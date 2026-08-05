import type {
  DonutData,
  GroupedColumnsData,
  PieData,
  TrendChartData,
} from "@/app/_charts/chart-types";
import type { ActionsBlockData } from "@/app/_charts/actions-block";
import type { GapCard } from "@/app/_charts/gap-cards";
import type { BarRow } from "@/app/_charts/h-bar-list";
import type { MatrixGroup } from "@/app/_charts/month-matrix";
import type { TableView } from "@/app/_charts/tabbed-table";
import type { Column, Row } from "@/app/_charts/table";
import { num, text, tiered } from "@/app/_charts/table";
import {
  areaPath,
  bandX,
  centredBandX,
  gridLines,
  groupedColumns,
  linePoints,
  linearScale,
  pieSlices,
  ringDash,
  trendline,
} from "@/app/_charts/geom";
import type { CsvTable } from "@/app/_export/csv";
import { group } from "@/app/_format/num";
import { MONTHS, MONTH_KEYS, type MonthKey } from "@/app/_time/periods";
import { ESTATE, LAST, MINUS, MONTH_INDEX, before } from "./spine";

/**
 * The factory behind Category Management, Availability, Revenue and Space.
 *
 * Those four PowerBI modules are the same seven tabs over different measures —
 * a brand table, a trend, a gap against target, an actions block, a raw
 * extract. Building them four times would be four places to fix a bug and four
 * chances for the shapes to drift apart, so each one is a config and this is
 * the only implementation.
 *
 * The invariants of `analytics.ts` are kept exactly: the authored month is
 * returned by reference, every month is precomputed at module scope, and every
 * displayed number is formatted here rather than at render.
 */

/* ---------------------------------------------------------------- */
/* config                                                           */
/* ---------------------------------------------------------------- */

/** One selectable measure — SOS, LSOS, Pricing, Promotion, … */
export type Measure = {
  id: string;
  /** Tab label on the dark toggle. */
  short: string;
  /** Full name used in titles and aria labels. */
  label: string;
  /** Six figures, February to July. July is the authored one. */
  series: number[];
  /** The target this measure is held to, for Gap Analysis. */
  target: number;
  /** Own share for the own-vs-competition donut; omitted for compliance. */
  competitive?: boolean;
};

/** `delta` is the change against the previous month — the whole back-history. */
export type BrandFact = [name: string, value: number, delta: number, facings: number];
export type GroupFact = [name: string, value: number, delta: number, target: number];
export type OutletFact = [
  outlet: string,
  code: string,
  value: number,
  target: number,
  /** Session slug, or null where no evidence was captured. */
  session: string | null,
];

export type MetricModuleConfig = {
  id: string;
  title: string;
  /** Noun for the thing being measured, e.g. "share of shelf". */
  measureNoun: string;
  measures: Measure[];
  /** Rows of the brand-wise table. Values are July's. */
  brands: BrandFact[];
  /** Cards on the category-wise view, and the Gap Analysis cards. */
  groups: GroupFact[];
  /** The actual-vs-target detail table. */
  outlets: OutletFact[];
  /** Reason codes for the Actions tab, largest first. */
  reasons: [label: string, count: number][];
  /** Per-brand action counts for the Actions tab. */
  actionsByBrand: [label: string, count: number][];
  /** Merchandisers on the completion table. */
  completion: [name: string, open: number, closed: number][];
  /** Actions generated in the authored month. */
  actionsTotal: number;
  /** Share of them closed, as a percentage. */
  actionsClosedPct: number;
  /** Before/after merchandising, per group. Omit where PowerBI has no such tab. */
  merchImpact?: [group: string, before: number, after: number][];
  /**
   * Which measure the brand, group and outlet facts were authored against, and
   * the one the module opens on. Everything else is scaled off it, so switching
   * measure moves the whole screen rather than only the headline. Defaults to
   * the first measure.
   */
  baseMeasure?: string;
};

/* ---------------------------------------------------------------- */
/* shared derivation                                                 */
/* ---------------------------------------------------------------- */

const MONTH_SHORT = MONTHS.map((month) => month.label.slice(0, 3));

const at = (series: number[], i: number) =>
  i < 0 ? before(series) : series[i];

/** How much lower this measure sat in month `i`, measured against July. */
const levelOf = (series: number[], i: number) => at(series, i) / series[LAST];

const round2 = (v: number) => +v.toFixed(2);

