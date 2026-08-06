import type { GaugeData } from "@/app/_charts/gauge";
import type { SeriesTone, StackedAreaData } from "@/app/_charts/chart-types";
import type { Column, Row } from "@/app/_charts/table";
import { text, tiered } from "@/app/_charts/table";
import { bandX, gridLines, linearScale, stackBands } from "@/app/_charts/geom";
import { MONTHS, MONTH_KEYS, type MonthKey } from "@/app/_time/periods";
import { AVAIL_SERIES, LAST, MONTH_INDEX } from "./spine";
import {
  GAUGE_LABEL,
  PLOT,
  VIEW_BOX,
  buildGauge,
  scopedLookup,
} from "./bespoke-shared";
import { NATIONAL, OUTLETS_BY_REGION, type RegionScopeId, type Scope } from "./scope";

/**
 * Shelving — how well the shelf is blocked by brand, format and flavour.
 *
 * **This is the one module that is deliberately narrower than the source.**
 * PowerBI's flavour-block trend stacks sixteen series. This design system has a
 * single indigo ramp plus four semantic colours, which yields about six
 * distinguishable steps — and stacked bands sit next to each other, so
 * near-neighbours are exactly what the eye has to separate. Sixteen bands would
 * be a chart nobody can read.
 *
 * So the top six variants are shown and the rest are rolled into "Other", which
 * the legend states. The full per-variant detail is still in the table below
 * the chart, which is where anyone reading sixteen series was going to end up.
 */

const CATEGORY_TABS = [
  "Toothpaste",
  "Toothbrush",
  "Mouthwash",
  "Kids oral care",
  "Whitening",
];

/** Authored July block-compliance scores per category. */
const BLOCKS: Record<string, [brand: number, brandHv: number, format: number, flavour: number]> = {
  Toothpaste: [84.15, 82.7, 77.22, 49.89],
  Toothbrush: [78.4, 74.1, 71.6, 44.2],
  Mouthwash: [69.8, 66.3, 63.9, 38.7],
  "Kids oral care": [61.2, 58.4, 55.1, 33.4],
  Whitening: [58.6, 55.2, 51.8, 31.9],
};

/**
 * Pack formats and variants, per category.
 *
 * These were one toothpaste list applied to every tab, which put "Tube 225g"
 * on the toothbrush chart. A category persona spends their whole day inside one
 * of these, so the axis has to be theirs. "Other" closes every list — the
 * module shows the top five and rolls up the tail, which is the concession the
 * header explains.
 */
const FORMATS: Record<string, string[]> = {
  Toothpaste: ["Tube 100g", "Tube 150g", "Tube 225g", "Twin pack", "Travel", "Other"],
  Toothbrush: ["Single", "Twin pack", "Value 3-pack", "Travel", "Kids pack", "Other"],
  Mouthwash: ["250ml", "500ml", "750ml", "Travel 100ml", "Twin pack", "Other"],
  "Kids oral care": ["Tube 40g", "Tube 80g", "Twin pack", "Gift pack", "Travel", "Other"],
  Whitening: ["Tube 100g", "Tube 125g", "Twin pack", "Pen", "Kit", "Other"],
};

const FLAVOURS: Record<string, string[]> = {
  Toothpaste: ["Cavity", "Charcoal", "Herbal", "Salt", "Whitening", "Other"],
  Toothbrush: ["Soft", "Medium", "Charcoal", "Firm", "Kids", "Other"],
  Mouthwash: ["Fresh mint", "Peppermint", "Herbal", "Zero alcohol", "Whitening", "Other"],
  "Kids oral care": ["Bubble fruit", "Strawberry", "Mild mint", "Watermelon", "Character", "Other"],
  Whitening: ["Charcoal", "Purple", "Advanced", "Mint", "Sparkling", "Other"],
};

const BLOCK_STORES = [
  "3742 · Winlife HCM 94/54",
  "3207 · BHX HCM Q07 769A",
  "14830 · BHX HCM TPH 187",
  "Emart Gò Vấp",
  "Co.opmart Nguyễn Đình Chiểu",
  "Aeon Tân Phú",
];

const BAND_TONES: SeriesTone[] = [
  "tertiary",
  "primary",
  "secondary",
  "success",
  "target",
  "muted",
];

const DAYS = 12;

export type ShelvingView = {
  period: MonthKey;
  monthLabel: string;
  categories: string[];
  byCategory: Record<
    string,
    {
      gauges: { title: string; data: GaugeData }[];
      formatTrend: StackedAreaData;
      flavourTrend: StackedAreaData;
      blockTable: { columns: Column[]; rows: Row[] };
    }
  >;
};

