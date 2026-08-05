import styles from "./charts.module.css";

/**
 * Horizontal bar list — PowerBI's "Why SOS was not fixed?", "Category-wise
 * actions generated" and the account/region time-spent charts are all this.
 *
 * Bars are CSS widths rather than SVG, matching how every other bar in this
 * app is drawn (`_reports/marks.tsx`). `pct` is the share of the widest row,
 * computed in `_data` — the component never scans the rows to find a maximum.
 */

export type BarRow = {
  label: string;
  /** Pre-formatted value shown at the end of the row. */
  value: string;
  /** Width as a percentage of the track, 0–100. */
  pct: number;
  tone?: "danger";
};

export function HBarList({
  rows,
  nameWidth = "150px",
  emptyLabel = "Nothing to show for this selection.",
}: {
  rows: BarRow[];
  nameWidth?: string;
  emptyLabel?: string;
}) {
  if (rows.length === 0) return <div className={styles.empty}>{emptyLabel}</div>;

  return (
    <div
      className={styles.barList}
      style={{ ["--bar-name" as string]: nameWidth }}
    >
      {rows.map((row) => (
        <div key={row.label} className={styles.barRow} data-tone={row.tone}>
          <span className={styles.barRowName} title={row.label}>
            {row.label}
          </span>
          <span className={styles.barTrack}>
            <span className={styles.barFill} style={{ width: `${row.pct}%` }} />
          </span>
          <span className={styles.barRowValue}>{row.value}</span>
        </div>
      ))}
    </div>
  );
}
