import { TREND } from "../_data/photo-quality";
import styles from "./photo-quality.module.css";

/**
 * The 30-day pass-rate line, drawn by hand exactly as the design did: three
 * gridlines with mono labels, a dashed 95% target, the polyline and its dots.
 * All geometry is precomputed in `_data`, so this is pure markup.
 */
export function TrendChart() {
  return (
    <svg
      viewBox="0 0 720 170"
      width="100%"
      className={styles.trendSvg}
      role="img"
      aria-label="Pass rate over the last 30 days, rising from 88.4% to 91.3% against a 95% target"
    >
      {TREND.grid.map((line) => (
        <g key={line.label}>
          <line
            x1={34}
            x2={712}
            y1={line.y}
            y2={line.y}
            className={styles.trendGrid}
          />
          <text
            x={26}
            y={line.y}
            textAnchor="end"
            dominantBaseline="middle"
            className={styles.trendAxisLabel}
          >
            {line.label}
          </text>
        </g>
      ))}

      <line
        x1={34}
        x2={712}
        y1={TREND.targetY}
        y2={TREND.targetY}
        className={styles.trendTargetLine}
      />

      <polyline points={TREND.line} className={styles.trendLine} />

      {TREND.dots.map((dot) => (
        <circle
          key={dot.cx}
          cx={dot.cx}
          cy={dot.cy}
          r={3}
          className={styles.trendDot}
        />
      ))}

      {TREND.xLabels.map((tick) => (
        <text
          key={tick.x}
          x={tick.x}
          y={164}
          textAnchor="middle"
          className={styles.trendXLabel}
        >
          {tick.label}
        </text>
      ))}
    </svg>
  );
}
