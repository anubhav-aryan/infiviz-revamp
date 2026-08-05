/**
 * Chart geometry — pure functions, no React, no side effects.
 *
 * Every chart in this app follows the rule `photo-quality/_components/trend-chart.tsx`
 * set: geometry is computed in `_data` at module scope and the component is
 * pure markup. These are the shared maths those `_data` files call.
 *
 * Everything here must stay deterministic. `toFixed` is, `toLocaleString` is
 * not, and `Math.random`/`Date.now` are banned outright — the results are
 * baked into prerendered HTML and have to match byte-for-byte on the client.
 *
 * Coordinates are emitted at one decimal. That is below the resolution of any
 * viewBox we draw into, and it keeps the point strings — which ship to the
 * client for every month of every series — roughly a third shorter than the
 * full float would.
 */

/** One-decimal coordinate, with `-0` normalised away. */
export function fx(value: number): string {
  const out = value.toFixed(1);
  return out === "-0.0" ? "0.0" : out;
}

export type Point = { x: number; y: number };

export type Scale = (value: number) => number;

/**
 * Linear scale from a value domain to a pixel range. Range may be inverted
 * (`[bottom, top]`) — that is the normal case for a y axis.
 */
export function linearScale(
  domain: [number, number],
  range: [number, number],
): Scale {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const span = d1 - d0;
  // A zero-width domain would divide by zero; pin it to the range start.
  if (span === 0) return () => r0;
  return (value) => r0 + ((value - d0) / span) * (r1 - r0);
}

/** Evenly spaced x positions for `count` samples across `[x0, x1]`. */
export function bandX(count: number, x0: number, x1: number): number[] {
  if (count <= 1) return [(x0 + x1) / 2];
  const step = (x1 - x0) / (count - 1);
  return Array.from({ length: count }, (_, i) => x0 + i * step);
}

/** Centre positions for `count` bands, each inset from the edges by half a slot. */
export function centredBandX(count: number, x0: number, x1: number): number[] {
  const slot = (x1 - x0) / count;
  return Array.from({ length: count }, (_, i) => x0 + slot * (i + 0.5));
}

/** `<polyline points="…">` string. */
export function linePoints(points: Point[]): string {
  return points.map((p) => `${fx(p.x)},${fx(p.y)}`).join(" ");
}

/**
 * Closed area under a line, for the filled trends. Drops to `baselineY` at
 * both ends so the fill sits on the axis rather than on the first data point.
 */
export function areaPath(points: Point[], baselineY: number): string {
  if (points.length === 0) return "";
  const first = points[0];
  const last = points[points.length - 1];
  const body = points.map((p) => `L ${fx(p.x)} ${fx(p.y)}`).join(" ");
  return `M ${fx(first.x)} ${fx(baselineY)} ${body} L ${fx(last.x)} ${fx(baselineY)} Z`;
}

/**
 * Least-squares fit across the series, returned as the two endpoints PowerBI
 * draws as a dotted overlay. Returns `null` for a series too short to fit.
 */
export function trendline(points: Point[]): { x1: number; y1: number; x2: number; y2: number } | null {
  const n = points.length;
  if (n < 2) return null;

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  for (const p of points) {
    sumX += p.x;
    sumY += p.y;
    sumXY += p.x * p.y;
    sumXX += p.x * p.x;
  }

  const denominator = n * sumXX - sumX * sumX;
  // Every sample on one x — no line to fit.
  if (denominator === 0) return null;

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;
  const x1 = points[0].x;
  const x2 = points[n - 1].x;
  return { x1, y1: slope * x1 + intercept, x2, y2: slope * x2 + intercept };
}

export type GridLine = { y: number; label: string };

/**
 * Horizontal gridlines at `count` evenly spaced values across the domain.
 * `format` renders the axis label, so callers keep control of units.
 */
export function gridLines(
  domain: [number, number],
  y: Scale,
  count: number,
  format: (value: number) => string,
): GridLine[] {
  const [d0, d1] = domain;
  const step = (d1 - d0) / (count - 1);
  return Array.from({ length: count }, (_, i) => {
    const value = d0 + step * i;
    return { y: Number(fx(y(value))), label: format(value) };
  });
}

