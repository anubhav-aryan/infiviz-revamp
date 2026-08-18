"use client";

import { useCallback, useState } from "react";
import type { Visit } from "@/app/store-explorer/_data/store-explorer";
import {
  DEFAULT_SESSION,
  type ExtraKind,
  type SessionIdentity,
  type ShelfView,
} from "../_data/session-viewer";
import { SessionHeader } from "./session-header";
import { SessionMetricsDrawer } from "./session-metrics-drawer";
import { SessionTables } from "./session-tables";
import { SessionToolbar } from "./session-toolbar";
import { ShelfStage } from "./shelf-stage";
import { ShelfToggles } from "./shelf-toggles";
import styles from "./session-viewer.module.css";

type SessionViewerProps = {
  /** Which store's session to show; omit for the design's own session. */
  session?: SessionIdentity;
  /** The `Visit` the session was resolved from — absent for the no-store
   *  default session, which has no `Visit` to carry. Threaded down so the MSL
   *  checklist can derive its per-store figures without re-deriving it. */
  visit?: Visit;
};

/**
 * Discrete zoom steps rather than a continuous control: the stitch is one
 * fixed-resolution image, so past about 4× there is nothing more to see.
 */
const ZOOM_STEPS = [1, 1.5, 2, 3, 4];

export function SessionViewer({ session = DEFAULT_SESSION, visit }: SessionViewerProps) {
  const [view, setView] = useState<ShelfView>("store");
  const [zoomIndex, setZoomIndex] = useState(0);
  const [shown, setShown] = useState<Set<ExtraKind>>(() => new Set());
  const [metricsOpen, setMetricsOpen] = useState(false);

  const toggleExtra = useCallback((kind: ExtraKind) => {
    setShown((current) => {
      const next = new Set(current);
      if (next.has(kind)) next.delete(kind);
      else next.add(kind);
      return next;
    });
  }, []);

  const zoom = ZOOM_STEPS[zoomIndex];

  return (
    <div className={styles.page}>
      <SessionToolbar
        title={session.title}
        date={session.date}
        view={view}
        onViewChange={setView}
        onZoomIn={() =>
          setZoomIndex((index) => Math.min(ZOOM_STEPS.length - 1, index + 1))
        }
        onZoomOut={() => setZoomIndex((index) => Math.max(0, index - 1))}
        canZoomIn={zoomIndex < ZOOM_STEPS.length - 1}
        canZoomOut={zoomIndex > 0}
        zoomLabel={`${zoom}×`}
        onOpenMetrics={() => setMetricsOpen(true)}
      />

      <SessionHeader session={session} />

      <ShelfStage view={view} zoom={zoom} shown={shown} />

      <ShelfToggles shown={shown} onToggle={toggleExtra} />

      <SessionTables />

      {metricsOpen ? (
        <SessionMetricsDrawer
          session={session}
          visit={visit}
          onClose={() => setMetricsOpen(false)}
        />
      ) : null}
    </div>
  );
}
