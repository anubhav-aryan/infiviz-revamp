import type { GroupedColumnsData } from "./chart-types";
import { ChartAxisTitle } from "./trend-chart";
import styles from "./charts.module.css";

/**
 * Grouped columns — every Gap Analysis tab's "actual vs target" chart, plus
 * Store Coverage's covered-vs-target and Merchandiser's actual-vs-planned.
 *
 * Rects only; the geometry comes from `geom.groupedColumns`. The value label
 * above each bar is what makes PowerBI's version readable without a tooltip,
 * so it is carried per bar rather than being optional decoration.
 */

export function GroupedColumns({ data }: { data: GroupedColumnsData }) {
  const { plot } = data;

  return (
    <svg
      viewBox={data.viewBox}
      width="100%"
      className={styles.chart}
      role="img"
      aria-label={data.ariaLabel}
    >
      {data.grid.map((line) => (
        <g key={`grid-${line.label}`}>
          <line
            x1={plot.x0}
            x2={plot.x1}
            y1={line.y}
            y2={line.y}
            className={styles.gridLine}
          />
          <text
            x={plot.x0 - 6}
            y={line.y}
            textAnchor="end"
            dominantBaseline="middle"
            className={styles.axisLabel}
          >
            {line.label}
          </text>
        </g>
      ))}

      {data.groups.map((group) =>
        group.bars.map((bar, index) => (
          <rect
            key={`bar-${group.label}-${index}`}
            x={bar.x}
            y={bar.y}
            width={bar.width}
            height={bar.height}
            rx={2}
            className={styles.column}
            data-tone={bar.tone}
          />
        )),
      )}

      {data.groups.map((group) =>
        group.bars.map((bar, index) =>
          bar.label ? (
            <text
              key={`bar-label-${group.label}-${index}`}
              x={bar.label.x}
              y={bar.label.y}
              textAnchor="middle"
              className={styles.dataLabel}
            >
              {bar.label.text}
            </text>
          ) : null,
        ),
      )}

      {data.xLabels.map((tick) => (
        <text
          key={`x-${tick.x}`}
          x={tick.x}
          y={plot.labelY}
          textAnchor="middle"
          className={styles.axisLabel}
        >
          {tick.label}
        </text>
      ))}

      {data.axisTitle ? <ChartAxisTitle title={data.axisTitle} /> : null}
      {data.xAxisTitle ? <ChartAxisTitle title={data.xAxisTitle} /> : null}
    </svg>
  );
}

/** Shared legend row — grouped columns, stacked areas and donuts all use it. */
export function ChartLegend({
  items,
  shape = "dot",
}: {
  items: { label: string; value?: string; tone: string }[];
  shape?: "dot" | "swatch";
}) {
  return (
    <div className={styles.legend}>
      {items.map((item) => (
        <span key={item.label} className={styles.legendItem}>
          <span
            className={shape === "dot" ? styles.legendDot : styles.legendSwatch}
            data-tone={item.tone}
          />
          {item.label}
          {item.value ? (
            <span className={styles.legendValue}>{item.value}</span>
          ) : null}
        </span>
      ))}
    </div>
  );
}
