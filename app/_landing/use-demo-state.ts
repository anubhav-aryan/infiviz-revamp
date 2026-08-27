"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { LandingStateId } from "./_data/landing";

/**
 * Which phase of the account the demo is showing — onboarding or live — kept
 * in localStorage.
 *
 * It used to be component state inside `Landing`, which was fine while its
 * control floated on the Activity screen. The control now lives in the
 * sidebar footer, which every shell renders, so the state has to live
 * somewhere every shell can reach: the same `useSyncExternalStore`-over-
 * localStorage shape as `useRole` and `useSidebarCollapsed`, for the same
 * hydration reasons those two document.
 */

export const DEMO_STATES: { id: LandingStateId; label: string }[] = [
  { id: "onboarding", label: "Onboarding" },
  { id: "live", label: "Live" },
];

export const DEFAULT_DEMO_STATE: LandingStateId = "live";

const KEY = "infiviz:demo-state";

type Stored = LandingStateId | null;

let cache: Stored | undefined;
const listeners = new Set<() => void>();

function isDemoState(value: string | null): value is LandingStateId {
  return DEMO_STATES.some((state) => state.id === value);
}

function snapshot(): Stored {
  if (cache === undefined) {
    try {
      const raw = window.localStorage.getItem(KEY);
      cache = isDemoState(raw) ? raw : null;
    } catch {
      cache = null;
    }
  }
  return cache;
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

export function useDemoState(): {
  demoState: LandingStateId;
  setDemoState: (next: LandingStateId) => void;
} {
  const stored = useSyncExternalStore(subscribe, snapshot, () => null as Stored);

  const setDemoState = useCallback((next: LandingStateId) => {
    cache = next;
    try {
      window.localStorage.setItem(KEY, next);
    } catch {
      // Quota or private mode — the in-memory value still works this session.
    }
    listeners.forEach((notify) => notify());
  }, []);

  return { demoState: stored ?? DEFAULT_DEMO_STATE, setDemoState };
}
