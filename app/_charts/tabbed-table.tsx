"use client";

import { useState } from "react";
import { MeasureTable } from "./measure-table";
import type { Column, Row } from "./table";
import styles from "./charts.module.css";

/**
 * A card holding several views of the same subject, switched in place —
 * PowerBI's "Visit-Wise SOS / Store-Wise SOS", "Store OSA / SKU OSA",
 * "Bottom 20 Outlets / Bottom 20 SKUs", "Outlet-Wise / SKU-Wise".
 *
 * The choice is local state rather than a query param on purpose: it is a
 * reading preference inside one card, not a scope the rest of the screen or a
 * shared link should inherit.
 */

export type TableView = {
  id: string;
  label: string;
  columns: Column[];
  rows: Row[];
  emptyLabel: string;
};

export function TabbedTable({
  views,
  title,
  maxHeight = 360,
  wide = false,
  action,
  variant = "pills",
}: {
  views: TableView[];
  title?: string;
  maxHeight?: number;
  wide?: boolean;
  /** Right-aligned slot — a toggle or export button. */
  action?: React.ReactNode;
  /**
   * `pills` keeps the compact in-header tabs every analytics table uses.
   * `underline` gives the tabs their own row with an indigo rule under the
   * active one — the Session Viewer's treatment, where the card is the page's
   * last block rather than one panel among several.
   */
  variant?: "pills" | "underline";
}) {
  const [activeId, setActiveId] = useState(views[0]?.id);
  const active = views.find((view) => view.id === activeId) ?? views[0];

  if (!active) return null;

  return (
    <div className={`${styles.card} ${styles.tableCard}`}>
      <div className={styles.tabbedHead} data-variant={variant}>
        {variant === "underline" && title ? (
          <span className={styles.tabbedTitle}>{title}</span>
        ) : null}
        <div
          className={styles.miniTabs}
          data-variant={variant}
          role="group"
          aria-label={title ?? "Table views"}
        >
          {views.map((view) => (
            <button
              key={view.id}
              type="button"
              className={styles.miniTab}
              data-variant={variant}
              data-active={view.id === active.id}
              aria-pressed={view.id === active.id}
              onClick={() => setActiveId(view.id)}
            >
              {view.label}
            </button>
          ))}
        </div>
        {action}
      </div>

      <MeasureTable
        columns={active.columns}
        rows={active.rows}
        emptyLabel={active.emptyLabel}
        maxHeight={maxHeight}
        wide={wide}
      />
    </div>
  );
}
