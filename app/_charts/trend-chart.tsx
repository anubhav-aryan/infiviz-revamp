import type { AxisTitle, TrendChartData } from "./chart-types";
import styles from "./charts.module.css";

/**
 * Area + line trend with data labels and a dotted trendline — the single most
 * repeated visual in the PowerBI dashboard (every module's "… trend, month
 * wise, last 6 months").
 *
 * Extends the idiom of `photo-quality/_components/trend-chart.tsx`: gridlines
 * with mono labels, a dashed reference rule, polyline and dots. New here are
 * the filled area, the per-point value labels PowerBI prints, and the
 * least-squares overlay. All geometry is precomputed — this is pure markup.
 */

export function ChartAxisTitle({ title }: { title: AxisTitle }) {
  return (
    <text
      x={title.x}
      y={title.y}
      textAnchor="middle"
      className={styles.axisTitle}
      transform={
        title.rotate ? `rotate(${title.rotate} ${title.x} ${title.y})` : undefined
      }
    >
      {title.text}
    </text>
  );
}

export function TrendChart({ data }: { data: TrendChartData }) {
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

      {data.rules?.map((rule) => (
        <line
          key={`rule-${rule.y}`}
          x1={plot.x0}
          x2={plot.x1}
          y1={rule.y}
          y2={rule.y}
          className={styles.targetLine}
        />
      ))}

      {/* Areas first, so every line, dot and label sits above every fill. */}
      {data.series.map((series) =>
        series.area ? (
          <path
            key={`area-${series.label}`}
            d={series.area}
            className={styles.areaFill}
            data-tone={series.tone}
          />
        ) : null,
      )}

      {data.series.map((series) => (
        <polyline
          key={`line-${series.label}`}
          points={series.line}
          className={styles.seriesLine}
          data-tone={series.tone}
        />
      ))}

      {data.trend ? (
        <line
          x1={data.trend.x1}
          y1={data.trend.y1}
          x2={data.trend.x2}
          y2={data.trend.y2}
          className={styles.trendline}
        />
      ) : null}

      {data.markX !== undefined ? (
        <line
          x1={data.markX}
          x2={data.markX}
          y1={plot.y0}
          y2={plot.y1}
          className={styles.markLine}
        />
      ) : null}

      {data.series.map((series) =>
        series.dots?.map((dot) => (
          <circle
            key={`dot-${series.label}-${dot.cx}`}
            cx={dot.cx}
            cy={dot.cy}
            r={3}
            className={styles.seriesDot}
            data-tone={series.tone}
          />
        )),
      )}

      {data.series.map((series) =>
        series.labels?.map((label) => (
          <text
            key={`label-${series.label}-${label.x}`}
            x={label.x}
            y={label.y}
            textAnchor="middle"
            className={styles.dataLabel}
          >
            {label.text}
          </text>
        )),
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