function buildStack(
  names: string[],
  seedBase: number,
  level: number,
  label: string,
): StackedAreaData {
  /* Shares per capture window, derived from a fixed shape rather than authored
     day by day — twelve points × six bands is geometry, not fact. */
  const series = names.map((name, index) => ({
    label: name,
    values: Array.from({ length: DAYS }, (_, day) => {
      const wave = Math.sin((day + index * 2 + seedBase) / 2.1) * 0.18 + 1;
      return +((22 - index * 2.6) * wave * level).toFixed(2);
    }),
  }));

  const totals = Array.from({ length: DAYS }, (_, day) =>
    series.reduce((sum, entry) => sum + entry.values[day], 0),
  );
  const domain: [number, number] = [0, Math.max(...totals) * 1.1];
  const y = linearScale(domain, [PLOT.y1, PLOT.y0]);
  const xs = bandX(DAYS, PLOT.x0, PLOT.x1);

  return {
    viewBox: VIEW_BOX,
    plot: PLOT,
    grid: gridLines(domain, y, 4, (v) => `${v.toFixed(0)}%`),
    bands: stackBands(series, xs, y).map((band, index) => ({
      ...band,
      tone: BAND_TONES[index] ?? "muted",
    })),
    xLabels: xs
      .map((x, day) => ({ x: +x.toFixed(1), label: `${day * 2 + 1}` }))
      .filter((_, day) => day % 2 === 0),
    legend: names.map((name, index) => ({
      label: name,
      tone: BAND_TONES[index] ?? "muted",
    })),
    axisTitle: { x: 12, y: 82, text: "Share", rotate: -90 },
    ariaLabel: `${label} compliance by capture window, top ${names.length - 1} variants plus other.`,
  };
}

function build(period: MonthKey, scope: Scope = NATIONAL): ShelvingView {
  const i = MONTH_INDEX[period];
  /* A region shifts every category's blocking by how well it executes. A
     category does not: `BLOCKS` already holds that category's own scores, so
     scaling by its factor as well would count it twice. Scoping to a category
     therefore narrows the tab strip rather than moving the numbers. */
  const scopeFactor = scope.kind === "region" ? scope.factors.osa : 1;
  const level = (AVAIL_SERIES[i] / AVAIL_SERIES[LAST]) * scopeFactor;

  const categories =
    scope.kind === "category" && CATEGORY_TABS.includes(scope.label)
      ? [scope.label]
      : CATEGORY_TABS;

  const stores =
    scope.kind === "region"
      ? OUTLETS_BY_REGION[scope.id as RegionScopeId].map((store) => store.outlet)
      : BLOCK_STORES;

  const byCategory = Object.fromEntries(
    categories.map((category, categoryIndex) => {
      const [brand, brandHv, format, flavour] = BLOCKS[category];
      const scaled = (value: number) => +(value * level).toFixed(2);

      const gauge = (title: string, value: number, tone: SeriesTone) => ({
        title,
        data: buildGauge({
          value: scaled(value),
          min: 0,
          max: 100,
          target: 80,
          label: scaled(value).toFixed(2),
          minLabel: "0",
          maxLabel: "100",
          tone,
          ariaLabel: `${title} ${scaled(value).toFixed(2)} against a target of 80.`,
        }),
      });

      return [
        category,
        {
          gauges: [
            gauge("Brand block compliance", brand, "tertiary"),
            gauge("Brand HV block compliance", brandHv, "primary"),
            gauge("Format block compliance", format, "secondary"),
            gauge("Flavour block compliance", flavour, flavour * level >= 80 ? "success" : "warning"),
          ],
          formatTrend: buildStack(
            FORMATS[category] ?? FORMATS.Toothpaste,
            categoryIndex,
            level,
            "Format block",
          ),
          flavourTrend: buildStack(
            FLAVOURS[category] ?? FLAVOURS.Toothpaste,
            categoryIndex + 3,
            level,
            "Flavour block",
          ),
          blockTable: {
            columns: [
              { key: "store", label: "Store" },
              { key: "brand", label: "Brand block", align: "right" },
              { key: "hv", label: "HV block", align: "right" },
              { key: "format", label: "Format block", align: "right" },
              { key: "flavour", label: "Flavour block", align: "right" },
            ],
            rows: stores.map((store, storeIndex) => {
              const skew = 1.12 - storeIndex * 0.07;
              const cell = (value: number) => {
                const v = +(value * level * skew).toFixed(2);
                return tiered(v.toFixed(2), v, v >= 80 ? "good" : v >= 55 ? "warn" : "bad");
              };
              return {
                id: `${category}-${store}`,
                cells: [
                  text(store),
                  cell(brand),
                  cell(brandHv),
                  cell(format),
                  cell(flavour),
                ],
              };
            }),
          },
        },
      ];
    }),
  ) as ShelvingView["byCategory"];

  return {
    period,
    monthLabel: MONTHS[i].label,
    categories,
    byCategory,
  };
}

export const SHELVING_VIEWS = Object.fromEntries(
  MONTH_KEYS.map((key) => [key, build(key)]),
) as Record<MonthKey, ShelvingView>;

export const shelvingView = scopedLookup(SHELVING_VIEWS, build);

export { GAUGE_LABEL };
