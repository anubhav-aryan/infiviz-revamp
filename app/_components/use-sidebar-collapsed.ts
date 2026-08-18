"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Whether the primary sidebar is collapsed, kept in localStorage.
 *
 * The same `useSyncExternalStore` shape as `useSavedViews`: localStorage is an
 * external store, so the server snapshot (nothing stored) is what renders
 * during SSR and hydration, and the stored value swaps in immediately after.
 * That keeps the first client paint identical to the prerendered HTML — every
 * route here is static, so a value read during render would be a hydration
 * mismatch.
 *
 * The store deliberately keeps the *raw* value rather than a boolean, so
 * "never chosen" stays distinguishable from "chosen expanded". Rail routes
 * default to collapsed, and only that distinction lets them do so without
 * overriding a user who expanded the sidebar on purpose.
 *
 * It lives outside React because each route mounts its own shell: component
 * state would reset the sidebar on every navigation.
 */

const KEY = "infiviz:sidebar-collapsed";

/** `null` means nothing is stored — the caller's default decides. */
type Stored = "1" | "0" | null;

let cache: Stored | undefined;
const listeners = new Set<() => void>();

function snapshot(): Stored {
  if (cache === undefined) {
    try {
      const raw = window.localStorage.getItem(KEY);
      cache = raw === "1" || raw === "0" ? raw : null;
    } catch {
      // Private-mode denial. Fall back to the caller's default and keep any
      // later choice in memory for this session.
      cache = null;
    }
  }
  return cache;
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  // Another tab collapsing the sidebar should be reflected here too.
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

/**
 * @param defaultCollapsed what to use until the user has chosen — `true` on the
 * two-rail routes, where a section rail already occupies the space an expanded
 * sidebar would want.
 */
export function useSidebarCollapsed(
  defaultCollapsed = false,
): [boolean, () => void] {
  const stored = useSyncExternalStore(
    subscribe,
    snapshot,
    () => null as Stored,
  );

  const collapsed = stored === null ? defaultCollapsed : stored === "1";

  // Negates the *effective* value, not the stored one: on a route that defaults
  // to collapsed with nothing stored yet, negating the raw `null` would write
  // "collapsed" again and the first click would do nothing visible.
  const toggle = useCallback(() => {
    const next: Stored = collapsed ? "0" : "1";
    cache = next;
    try {
      window.localStorage.setItem(KEY, next);
    } catch {
      // Quota or private mode — the in-memory value still works this session.
    }
    listeners.forEach((notify) => notify());
  }, [collapsed]);

  return [collapsed, toggle];
}
