"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  BOX_LEGEND,
  BOX_PAINT,
  COMPLIANCE_LEGEND,
  COMPLIANCE_PAINT,
  EXTRA_BOXES,
  EXTRA_PAINT,
  RECOGNITION_BOXES,
  SHELF_IMAGE,
  STITCH_PANELS,
  type ExtraKind,
  type ShelfView,
} from "../_data/session-viewer";
import styles from "./session-viewer.module.css";

/** The canvas the box coordinates were authored against. */
const CANVAS_H = 56;

const kindLabel = (kind: (typeof RECOGNITION_BOXES)[number]["kind"]) =>
  BOX_LEGEND.find((entry) => entry.kind === kind)?.label ?? kind;

const complianceLabel = (kind: (typeof RECOGNITION_BOXES)[number]["compliance"]) =>
  COMPLIANCE_LEGEND.find((entry) => entry.kind === kind)?.label ?? kind;

type ShelfStageProps = {
  view: ShelfView;
  zoom: number;
  /** Which `ExtraBox` kinds the toggles are currently revealing. */
  shown: Set<ExtraKind>;
};

/**
 * The stitched shelf, its recognition overlay, and the minimap under it.
 *
 * **Zoom is layout width, not `transform: scale()`.** `.stage` is sized
 * `width: calc(var(--zoom) * 100%)` inside a `.stageViewport` that scrolls, and
 * the image, the SVG and the hit layer are all children of `.stage` sized in
 * relative units — `inset: 0` for the first two, percentages for the third. So
 * widening the stage re-lays out all three identically and the boxes stay
 * registered to the products at every zoom level, with nothing recomputed in JS.
 *
 * A transform would have been wrong twice over: it scales `strokeWidth` and the
 * hover label into unreadable slabs, and `overflow: auto` on a transformed
 * child reports the wrong `scrollWidth`, so panning would need manual translate
 * maths instead of native scrolling.
 */
