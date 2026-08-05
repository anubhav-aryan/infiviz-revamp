"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/app/_components/icon";
import { MeasureTable } from "./measure-table";
import { sortRows, type Column, type Row } from "./table";
import styles from "./charts.module.css";

/**
 * Sorting wrapper. The presentational table stays pure and server-renderable;
 * only this shell holds state, so a table that is never sorted costs nothing.
 *
 * `defaultSort` matches the order `_data` already delivered the rows in, so the
 * first render is the server's order and clicking a header is the only thing
 * that ever reorders. Sorting goes through the shared `sortRows`, which the CSV
 * export also uses — an export that disagrees with the screen is worse than no
 * export.
 */

export function SortableTable({
  columns,
  rows,
  emptyLabel,
  defaultSort,
  maxHeight = 420,
  wide = false,
}: {
  columns: Column[];
  rows: Row[];
  emptyLabel: string;
  /** Column index and direction the rows arrive in. */
  defaultSort?: { index: number; dir: "asc" | "desc" };
  maxHeight?: number;
  wide?: boolean;
}) {
  const [sort, setSort] = useState(defaultSort ?? null);

  const sorted = useMemo(
    () => (sort ? sortRows(rows, sort.index, sort.dir) : rows),
    [rows, sort],
  );

  return (
    <MeasureTable
      columns={columns}
      rows={sorted}
      emptyLabel={emptyLabel}
      maxHeight={maxHeight}
      wide={wide}
      sortState={sort ?? undefined}
      headerSlot={(column, index) => {
        if (column.unsortable) return column.label;

        const active = sort?.index === index;
        const nextDir = active && sort.dir === "desc" ? "asc" : "desc";

        return (
          <button
            type="button"
            className={styles.sortButton}
            onClick={() => setSort({ index, dir: nextDir })}
            aria-label={`Sort by ${column.label}, ${nextDir === "desc" ? "descending" : "ascending"}`}
          >
            {column.label}
            {active ? (
              <Icon
                name={sort.dir === "desc" ? "chevron-down" : "chevron-up"}
                size={13}
                className={styles.sortArrow}
              />
            ) : null}
          </button>
        );
      }}
    />
  );
}
