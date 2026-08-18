"use client";

import type { CSSProperties, ReactNode } from "react";
import { useRef } from "react";
import {
  authoredWidths,
  clampCol,
  trackList,
  type GridColumn,
} from "./grid-columns";
import { useColumnWidths } from "./use-column-widths";
import styles from "./resizable-grid.module.css";

/** Matches the demo state picker's keyboard nudge. */
const NUDGE = 16;

/**
 * A Master data table with draggable column edges.
 *
 * Body rows arrive as `children` so each board keeps rendering its own cells —
 * the adherence bar, the status pills, the mono handles — on the server. Only
 * the header and the track list are client-side.
 */
export function ResizableGrid({
  tableKey,
  columns,
  children,
}: {
  tableKey: string;
  columns: GridColumn[];
  children: ReactNode;
}) {
  const [widths, setWidth, resetWidth] = useColumnWidths(
    tableKey,
    authoredWidths(columns),
  );
  /** Where the drag started, so a slow drag can't accumulate rounding drift. */
  const drag = useRef<{ key: string; x: number; width: number } | null>(null);

  const startDrag = (column: GridColumn) => (event: React.PointerEvent) => {
    drag.current = {
      key: column.key,
      x: event.clientX,
      width: widths[column.key] ?? column.width,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  };

  const onDrag = (event: React.PointerEvent) => {
    const from = drag.current;
    if (!from) return;
    setWidth(from.key, clampCol(from.width + (event.clientX - from.x)));
  };

  const endDrag = (event: React.PointerEvent) => {
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const onKeyDown = (column: GridColumn) => (event: React.KeyboardEvent) => {
    const step =
      event.key === "ArrowRight" ? NUDGE : event.key === "ArrowLeft" ? -NUDGE : 0;
    if (!step) return;
    event.preventDefault();
    setWidth(column.key, clampCol((widths[column.key] ?? column.width) + step));
  };

  return (
    <div
      className={styles.grid}
      style={{ "--cols": trackList(columns, widths) } as CSSProperties}
    >
      <div className={`${styles.row} ${styles.head}`}>
        {columns.map((column) => (
          <span
            key={column.key}
            className={styles.headCell}
            data-align={column.align}
          >
            <span className={styles.headLabel}>{column.label}</span>
            {column.flex ? null : (
              // A separator rather than a button: it moves a boundary, it does
              // not perform an action, and that is what a screen reader should
              // hear when it lands here.
              <span
                className={styles.handle}
                role="separator"
                aria-orientation="vertical"
                aria-label={`Resize ${column.label} column`}
                tabIndex={0}
                onPointerDown={startDrag(column)}
                onPointerMove={onDrag}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                onKeyDown={onKeyDown(column)}
                onDoubleClick={() => resetWidth(column.key)}
              />
            )}
          </span>
        ))}
      </div>

      {children}
    </div>
  );
}

/**
 * One body row. Takes the same track list from the grid above it, so a cell can
 * never land under the wrong heading.
 */
export function GridRow({ children }: { children: ReactNode }) {
  return <div className={`${styles.row} ${styles.body}`}>{children}</div>;
}