/* ---------------------------------------------------------------- */
/* radial — gauges, donuts, pies                                     */

/**
 * Polar to cartesian with 0° at twelve o'clock, running clockwise. SVG's own
 * angles start at three o'clock, so the -90 here is what makes every caller
 * able to think in "degrees around the dial".
 */
export function polar(cx: number, cy: number, r: number, degrees: number): Point {
  const radians = ((degrees - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(radians), y: cy + r * Math.sin(radians) };
}

/**
 * Open arc for a stroked gauge track. Sweeps clockwise from `startDeg` to
 * `endDeg`; a full 360 would collapse to a point, so callers wanting a ring
 * should use `ringDash` instead.
 */
export function arcPath(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number,
): string {
  const start = polar(cx, cy, r, startDeg);
  const end = polar(cx, cy, r, endDeg);
  const largeArc = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;
  const sweep = endDeg > startDeg ? 1 : 0;
  return `M ${fx(start.x)} ${fx(start.y)} A ${fx(r)} ${fx(r)} 0 ${largeArc} ${sweep} ${fx(end.x)} ${fx(end.y)}`;
}

/** Filled pie sector, centre → arc → back. */
export function sectorPath(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number,
): string {
  // A full circle has no distinct start and end point to draw between.
  if (endDeg - startDeg >= 360) {
    return `M ${fx(cx)} ${fx(cy - r)} A ${fx(r)} ${fx(r)} 0 1 1 ${fx(cx - 0.01)} ${fx(cy - r)} Z`;
  }
  const start = polar(cx, cy, r, startDeg);
  const end = polar(cx, cy, r, endDeg);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${fx(cx)} ${fx(cy)} L ${fx(start.x)} ${fx(start.y)} A ${fx(r)} ${fx(r)} 0 ${largeArc} 1 ${fx(end.x)} ${fx(end.y)} Z`;
}

export type PieSlice = {
  label: string;
  /** Filled sector path. */
  d: string;
  /** Where a leader label sits, just outside the arc's midpoint. */
  labelX: number;
  labelY: number;
  /** `end` when the slice's midpoint is on the left half, so text runs inward. */
  anchor: "start" | "end";
};

/**
 * Sectors for a pie, clockwise from twelve o'clock. Zero-valued entries are
 * dropped rather than drawn as invisible slivers that still take a label.
 */
export function pieSlices(
  values: { label: string; value: number }[],
  cx: number,
  cy: number,
  r: number,
  labelRadius = r + 14,
): PieSlice[] {
  const total = values.reduce((sum, v) => sum + v.value, 0);
  if (total <= 0) return [];

  let cursor = 0;
  const slices: PieSlice[] = [];
  for (const entry of values) {
    if (entry.value <= 0) continue;
    const sweep = (entry.value / total) * 360;
    const mid = cursor + sweep / 2;
    const anchorPoint = polar(cx, cy, labelRadius, mid);
    slices.push({
      label: entry.label,
      d: sectorPath(cx, cy, r, cursor, cursor + sweep),
      labelX: Number(fx(anchorPoint.x)),
      labelY: Number(fx(anchorPoint.y)),
      anchor: mid > 180 ? "end" : "start",
    });
    cursor += sweep;
  }
  return slices;
}

/**
 * A gauge's track, filled portion and optional target marker, in one call —
 * about twenty dials across the dashboard need exactly this.
 *
 * The sweep runs `startDeg` to `endDeg` clockwise from twelve o'clock, so a
 * semicircle is -90 to 90 and PowerBI's wider dial is -120 to 120.
 */
export function gaugeGeometry(
  value: number,
  min: number,
  max: number,
  options: {
    cx: number;
    cy: number;
    r: number;
    startDeg: number;
    endDeg: number;
    target?: number;
    /** How far the target marker overhangs the band, each side. */
    needleOverhang?: number;
  },
) {
  const { cx, cy, r, startDeg, endDeg, target, needleOverhang = 11 } = options;
  const span = max - min || 1;
  const clamp = (v: number) => Math.max(min, Math.min(max, v));
  const angleAt = (v: number) =>
    startDeg + ((clamp(v) - min) / span) * (endDeg - startDeg);

  const valueAngle = angleAt(value);
  const inner = target === undefined ? null : polar(cx, cy, r - needleOverhang, angleAt(target));
  const outer = target === undefined ? null : polar(cx, cy, r + needleOverhang, angleAt(target));

  return {
    track: arcPath(cx, cy, r, startDeg, endDeg),
    /* A value sitting exactly on the start would produce a zero-length arc,
       which some renderers drop entirely; nudge it so the cap still shows. */
    value: arcPath(cx, cy, r, startDeg, Math.max(valueAngle, startDeg + 0.01)),
    needle:
      inner && outer
        ? {
            x1: Number(fx(inner.x)),
            y1: Number(fx(inner.y)),
            x2: Number(fx(outer.x)),
            y2: Number(fx(outer.y)),
          }
        : undefined,
  };
}

export type RingSegment = {
  label: string;
  /** `stroke-dasharray` — drawn length, then the rest of the circumference. */
  dash: string;
  /** `stroke-dashoffset` that rotates this segment to its start position. */
  offset: string;
};

/**
 * Donut segments as dasharrays on one stroked circle. Cheaper and crisper than
 * annulus paths, and the ring's thickness stays a single `stroke-width`.
 */
export function ringDash(
  values: { label: string; value: number }[],
  radius: number,
): RingSegment[] {
  const circumference = 2 * Math.PI * radius;
  const total = values.reduce((sum, v) => sum + v.value, 0);
  if (total <= 0) return [];

  let cursor = 0;
  return values
    .filter((entry) => entry.value > 0)
    .map((entry) => {
      const length = (entry.value / total) * circumference;
      const segment: RingSegment = {
        label: entry.label,
        dash: `${fx(length)} ${fx(circumference - length)}`,
        // Negative offset advances clockwise from the stroke's start.
        offset: fx(-cursor),
      };
      cursor += length;
      return segment;
    });
}

/* ---------------------------------------------------------------- */
/* stacks and columns                                                */

export type StackBand = {
  label: string;
  /** Closed polygon: along the top edge, then back along the bottom. */
  d: string;
};

/**
 * Cumulative bands for a stacked area. `series[i].values` must all be the same
 * length as `xs`; the first series sits at the bottom of the stack.
 */
export function stackBands(
  series: { label: string; values: number[] }[],
  xs: number[],
  y: Scale,
): StackBand[] {
  const totals = new Array<number>(xs.length).fill(0);
  const bands: StackBand[] = [];

  for (const entry of series) {
    const lower = totals.slice();
    for (let i = 0; i < xs.length; i += 1) {
      totals[i] += entry.values[i] ?? 0;
    }

    const top = xs.map((x, i) => `${fx(x)} ${fx(y(totals[i]))}`);
    const bottom = xs
      .map((x, i) => `${fx(x)} ${fx(y(lower[i]))}`)
      .reverse();

    bands.push({
      label: entry.label,
      d: `M ${top.join(" L ")} L ${bottom.join(" L ")} Z`,
    });
  }

  return bands;
}

export type ColumnRect = { x: number; y: number; width: number; height: number };

/**
 * Rects for a grouped column chart. Each group gets an equal slot; the bars
 * inside it share the slot minus `gap` on either side.
 */
export function groupedColumns(
  groups: number[][],
  xs: number[],
  slotWidth: number,
  y: Scale,
  baselineY: number,
  gap = 4,
): ColumnRect[][] {
  return groups.map((bars, groupIndex) => {
    const usable = slotWidth - gap * 2;
    const barWidth = bars.length > 0 ? usable / bars.length : usable;
    const left = xs[groupIndex] - usable / 2;

    return bars.map((value, barIndex) => {
      const top = y(value);
      return {
        x: Number(fx(left + barIndex * barWidth)),
        y: Number(fx(Math.min(top, baselineY))),
        width: Number(fx(barWidth - 1)),
        height: Number(fx(Math.abs(baselineY - top))),
      };
    });
  });
}
