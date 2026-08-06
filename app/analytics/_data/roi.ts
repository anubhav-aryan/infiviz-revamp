import type { PieData } from "@/app/_charts/chart-types";
import type { BarRow } from "@/app/_charts/h-bar-list";
import type { Column, Row } from "@/app/_charts/table";
import { num, text } from "@/app/_charts/table";
import { linePoints, linearScale, bandX, pieSlices } from "@/app/_charts/geom";
import { group } from "@/app/_format/num";
import { MONTH_KEYS, MONTHS, type MonthKey } from "@/app/_time/periods";
import {
  AVAIL_SERIES,
  ESTATE,
  LAST,
  MONTH_INDEX,
  PLANOGRAM_SERIES,
  PRICING_SERIES,
  VIS_SERIES,
} from "./spine";
import { clampPct, scopedLookup } from "./bespoke-shared";
import {
  DISTRICTS_BY_REGION,
  NATIONAL,
  type RegionScopeId,
  type Scope,
} from "./scope";

/**
 * ROI — what the merchandising programme is worth.
 *
 * Nothing here is free-standing. Sales uplift is driven by the availability
 * points the platform already publishes, and merchandising cost by the team
 * size `merch-activity` already publishes — so if OSA moves, ROI moves with it
 * rather than sitting on an unrelated series.
 */

