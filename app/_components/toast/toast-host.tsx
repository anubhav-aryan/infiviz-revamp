"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import { Icon } from "../icon";
import { useSidebarCollapsed } from "../use-sidebar-collapsed";
import { useToast } from "./toast-context";
import styles from "./toast.module.css";

/** Long enough to read a ticket key and reach for the link, short enough that
 *  an ignored confirmation clears itself. */
const DISMISS_MS = 6000;

/**
 * Renders the current toast, bottom-left.
 *
 * Bottom-left because the other corner is taken three times over: the chat
 * launcher sits there, the chat panel opens above it, and Landing parks its
 * demo state picker in the same place.
 *
 * It clears the nav by reading the sidebar's own collapse state rather than
 * guessing a width — and slides with it, since that rail is animated now.
 */
export function ToastHost({
  defaultCollapsed,
  /** Width of any second rail between the sidebar and the content — the
   *  two-rail shell's section rail. Without it the toast lands on top of it. */
  inset = 0,
}: {
  defaultCollapsed?: boolean;
  inset?: number;
}) {
  const api = useToast();
  const [collapsed] = useSidebarCollapsed(defaultCollapsed);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toast = api?.toast ?? null;
  const dismiss = api?.dismiss;
  const id = toast?.id;

  // A post-hydration interaction, not render-time nondeterminism: the timer
  // only ever starts because someone filed a ticket. Keyed on the toast's id so
  // a second one raised over the first restarts the countdown rather than
  // inheriting what was left of it.
  useEffect(() => {
    if (id === undefined || !dismiss) return;
    timer.current = setTimeout(dismiss, DISMISS_MS);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [id, dismiss]);

  return (
    // The live region is always mounted, empty when there is nothing to say —
    // a region that appears at the same moment as its message is not reliably
    // announced.
    <div
      className={styles.region}
      style={
        {
          "--rail-w": collapsed ? "64px" : "240px",
          "--rail-inset": `${inset}px`,
        } as CSSProperties
      }
      role="status"
      aria-live="polite"
    >
      {toast ? (
        <div key={toast.id} className={styles.toast}>
          <Icon name="check" size={14} className={styles.tick} aria-hidden="true" />
          <span className={styles.message}>{toast.message}</span>

          {toast.action ? (
            <Link
              href={toast.action.href}
              className={styles.action}
              onClick={dismiss}
            >
              {toast.action.label}
            </Link>
          ) : null}

          <button
            type="button"
            className={styles.close}
            onClick={dismiss}
            aria-label="Dismiss"
          >
            <Icon name="x" size={13} />
          </button>
        </div>
      ) : null}
    </div>
  );
}
