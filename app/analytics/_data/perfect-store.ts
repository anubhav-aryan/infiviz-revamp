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
import { buildSeriesTrend, clampPct, pct2, scopedLookup } from "./bespoke-shared";
import { NATIONAL, OUTLETS_BY_REGION, type RegionScopeId, type Scope } from "./scope";

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

/**
 * Which stores the table lists.
 *
 * A region swaps them for its own — the point of scoping to Mekong Delta is to
 * see Mekong Delta's stores. A category does not: the same stores were visited,
 * and what changes is what was measured inside them. Replacements are laid over
 * the authored templates so a store still carries a pricing and planogram skew
 * rather than sitting exactly on its region's mean.
 */
function storesFor(scope: Scope): [name: string, osa: number, sos: number][] {
  const templates = STORES.map(
    ([name, osa, , , sos]) => [name, osa, sos] as [string, number, number],
  );
  if (scope.kind !== "region") return templates;
  return OUTLETS_BY_REGION[scope.id as RegionScopeId].map((store, index) => {
    const [, osa, sos] = templates[index % templates.length];
    return [store.outlet, osa * store.skew, sos * store.skew];
  });
}

function build(period: MonthKey, scope: Scope = NATIONAL): PerfectStoreView {
  const i = MONTH_INDEX[period];
  const osaLevel = AVAIL_SERIES[i] / AVAIL_SERIES[LAST];
  const sosLevel = VIS_SERIES[i] / VIS_SERIES[LAST];
  const pricingLevel = PRICING_SERIES[i] / PRICING_SERIES[LAST];
  const planogramLevel = PLANOGRAM_SERIES[i] / PLANOGRAM_SERIES[LAST];

  /* Pricing and planogram have no per-region fact anywhere in the fixtures, so
     they move with the scope's availability standing — the closest thing the
     data has to "how well this scope executes". */
  const execFactor = scope.factors.osa;

  /* The scope's own four components, and the score they make. Under the
     national scope the score is read from `PERFECT_SERIES` rather than
     recomputed, because that array rounds to one decimal before the mean and a
     recomputation would disagree with it in the second. */
  const scopeSos = clampPct(VIS_SERIES[i] * scope.factors.sos);
  const scopeOsa = clampPct(AVAIL_SERIES[i] * scope.factors.osa);
  const scopePricing = clampPct(PRICING_SERIES[i] * execFactor);
  const scopePlanogram = clampPct(PLANOGRAM_SERIES[i] * execFactor);
  const scoreAt = (index: number) =>
    scope.kind === "national"
      ? PERFECT_SERIES[index]
      : +(
          (clampPct(VIS_SERIES[index] * scope.factors.sos) +
            clampPct(AVAIL_SERIES[index] * scope.factors.osa) +
            clampPct(PRICING_SERIES[index] * execFactor) +
            clampPct(PLANOGRAM_SERIES[index] * execFactor)) /
          4
        ).toFixed(1);
  const headline = scoreAt(i);

  const rows: Row[] = storesFor(scope)
    .map(([name, osa, sos]) => {
      const [pricingSkew, planogramSkew] = STORE_SKEW[name] ?? [1, 1];
      const storeOsa = clampPct(osa * osaLevel * scope.factors.osa);
      const storeSos = clampPct(sos * sosLevel * scope.factors.sos);
      const storePricing = clampPct(
        PRICING_SERIES[LAST] * pricingSkew * pricingLevel * execFactor,
      );
      const storePlanogram = clampPct(
        PLANOGRAM_SERIES[LAST] * planogramSkew * planogramLevel * execFactor,
      );
      const score = (storeSos + storeOsa + storePricing + storePlanogram) / 4;

      return {
        id: name,
        cells: [
          text(name),
          num(pct2(storeSos), storeSos),
          num(pct2(storeOsa), storeOsa),
          num(pct2(storePricing), storePricing),
          num(pct2(storePlanogram), storePlanogram),
          tiered(pct2(score), score, scoreTier(score, headline)),
        ],
      };
    })
    .sort((a, b) => (b.cells[5].value ?? 0) - (a.cells[5].value ?? 0));

  /* The total row is the scope's own figure, not the mean of the stores on
     screen — those are a sample, and averaging a sample would quietly disagree
     with every other surface that quotes 63.8% OSA. */
  const total: Row = {
    id: "total",
    total: true,
    cells: [
      text(scope.label),
      num(pct2(scopeSos), scopeSos),
      num(pct2(scopeOsa), scopeOsa),
      num(pct2(scopePricing), scopePricing),
      num(pct2(scopePlanogram), scopePlanogram),
      num(pct2(headline), headline),
    ],
  };

  const previous = scoreAt(i > 0 ? i - 1 : 0);
  const scale = (values: number[], factor: number) =>
    factor === 1 ? values : values.map((value) => clampPct(value * factor));

  return {
    period,
    monthLabel: MONTHS[i].label,
    score: pct2(headline),
    scoreDelta: `${headline >= previous ? "+" : "−"}${Math.abs(headline - previous).toFixed(2)}%`,
    columns: COLUMNS,
    rows: [...rows, total],
    trend: buildSeriesTrend({
      series: [
        {
          label: "Perfect Store score",
          values: PERFECT_SERIES.map((_, index) => scoreAt(index)),
          tone: "primary",
          fill: true,
        },
        {
          label: "On-shelf availability",
          values: scale(AVAIL_SERIES, scope.factors.osa),
          tone: "secondary",
        },
        {
          label: "Pricing compliance",
          values: scale(PRICING_SERIES, execFactor),
          tone: "tertiary",
        },
      ],
      axisTitle: "Score",
      withTrendline: true,
      ariaLabel: `Perfect Store score and components for ${scope.label}, February to July 2026.`,
    }),
  };
}

export const PERFECT_STORE_VIEWS = Object.fromEntries(
  MONTH_KEYS.map((key) => [key, build(key)]),
) as Record<MonthKey, PerfectStoreView>;

export const perfectStoreView = scopedLookup(PERFECT_STORE_VIEWS, build);
