"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { ActiveFilter } from "./model";

/**
 * Saved views — a named period + filter set, kept in localStorage.
 *
 * `useSyncExternalStore` rather than a read inside an effect: localStorage is
 * an external store, and this is the hook built for one. It renders the server
 * snapshot (empty) during SSR and hydration, then swaps to the real value, so
 * the first client paint still matches the prerendered HTML — without the
 * cascading render that a setState-in-effect would cause.
 */

export type SavedView = {
  id: string;
  name: string;
  period: string;
  filters: ActiveFilter[];
};

type Stored = { version: 1; views: SavedView[] };

const VERSION = 1;

/** Stable empty array: a new [] each call would spin useSyncExternalStore. */
const EMPTY: SavedView[] = [];

/**
 * getSnapshot must return a referentially stable value between changes, so
 * parsed results are cached per scope and only invalidated on write.
 */
const cache = new Map<string, SavedView[]>();
const listeners = new Set<() => void>();

function storageKey(scope: string): string {
  return `infiviz:saved-views:${scope}`;
}

/** Anything unparseable or from another version is discarded, not repaired. */
function read(scope: string): SavedView[] {
  try {
    const raw = window.localStorage.getItem(storageKey(scope));
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Stored;
    if (parsed?.version !== VERSION || !Array.isArray(parsed.views)) return EMPTY;
    const views = parsed.views.filter(
      (v) =>
        typeof v?.id === "string" &&
        typeof v?.name === "string" &&
        typeof v?.period === "string" &&
        Array.isArray(v?.filters),
    );
    return views.length ? views : EMPTY;
  } catch {
    // Private-mode denials and corrupt values both land here. Degrade quietly.
    return EMPTY;
  }
}

function snapshot(scope: string): SavedView[] {
  let hit = cache.get(scope);
  if (!hit) {
    hit = read(scope);
    cache.set(scope, hit);
  }
  return hit;
}

function commit(scope: string, views: SavedView[]): void {
  cache.set(scope, views.length ? views : EMPTY);
  try {
    const payload: Stored = { version: VERSION, views };
    window.localStorage.setItem(storageKey(scope), JSON.stringify(payload));
  } catch {
    // Quota or private mode — the in-memory value still works for this session.
  }
  listeners.forEach((notify) => notify());
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  // Another tab writing the same key should be reflected here too.
  const onStorage = (event: StorageEvent) => {
    if (event.key?.startsWith("infiviz:saved-views:")) {
      cache.clear();
      listeners.forEach((notify) => notify());
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

const subscribeNothing = () => () => {};

export function useSavedViews(scope: string) {
  const views = useSyncExternalStore(
    subscribe,
    () => snapshot(scope),
    () => EMPTY,
  );

  /** False until hydration completes, so callers can hold off on an empty state. */
  const ready = useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  );

  const save = useCallback(
    (name: string, period: string, filters: ActiveFilter[]) => {
      // An id derived from the name makes re-saving the same name an update
      // rather than a duplicate, with no counter to collide on.
      const id = name.trim().toLowerCase();
      const current = snapshot(scope);
      commit(scope, [
        ...current.filter((v) => v.id !== id),
        { id, name: name.trim(), period, filters },
      ]);
    },
    [scope],
  );

  const remove = useCallback(
    (id: string) => {
      commit(
        scope,
        snapshot(scope).filter((v) => v.id !== id),
      );
    },
    [scope],
  );

  return { views, ready, save, remove };
}
