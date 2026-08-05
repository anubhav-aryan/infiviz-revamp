import { DeltaChip } from "@/app/_reports/marks";
import type { Delta } from "@/app/_reports/thresholds";
import styles from "./charts.module.css";

/**
 * The recurring "one number plus its movement" card — PowerBI's Number of
 * Actions, Actions per Visit, Total Revenue Impact, Overall Photo Quality and
 * the current-vs-previous cards on ROI are all this shape.
 *
 * `spark` is a precomputed `<polyline points>` string, like every other chart
 * here; the card never derives geometry at render.
 */

export type StatCardProps = {
  label: string;
  value: string;
  unit?: string;
  /** `sm` is the in-grid size; `lg` is the standalone hero. */
  size?: "lg" | "sm";
  delta?: Delta;
  /** A second, quieter movement line — ROI shows both MoM and absolute change. */
  secondary?: string;
  caption?: string;
  spark?: string;
  sparkViewBox?: string;
};

export function StatCard({
  label,
  value,
  unit,
  size = "lg",
  delta,
  secondary,
  caption,
  spark,
  sparkViewBox = "0 0 100 30",
}: StatCardProps) {
  return (
    <div className={`${styles.card} ${styles.statCard}`}>
      <div className={styles.statLabel}>{label}</div>

      <div className={styles.statValueRow}>
        <span className={styles.statValue} data-size={size === "sm" ? "sm" : undefined}>
          {value}
          {unit ? <span className={styles.statUnit}>{unit}</span> : null}
        </span>
        {delta ? <DeltaChip {...delta} size="hero" /> : null}
      </div>

      <div className={styles.statFoot}>
        <div>
          {caption ? <div className={styles.statCaption}>{caption}</div> : null}
          {secondary ? <div className={styles.statCaption}>{secondary}</div> : null}
        </div>

        {spark ? (
          <svg viewBox={sparkViewBox} className={styles.statSpark} aria-hidden="true">
            <polyline
              points={spark}
              fill="none"
              stroke="var(--indigo-400)"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : null}
      </div>
    </div>
  );
}
