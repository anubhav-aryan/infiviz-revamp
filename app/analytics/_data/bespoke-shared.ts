import type { GaugeData } from "@/app/_charts/gauge";
import type { SeriesTone, TrendChartData } from "@/app/_charts/chart-types";
import {
  areaPath,
  bandX,
  gaugeGeometry,
  gridLines,
  linePoints,
  linearScale,
  trendline,
} from "@/app/_charts/geom";
import { group } from "@/app/_format/num";
import { MONTHS } from "@/app/_time/periods";

/**
 * Shared helpers for the five modules the metric factory does not drive —
 * Perfect Store, ROI, Shelving, Merchandiser and Store Management.
 *
 * Those have genuinely different shapes, so they are not configs. What they do
 * share is the gauge and the six-month trend, so those live here rather than
 * being written out five times.
 */

export const MONTH_SHORT = MONTHS.map((month) => month.label.slice(0, 3));

export const pct2 = (v: number) => `${v.toFixed(2)}%`;
export const pct1 = (v: number) => `${v.toFixed(1)}%`;

/** PowerBI's wider dial: 240° of sweep, opening at the bottom-left. */
const DIAL = { cx: 100, cy: 96, r: 68, startDeg: -120, endDeg: 120 };

export function buildGauge(options: {
  value: number;
  min: number;
  max: number;
  label: string;
  caption?: string;
  minLabel?: string;
  maxLabel?: string;
  target?: number;
  tone?: SeriesTone;
  ariaLabel: string;
}): GaugeData {
  const { value, min, max, target, tone = "primary" } = options;
  const geometry = gaugeGeometry(value, min, max, { ...DIAL, target });

  return {
    viewBox: "0 0 200 150",
    track: geometry.track,
    value: geometry.value,
    needle: geometry.needle,
    label: options.label,
    caption: options.caption,
    min: options.minLabel ?? group(min),
    max: options.maxLabel ?? group(max),
    tone,
    ariaLabel: options.ariaLabel,
  };
}

/** Where the gauge readout sits inside the 200×150 viewBox. */
export const GAUGE_LABEL = { x: 100, y: 104 };

/* Every bespoke trend shares the canvas the factory modules use, so panels
   line up across modules as well as across tabs. */
export const PLOT = { x0: 64, x1: 574, y0: 16, y1: 148, labelY: 168 };
export const VIEW_BOX = "0 0 590 178";

export function buildSeriesTrend(options: {
  series: { label: string; values: number[]; tone: SeriesTone; fill?: boolean }[];
  format?: (v: number) => string;
  axisTitle?: string;
  labelled?: boolean;
  ariaLabel: string;
  xLabels?: string[];
  withTrendline?: boolean;
}): TrendChartData {
  const {
    series,
    format = pct1,
    labelled = true,
    withTrendline = false,
  } = options;

  const all = series.flatMap((entry) => entry.values);
  const lo = Math.min(...all);
  const hi = Math.max(...all);
  const pad = (hi - lo || 1) * 0.18;
  const domain: [number, number] = [
    +Math.max(0, lo - pad).toFixed(2),
    +(hi + pad).toFixed(2),
  ];

  const y = linearScale(domain, [PLOT.y1, PLOT.y0]);
  const count = series[0]?.values.length ?? 0;
  const xs = bandX(count, PLOT.x0 + 16, PLOT.x1 - 16);

  const built = series.map((entry) => {
    const points = entry.values.map((value, i) => ({ x: xs[i], y: y(value) }));
    return {
      label: entry.label,
      tone: entry.tone,
      line: linePoints(points),
      area: entry.fill ? areaPath(points, PLOT.y1) : undefined,
      dots: points.map((p) => ({ cx: +p.x.toFixed(1), cy: +p.y.toFixed(1) })),
      labels: labelled
        ? points.map((p, i) => ({
            x: +p.x.toFixed(1),
            y: +(p.y - 10).toFixed(1),
            text: format(entry.values[i]),
          }))
        : undefined,
      points,
    };
  });

  return {
    viewBox: VIEW_BOX,
    plot: PLOT,
    grid: gridLines(domain, y, 4, format),
    series: built.map(({ points, ...rest }) => {
      void points;
      return rest;
    }),
    trend:
      withTrendline && built[0] ? trendline(built[0].points) ?? undefined : undefined,
    xLabels: xs.map((x, i) => ({
      x: +x.toFixed(1),
      label: options.xLabels?.[i] ?? `${MONTH_SHORT[i]} 2026`,
    })),
    axisTitle: options.axisTitle
      ? { x: 12, y: 82, text: options.axisTitle, rotate: -90 }
      : undefined,
    ariaLabel: options.ariaLabel,
  };
}
