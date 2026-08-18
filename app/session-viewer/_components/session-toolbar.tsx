"use client";

import { Icon } from "@/app/_components/icon";
import type { ShelfView } from "../_data/session-viewer";
import styles from "./session-viewer.module.css";

/**
 * The toolbar above the stitch.
 *
 * Three of these controls are real — zoom in, zoom out, and the Store /
 * Planogram view switch. `COMPARE SESSION`, `EXPORT PLANOGRAM` and `SHARE` are
 * chrome: the app has one authored session per store and no second session to
 * compare against, so they are marked `aria-disabled` with a title saying so
 * rather than wired to a handler that would do nothing. The existing
 * `ExcelDownloadButton` sets the same precedent for a button that looks real
 * and isn't.
 */

type SessionToolbarProps = {
  title: string;
  date: string;
  view: ShelfView;
  onViewChange: (view: ShelfView) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  canZoomIn: boolean;
  canZoomOut: boolean;
  zoomLabel: string;
  onOpenMetrics: () => void;
};

/** Buttons with no destination yet — inert, and visibly so. */
function PendingButton({
  icon,
  label,
}: {
  icon: Parameters<typeof Icon>[0]["name"];
  label: string;
}) {
  return (
    <span
      className={styles.toolButton}
      data-pending="true"
      aria-disabled="true"
      title={`${label} — not available in this demo`}
    >
      <Icon name={icon} size={14} />
      {label}
    </span>
  );
}

export function SessionToolbar({
  title,
  date,
  view,
  onViewChange,
  onZoomIn,
  onZoomOut,
  canZoomIn,
  canZoomOut,
  zoomLabel,
  onOpenMetrics,
}: SessionToolbarProps) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.toolGroup}>
        <button
          type="button"
          className={styles.iconButton}
          onClick={onZoomIn}
          disabled={!canZoomIn}
          aria-label="Zoom in"
        >
          <Icon name="zoom-in" size={16} />
        </button>
        <button
          type="button"
          className={styles.iconButton}
          onClick={onZoomOut}
          disabled={!canZoomOut}
          aria-label="Zoom out"
        >
          <Icon name="zoom-out" size={16} />
        </button>
        <span className={styles.zoomLabel}>{zoomLabel}</span>
      </div>

      <div className={styles.toolGroup}>
        <button
          type="button"
          className={styles.toolButton}
          data-active={view === "store"}
          aria-pressed={view === "store"}
          onClick={() => onViewChange("store")}
        >
          Store view
        </button>
        <button
          type="button"
          className={styles.toolButton}
          data-active={view === "compliance"}
          aria-pressed={view === "compliance"}
          onClick={() => onViewChange("compliance")}
        >
          Planogram compliance view
        </button>
        <PendingButton icon="git-compare" label="Compare session" />
      </div>

      <div className={styles.toolTitle}>
        <span className={styles.toolTitleName}>{title}</span>
        <span className={styles.toolTitleDate}>{date}</span>
      </div>

      <div className={`${styles.toolGroup} ${styles.toolGroupEnd}`}>
        <button
          type="button"
          className={styles.toolButton}
          onClick={onOpenMetrics}
        >
          <Icon name="bar-chart-3" size={14} />
          Session metrics
        </button>
        <PendingButton icon="presentation" label="Export planogram" />
        <PendingButton icon="share-2" label="Share" />
      </div>
    </div>
  );
}