/** Formatted by hand — `toLocaleString` is banned for hydration safety. */
export function vnd(amount: number): string {
  if (amount >= 1_000_000_000) return `$${(amount / 1_000_000_000).toFixed(2)}bn`;
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}m`;
  return `$${group(Math.round(amount))}`;
}

/* Authored rates, sized so the programme reads the way the source dashboard
   reads: uplift an order of magnitude above cost, not below it. One
   availability point across 1,412 audited stores is worth ~$2.8m per store a
   month; a merchandiser costs ~$9.4m a month, which puts the national team at
   about the same fraction of uplift PowerBI shows (~3%). */
const REVENUE_PER_POINT = 4_000_000_000;
const COST_PER_MERCHANDISER = 9_400_000;
const SAVINGS_PER_POINT = 68_000_000;
const BASELINE_OSA = 52;

/**
 * The programme's return, for whatever is being looked at.
 *
 * A scope enters twice, and the two are not the same thing. Its share of the
 * estate sizes everything — a region with a fifth of the stores earns and costs
 * about a fifth. Its availability factor decides where it sits against the
 * baseline, and that is where the story is: the baseline is 52% OSA, so North
 * Highlands at 52.4 barely clears it and its uplift nearly vanishes while its
 * merchandisers still cost what they cost. That is a real finding about the
 * region, not an artefact — it is what the availability fixture already says.
 */
const upliftAt = (i: number, scope: Scope) =>
  Math.max(0, clampPct(AVAIL_SERIES[i] * scope.factors.osa) - BASELINE_OSA) *
  REVENUE_PER_POINT *
  scope.countShare;
const costAt = (i: number, scope: Scope) =>
  ESTATE.team *
  scope.countShare *
  COST_PER_MERCHANDISER *
  (0.9 + (i / LAST) * 0.2);
/* Payout savings track planogram compliance: a compliant shelf is one the
   retailer cannot claim a display allowance on without earning it. */
const savingsAt = (i: number, scope: Scope) =>
  clampPct(PLANOGRAM_SERIES[i] * scope.factors.osa) *
  SAVINGS_PER_POINT *
  scope.countShare;

export type RoiKpi = { label: string; delta: string; current: string; previous: string };

export type RoiView = {
  period: MonthKey;
  monthLabel: string;
  total: { value: string; delta: string; caption: string };
  split: PieData;
  /** Title above the breakdown — "by region" nationally, "by area" inside one. */
  byRegionTitle: string;
  byRegionCaption: string;
  byRegion: BarRow[];
  cards: {
    title: string;
    current: string;
    previous: string;
    delta: string;
    tone: "up" | "down";
    spark: string;
  }[];
  kpiTables: { title: string; columns: Column[]; rows: Row[] }[];
};

const REGIONS: [string, number][] = [
  ["Ho Chi Minh City", 0.29],
  ["South East", 0.24],
  ["Mekong Delta", 0.19],
  ["Red River Delta", 0.14],
  ["Central", 0.09],
  ["North Highlands", 0.05],
];

const KPI_COLUMNS: Column[] = [
  { key: "kpi", label: "KPI" },
  { key: "delta", label: "Change", align: "right" },
  { key: "current", label: "Current month", align: "right" },
  { key: "previous", label: "Previous month", align: "right" },
];

function sparkOf(values: number[]): string {
  const y = linearScale(
    [Math.min(...values) * 0.96, Math.max(...values) * 1.02],
    [28, 4],
  );
  const xs = bandX(values.length, 2, 98);
  return linePoints(values.map((v, i) => ({ x: xs[i], y: y(v) })));
}

/**
 * What the money is split across.
 *
 * Nationally that is the six regions. Inside a region it is that region's own
 * districts, read off the geographic estate — a regional lead who has already
 * scoped to Mekong Delta learns nothing from a bar saying "Mekong Delta". A
 * category is not a geography, so it keeps the regional split.
 */
function breakdownFor(scope: Scope): {
  title: string;
  caption: string;
  rows: [string, number][];
} {
  if (scope.kind !== "region") {
    return {
      title: "Revenue impact by region",
      caption:
        "Net of merchandising cost, shared out by each region's audited store count.",
      rows: REGIONS,
    };
  }
  return {
    title: "Revenue impact by area",
    caption: `Net of merchandising cost, shared out by each area's share of ${scope.label}'s stores.`,
    rows: DISTRICTS_BY_REGION[scope.id as RegionScopeId],
  };
}

function kpiRow(label: string, current: number, previous: number): Row {
  const change = ((current - previous) / previous) * 100;
  return {
    id: label,
    cells: [
      text(label),
      {
        text: `${change >= 0 ? "+" : "−"}${Math.abs(change).toFixed(2)}%`,
        value: change,
        delta: {
          direction: change >= 0 ? "up" : "down",
          tone: change >= 0 ? "success" : "danger",
          label: `${Math.abs(change).toFixed(2)}%`,
        },
      },
      num(`${current.toFixed(2)}%`, current),
      num(`${previous.toFixed(2)}%`, previous),
    ],
  };
}

function build(period: MonthKey, scope: Scope = NATIONAL): RoiView {
  const i = MONTH_INDEX[period];
  const prev = Math.max(0, i - 1);

  const uplift = upliftAt(i, scope);
  const cost = costAt(i, scope);
  const savings = savingsAt(i, scope);
  const net = uplift - cost + savings;
  const netPrev = upliftAt(prev, scope) - costAt(prev, scope) + savingsAt(prev, scope);
  const change = netPrev === 0 ? 0 : ((net - netPrev) / netPrev) * 100;

  const breakdown = breakdownFor(scope);
  const osa = (index: number) => clampPct(AVAIL_SERIES[index] * scope.factors.osa);
  const sos = (index: number) => clampPct(VIS_SERIES[index] * scope.factors.sos);
  const planogram = (index: number) =>
    clampPct(PLANOGRAM_SERIES[index] * scope.factors.osa);
  const pricing = (index: number) =>
    clampPct(PRICING_SERIES[index] * scope.factors.osa);

  const slices = pieSlices(
    [
      { label: "Sales uplift", value: uplift },
      { label: "Payout savings", value: savings },
      { label: "Merchandising cost", value: cost },
    ],
    150,
    100,
    72,
    84,
  );

  const maxShare = Math.max(...breakdown.rows.map(([, share]) => share));

  const card = (
    title: string,
    current: number,
    previous: number,
    series: number[],
    invert = false,
  ) => {
    const up = current >= previous;
    return {
      title,
      current: vnd(current),
      previous: vnd(previous),
      delta: `${up ? "+" : "−"}${vnd(Math.abs(current - previous))}`,
      /* Cost falling is good news, so tone is not derived from direction. */
      tone: (invert ? !up : up) ? ("up" as const) : ("down" as const),
      spark: sparkOf(series),
    };
  };

  return {
    period,
    monthLabel: MONTHS[i].label,
    total: {
      value: vnd(net),
      delta: `${change >= 0 ? "+" : "−"}${Math.abs(change).toFixed(2)}%`,
      caption: "net revenue impact vs last month",
    },
    split: {
      viewBox: "0 0 300 200",
      slices: [
        { ...slices[0], tone: "primary", text: vnd(uplift) },
        { ...slices[1], tone: "secondary", text: vnd(savings) },
        { ...slices[2], tone: "muted", text: vnd(cost) },
      ],
      legend: [
        { label: "Sales uplift", value: vnd(uplift), tone: "primary" },
        { label: "Payout savings", value: vnd(savings), tone: "secondary" },
        { label: "Merchandising cost", value: vnd(cost), tone: "muted" },
      ],
      ariaLabel: `Revenue impact split: uplift ${vnd(uplift)}, savings ${vnd(savings)}, cost ${vnd(cost)}.`,
    },
    byRegionTitle: breakdown.title,
    byRegionCaption: breakdown.caption,
    byRegion: breakdown.rows.map(([name, share]) => ({
      label: name,
      value: vnd(net * share),
      pct: +((share / maxShare) * 100).toFixed(1),
    })),
    cards: [
      card(
        "Sales uplift",
        uplift,
        upliftAt(prev, scope),
        AVAIL_SERIES.map((_, index) => upliftAt(index, scope)),
      ),
      card(
        "Merchandising cost",
        cost,
        costAt(prev, scope),
        AVAIL_SERIES.map((_, index) => costAt(index, scope)),
        true,
      ),
      card(
        "Payout savings",
        savings,
        savingsAt(prev, scope),
        AVAIL_SERIES.map((_, index) => savingsAt(index, scope)),
      ),
    ],
    kpiTables: [
      {
        title: "Shelf performance",
        columns: KPI_COLUMNS,
        rows: [
          kpiRow("Share of shelf", sos(i), sos(prev)),
          kpiRow("On-shelf availability", osa(i), osa(prev)),
          kpiRow("Planogram adherence", planogram(i), planogram(prev)),
          kpiRow("Pricing adherence", pricing(i), pricing(prev)),
        ],
      },
      {
        title: "Field execution",
        columns: KPI_COLUMNS,
        rows: [
          kpiRow("Merchandiser score", osa(i) * 1.34, osa(prev) * 1.34),
          kpiRow("PJP adherence", 85 * (osa(i) / AVAIL_SERIES[LAST]), 85 * (osa(prev) / AVAIL_SERIES[LAST])),
          kpiRow("Store coverage", ESTATE.coverage * (osa(i) / AVAIL_SERIES[LAST]), ESTATE.coverage * (osa(prev) / AVAIL_SERIES[LAST])),
        ],
      },
    ],
  };
}

export const ROI_VIEWS = Object.fromEntries(
  MONTH_KEYS.map((key) => [key, build(key)]),
) as Record<MonthKey, RoiView>;

export const roiView = scopedLookup(ROI_VIEWS, build);
