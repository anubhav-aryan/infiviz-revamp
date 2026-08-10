"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Icon } from "./icon";
import { useChartOrder } from "./use-chart-order";
import styles from "./reorderable-grid.module.css";

export type ReorderableItem = { id: string; node: ReactNode };

/**
 * Wraps an existing set of chart cards so they can be dragged into a new
 * order, persisted per screen (see `useChartOrder`). Deliberately a wrapper
 * around whatever JSX a screen already builds for its cards, rather than a
 * new card component — each item keeps its own header, its own Ask InfiChat/
 * Excel/Create-ticket buttons, untouched; this only adds a drag handle
 * chip in the corner and controls the order they're rendered in.
 *
 * Native HTML5 drag-and-drop, not a library — there's no other
 * drag-and-drop anywhere in this app, and a library would be a lot of new
 * surface for what a mockup needs.
 */
export function ReorderableGrid({
  pageKey,
  items,
  className,
  gap = 16,
}: {
  pageKey: string;
  items: ReorderableItem[];
  className?: string;
  /** Px gap between items. Set to `0` for screens that space their own
   *  top-level blocks via `margin-bottom` rather than a flex gap. */
  gap?: number;
}) {
  const authored = items.map((item) => item.id);
  const [order, setOrder] = useChartOrder(pageKey, authored);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const byId = new Map(items.map((item) => [item.id, item]));
  const ordered = order.map((id) => byId.get(id)).filter((item): item is ReorderableItem => !!item);

  const handleDrop = (targetId: string) => {
    if (dragId && dragId !== targetId) {
      const next = order.filter((id) => id !== dragId);
      next.splice(next.indexOf(targetId), 0, dragId);
      setOrder(next);
    }
    setDragId(null);
    setOverId(null);
  };

  return (
    <div className={`${styles.grid} ${className ?? ""}`} style={{ gap }}>
      {ordered.map((item) => (
        <div
          key={item.id}
          className={styles.cell}
          draggable
          data-dragging={dragId === item.id || undefined}
          data-drag-over={(overId === item.id && dragId !== item.id) || undefined}
          onDragStart={(event) => {
            event.dataTransfer.effectAllowed = "move";
            setDragId(item.id);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            if (overId !== item.id) setOverId(item.id);
          }}
          onDragLeave={() => setOverId((current) => (current === item.id ? null : current))}
          onDrop={(event) => {
            event.preventDefault();
            handleDrop(item.id);
          }}
          onDragEnd={() => {
            setDragId(null);
            setOverId(null);
          }}
        >
          <span className={styles.handle} title="Drag to reorder" aria-hidden="true">
            <Icon name="grip-vertical" size={14} />
          </span>
          {item.node}
        </div>
      ))}
    </div>
  );
}
