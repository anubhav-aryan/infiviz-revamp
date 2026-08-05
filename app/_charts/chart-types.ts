import type { GridLine, PieSlice, RingSegment, StackBand } from "./geom";

/**
 * The shapes `_data` builds and the chart components render. Keeping them in
 * one place means a module's data file imports types, never components, and
 * the components import types, never data — so nothing is tempted to compute
 * geometry at render time.
 *
 * `tone` is always a name, never a colour. The stylesheet stays the only thing
 * that knows which token a tone maps to, matching the rule `thresholds.ts`
 * already sets for tiers.
 */

export type SeriesTone =
  | "primary"
  | "secondary"
  | "tertiary"
  | "muted"
  | "target"
  | "success"
  | "warning"
  | "danger";

export type AxisLabel = { x: number; label: string };

export type DataLabel = { x: number; y: number; text: string };

/**
 * The drawing area inside the viewBox. Every rule, gridline and axis in a chart
 * is positioned from this, so no component ever falls back to a percentage
 * length — those resolve against the viewport and quietly drift when a chart is
 * reused at another size.
 */
export type PlotBox = {
  /** Left and right edges of the plotting area. */
  x0: number;
  x1: number;
  /** Top edge, and the baseline the areas and columns sit on. */
  y0: number;
  y1: number;
  /** Baseline for the x-axis tick labels. */
  labelY: number;
};

/** Positioned axis caption — `_data` decides where it sits, including rotation. */
export type AxisTitle = { x: number; y: number; text: string; rotate?: number };

/* ---------- area + line trend ---------- */

export type TrendSeries = {
  label: string;
  tone: SeriesTone;
  /** `<polyline points>`. */
  line: string;
  /** Closed fill under the line; omit for an unfilled series. */
  area?: string;
  dots?: { cx: number; cy: number }[];
  /** Per-point value labels, as PowerBI prints on its trends. */
  labels?: DataLabel[];
};

export type TrendChartData = {
  viewBox: string;
  plot: PlotBox;
  grid: GridLine[];
  series: TrendSeries[];
  /** Dotted least-squares overlay. */
  trend?: { x1: number; y1: number; x2: number; y2: number };
  /** Dashed horizontal reference, e.g. a target. */
  rules?: { y: number; label?: string }[];
  /** Dashed vertical "you are here" marker when viewing a past month. */
  markX?: number;
  xLabels: AxisLabel[];
  axisTitle?: AxisTitle;
  xAxisTitle?: AxisTitle;
  ariaLabel: string;
};

/* ---------- grouped columns ---------- */

export type ColumnBar = {
  x: number;
  y: number;
  width: number;
  height: number;
  tone: SeriesTone;
  /** Value printed above the bar. */
  label?: DataLabel;
};

export type GroupedColumnsData = {
  viewBox: string;
  plot: PlotBox;
  grid: GridLine[];
  groups: { label: string; bars: ColumnBar[] }[];
  legend: { label: string; tone: SeriesTone }[];
  xLabels: AxisLabel[];
  axisTitle?: AxisTitle;
  xAxisTitle?: AxisTitle;
  ariaLabel: string;
};

/* ---------- radial ---------- */

export type DonutData = {
  segments: (RingSegment & { tone: SeriesTone })[];
  radius: number;
  strokeWidth: number;
  /** Optional centre readout. */
  centre?: { value: string; caption?: string };
  legend: { label: string; value: string; tone: SeriesTone }[];
  ariaLabel: string;
};

export type PieData = {
  /**
   * Must leave room for the leader labels either side of the circle. They are
   * anchored outside the arc, so a viewBox sized to the circle alone lets them
   * paint outside the card.
   */
  viewBox: string;
  slices: (PieSlice & { tone: SeriesTone; text: string })[];
  legend: { label: string; value: string; tone: SeriesTone }[];
  ariaLabel: string;
};

/* ---------- stacked area ---------- */

export type StackedAreaData = {
  viewBox: string;
  plot: PlotBox;
  grid: GridLine[];
  bands: (StackBand & { tone: SeriesTone })[];
  xLabels: AxisLabel[];
  legend: { label: string; tone: SeriesTone }[];
  axisTitle?: AxisTitle;
  ariaLabel: string;
};
