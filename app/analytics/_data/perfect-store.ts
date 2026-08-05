import type { Column, Row } from "@/app/_charts/table";
import { num, text, tiered } from "@/app/_charts/table";
import { MONTH_KEYS, MONTHS, type MonthKey } from "@/app/_time/periods";
import {
  AVAIL_SERIES,
  DIM_SOURCE,
  LAST,
  MONTH_INDEX,
  PERFECT_SERIES,
  PLANOGRAM_SERIES,
  PRICING_SERIES,
  VIS_SERIES,
} from "./spine";
import { buildSeriesTrend, pct2 } from "./bespoke-shared";

/**
 * Perfect Store — one score per store over its four components.
 *
 * The score is the unweighted mean of SOS, OSA, pricing and planogram, which is
 * exactly how the source dashboard's total row computes it. Nothing here is a
 * new measure: all four components already exist on the platform, and
 * `PERFECT_SERIES` in `spine.ts` is derived from them rather than authored, so
 * the national total can never drift from the four numbers it is made of.
 *
 * Stores come from the `Store` dimension the Analytics screen already
 * publishes, so a store's OSA is the same figure on both surfaces.
 */

const STORES = DIM_SOURCE.Store;

/* Per-store variation around the national component levels. Authored as
   multipliers rather than absolute figures so every store still moves with the
   national spine when the month changes. */
const STORE_SKEW: Record<string, [pricing: number, planogram: number]> = {
  "3742 Winlife 94/54": [1.24, 1.16],
  "3207 BHX Q07": [1.05, 1.02],
  "Co.opmart NĐC": [0.96, 0.98],
  "Aeon Tân Phú": [1.02, 0.94],
  "14830 BHX 187 Tân": [0.83, 0.9],
  "MM An Phú": [0.72, 0.84],
};

export type PerfectStoreView = {
  period: MonthKey;
  monthLabel: string;
  score: string;
  scoreDelta: string;
  columns: Column[];
  rows: Row[];
  trend: ReturnType<typeof buildSeriesTrend>;
};

const COLUMNS: Column[] = [
  { key: "store", label: "Store" },
  { key: "sos", label: "SOS", align: "right" },
  { key: "osa", label: "OSA compliance", align: "right" },
  { key: "pricing", label: "Pricing compliance", align: "right" },
  { key: "planogram", label: "Planogram compliance", align: "right" },
  { key: "score", label: "Store score", align: "right" },
];

/** Tiers against the national score, so the ramp means "better than average". */
const scoreTier = (score: number, national: number) =>
  score >= national * 1.15
    ? ("good" as const)
    : score >= national * 0.92
      ? ("warn" as const)
      : ("bad" as const);

function build(period: MonthKey): PerfectStoreView {
  const i = MONTH_INDEX[period];
  const osaLevel = AVAIL_SERIES[i] / AVAIL_SERIES[LAST];
  const sosLevel = VIS_SERIES[i] / VIS_SERIES[LAST];
  const pricingLevel = PRICING_SERIES[i] / PRICING_SERIES[LAST];
  const planogramLevel = PLANOGRAM_SERIES[i] / PLANOGRAM_SERIES[LAST];
  const national = PERFECT_SERIES[i];

  const rows: Row[] = STORES.map(([name, osa, , , sos]) => {
    const [pricingSkew, planogramSkew] = STORE_SKEW[name] ?? [1, 1];
    const storeOsa = osa * osaLevel;
    const storeSos = sos * sosLevel;
    const storePricing = PRICING_SERIES[LAST] * pricingSkew * pricingLevel;
    const storePlanogram = PLANOGRAM_SERIES[LAST] * planogramSkew * planogramLevel;
    const score = (storeSos + storeOsa + storePricing + storePlanogram) / 4;

    return {
      id: name,
      cells: [
        text(name),
        num(pct2(storeSos), storeSos),
        num(pct2(storeOsa), storeOsa),
        num(pct2(storePricing), storePricing),
        num(pct2(storePlanogram), storePlanogram),
        tiered(pct2(score), score, scoreTier(score, national)),
      ],
    };
  }).sort((a, b) => (b.cells[5].value ?? 0) - (a.cells[5].value ?? 0));

  /* The total row is the national figure, not the mean of the eight stores on
     screen — those are a sample, and averaging a sample would quietly disagree
     with every other surface that quotes 63.8% OSA. */
  const total: Row = {
    id: "total",
    total: true,
    cells: [
      text("National"),
      num(pct2(VIS_SERIES[i]), VIS_SERIES[i]),
      num(pct2(AVAIL_SERIES[i]), AVAIL_SERIES[i]),
      num(pct2(PRICING_SERIES[i]), PRICING_SERIES[i]),
      num(pct2(PLANOGRAM_SERIES[i]), PLANOGRAM_SERIES[i]),
      num(pct2(national), national),
    ],
  };

  const previous = i > 0 ? PERFECT_SERIES[i - 1] : PERFECT_SERIES[0];

  return {
    period,
    monthLabel: MONTHS[i].label,
    score: pct2(national),
    scoreDelta: `${national >= previous ? "+" : "−"}${Math.abs(national - previous).toFixed(2)}%`,
    columns: COLUMNS,
    rows: [...rows, total],
    trend: buildSeriesTrend({
      series: [
        { label: "Perfect Store score", values: PERFECT_SERIES, tone: "primary", fill: true },
        { label: "On-shelf availability", values: AVAIL_SERIES, tone: "secondary" },
        { label: "Pricing compliance", values: PRICING_SERIES, tone: "tertiary" },
      ],
      axisTitle: "Score",
      withTrendline: true,
      ariaLabel: "Perfect Store score and components, February to July 2026.",
    }),
  };
}

export const PERFECT_STORE_VIEWS = Object.fromEntries(
  MONTH_KEYS.map((key) => [key, build(key)]),
) as Record<MonthKey, PerfectStoreView>;
