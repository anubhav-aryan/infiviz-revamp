"use client";

import { useEffect, useRef } from "react";
import { Icon } from "@/app/_components/icon";
import type { Visit } from "@/app/store-explorer/_data/store-explorer";
import type { SessionIdentity } from "../_data/session-viewer";
import { MetricsPanel } from "./metrics-panel";
import styles from "./session-viewer.module.css";

/**
 * The roll-up metrics, in a slide-over rather than a second column.
 *
 * Structure copied from `catalog/_components/sku-panel.tsx`, which is where
 * this pattern is authored: scrim + `role="dialog"`, Escape to close, focus
 * moved to the close button on open and restored to the opener on unmount.
 * Mount/unmount, no animation — the same as every other panel in the app.
 */

type SessionMetricsDrawerProps = {
  session: SessionIdentity;
  visit?: Visit;
  onClose: () => void;
};

export function SessionMetricsDrawer({
  session,
  visit,
  onClose,
}: SessionMetricsDrawerProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      opener?.focus?.();
    };
  }, [onClose]);

  return (
    <div className={styles.panelScrim} onClick={onClose} role="presentation">
      <div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label={`Session metrics — ${session.title}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.panelHead}>
          <div>
            <div className={styles.panelEyebrow}>Session metrics</div>
            <div className={styles.panelTitle}>{session.title}</div>
          </div>
          <button
            ref={closeRef}
            type="button"
            className={styles.panelClose}
            onClick={onClose}
            aria-label="Close session metrics"
          >
            <Icon name="x" />
          </button>
        </div>

        <div className={styles.panelBody}>
          <MetricsPanel session={session} visit={visit} />
        </div>
      </div>
    </div>
  );
}
