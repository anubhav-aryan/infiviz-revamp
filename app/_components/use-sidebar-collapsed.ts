"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Whether the primary sidebar is collapsed, kept in localStorage.
 *
 * The same `useSyncExternalStore` shape as `useSavedViews`: localStorage is an
 * external store, so the server snapshot (expanded) is what renders during SSR
 * and hydration, and the stored value swaps in immediately after. That keeps
 * the first client paint identical to the prerendered HTML — every route here
 * is static, so a value read during render would be a hydration mismatch.
 *
 * It lives outside React because each route mounts its own shell: component
 * state would reset the sidebar on every navigation.
 */

const KEY = "infiviz:sidebar-collapsed";

let cache: boolean | null = null;
const listeners = new Set<() => void>();

function snapshot(): boolean {
  if (cache === null) {
    try {
      cache = window.localStorage.getItem(KEY) === "1";
    } catch {
      // Private-mode denial. Default to expanded and keep it in memory.
      cache = false;
    }
  }
  return cache;
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  // Another tab collapsing the sidebar should be reflected here too.
  const onStorage = (event: StorageEvent) => {
    if (event.key === KEY) {
      cache = null;
      listeners.forEach((notify) => notify());
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

export function useSidebarCollapsed(): [boolean, () => void] {
  const collapsed = useSyncExternalStore(
    subscribe,
    snapshot,
    () => false,
  );

  const toggle = useCallback(() => {
    const next = !snapshot();
    cache = next;
    try {
      window.localStorage.setItem(KEY, next ? "1" : "0");
    } catch {
      // Quota or private mode — the in-memory value still works this session.
    }
    listeners.forEach((notify) => notify());
  }, []);

  return [collapsed, toggle];
}