const pct = (v: number) => `${v.toFixed(2)}%`;

const signed2 = (v: number) =>
  `${v >= 0 ? "+" : MINUS}${Math.abs(v).toFixed(2)}%`;

function deltaOf(value: number, sortValue = value) {
  return {
    text: signed2(value),
    value: sortValue,
    delta: {
      direction: value >= 0 ? ("up" as const) : ("down" as const),
      tone: value >= 0 ? ("success" as const) : ("danger" as const),
      label: `${Math.abs(value).toFixed(2)}%`,
    },
  };
}

/** Against-target tiering, shared by every colour-scaled cell in the module. */
function tierFor(value: number, target: number) {
  if (value >= target) return "good" as const;
  return value >= target * 0.6 ? ("warn" as const) : ("bad" as const);
}

/* ---------------------------------------------------------------- */
/* the view                                                          */
/* ---------------------------------------------------------------- */

export type MetricModuleView = {
  moduleId: string;
  period: MonthKey;
  monthLabel: string;
  measureId: string;
  measureLabel: string;
  /** Headline value for the selected measure, e.g. `"38.70%"`. */
  headline: string;
  headlineDelta: string;

  brandTable: { columns: Column[]; rows: Row[] };
  groupCards: {
    name: string;
    value: string;
    momLabel: string;
    changeLabel: string;
    tone: "up" | "down";
  }[];
  donut?: DonutData;
  trend: TrendChartData;
  detailViews: TableView[];

  gapCards: GapCard[];
  gapColumns: GroupedColumnsData;
  gapDetail: { columns: Column[]; rows: Row[] };

  actions: ActionsBlockData;

  merchImpact?: {
    bars: BarRow[];
    beforeAfter: TrendChartData;
    table: { columns: Column[]; rows: Row[] };
  };

  /** Availability only — PowerBI gives out-of-stock its own tab. */
  oos?: { columns: Column[]; rows: Row[] };

  matrix: { columns: string[]; groups: MatrixGroup[] };

  raw: { columns: Column[]; rows: Row[]; csv: CsvTable };
};

/* Trend and column charts share one canvas so panels line up across tabs. */
const PLOT = { x0: 64, x1: 574, y0: 16, y1: 148, labelY: 168 };
const VIEW_BOX = "0 0 590 178";

function buildTrend(measure: Measure, i: number, label: string): TrendChartData {
  const values = measure.series;
  const lo = Math.min(...values) * 0.985;
  const hi = Math.max(...values) * 1.015;
  const domain: [number, number] = [+lo.toFixed(2), +hi.toFixed(2)];
  const y = linearScale(domain, [PLOT.y1, PLOT.y0]);
  const xs = bandX(values.length, PLOT.x0 + 16, PLOT.x1 - 16);
  const points = values.map((value, index) => ({ x: xs[index], y: y(value) }));

  return {
    viewBox: VIEW_BOX,
    plot: PLOT,
    grid: gridLines(domain, y, 4, (v) => `${v.toFixed(1)}%`),
    series: [
      {
        label,
        tone: "primary",
        line: linePoints(points),
        area: areaPath(points, PLOT.y1),
        dots: points.map((p) => ({ cx: +p.x.toFixed(1), cy: +p.y.toFixed(1) })),
        labels: points.map((p, index) => ({
          x: +p.x.toFixed(1),
          y: +(p.y - 10).toFixed(1),
          text: pct(values[index]),
        })),
      },
    ],
    trend: trendline(points) ?? undefined,
    // Only when looking at a past month, so the current month is never marked.
    markX: i === LAST ? undefined : +xs[i].toFixed(1),
    xLabels: xs.map((x, index) => ({
      x: +x.toFixed(1),
      label: `${MONTH_SHORT[index]} 2026`,
    })),
    axisTitle: { x: 12, y: 82, text: measure.short, rotate: -90 },
    ariaLabel: `${label} by month, February to July 2026, ${pct(values[0])} to ${pct(values[LAST])}.`,
  };
}

