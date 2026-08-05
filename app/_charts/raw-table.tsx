import type { CsvTable } from "@/app/_export/csv";
import { ExportButton } from "@/app/_export/export-button";
import { MeasureTable } from "./measure-table";
import { group } from "@/app/_format/num";
import type { Column, Row } from "./table";
import styles from "./charts.module.css";

/**
 * The Raw Data tab on every module.
 *
 * PowerBI streams tens of thousands of rows into a virtualised grid. We render
 * a capped window and put the complete extract behind Export, which is the
 * honest trade: nobody reads row 12,000 on screen, and virtualising a table
 * nobody scrolls would cost a scroll listener and a measurement pass on a
 * screen that otherwise has neither. The footer states the cap explicitly
 * rather than letting a truncated table imply it is the whole set.
 */

export function RawTable({
  title,
  columns,
  rows,
  csv,
  filename,
  cap = 50,
  emptyLabel = "No rows for this selection.",
  wide = false,
}: {
  title: string;
  columns: Column[];
  rows: Row[];
  /** The complete extract — not the capped window. */
  csv: CsvTable;
  filename: string;
  cap?: number;
  emptyLabel?: string;
  wide?: boolean;
}) {
  const shown = rows.slice(0, cap);
  const truncated = rows.length > cap;

  return (
    <div className={`${styles.card} ${styles.tableCard}`}>
      <div className={styles.tabbedHead}>
        <div className={styles.cardTitle}>{title}</div>
        <ExportButton
          table={csv}
          filename={filename}
          label="Export all rows"
          className={styles.exportButton}
        />
      </div>

      <MeasureTable
        columns={columns}
        rows={shown}
        emptyLabel={emptyLabel}
        maxHeight={460}
        wide={wide}
      />

      {rows.length > 0 ? (
        <div className={styles.tableFoot}>
          <span>
            {truncated
              ? `Showing the first ${group(cap)} of ${group(rows.length)} rows`
              : `${group(rows.length)} row${rows.length === 1 ? "" : "s"}`}
          </span>
          {truncated ? <span>Export for the complete extract</span> : null}
        </div>
      ) : null}
    </div>
  );
}
