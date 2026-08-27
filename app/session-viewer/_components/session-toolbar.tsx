"use client";

import { useState } from "react";
import { Icon } from "@/app/_components/icon";
import type { ShelfView } from "../_data/session-viewer";
import styles from "./session-viewer.module.css";

/**
 * The toolbar above the stitch.
 *
 * The panel names itself first, then offers the one control that changes what
 * the overlay means — Store view against POG compliance. Everything to the
 * right operates on the view rather than choosing it, so it is pushed there
 * and divided off.
 *
 * `Compare` is chrome: the app has one authored session per store and no
 * second session to compare against, so it is marked `aria-disabled` with a
 * title saying so rather than wired to a handler that would do nothing.
 * `Planogram Export` renders at full strength by request — the export itself
 * is not built yet, so the button waits for its behaviour.
 *
 * `Share` is not chrome. The mockup draws it enabled beside those two, and the
 * only way to draw an enabled button honestly is to give it something to do —
 * so it copies the session's own URL, which is what sharing a session is.
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

/** Copies this session's URL. Falls back to selecting nothing if the clipboard
 *  is unavailable — the label just never changes. */
function ShareButton() {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      className={styles.toolButton}
      onClick={() => {
        void navigator.clipboard?.writeText(window.location.href).then(() => {
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1600);
        });
      }}
    >
      <Icon name={copied ? "check" : "share-2"} size={14} />
      {copied ? "Link copied" : "Share"}
    </button>
  );
}

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
      <span className={styles.stageTitle}>Shelf capture</span>

      <div className={styles.segmented} role="group" aria-label="Overlay view">
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

      <div className={styles.stageTools}>
        <span className={styles.zoomGroup}>
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
            className={styles.toolButton}
            onClick={onReset}
            disabled={!canReset}
          >
            Reset
          </button>
        </span>

        <span className={styles.divider} aria-hidden="true" />

        <PendingButton icon="git-compare" label="Compare" />
        <button type="button" className={styles.toolButton}>
          <Icon name="file-down" size={14} />
          Planogram Export
        </button>
        <ShareButton />
      </div>
    </div>
  );
}