function buildGapColumns(measure: Measure, label: string): GroupedColumnsData {
  const actual = measure.series;
  const target = actual.map(() => measure.target);
  const domain: [number, number] = [0, Math.max(measure.target, ...actual) * 1.25];
  const y = linearScale(domain, [PLOT.y1, PLOT.y0]);
  const xs = centredBandX(actual.length, PLOT.x0, PLOT.x1);
  const slot = (PLOT.x1 - PLOT.x0) / actual.length;

  const rects = groupedColumns(
    actual.map((value, i) => [value, target[i]]),
    xs,
    slot,
    y,
    PLOT.y1,
    10,
  );

  return {
    viewBox: VIEW_BOX,
    plot: PLOT,
    grid: gridLines(domain, y, 4, (v) => `${v.toFixed(0)}%`),
    groups: actual.map((_, i) => ({
      label: MONTH_SHORT[i],
      bars: rects[i].map((rect, barIndex) => ({
        ...rect,
        tone: barIndex === 0 ? ("tertiary" as const) : ("target" as const),
        label: {
          x: +(rect.x + rect.width / 2).toFixed(1),
          /* Staggered: the two bars are adjacent, so equal-height ones would
             print their labels on top of each other — which they do whenever a
             month lands exactly on target. */
          y: +(rect.y - (barIndex === 0 ? 5 : 15)).toFixed(1),
          text: pct(barIndex === 0 ? actual[i] : target[i]),
        },
      })),
    })),
    legend: [
      { label: `Actual ${measure.short}`, tone: "tertiary" },
      { label: "Target", tone: "target" },
    ],
    xLabels: xs.map((x, i) => ({ x: +x.toFixed(1), label: `${MONTH_SHORT[i]} 2026` })),
    axisTitle: { x: 12, y: 82, text: `Actual ${measure.short}`, rotate: -90 },
    ariaLabel: `${label} against target, February to July 2026.`,
  };
}

function buildDonut(measure: Measure, i: number, own: number): DonutData {
  const radius = 62;
  const segments = ringDash(
    [
      { label: "Company", value: own },
      { label: "Competitor", value: 100 - own },
    ],
    radius,
  );

  return {
    radius,
    strokeWidth: 26,
    segments: [
      { ...segments[0], tone: "primary" },
      { ...segments[1], tone: "muted" },
    ],
    centre: { value: `${own.toFixed(1)}%`, caption: "Company" },
    legend: [
      { label: "Company", value: pct(own), tone: "primary" },
      { label: "Competitor", value: pct(round2(100 - own)), tone: "muted" },
    ],
    ariaLabel: `${measure.label}: company ${pct(own)}, competitors ${pct(round2(100 - own))}.`,
  };
}

function buildOpenClosed(total: number, closedPct: number): PieData {
  const closed = Math.round((total * closedPct) / 100);
  const open = total - closed;
  const slices = pieSlices(
    [
      { label: "Open", value: open },
      { label: "Closed", value: closed },
    ],
    150,
    100,
    72,
    84,
  );

  return {
    viewBox: "0 0 300 200",
    slices: [
      {
        ...slices[0],
        tone: "primary",
        text: `${group(open)} (${(100 - closedPct).toFixed(1)}%)`,
      },
      {
        ...slices[1],
        tone: "secondary",
        text: `${group(closed)} (${closedPct.toFixed(1)}%)`,
      },
    ],
    legend: [
      { label: "Open", value: group(open), tone: "primary" },
      { label: "Closed", value: group(closed), tone: "secondary" },
    ],
    ariaLabel: `Task status: ${group(open)} open, ${group(closed)} closed.`,
  };
}

function barsFrom(facts: [string, number][], scale: number): BarRow[] {
  const scaled = facts.map(
    ([label, count]) => [label, Math.max(0, Math.round(count * scale))] as const,
  );
  const max = Math.max(1, ...scaled.map(([, count]) => count));
  return scaled.map(([label, count]) => ({
    label,
    value: group(count),
    pct: +((count / max) * 100).toFixed(1),
  }));
}

/* ---------------------------------------------------------------- */
/* the builder                                                       */
/* ---------------------------------------------------------------- */

