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

/**
 * ROI — what the merchandising programme is worth.
 *
 * **Currency is đồng, not dollars.** The source dashboard reports a US grocery
 * account in USD; this fixture is Colgate-Palmolive Vietnam, so `$443.60K`
 * cannot be transliterated. Figures are re-authored at plausible VND
 * magnitudes.
 *
 * Nothing here is free-standing. Sales uplift is driven by the availability
 * points the platform already publishes, and merchandising cost by the team
 * size `merch-activity` already publishes — so if OSA moves, ROI moves with it
 * rather than sitting on an unrelated series.
 */

/** Đồng, formatted by hand — `toLocaleString` is banned for hydration safety. */
export function vnd(amount: number): string {
  if (amount >= 1_000_000_000) return `₫${(amount / 1_000_000_000).toFixed(2)}bn`;
  if (amount >= 1_000_000) return `₫${(amount / 1_000_000).toFixed(1)}m`;
  return `₫${group(Math.round(amount))}`;
}

/* Authored rates. One availability point across the audited estate is worth
   this much incremental revenue a month; one merchandiser costs this much. */
const REVENUE_PER_POINT = 42_000_000;
const COST_PER_MERCHANDISER = 9_400_000;
const BASELINE_OSA = 52;

const upliftAt = (i: number) =>
  Math.max(0, AVAIL_SERIES[i] - BASELINE_OSA) * REVENUE_PER_POINT;
const costAt = (i: number) =>
  ESTATE.team * COST_PER_MERCHANDISER * (0.9 + (i / LAST) * 0.2);
/* Payout savings track planogram compliance: a compliant shelf is one the
   retailer cannot claim a display allowance on without earning it. */
const savingsAt = (i: number) => PLANOGRAM_SERIES[i] * 5_600_000;

export type RoiKpi = { label: string; delta: string; current: string; previous: string };

export type RoiView = {
  period: MonthKey;
  monthLabel: string;
  total: { value: string; delta: string; caption: string };
  split: PieData;
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

function build(period: MonthKey): RoiView {
  const i = MONTH_INDEX[period];
  const prev = Math.max(0, i - 1);

  const uplift = upliftAt(i);
  const cost = costAt(i);
  const savings = savingsAt(i);
  const net = uplift - cost + savings;
  const netPrev = upliftAt(prev) - costAt(prev) + savingsAt(prev);
  const change = netPrev === 0 ? 0 : ((net - netPrev) / netPrev) * 100;

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

  const maxRegion = Math.max(...REGIONS.map(([, share]) => share));

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
      delta: `${up ? "+" : "−"}${vnd(Math.abs(current - previous)).replace("₫", "₫")}`,
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
    byRegion: REGIONS.map(([name, share]) => ({
      label: name,
      value: vnd(net * share),
      pct: +((share / maxRegion) * 100).toFixed(1),
    })),
    cards: [
      card(
        "Sales uplift",
        uplift,
        upliftAt(prev),
        AVAIL_SERIES.map((_, index) => upliftAt(index)),
      ),
      card(
        "Merchandising cost",
        cost,
        costAt(prev),
        AVAIL_SERIES.map((_, index) => costAt(index)),
        true,
      ),
      card(
        "Payout savings",
        savings,
        savingsAt(prev),
        AVAIL_SERIES.map((_, index) => savingsAt(index)),
      ),
    ],
    kpiTables: [
      {
        title: "Shelf performance",
        columns: KPI_COLUMNS,
        rows: [
          kpiRow("Share of shelf", VIS_SERIES[i], VIS_SERIES[prev]),
          kpiRow("On-shelf availability", AVAIL_SERIES[i], AVAIL_SERIES[prev]),
          kpiRow("Planogram adherence", PLANOGRAM_SERIES[i], PLANOGRAM_SERIES[prev]),
          kpiRow("Pricing adherence", PRICING_SERIES[i], PRICING_SERIES[prev]),
        ],
      },
      {
        title: "Field execution",
        columns: KPI_COLUMNS,
        rows: [
          kpiRow("Merchandiser score", AVAIL_SERIES[i] * 1.34, AVAIL_SERIES[prev] * 1.34),
          kpiRow("PJP adherence", 85 * (AVAIL_SERIES[i] / AVAIL_SERIES[LAST]), 85 * (AVAIL_SERIES[prev] / AVAIL_SERIES[LAST])),
          kpiRow("Store coverage", ESTATE.coverage * (AVAIL_SERIES[i] / AVAIL_SERIES[LAST]), ESTATE.coverage * (AVAIL_SERIES[prev] / AVAIL_SERIES[LAST])),
        ],
      },
    ],
  };
}

export const ROI_VIEWS = Object.fromEntries(
  MONTH_KEYS.map((key) => [key, build(key)]),
) as Record<MonthKey, RoiView>;
