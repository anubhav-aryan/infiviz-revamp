import type { Column, Row } from "./table";
import { MeasureTable } from "./measure-table";
import styles from "./charts.module.css";

/**
 * The "actual vs target" detail tables that sit at the bottom of every Gap
 * Analysis tab, plus the visit/outlet-wise tables on Analytics.
 *
 * The only thing it adds over `MeasureTable` is the SE Link column, appended
 * here so ~15 call sites don't each re-declare it. Rows opt in by ending with
 * a `seLink` cell; `sessionHrefs` is not resolved here because whether a row
 * has session evidence is a data question, answered in `_data`.
 */

export const SE_LINK_COLUMN: Column = {
  key: "se",
  label: "SE Link",
  align: "right",
  width: "72px",
  unsortable: true,
};

export function DetailTable({
  title,
  caption,
  columns,
  rows,
  emptyLabel,
  maxHeight = 380,
  wide = false,
  seLink = true,
  action,
}: {
  title: string;
  caption?: string;
  columns: Column[];
  rows: Row[];
  emptyLabel: string;
  maxHeight?: number;
  wide?: boolean;
  /** Set false for tables with no per-row session, e.g. brand roll-ups. */
  seLink?: boolean;
  action?: React.ReactNode;
}) {
  return (
    <div className={`${styles.card} ${styles.tableCard}`}>
      <div className={styles.tabbedHead}>
        <div>
          <div className={styles.cardTitle}>{title}</div>
          {caption ? <div className={styles.cardCaption}>{caption}</div> : null}
        </div>
        {action}
      </div>

      <MeasureTable
        columns={seLink ? [...columns, SE_LINK_COLUMN] : columns}
        rows={rows}
        emptyLabel={emptyLabel}
        maxHeight={maxHeight}
        wide={wide}
      />
    </div>
  );
}
