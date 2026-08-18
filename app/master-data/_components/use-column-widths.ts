"use client";

import { useCallback, useSyncExternalStore } from "react";
import { MOCK_ACCOUNT_KEY } from "@/app/_identity/mock-identity";

/**
 * Persisted column widths for one Master data table, "per user per account" —
 * the same `useSyncExternalStore` + localStorage idiom as `use-chart-order.ts`
 * and `use-sidebar-collapsed.ts`. SSR and first paint render the authored
 * widths, and a stored map (if any) swaps in right after hydration.
 *
 * Persistence is not a nicety here: Journey plans steps between months with
 * real navigation, so widths held in component state would be thrown away
 * every time someone changed month.
 */

const cache = new Map<string, Record<string, number>>();
/** Authored widths are cached too — `useSyncExternalStore` needs a snapshot
 *  whose identity is stable across calls, and props cross the RSC boundary as
 *  fresh objects on every render. */
const authoredCache = new Map<string, Record<string, number>>();
const listeners = new Set<() => void>();

const PREFIX = "infiviz:cols:";

function storageKey(tableKey: string): string {
  return `${PREFIX}${MOCK_ACCOUNT_KEY}:${tableKey}`;
}

/** Widths for columns that no longer exist are dropped, and a column the save
 *  predates keeps its authored width — a stale save never hides a column. */
function reconcile(
  saved: Record<string, unknown>,
  authored: Record<string, number>,
): Record<string, number> {
  const merged: Record<string, number> = { ...authored };
  for (const [key, value] of Object.entries(saved)) {
    if (key in authored && typeof value === "number" && Number.isFinite(value)) {
      merged[key] = value;
    }
  }
  return merged;
}

function read(
  tableKey: string,
  authored: Record<string, number>,
): Record<string, number> {
  try {
    const raw = window.localStorage.getItem(storageKey(tableKey));
    if (!raw) return authored;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return authored;
    }
    return reconcile(parsed as Record<string, unknown>, authored);
  } catch {
    return authored;
  }
}

function authoredSnapshot(
  tableKey: string,
  authored: Record<string, number>,
): Record<string, number> {
  let hit = authoredCache.get(tableKey);
  if (!hit) {
    hit = authored;
    authoredCache.set(tableKey, hit);
  }
  return hit;
}

function snapshot(
  tableKey: string,
  authored: Record<string, number>,
): Record<string, number> {
  let hit = cache.get(tableKey);
  if (!hit) {
    hit = read(tableKey, authoredSnapshot(tableKey, authored));
    cache.set(tableKey, hit);
  }
  return hit;
}

function commit(tableKey: string, widths: Record<string, number>): void {
  cache.set(tableKey, widths);
  try {
    window.localStorage.setItem(storageKey(tableKey), JSON.stringify(widths));
  } catch {
    // Quota or private mode — the in-memory value still works this session.
  }
  listeners.forEach((notify) => notify());
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  const onStorage = (event: StorageEvent) => {
    if (event.key?.startsWith(PREFIX)) {
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

/**
 * @param tableKey Unique per table, so resizing one never collides with another.
 * @param authored Column key → designed width in px. Also the SSR snapshot and
 *   the reconciliation source.
 */
export function useColumnWidths(
  tableKey: string,
  authored: Record<string, number>,
): [Record<string, number>, (key: string, width: number) => void, (key: string) => void] {
  const widths = useSyncExternalStore(
    subscribe,
    () => snapshot(tableKey, authored),
    () => authoredSnapshot(tableKey, authored),
  );

  const setWidth = useCallback(
    (key: string, width: number) => {
      commit(tableKey, { ...snapshot(tableKey, authored), [key]: width });
    },
    [tableKey, authored],
  );

  const resetWidth = useCallback(
    (key: string) => {
      const base = authoredSnapshot(tableKey, authored);
      commit(tableKey, { ...snapshot(tableKey, authored), [key]: base[key] });
    },
    [tableKey, authored],
  );

  return [widths, setWidth, resetWidth];
}