export function buildMetricModule(
  config: MetricModuleConfig,
  measureId: string,
  period: MonthKey,
): MetricModuleView {
  const measure =
    config.measures.find((m) => m.id === measureId) ?? config.measures[0];
  const i = MONTH_INDEX[period];

  /* Two factors, deliberately separate. `monthLevel` is how far down the
     six-month spine this month sits; `measureScale` is how the selected
     measure relates to the one the facts were authored against. Without the
     second, switching from OSA to must-stock OSA would move the headline and
     leave every brand row untouched. */
  const base =
    config.measures.find((m) => m.id === config.baseMeasure) ?? config.measures[0];
  const measureScale = measure.series[LAST] / base.series[LAST];
  const level = levelOf(measure.series, i) * measureScale;
  const headline = at(measure.series, i);
  const headlineDelta = headline - at(measure.series, i - 1);

  /* ---- brand-wise table ---- */

  const brandRows: Row[] = config.brands.map(([name, value, delta, facings]) => {
    const scaled = round2(value * level);
    const scaledDelta = round2(delta * level);
    const scaledFacings = Math.round(facings * level);
    return {
      id: name,
      cells: [
        text(name),
        num(group(scaledFacings), scaledFacings),
        num(pct(scaled), scaled),
        deltaOf(scaledDelta),
      ],
    };
  });

  /* ---- category cards ---- */

  const groupCards = config.groups.map(([name, value, delta]) => {
    const scaled = round2(value * level);
    const scaledDelta = round2(delta * level);
    return {
      name,
      value: pct(scaled),
      momLabel: `${signed2(scaledDelta)} MoM`,
      changeLabel: `${signed2(round2(scaledDelta * 1.9))} change`,
      tone: scaledDelta >= 0 ? ("up" as const) : ("down" as const),
    };
  });

  /* ---- gap analysis ---- */

  const gapCards: GapCard[] = config.groups.map(([name, value, , target]) => {
    const scaled = round2(value * level);
    const gap = round2(Math.abs(target - scaled));
    return {
      name,
      gap: pct(gap),
      actual: pct(scaled),
      target: pct(target),
      tone: scaled >= target ? "ahead" : "behind",
    };
  });

  /* ---- detail tables ---- */

  const outletColumns: Column[] = [
    { key: "date", label: "Visit date" },
    { key: "code", label: "Outlet code" },
    { key: "outlet", label: "Outlet" },
    { key: "actual", label: `Actual ${measure.short}`, align: "right" },
    { key: "target", label: `Target ${measure.short}`, align: "right" },
    { key: "se", label: "SE Link", align: "right", width: "72px", unsortable: true },
  ];

  const outletRows: Row[] = config.outlets.map(
    ([outlet, code, value, target, session], index) => {
      const scaled = round2(value * level);
      return {
        id: `${code}-${index}`,
        cells: [
          text(`${String((index % 27) + 2).padStart(2, "0")} ${MONTH_SHORT[i]} 2026`),
          text(code),
          text(outlet),
          tiered(pct(scaled), scaled, tierFor(scaled, target)),
          num(pct(target), target),
          { text: "", seLink: true, href: session ? `/session-viewer/${session}` : undefined },
        ],
      };
    },
  );

  const storeColumns: Column[] = [
    { key: "outlet", label: "Outlet" },
    { key: "code", label: "Outlet code" },
    { key: "value", label: measure.short, align: "right" },
  ];

  const storeRows: Row[] = config.outlets.map(([outlet, code, value], index) => {
    const scaled = round2(value * level);
    return {
      id: `store-${code}-${index}`,
      cells: [
        text(outlet),
        text(code),
        tiered(pct(scaled), scaled, tierFor(scaled, measure.target)),
      ],
    };
  });

  /* ---- actions ---- */

  const actionsTotal = Math.round(config.actionsTotal * (2 - level));
  const closedPct = round2(config.actionsClosedPct * level);
  const closed = Math.round((actionsTotal * closedPct) / 100);
  const perVisit = actionsTotal / Math.max(1, Math.round(ESTATE.sessions * level));

  const actions: ActionsBlockData = {
    stats: [
      {
        label: "Number of actions",
        value: group(actionsTotal),
        caption: `generated in ${MONTHS[i].label}`,
      },
      {
        /* Per session, not per visit: the denominator this fixture publishes is
           sessions, and labelling it "visit" over a session count would be two
           different things in one card. */
        label: "Actions per session",
        value: perVisit.toFixed(2),
        caption: `across ${group(Math.round(ESTATE.sessions * level))} sessions`,
      },
      {
        label: "Actions completed",
        value: closedPct.toFixed(1),
        unit: "%",
        caption: `${group(closed)} of ${group(actionsTotal)} closed`,
      },
    ],
    openClosed: buildOpenClosed(actionsTotal, closedPct),
    reasons: {
      title: `Why ${config.measureNoun} was not fixed`,
      rows: barsFrom(config.reasons, level),
      axisLabel: "Number of actions",
    },
    byCategory: {
      title: "Brand-wise actions generated",
      rows: barsFrom(config.actionsByBrand, level),
      axisLabel: "Number of actions",
    },
    completion: {
      title: "Merchandiser-wise action completion",
      columns: [
        { key: "merch", label: "Merchandiser" },
        { key: "open", label: "Open tasks", align: "right" },
        { key: "closed", label: "Closed tasks", align: "right" },
        { key: "pct", label: "Completion", align: "right" },
      ],
      rows: config.completion.map(([name, open, closedCount]) => {
        const scaledOpen = Math.round(open * (2 - level));
        const scaledClosed = Math.round(closedCount * level);
        const rate = (scaledClosed / Math.max(1, scaledOpen + scaledClosed)) * 100;
        return {
          id: name,
          cells: [
            text(name),
            num(group(scaledOpen), scaledOpen),
            num(group(scaledClosed), scaledClosed),
            num(pct(rate), rate),
          ],
        };
      }),
    },
    raw: {
      title: "Actions raw data",
      columns: [
        { key: "date", label: "Visit date" },
        { key: "outlet", label: "Outlet" },
        { key: "code", label: "Outlet code" },
        { key: "reason", label: "Reason" },
        { key: "status", label: "Status" },
      ],
      rows: config.outlets.map(([outlet, code], index) => ({
        id: `action-${code}-${index}`,
        cells: [
          text(`${String((index % 27) + 2).padStart(2, "0")} ${MONTH_SHORT[i]} 2026`),
          text(outlet),
          text(code),
          text(config.reasons[index % config.reasons.length][0]),
          text(index % 3 === 0 ? "Closed" : "Open"),
        ],
      })),
    },
  };

  /* ---- merchandising impact ---- */

  const merchImpact = config.merchImpact
    ? (() => {
        const facts = config.merchImpact.map(
          ([name, beforeValue, afterValue]) =>
            [name, round2(beforeValue * level), round2(afterValue * level)] as const,
        );
        const max = Math.max(...facts.map(([, , after]) => after));

        const beforeSeries = MONTH_SHORT.map(
          (_, index) => round2(facts[0][1] * levelOf(measure.series, index) / level),
        );
        const afterSeries = MONTH_SHORT.map(
          (_, index) => round2(facts[0][2] * levelOf(measure.series, index) / level),
        );
        const domain: [number, number] = [0, Math.max(...afterSeries) * 1.2];
        const y = linearScale(domain, [PLOT.y1, PLOT.y0]);
        const xs = bandX(6, PLOT.x0 + 16, PLOT.x1 - 16);
        const beforePoints = beforeSeries.map((v, index) => ({ x: xs[index], y: y(v) }));
        const afterPoints = afterSeries.map((v, index) => ({ x: xs[index], y: y(v) }));

        return {
          bars: facts.flatMap(([name, beforeValue, afterValue]) => [
            {
              label: `${name} · before`,
              value: pct(beforeValue),
              pct: +((beforeValue / max) * 100).toFixed(1),
            },
            {
              label: `${name} · after`,
              value: pct(afterValue),
              pct: +((afterValue / max) * 100).toFixed(1),
            },
          ]),
          beforeAfter: {
            viewBox: VIEW_BOX,
            plot: PLOT,
            grid: gridLines(domain, y, 4, (v) => `${v.toFixed(0)}%`),
            series: [
              {
                label: "After merchandising",
                tone: "tertiary" as const,
                line: linePoints(afterPoints),
                area: areaPath(afterPoints, PLOT.y1),
                labels: afterPoints.map((p, index) => ({
                  x: +p.x.toFixed(1),
                  y: +(p.y - 9).toFixed(1),
                  text: pct(afterSeries[index]),
                })),
              },
              {
                label: "Before merchandising",
                tone: "secondary" as const,
                line: linePoints(beforePoints),
                area: areaPath(beforePoints, PLOT.y1),
                labels: beforePoints.map((p, index) => ({
                  x: +p.x.toFixed(1),
                  y: +(p.y + 14).toFixed(1),
                  text: pct(beforeSeries[index]),
                })),
              },
            ],
            xLabels: xs.map((x, index) => ({
              x: +x.toFixed(1),
              label: `${MONTH_SHORT[index]} 2026`,
            })),
            axisTitle: { x: 12, y: 82, text: measure.short, rotate: -90 },
            ariaLabel: `${measure.label} before and after merchandising, February to July 2026.`,
          },
          table: {
            columns: [
              { key: "date", label: "Visit date" },
              { key: "outlet", label: "Outlet" },
              { key: "before", label: "Before", align: "right" as const },
              { key: "after", label: "After", align: "right" as const },
              { key: "uplift", label: "Uplift", align: "right" as const },
            ],
            rows: config.outlets.map(([outlet, code, value], index) => {
              const beforeValue = round2(value * level * 0.6);
              const afterValue = round2(value * level);
              const uplift = round2(afterValue - beforeValue);
              return {
                id: `impact-${code}-${index}`,
                cells: [
                  text(`${String((index % 27) + 2).padStart(2, "0")} ${MONTH_SHORT[i]} 2026`),
                  text(outlet),
                  num(pct(beforeValue), beforeValue),
                  num(pct(afterValue), afterValue),
                  deltaOf(uplift),
                ],
              };
            }),
          },
        };
      })()
    : undefined;

  /* ---- raw ---- */

  const rawColumns: Column[] = [
    { key: "date", label: "Date" },
    { key: "code", label: "Outlet code" },
    { key: "outlet", label: "Outlet" },
    { key: "brand", label: "Brand" },
    { key: "value", label: measure.short, align: "right" },
  ];

  const rawRows: Row[] = config.outlets.flatMap(([outlet, code, value], outletIndex) =>
    config.brands.map(([brand, brandValue], brandIndex) => {
      const scaled = round2(((value + brandValue) / 2) * level);
      return {
        id: `raw-${code}-${brandIndex}`,
        cells: [
          text(
            `${String(((outletIndex + brandIndex) % 27) + 2).padStart(2, "0")} ${MONTH_SHORT[i]} 2026`,
          ),
          text(code),
          text(outlet),
          text(brand),
          num(pct(scaled), scaled),
        ],
      };
    }),
  );

  /* ---- out of stock ---- */

  /* Absent store-SKUs, the complement of availability. Derived from the same
     brand facts the Analytics tab shows, so the two always agree on how much
     is missing. */
  const oos = {
    columns: [
      { key: "brand", label: "Brand" },
      { key: "ranged", label: "Ranged stores", align: "right" as const },
      { key: "present", label: "Present", align: "right" as const },
      { key: "absent", label: "Absent", align: "right" as const },
      { key: "osa", label: measure.short, align: "right" as const },
    ],
    rows: config.brands
      .map(([name, value, , facings]) => {
        const ranged = Math.round(facings / 46);
        const scaled = round2(value * level);
        const present = Math.round((ranged * scaled) / 100);
        return { name, ranged, present, absent: ranged - present, scaled };
      })
      .sort((a, b) => b.absent - a.absent)
      .map(({ name, ranged, present, absent, scaled }) => ({
        id: `oos-${name}`,
        cells: [
          text(name),
          num(group(ranged), ranged),
          num(group(present), present),
          num(group(absent), absent),
          tiered(pct(scaled), scaled, tierFor(scaled, measure.target)),
        ],
      })),
  };

  /* ---- trend matrix ---- */

  /* Retailer opens into its stores, each cell one month. Levels come from the
     measure's own range across the window rather than a fixed scale, so a
     compliance measure sitting in the 50s is still legible. */
  const span = Math.max(...measure.series) - Math.min(...measure.series) || 1;
  const levelOfValue = (value: number): 0 | 1 | 2 | 3 | 4 => {
    const share = (value - Math.min(...measure.series) * 0.8) / (span * 2.2);
    return Math.max(0, Math.min(4, Math.round(share * 4))) as 0 | 1 | 2 | 3 | 4;
  };

  /* Group by the store's actual retailer, read from its name. Grouping by
     array index put Co.opmart stores under Bach Hoa Xanh — the names carry the
     banner, so this is the fact rather than a guess. Anything unmatched lands
     in "Other" rather than being silently filed under the wrong retailer. */
  const RETAILER_TOKENS: [token: string, retailer: string][] = [
    ["BHX", "Bach Hoa Xanh"],
    ["Bach Hoa Xanh", "Bach Hoa Xanh"],
    ["Winlife", "Winmart"],
    ["Winmart", "Winmart"],
    ["Co.opmart", "Co.opmart"],
    ["Aeon", "Aeon"],
    ["Lotte", "Lotte"],
    ["Emart", "Emart"],
    ["MM Mega Market", "MM Mega Market"],
  ];

  const retailerOf = (outlet: string) =>
    RETAILER_TOKENS.find(([token]) => outlet.includes(token))?.[1] ?? "Other";

  const byRetailer = new Map<string, typeof config.outlets>();
  for (const outlet of config.outlets) {
    const retailer = retailerOf(outlet[0]);
    const existing = byRetailer.get(retailer);
    if (existing) existing.push(outlet);
    else byRetailer.set(retailer, [outlet]);
  }

  const matrixGroups: MatrixGroup[] = [...byRetailer.entries()].map(
    ([retailer, stores], groupIndex) => {
      const cellsFor = (base: number, seed: number) =>
        measure.series.map((monthValue, monthIndex) => {
          /* A store with no visit that month leaves the cell blank — a zero
             would read as "measured, and it was zero". */
          if ((seed + monthIndex) % 7 === 3) return { text: "" };
          const value = round2(base * (monthValue / measure.series[LAST]));
          return { text: pct(value), level: levelOfValue(value) };
        });

      /* The group row is the retailer's mean, so it reconciles with the stores
         underneath it rather than being an independent figure. */
      const groupBase =
        stores.reduce((sum, [, , value]) => sum + value, 0) / stores.length;

      return {
        id: `matrix-${retailer}`,
        label: retailer,
        cells: cellsFor(groupBase, groupIndex),
        children: stores.map(([outlet, code, value], storeIndex) => ({
          id: `matrix-${code}`,
          label: outlet,
          cells: cellsFor(value, groupIndex + storeIndex + 1),
        })),
      };
    },
  );

  return {
    moduleId: config.id,
    period,
    monthLabel: MONTHS[i].label,
    measureId: measure.id,
    measureLabel: measure.label,
    headline: pct(round2(headline)),
    headlineDelta: signed2(round2(headlineDelta)),

    brandTable: {
      columns: [
        { key: "brand", label: "Brand" },
        { key: "facings", label: "Facings", align: "right" },
        { key: "value", label: measure.short, align: "right" },
        { key: "mom", label: "Δ MoM", align: "right" },
      ],
      rows: brandRows,
    },
    groupCards,
    donut: measure.competitive
      ? buildDonut(measure, i, round2(at(measure.series, i)))
      : undefined,
    trend: buildTrend(measure, i, measure.label),
    detailViews: [
      {
        id: "visit",
        label: `Visit-wise ${measure.short}`,
        columns: outletColumns,
        rows: outletRows,
        emptyLabel: "No visits match this selection.",
      },
      {
        id: "store",
        label: `Store-wise ${measure.short}`,
        columns: storeColumns,
        rows: storeRows,
        emptyLabel: "No stores match this selection.",
      },
    ],

    gapCards,
    gapColumns: buildGapColumns(measure, measure.label),
    gapDetail: { columns: outletColumns, rows: outletRows },

    actions,
    merchImpact,
    oos,
    matrix: {
      columns: MONTH_SHORT.map((label) => `${label} 2026`),
      groups: matrixGroups,
    },

    raw: {
      columns: rawColumns,
      rows: rawRows,
      csv: {
        headers: rawColumns.map((column) => column.label),
        rows: rawRows.map((row) => row.cells.map((cell) => cell.text)),
      },
    },
  };
}

/**
 * Every month × every measure, built once at module scope. The client reads
 * straight out of here, so the first render after hydration recomputes nothing
 * — the same contract `PRECOMPUTED` in `analytics.ts` has.
 */
export function precomputeModule(config: MetricModuleConfig) {
  const out: Record<string, Record<MonthKey, MetricModuleView>> = {};
  for (const measure of config.measures) {
    out[measure.id] = Object.fromEntries(
      MONTH_KEYS.map((key) => [key, buildMetricModule(config, measure.id, key)]),
    ) as Record<MonthKey, MetricModuleView>;
  }
  return out;
}

/** The measure a module opens on — its base, never a positional guess. */
export function defaultMeasureId(config: MetricModuleConfig): string {
  return (
    config.measures.find((m) => m.id === config.baseMeasure)?.id ??
    config.measures[0].id
  );
}

export const prevMonthLabel = (period: MonthKey) => {
  const i = MONTH_INDEX[period];
  return i > 0 ? MONTHS[i - 1].label : "before the window";
};
