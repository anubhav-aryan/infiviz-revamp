"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

/**
 * The app's transient confirmations.
 *
 * One toast at a time, deliberately: the only thing that raises one right now
 * is filing a ticket, and two stacked confirmations for two tickets would be
 * two things to dismiss for one decision. A second `show` replaces the first.
 */

export type Toast = {
  /** Bumped on every `show` so the host can restart its timer and animation
   *  even when the same message is raised twice. */
  id: number;
  message: string;
  action?: { label: string; href: string };
};

type ToastApi = {
  toast: Toast | null;
  show: (toast: Omit<Toast, "id">) => void;
  dismiss: () => void;
};

const ToastContext = createContext<ToastApi | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);

  const show = useCallback((next: Omit<Toast, "id">) => {
    setToast((current) => ({ ...next, id: (current?.id ?? 0) + 1 }));
  }, []);

  const dismiss = useCallback(() => setToast(null), []);

  const api = useMemo(() => ({ toast, show, dismiss }), [toast, show, dismiss]);

  return <ToastContext.Provider value={api}>{children}</ToastContext.Provider>;
}

/**
 * Returns `null` outside a provider rather than throwing — the convention
 * `useChatPane` sets, because `/reference/charts` renders with no shell and a
 * component that can raise a toast should not require one.
 */
export function useToast(): ToastApi | null {
  return useContext(ToastContext);
}
