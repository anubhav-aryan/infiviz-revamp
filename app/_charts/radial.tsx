import type { DonutData, PieData } from "./chart-types";
import { ChartLegend } from "./grouped-columns";
import styles from "./charts.module.css";

/**
 * Donut and pie. PowerBI uses the donut for "own vs competition" on every
 * Category Management tab, and the pie for open-vs-closed tasks and the ROI
 * revenue split.
 *
 * The donut is dasharrays on one stroked circle rather than annulus paths:
 * the ring's thickness stays a single `stroke-width`, and the segments are two
 * numbers each instead of two arcs. The -90 rotation moves the stroke's start
 * from three o'clock to twelve, which is where every reader expects it.
 */

export function Donut({ data }: { data: DonutData }) {
  const size = (data.radius + data.strokeWidth) * 2 + 4;
  const centre = size / 2;

  return (
    <div className={styles.radialWrap}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className={styles.radial}
        role="img"
        aria-label={data.ariaLabel}
      >
        <g transform={`rotate(-90 ${centre} ${centre})`}>
          {data.segments.map((segment) => (
            <circle
              key={segment.label}
              cx={centre}
              cy={centre}
              r={data.radius}
              fill="none"
              strokeWidth={data.strokeWidth}
              strokeDasharray={segment.dash}
              strokeDashoffset={segment.offset}
              className={styles.ringSegment}
              data-tone={segment.tone}
            />
          ))}
        </g>

        {data.centre ? (
          <>
            <text
              x={centre}
              y={data.centre.caption ? centre - 2 : centre}
              textAnchor="middle"
              dominantBaseline="middle"
              className={styles.radialValue}
            >
              {data.centre.value}
            </text>
            {data.centre.caption ? (
              <text
                x={centre}
                y={centre + 16}
                textAnchor="middle"
                dominantBaseline="middle"
                className={styles.radialCaption}
              >
                {data.centre.caption}
              </text>
            ) : null}
          </>
        ) : null}
      </svg>

      <ChartLegend items={data.legend} />
    </div>
  );
}

export function Pie({ data, maxWidth }: { data: PieData; maxWidth?: number }) {
  return (
    <div className={styles.radialWrap}>
      <svg
        viewBox={data.viewBox}
        className={styles.radial}
        style={maxWidth ? { maxWidth: `${maxWidth}px` } : undefined}
        role="img"
        aria-label={data.ariaLabel}
      >
        {data.slices.map((slice) => (
          <path
            key={slice.label}
            d={slice.d}
            className={styles.pieSlice}
            data-tone={slice.tone}
          />
        ))}

        {data.slices.map((slice) => (
          <text
            key={`label-${slice.label}`}
            x={slice.labelX}
            y={slice.labelY}
            textAnchor={slice.anchor}
            dominantBaseline="middle"
            className={styles.dataLabel}
          >
            {slice.text}
          </text>
        ))}
      </svg>

      <ChartLegend items={data.legend} />
    </div>
  );
}
