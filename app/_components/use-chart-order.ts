"use client";

import { useCallback, useSyncExternalStore } from "react";
import { MOCK_ACCOUNT_KEY } from "@/app/_identity/mock-identity";

/**
 * Persisted chart order for one screen, "per user per account" — in practice
 * one hardcoded pseudo-account (`MOCK_ACCOUNT_KEY`), since there's no real
 * auth in this app. Same `useSyncExternalStore` + localStorage idiom as
 * `use-saved-views.ts` / `use-sidebar-collapsed.ts`: SSR and first paint
 * render the authored order, and the stored order (if any) swaps in right
 * after hydration.
 */

const cache = new Map<string, string[]>();
const listeners = new Set<() => void>();

function storageKey(pageKey: string): string {
  return `infiviz:layout:${MOCK_ACCOUNT_KEY}:${pageKey}`;
}

/** Unknown ids from a stale save are dropped; new ids the save predates are
 *  appended — a card never disappears and a bad value never crashes. */
function reconcile(saved: string[], authored: string[]): string[] {
  const known = new Set(authored);
  const kept = saved.filter((id) => known.has(id));
  const missing = authored.filter((id) => !kept.includes(id));
  return [...kept, ...missing];
}

function read(pageKey: string, authored: string[]): string[] {
  try {
    const raw = window.localStorage.getItem(storageKey(pageKey));
    if (!raw) return authored;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || !parsed.every((v) => typeof v === "string")) {
      return authored;
    }
    return reconcile(parsed, authored);
  } catch {
    return authored;
  }
}

function snapshot(pageKey: string, authored: string[]): string[] {
  let hit = cache.get(pageKey);
  if (!hit) {
    hit = read(pageKey, authored);
    cache.set(pageKey, hit);
  }
  return hit;
}

function commit(pageKey: string, order: string[]): void {
  cache.set(pageKey, order);
  try {
    window.localStorage.setItem(storageKey(pageKey), JSON.stringify(order));
  } catch {
    // Quota or private mode — the in-memory value still works this session.
  }
  listeners.forEach((notify) => notify());
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  const onStorage = (event: StorageEvent) => {
    if (event.key?.startsWith("infiviz:layout:")) {
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
 * @param pageKey Unique per screen, so reordering one page's charts never
 *   collides with another's.
 * @param authored The card ids in their default (authored) order. Used as
 *   the SSR/pre-hydration snapshot and as the reconciliation source.
 */
export function useChartOrder(
  pageKey: string,
  authored: string[],
): [string[], (order: string[]) => void] {
  const order = useSyncExternalStore(
    subscribe,
    () => snapshot(pageKey, authored),
    () => authored,
  );

  const setOrder = useCallback((next: string[]) => commit(pageKey, next), [pageKey]);

  return [order, setOrder];
}
