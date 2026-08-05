import type { StackedAreaData } from "./chart-types";
import { ChartLegend } from "./grouped-columns";
import { ChartAxisTitle } from "./trend-chart";
import styles from "./charts.module.css";

/**
 * Stacked area — Shelving's format-block and flavour-block trends.
 *
 * **Deliberately capped at seven bands.** PowerBI draws sixteen flavour series
 * here; this design system has one indigo ramp and four semantic colours, which
 * gives about six distinguishable steps, and stacked bands are adjacent by
 * construction so near-neighbours are exactly what a reader has to tell apart.
 * Sixteen bands would be a chart nobody can read. `_data` therefore keeps the
 * top six and rolls the remainder into "Other", and the legend says so.
 *
 * That is a real reduction against the source dashboard, recorded rather than
 * hidden.
 */

export function StackedArea({ data }: { data: StackedAreaData }) {
  const { plot } = data;

  return (
    <div>
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

        {data.bands.map((band) => (
          <path
            key={band.label}
            d={band.d}
            className={styles.band}
            data-tone={band.tone}
          >
            <title>{band.label}</title>
          </path>
        ))}

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
      </svg>

      <ChartLegend items={data.legend} shape="swatch" />
    </div>
  );
}
