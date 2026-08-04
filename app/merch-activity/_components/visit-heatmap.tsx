import type { HeatRow } from "../_data/merch-activity";
import shared from "@/app/_reports/reports.module.css";
import styles from "./merch-activity.module.css";

/** The ramp under the legend, in the same order as `heatLevel`'s tiers. */
const RAMP = [0, 1, 2, 3, 4] as const;

type VisitHeatmapProps = {
  title: string;
  rows: HeatRow[];
  /** Days in the month — the grid's column count, 28 through 31. */
  days: number;
};

/**
 * Ten merchandisers × the days of the month. Cells carry the design's native
 * `title` tooltip rather than anything richer, so hovering any of the ~300
 * squares reads back the same string the design showed.
 */
export function VisitHeatmap({ title, rows, days }: VisitHeatmapProps) {
  return (
    <div className={`${shared.card} ${shared.cardPad}`}>
      <div className={styles.heatHead}>
        <div className={shared.cardTitle}>{title}</div>
        <div className={styles.heatLegend}>
          Fewer
          <span className={styles.heatRamp} aria-hidden="true">
            {RAMP.map((level) => (
              <span
                key={level}
                className={`${styles.heatCell} ${styles.heatSwatch}`}
                data-level={level}
              />
            ))}
          </span>
          More
        </div>
      </div>

      {rows.map((row) => (
        <div key={row.name} className={styles.heatRow}>
          <span className={styles.heatName}>{row.name}</span>
          <span className={styles.heatCells} data-days={days}>
            {row.cells.map((cell) => (
              <span
                key={cell.title}
                title={cell.title}
                className={`${styles.heatCell} ${styles.heatCellDay}`}
                data-level={cell.level}
              />
            ))}
          </span>
        </div>
      ))}
    </div>
  );
}
