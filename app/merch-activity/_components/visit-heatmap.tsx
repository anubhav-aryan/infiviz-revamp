import { HEAT_ROWS } from "../_data/merch-activity";
import shared from "@/app/_reports/reports.module.css";
import styles from "./merch-activity.module.css";

/** The ramp under the legend, in the same order as `heatLevel`'s tiers. */
const RAMP = [0, 1, 2, 3, 4] as const;

/**
 * Ten merchandisers × the 31 days of July. Cells carry the design's native
 * `title` tooltip rather than anything richer, so hovering any of the 310
 * squares reads back the same string the design showed.
 */
export function VisitHeatmap() {
  return (
    <div className={`${shared.card} ${shared.cardPad}`}>
      <div className={styles.heatHead}>
        <div className={shared.cardTitle}>Visits logged · July 2026</div>
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

      {HEAT_ROWS.map((row) => (
        <div key={row.name} className={styles.heatRow}>
          <span className={styles.heatName}>{row.name}</span>
          <span className={styles.heatCells}>
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
