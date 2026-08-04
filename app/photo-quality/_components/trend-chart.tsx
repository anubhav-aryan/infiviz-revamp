import type { PhotoQualityView } from "../_data/photo-quality";
import styles from "./photo-quality.module.css";

/**
 * The 30-day pass-rate line, drawn by hand exactly as the design did: three
 * gridlines with mono labels, a dashed 95% target, the polyline and its dots.
 * All geometry is precomputed in `_data`, so this is pure markup.
 */
export function TrendChart({ trend }: { trend: PhotoQualityView["trend"] }) {
  return (
    <svg
      viewBox="0 0 720 170"
      width="100%"
      className={styles.trendSvg}
      role="img"
      aria-label={trend.ariaLabel}
    >
      {trend.grid.map((line) => (
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
        y1={trend.targetY}
        y2={trend.targetY}
        className={styles.trendTargetLine}
      />

      <polyline points={trend.line} className={styles.trendLine} />

      {trend.dots.map((dot) => (
        <circle
          key={dot.cx}
          cx={dot.cx}
          cy={dot.cy}
          r={3}
          className={styles.trendDot}
        />
      ))}

      {trend.xLabels.map((tick) => (
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
