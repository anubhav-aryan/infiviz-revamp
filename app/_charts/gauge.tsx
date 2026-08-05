import type { SeriesTone } from "./chart-types";
import styles from "./charts.module.css";

/**
 * The dial PowerBI uses for compliance scores, coverage counts and photo-quality
 * defect classes — roughly twenty of them across the dashboard.
 *
 * Arc geometry is precomputed in `_data` via `geom.arcPath`, so this is pure
 * markup like every other chart here. The target needle is what makes the dial
 * worth drawing rather than printing the number: it says where the value should
 * be, not just where it is.
 */

export type GaugeData = {
  viewBox: string;
  /** Full sweep, drawn as the unfilled track. */
  track: string;
  /** The filled portion, from the start of the sweep to the value. */
  value: string;
  /** Target marker across the band. Omitted where the measure has no target. */
  needle?: { x1: number; y1: number; x2: number; y2: number };
  /** Big readout, pre-formatted. */
  label: string;
  /** Fraction under the readout, e.g. `"436 / 1,311"`. */
  caption?: string;
  /** Scale ends, printed at the arc's feet. */
  min: string;
  max: string;
  tone: SeriesTone;
  ariaLabel: string;
};

export function Gauge({
  data,
  title,
  labelX,
  labelY,
}: {
  data: GaugeData;
  title: string;
  /** Centre of the readout inside the viewBox. */
  labelX: number;
  labelY: number;
}) {
  return (
    <div className={styles.gauge}>
      <div className={styles.gaugeTitle}>{title}</div>
      <svg
        viewBox={data.viewBox}
        className={styles.gaugeSvg}
        role="img"
        aria-label={data.ariaLabel}
      >
        <path d={data.track} className={styles.gaugeTrack} />
        <path d={data.value} className={styles.gaugeValue} data-tone={data.tone} />

        {data.needle ? (
          <line
            x1={data.needle.x1}
            y1={data.needle.y1}
            x2={data.needle.x2}
            y2={data.needle.y2}
            className={styles.gaugeNeedle}
          />
        ) : null}

        <text
          x={labelX}
          y={labelY}
          textAnchor="middle"
          className={styles.gaugeReadout}
        >
          {data.label}
        </text>

        {data.caption ? (
          <text
            x={labelX}
            y={labelY + 16}
            textAnchor="middle"
            className={styles.gaugeCaption}
          >
            {data.caption}
          </text>
        ) : null}
      </svg>

      <div className={styles.gaugeScale}>
        <span>{data.min}</span>
        <span>{data.max}</span>
      </div>
    </div>
  );
}
