"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Icon } from "./icon";
import { useChartOrder } from "./use-chart-order";
import styles from "./reorderable-grid.module.css";

/**
 * Drag-to-rearrange for cards a screen already builds.
 *
 * Deliberately a wrapper around whatever JSX a screen already renders, rather
 * than a card component of its own — each item keeps its own header and its
 * own Ask InfiChat / Excel / Create-ticket buttons untouched; this adds a grip
 * chip in the corner and decides what order they come in.
 *
 * Native HTML5 drag-and-drop, not a library. There is no other drag-and-drop
 * anywhere in this app, and a library would be a lot of new surface for what a
 * mockup needs — which is also why the two entry points below share one
 * implementation instead of growing a second.
 *
 * `ReorderableGrid` persists the order per screen; `ControlledReorderableGrid`
 * leaves it to the caller, for a draft that must not touch storage yet.
 */

export type ReorderableItem = {
  id: string;
  node: ReactNode;
  /**
   * How many columns this item takes when the grid has more than one. Ignored
   * at `columns={1}`, which is every screen that predates boards.
   */
  span?: "half" | "full";
};

type GridShape = {
  items: ReorderableItem[];
  className?: string;
  /** Px gap between items. Set to `0` for screens that space their own
   *  top-level blocks via `margin-bottom` rather than a flex gap. */
  gap?: number;
  /**
   * Columns to lay the items out in. `1` — the default, and what every
   * Analytics screen uses — keeps the original single-column flex exactly as
   * it was; `2` switches to a CSS grid where an item's `span` applies.
   *
   * Boards need two-across to read as a dashboard, and this is the app's only
   * drag-and-drop, so it grows a column count rather than gaining a rival
   * implementation. The reorder itself is untouched either way: `order` is a
   * flat array and dropping splices it, which a grid lays out just as happily
   * as a flex column.
   */
  columns?: 1 | 2;
};

/**
 * The order is persisted per screen under `pageKey` — the original and still
 * the common case.
 */
export function ReorderableGrid({ pageKey, ...rest }: GridShape & { pageKey: string }) {
  const [order, setOrder] = useChartOrder(
    pageKey,
    rest.items.map((item) => item.id),
  );
  return <Grid {...rest} order={order} onReorder={setOrder} />;
}

/**
 * The order lives in the caller's state and nothing is written to storage.
 *
 * For a draft — the board editor, where the whole contract is that nothing
 * persists until Save, so a grid that quietly wrote a layout key on every drag
 * would break it. Deliberately a second entry point rather than an optional
 * `pageKey`: `useChartOrder` cannot be called conditionally, and giving it a
 * placeholder key would let two draft grids share one cache entry and fight
 * over it — which is exactly the class of bug that made boards unusable.
 */
export function ControlledReorderableGrid(props: GridShape & {
  /** Ids in render order. Any id not in `items` is skipped. */
  order: string[];
  onReorder: (next: string[]) => void;
}) {
  return <Grid {...props} />;
}

function Grid({
  items,
  className,
  gap = 16,
  columns = 1,
  order,
  onReorder: setOrder,
}: GridShape & { order: string[]; onReorder: (next: string[]) => void }) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const byId = new Map(items.map((item) => [item.id, item]));
  const ordered = order.map((id) => byId.get(id)).filter((item): item is ReorderableItem => !!item);

  /**
   * `after` puts the dragged item on the far side of the target.
   *
   * Without it insertion is always *before* the target, which means the last
   * slot is unreachable: with `[A, B, C]`, dropping A on C gives `[B, A, C]`
   * and A can never become last. The caller decides from where in the target
   * the pointer actually was.
   */
  const handleDrop = (targetId: string, after: boolean) => {
    if (dragId && dragId !== targetId) {
      const next = order.filter((id) => id !== dragId);
      next.splice(next.indexOf(targetId) + (after ? 1 : 0), 0, dragId);
      setOrder(next);
    }
    setDragId(null);
    setOverId(null);
  };

  /**
   * Which half of the cell the pointer is in. Horizontal at two columns, where
   * neighbours sit side by side and a vertical midpoint would answer the wrong
   * question; vertical in a single column.
   */
  const isAfter = (event: React.DragEvent<HTMLDivElement>): boolean => {
    const box = event.currentTarget.getBoundingClientRect();
    return columns === 2
      ? event.clientX > box.left + box.width / 2
      : event.clientY > box.top + box.height / 2;
  };

  return (
    <div
      className={`${styles.grid} ${className ?? ""}`}
      style={{ gap }}
      data-columns={columns === 2 ? "2" : undefined}
    >
      {ordered.map((item) => (
        <div
          key={item.id}
          className={styles.cell}
          draggable
          data-span={columns === 2 ? (item.span ?? "full") : undefined}
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
            handleDrop(item.id, isAfter(event));
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
