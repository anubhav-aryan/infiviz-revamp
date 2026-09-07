"use client";

import { useSyncExternalStore } from "react";
import { MOCK_ACCOUNT_KEY } from "@/app/_identity/mock-identity";
import { SHARED_VIEWS, type SharedView } from "./shared-views";

/**
 * The Shared Analytics inbox: what has been shared with this reader, what they
 * saved, and what they opened last.
 *
 * The same `useSyncExternalStore` idiom as `use-created-tickets.ts` and
 * `use-saved-views.ts`, and for the same reason: localStorage is an external
 * store, the server snapshot is "nothing stored", so SSR and the hydration
 * render show the authored fixtures alone and the reader's own rows swap in
 * one pass later. `SHARED_VIEWS` stays a frozen fixture; everything the reader
 * does lands in the three records below.
 *
 * It lives outside React because a view is shared from one screen (the filter
 * bar, anywhere) and read on another (Shared Analytics) — component state on
 * either would not survive the navigation between them.
 *
 * Three separate keys rather than one blob: saving, opening and sharing are
 * independent writes, and a reader who saves a view should not have their
 * open history rewritten as a side effect.
 */

const SAVED_KEY = `infiviz:shared-saved:${MOCK_ACCOUNT_KEY}`;
const OPENED_KEY = `infiviz:shared-opened:${MOCK_ACCOUNT_KEY}`;
const SENT_KEY = `infiviz:shared-sent:${MOCK_ACCOUNT_KEY}`;

/** Stable identities — a fresh literal each call would spin the store. */
const NO_IDS: string[] = [];
const NO_VIEWS: SharedView[] = [];

type Bucket = {
  key: string;
  cache: unknown;
  listeners: Set<() => void>;
};

const buckets = new Map<string, Bucket>();

function bucketFor(key: string): Bucket {
  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = { key, cache: undefined, listeners: new Set() };
    buckets.set(key, bucket);
  }
  return bucket;
}

function readRaw(key: string): unknown {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown): void {
  const bucket = bucketFor(key);
  bucket.cache = value;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Quota or private mode — the in-memory value still works this session.
  }
  bucket.listeners.forEach((notify) => notify());
}

function subscribeTo(key: string) {
  return (onChange: () => void): () => void => {
    const bucket = bucketFor(key);
    bucket.listeners.add(onChange);
    const onStorage = (event: StorageEvent) => {
      if (event.key === key) {
        bucket.cache = undefined;
        bucket.listeners.forEach((notify) => notify());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      bucket.listeners.delete(onChange);
      window.removeEventListener("storage", onStorage);
    };
  };
}

/* ---------- id lists: saved, and recently opened ---------- */

function idsSnapshot(key: string): string[] {
  const bucket = bucketFor(key);
  if (bucket.cache === undefined) {
    const parsed = readRaw(key);
    const rows = Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string")
      : [];
    bucket.cache = rows.length ? rows : NO_IDS;
  }
  return bucket.cache as string[];
}

/* ---------- views the reader shared themselves ---------- */

function sentSnapshot(): SharedView[] {
  const bucket = bucketFor(SENT_KEY);
  if (bucket.cache === undefined) {
    const parsed = readRaw(SENT_KEY);
    // Shape-check rather than trust: a stale or hand-edited value must not be
    // able to crash the screen it renders into.
    const rows = Array.isArray(parsed)
      ? parsed.filter(
          (row): row is SharedView =>
            !!row &&
            typeof row.id === "string" &&
            typeof row.name === "string" &&
            typeof row.query === "string" &&
            Array.isArray(row.chips),
        )
      : [];
    bucket.cache = rows.length ? rows : NO_VIEWS;
  }
  return bucket.cache as SharedView[];
}

/* ---------- the hook ---------- */

export type SharedInbox = {
  /** Everything shared with this reader, newest first — sent then authored. */
  views: SharedView[];
  savedIds: string[];
  /** Most recently opened first. Capped, see `OPEN_HISTORY`. */
  openedIds: string[];
};

/** How much open history is worth keeping. Enough to fill the strip, no more. */
const OPEN_HISTORY = 6;

export function useSharedInbox(): SharedInbox {
  const sent = useSyncExternalStore(
    subscribeTo(SENT_KEY),
    sentSnapshot,
    () => NO_VIEWS,
  );
  const savedIds = useSyncExternalStore(
    subscribeTo(SAVED_KEY),
    () => idsSnapshot(SAVED_KEY),
    () => NO_IDS,
  );
  const openedIds = useSyncExternalStore(
    subscribeTo(OPENED_KEY),
    () => idsSnapshot(OPENED_KEY),
    () => NO_IDS,
  );

  return { views: [...sent, ...SHARED_VIEWS], savedIds, openedIds };
}

/* ---------- writes ---------- */

export function toggleSaved(id: string): void {
  const current = idsSnapshot(SAVED_KEY);
  write(
    SAVED_KEY,
    current.includes(id) ? current.filter((saved) => saved !== id) : [...current, id],
  );
}

/** Records an open. Most recent first, deduped, capped at `OPEN_HISTORY`. */
export function markOpened(id: string): void {
  const current = idsSnapshot(OPENED_KEY);
  const next = [id, ...current.filter((opened) => opened !== id)].slice(0, OPEN_HISTORY);
  // Bail when the order is already right, so opening the same view twice in a
  // row does not notify every subscriber for nothing.
  if (next.length === current.length && next.every((v, i) => v === current[i])) return;
  write(OPENED_KEY, next);
}

export type ShareDraft = {
  name: string;
  note: string;
  query: string;
  chips: { dim: string; value: string }[];
  /** Display names of the mocked recipients, for the card's caption. */
  recipients: string[];
};

/**
 * Records a view this reader shared, so it appears in their own list the way
 * a sent message appears in a sent folder.
 *
 * `fromId` is deliberately empty: the sender is the reader, and the card
 * renders "Shared by you" rather than looking a person up.
 */
export function recordShare(draft: ShareDraft): SharedView {
  const view: SharedView = {
    id: `sent-${Date.now().toString(36)}`,
    name: draft.name,
    note: draft.recipients.length
      ? `Shared with ${draft.recipients.join(", ")}.`
      : "Shared by link.",
    fromId: "",
    when: "Just now",
    query: draft.query,
    chips: draft.chips,
  };
  write(SENT_KEY, [view, ...sentSnapshot()]);
  return view;
}
