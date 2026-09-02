"use client";

import Link from "next/link";
import { useState } from "react";
import { Hint } from "@/app/_components/hint";
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
 * `Compare` opens the store's visit-comparison timeline. Planogram Export
 * lives under the stitch beside the minimap — it exports what the stage
 * shows, so it sits with the stage.
 *
 * `Share` is not chrome. The mockup draws it enabled beside those two, and the
 * only way to draw an enabled button honestly is to give it something to do —
 * so it copies the session's own URL, which is what sharing a session is.
 */

type SessionToolbarProps = {
  /** The store's `/compare` page — every visit side by side. */
  compareHref: string;
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

export function SessionToolbar({
  compareHref,
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

        <Link href={compareHref} className={styles.toolButton}>
          <Icon name="git-compare" size={14} />
          Compare
        </Link>
        <ShareButton />

        {/* Evidence photos are the after shot — what the shelf looked like once
            the merchandiser acted on the session. Some sessions have them and
            some do not, and they carry their own metrics, so the destination is
            a page of its own rather than a lightbox. Disabled until that page
            exists: an enabled button with nowhere to go is the one thing this
            toolbar refuses to draw. `align="end"` because this sits at the
            right edge, where a centred bubble would run off the panel. */}
        <Hint text="After-action evidence photos — not built yet" align="end">
          <button type="button" className={styles.toolButton} disabled>
            <Icon name="camera" size={14} />
            Evidence Image
          </button>
        </Hint>
      </div>
    </div>
  );
}
