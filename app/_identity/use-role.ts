"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Who the reader is, kept in localStorage.
 *
 * The four analytics personas used to be lenses anyone could switch between.
 * They are now access: a role sees its own dashboard and nothing else, and the
 * ticket hierarchy in `people.ts` — which always described who may assign to
 * whom — finally has something global to hang off. "internal" is the Infilect
 * operator view: every persona, every ticket, no gating, which is what the
 * whole section did before this existed.
 *
 * The same `useSyncExternalStore` shape as `useSidebarCollapsed`: localStorage
 * is an external store, so the server snapshot (nothing stored) renders during
 * SSR and hydration and the stored role swaps in immediately after. Every route
 * in this section is static — a value read during render would be a hydration
 * mismatch on all of them.
 *
 * It lives outside React because each route mounts its own shell: component
 * state would reset the role on every navigation.
 */

export type Role = "exec" | "regional" | "category" | "field" | "internal";

/**
 * The most restricted role, deliberately. A demo that opens on the *widest*
 * view never shows what the gating does; opening at the bottom of the hierarchy
 * makes it the first thing you see.
 */
export const DEFAULT_ROLE: Role = "field";

/** Picker order — the hierarchy top to bottom, with the operator view last. */
export const ROLES: { id: Role; label: string }[] = [
  { id: "exec", label: "Executive" },
  { id: "regional", label: "Regional" },
  { id: "category", label: "Category" },
  { id: "field", label: "Field" },
  { id: "internal", label: "Internal" },
];

export const ROLE_LABEL = Object.fromEntries(
  ROLES.map((role) => [role.id, role.label]),
) as Record<Role, string>;

const KEY = "infiviz:role";

/** `null` means nothing is stored — `DEFAULT_ROLE` decides. */
type Stored = Role | null;

let cache: Stored | undefined;
const listeners = new Set<() => void>();

function isRole(value: string | null): value is Role {
  return ROLES.some((role) => role.id === value);
}

function snapshot(): Stored {
  if (cache === undefined) {
    try {
      const raw = window.localStorage.getItem(KEY);
      cache = isRole(raw) ? raw : null;
    } catch {
      // Private-mode denial. Fall back to the default and keep any later
      // choice in memory for this session.
      cache = null;
    }
  }
  return cache;
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  // Switching role in another tab should be reflected here too.
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

const subscribeNothing = () => () => {};

export function useRole(): {
  role: Role;
  ready: boolean;
  setRole: (next: Role) => void;
} {
  const stored = useSyncExternalStore(subscribe, snapshot, () => null as Stored);

  /**
   * False during SSR and the hydration render, true in the same post-hydration
   * pass that delivers the real stored role.
   *
   * Anything that would make the markup *differ* from what was prerendered —
   * hiding a persona switcher, blanking a body, redirecting — must be gated on
   * this. Rendering the role value itself needs no gate: it equals the server's
   * default until the swap.
   */
  const ready = useSyncExternalStore(subscribeNothing, () => true, () => false);

  const setRole = useCallback((next: Role) => {
    cache = next;
    try {
      window.localStorage.setItem(KEY, next);
    } catch {
      // Quota or private mode — the in-memory value still works this session.
    }
    listeners.forEach((notify) => notify());
  }, []);

  return { role: stored ?? DEFAULT_ROLE, ready, setRole };
}
