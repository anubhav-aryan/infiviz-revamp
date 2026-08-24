"use client";

import { Icon } from "@/app/_components/icon";
import type { ShelfView } from "../_data/session-viewer";
import styles from "./session-viewer.module.css";

/**
 * The toolbar above the stitch.
 *
 * Four of these controls are real — zoom in, zoom out, Reset and the Store /
 * POG view switch. `Compare`, `Planogram` and `Share` are chrome: the app has one authored session per store and no second session to
 * compare against, so they are marked `aria-disabled` with a title saying so
 * rather than wired to a handler that would do nothing. The existing
 * `ExcelDownloadButton` sets the same precedent for a button that looks real
 * and isn't.
 */

type SessionToolbarProps = {
  view: ShelfView;
  onViewChange: (view: ShelfView) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  canZoomIn: boolean;
  canZoomOut: boolean;
  zoomLabel: string;
  onReset: () => void;
  canReset: boolean;
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
  view,
  onViewChange,
  onZoomIn,
  onZoomOut,
  canZoomIn,
  canZoomOut,
  zoomLabel,
  onReset,
  canReset,
}: SessionToolbarProps) {
  return (
    <div className={styles.stageHead}>
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

      <div className={styles.segmented} role="group" aria-label="Shelf view">
        <button
          type="button"
          className={styles.segButton}
          data-active={view === "store"}
          aria-pressed={view === "store"}
          onClick={() => onViewChange("store")}
        >
          Store view
        </button>
        <button
          type="button"
          className={styles.segButton}
          data-active={view === "compliance"}
          aria-pressed={view === "compliance"}
          onClick={() => onViewChange("compliance")}
        >
          POG compliance
        </button>
      </div>

      <button
        type="button"
        className={styles.toolButton}
        onClick={onReset}
        disabled={!canReset}
      >
        Reset
      </button>

      <div className={`${styles.toolGroup} ${styles.toolGroupEnd}`}>
        <PendingButton icon="git-compare" label="Compare" />
        <PendingButton icon="presentation" label="Planogram" />
        <PendingButton icon="share-2" label="Share" />
      </div>
    </div>
  );
}
