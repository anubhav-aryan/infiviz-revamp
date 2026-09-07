"use client";

import { useCallback, useSyncExternalStore } from "react";
import { MOCK_ACCOUNT_KEY } from "@/app/_identity/mock-identity";
import { WIDGET_BY_ID } from "./board-widgets";

/**
 * Boards a reader has built, kept in localStorage.
 *
 * The storage shape follows `use-saved-views.ts`: a versioned envelope whose
 * `VERSION` is checked on read and whose contents are **discarded wholesale**
 * on a mismatch rather than migrated. Repairing a board saved against an older
 * widget catalogue would mean guessing which widget the reader meant.
 *
 * Unknown widget ids are dropped on read instead, which is the narrower
 * version of the same rule and does not need a version bump: a widget removed
 * from the catalogue leaves the boards that used it standing, minus that card.
 *
 * Keyed by `MOCK_ACCOUNT_KEY` because a board is per user per account — see
 * `mock-identity.ts` for why that is a constant here.
 */

export type Board = {
  id: string;
  name: string;
  /** Widget ids, in the order authored. Reorder is `useChartOrder`'s job. */
  widgets: string[];
  /** ISO, so the list can sort without parsing a display string. */
  createdAt: string;
};

const KEY = `infiviz:boards:${MOCK_ACCOUNT_KEY}`;
const VERSION = 1;

type Stored = { version: number; boards: Board[] };

/** Stable empty array: a new [] each call would spin useSyncExternalStore. */
const EMPTY: Board[] = [];

let cache: Board[] | undefined;
const listeners = new Set<() => void>();

function read(): Board[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Stored;
    if (parsed?.version !== VERSION || !Array.isArray(parsed.boards)) return EMPTY;
    const boards = parsed.boards
      .filter(
        (b): b is Board =>
          !!b &&
          typeof b.id === "string" &&
          typeof b.name === "string" &&
          Array.isArray(b.widgets),
      )
      // A widget the catalogue no longer offers is dropped, not fatal.
      .map((b) => ({ ...b, widgets: b.widgets.filter((id) => WIDGET_BY_ID.has(id)) }));
    return boards.length ? boards : EMPTY;
  } catch {
    return EMPTY;
  }
}

function snapshot(): Board[] {
  if (cache === undefined) cache = read();
  return cache;
}

function persist(boards: Board[]): void {
  cache = boards.length ? boards : EMPTY;
  try {
    window.localStorage.setItem(
      KEY,
      JSON.stringify({ version: VERSION, boards } satisfies Stored),
    );
  } catch {
    // Quota or private mode — the in-memory value still works this session.
  }
  listeners.forEach((notify) => notify());
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  const onStorage = (event: StorageEvent) => {
    if (event.key === KEY) {
      cache = undefined;
      listeners.forEach((notify) => notify());
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

/** `"Q3 review"` → `"q3-review"`. Same rule the filter registry slugs by. */
export function boardId(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * What the reader typed. Deliberately narrower than `Board` — no id, no
 * timestamp, nothing derived — following the `TicketDraft` shape in
 * `app/tickets/_data/use-created-tickets.ts`: the form holds this, the commit
 * turns it into the stored entity.
 */
export type BoardDraft = { name: string; widgets: string[] };

export type BoardsApi = {
  boards: Board[];
  /**
   * False during SSR and the hydration render, true in the same pass that
   * delivers the stored boards. Anything that would make the markup differ
   * from what was prerendered — an empty state, a count — must wait for this.
   */
  ready: boolean;
  /**
   * The only way a board is written.
   *
   * Creates when `id` is absent, replaces that board's name and widget set
   * when present. One commit rather than the `create`/`rename`/`addWidget`/
   * `removeWidget` it replaces: those wrote on every mutation, which meant a
   * name field that persisted each keystroke — and since it trimmed as it
   * wrote, a space could never survive long enough to type a second word.
   * A draft edited in component state and committed once cannot do that.
   */
  saveBoard: (draft: BoardDraft, id?: string) => Board;
  remove: (id: string) => void;
  /** Adds a board received by link. Renamed if the id is already taken. */
  adopt: (name: string, widgets: string[]) => Board;
};

export function useBoards(): BoardsApi {
  const boards = useSyncExternalStore(subscribe, snapshot, () => EMPTY);
  const ready = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  const saveBoard = useCallback((draft: BoardDraft, id?: string): Board => {
    const name = draft.name.trim() || "Untitled board";
    const widgets = draft.widgets.filter((widgetId) => WIDGET_BY_ID.has(widgetId));
    const existing = id ? snapshot().find((b) => b.id === id) : undefined;

    if (existing) {
      /* The id is kept even when the name changes, so a link already shared or
         a tab already open still resolves. */
      const updated: Board = { ...existing, name, widgets };
      persist(snapshot().map((b) => (b.id === existing.id ? updated : b)));
      return updated;
    }

    const board: Board = {
      id: uniqueId(boardId(name) || "board", snapshot()),
      name,
      widgets,
      createdAt: new Date().toISOString(),
    };
    persist([board, ...snapshot()]);
    return board;
  }, []);

  const remove = useCallback((id: string) => {
    persist(snapshot().filter((b) => b.id !== id));
  }, []);

  const adopt = useCallback(
    (name: string, widgets: string[]): Board =>
      saveBoard({ name: name.trim() || "Shared board", widgets }),
    [saveBoard],
  );

  return { boards, ready, saveBoard, remove, adopt };
}

/** Appends `-2`, `-3`… rather than overwriting a board that shares a name. */
function uniqueId(base: string, existing: Board[]): string {
  const taken = new Set(existing.map((b) => b.id));
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}