export function ShelfStage({ view, zoom, shown }: ShelfStageProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  /** Visible fraction of the stitch, for the minimap rect. `1` before any
   *  scroll, which is what zoom 1 shows — so server and client agree. */
  const [viewWindow, setViewWindow] = useState({ left: 0, width: 1 });

  const measure = useCallback(() => {
    const node = viewportRef.current;
    if (!node || node.scrollWidth === 0) return;
    setViewWindow({
      left: node.scrollLeft / node.scrollWidth,
      width: node.clientWidth / node.scrollWidth,
    });
  }, []);

  // Zoom changes the scrollable width without firing a scroll event.
  useEffect(measure, [measure, zoom]);

  const hoveredBox = hovered !== null ? RECOGNITION_BOXES[hovered] : null;
  const legend = view === "store" ? BOX_LEGEND : COMPLIANCE_LEGEND;
  const extras = EXTRA_BOXES.filter((box) => shown.has(box.kind));

  /** Clicking the minimap recentres the viewport on that point. */
  const recentre = (event: React.MouseEvent<HTMLDivElement>) => {
    const node = viewportRef.current;
    if (!node) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const fraction = (event.clientX - rect.left) / rect.width;
    node.scrollLeft = fraction * node.scrollWidth - node.clientWidth / 2;
  };

  return (
    <div className={`${styles.card} ${styles.stageCard}`}>
      <div
        ref={viewportRef}
        className={styles.stageViewport}
        onScroll={measure}
        // Scrollable regions need to be reachable and operable by keyboard.
        tabIndex={0}
        role="group"
        aria-label="Stitched shelf capture"
      >
        <div className={styles.stage} style={{ "--zoom": zoom } as React.CSSProperties}>
          <img
            className={styles.shelfImage}
            src={SHELF_IMAGE}
            alt="Stitched shelf capture"
          />

          {/* `preserveAspectRatio="none"` is deliberate: the boxes were placed
              against the stitch, so they must stretch with it rather than stay
              square. */}
          <svg
            viewBox="0 0 100 56"
            preserveAspectRatio="none"
            className={styles.shelfOverlay}
            aria-label="Recognition boxes over the stitched shelf"
          >
            {RECOGNITION_BOXES.map((box) => {
              const paint =
                view === "store"
                  ? BOX_PAINT[box.kind]
                  : COMPLIANCE_PAINT[box.compliance];
              return (
                <rect
                  key={`${box.kind}-${box.x}-${box.y}`}
                  x={box.x}
                  y={box.y}
                  width={box.w}
                  height={box.h}
                  rx="0.6"
                  fill={paint.fill}
                  stroke={paint.stroke}
                  strokeWidth="0.6"
                  strokeDasharray={paint.dash}
                />
              );
            })}

            {extras.map((box) => {
              const paint = EXTRA_PAINT[box.kind];
              return (
                <rect
                  key={`${box.kind}-${box.x}-${box.y}`}
                  x={box.x}
                  y={box.y}
                  width={box.w}
                  height={box.h}
                  rx="0.4"
                  fill={paint.fill}
                  stroke={paint.stroke}
                  strokeWidth="0.5"
                  strokeDasharray={paint.dash}
                />
              );
            })}
          </svg>

          {/* HTML hit-targets in percentage coordinates over the same boxes —
              an SVG `<rect>` has no hover/focus affordance of its own worth
              relying on, so metrics are surfaced through a parallel layer
              instead of inside the SVG. */}
          <div className={styles.shelfHitLayer}>
            {RECOGNITION_BOXES.map((box, index) => (
              <button
                key={`${box.kind}-${box.x}-${box.y}`}
                type="button"
                className={styles.shelfHitTarget}
                style={{
                  left: `${box.x}%`,
                  top: `${(box.y / CANVAS_H) * 100}%`,
                  width: `${box.w}%`,
                  height: `${(box.h / CANVAS_H) * 100}%`,
                }}
                onMouseEnter={() => setHovered(index)}
                onMouseLeave={() =>
                  setHovered((current) => (current === index ? null : current))
                }
                onFocus={() => setHovered(index)}
                onBlur={() =>
                  setHovered((current) => (current === index ? null : current))
                }
                aria-label={
                  view === "store"
                    ? `${kindLabel(box.kind)} · ${Math.round(box.confidence * 100)}% confidence`
                    : `${complianceLabel(box.compliance)} · ${kindLabel(box.kind)}`
                }
              />
            ))}

            {hoveredBox ? (
              <span
                className={styles.shelfHoverLabel}
                style={{
                  left: `${hoveredBox.x}%`,
                  top: `${(hoveredBox.y / CANVAS_H) * 100}%`,
                }}
              >
                {view === "store"
                  ? `${kindLabel(hoveredBox.kind)} · ${Math.round(hoveredBox.confidence * 100)}%`
                  : `${complianceLabel(hoveredBox.compliance)} · ${kindLabel(hoveredBox.kind)}`}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* The panels the stitch was assembled from, labelled under their span. */}
      <div className={styles.panelStrip}>
        {STITCH_PANELS.map((panel, index) => (
          <span key={index} className={styles.panelTag}>
            <span>Shelf: {panel.shelf}</span>
            <span>Brand: {panel.brand}</span>
          </span>
        ))}
      </div>

      <div
        className={styles.minimap}
        onClick={recentre}
        role="presentation"
        title="Click to move the view"
      >
        <img className={styles.minimapImage} src={SHELF_IMAGE} alt="" />
        <span
          className={styles.minimapWindow}
          style={{
            left: `${viewWindow.left * 100}%`,
            width: `${Math.min(1, viewWindow.width) * 100}%`,
          }}
        />
      </div>

      <div className={styles.legend}>
        {legend.map((entry) => (
          <span key={entry.kind} className={styles.legendItem}>
            <span
              className={styles.legendSwatch}
              data-kind={entry.kind}
              aria-hidden="true"
            />
            {entry.label}
          </span>
        ))}
      </div>
    </div>
  );
}
