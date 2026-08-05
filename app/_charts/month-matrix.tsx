"use client";

import { useState } from "react";
import { Icon } from "@/app/_components/icon";
import styles from "./charts.module.css";

/**
 * The expandable month matrix — PowerBI's Trend Analysis tab, where a store
 * brand opens into its stores and each cell is one month's measure.
 *
 * Two things make this different from the other tables. The first column is
 * sticky, because the row label is the only thing that makes a wall of numbers
 * readable once it scrolls sideways. And the group rows expand, which is the
 * one piece of client state here — the cells themselves are precomputed in
 * `_data`, colour tier included.
 *
 * Blank cells are meaningful: PowerBI leaves a month empty when the store was
 * not visited, and so do we. A zero would read as "measured, and it was zero".
 */

export type MatrixCell = {
  /** Pre-formatted, or empty for a month with no visit. */
  text: string;
  /** 0–4 on the same ramp the heatmaps use; omitted for a blank cell. */
  level?: 0 | 1 | 2 | 3 | 4;
};

export type MatrixRow = {
  id: string;
  label: string;
  cells: MatrixCell[];
};

export type MatrixGroup = MatrixRow & { children: MatrixRow[] };

export function MonthMatrix({
  columns,
  groups,
  rowHeader,
  ariaLabel,
}: {
  columns: string[];
  groups: MatrixGroup[];
  rowHeader: string;
  ariaLabel: string;
}) {
  const [open, setOpen] = useState<string[]>(() =>
    // First group open, so the shape of the data is visible without a click.
    groups.length > 0 ? [groups[0].id] : [],
  );

  const toggle = (id: string) =>
    setOpen((current) =>
      current.includes(id)
        ? current.filter((entry) => entry !== id)
        : [...current, id],
    );

  if (groups.length === 0) {
    return <div className={styles.empty}>No history for this selection.</div>;
  }

  return (
    <div className={styles.matrixScroll}>
      <table className={styles.matrix} aria-label={ariaLabel}>
        <thead>
          <tr>
            <th className={styles.matrixRowHead} scope="col">
              {rowHeader}
            </th>
            {columns.map((column) => (
              <th key={column} scope="col">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => {
            const isOpen = open.includes(group.id);
            return [
              <tr key={group.id} className={styles.matrixGroupRow}>
                <th className={styles.matrixRowHead} scope="row">
                  <button
                    type="button"
                    className={styles.matrixToggle}
                    onClick={() => toggle(group.id)}
                    aria-expanded={isOpen}
                  >
                    <Icon name={isOpen ? "chevron-down" : "chevron-right"} size={14} />
                    {group.label}
                  </button>
                </th>
                {group.cells.map((cell, index) => (
                  <td
                    key={`${group.id}-${index}`}
                    className={styles.matrixCell}
                    data-level={cell.level}
                  >
                    {cell.text}
                  </td>
                ))}
              </tr>,
              ...(isOpen
                ? group.children.map((child) => (
                    <tr key={child.id}>
                      <th className={styles.matrixRowHead} scope="row" data-child="true">
                        {child.label}
                      </th>
                      {child.cells.map((cell, index) => (
                        <td
                          key={`${child.id}-${index}`}
                          className={styles.matrixCell}
                          data-level={cell.level}
                        >
                          {cell.text}
                        </td>
                      ))}
                    </tr>
                  ))
                : []),
            ];
          })}
        </tbody>
      </table>
    </div>
  );
}
