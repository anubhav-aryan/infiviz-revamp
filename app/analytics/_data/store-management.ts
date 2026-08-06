import type { GaugeData } from "@/app/_charts/gauge";
import type { GroupedColumnsData } from "@/app/_charts/chart-types";
import type { MatrixGroup } from "@/app/_charts/month-matrix";
import type { Column, Row } from "@/app/_charts/table";
import { num, text, tiered } from "@/app/_charts/table";
import { centredBandX, gridLines, groupedColumns, linearScale } from "@/app/_charts/geom";
import { group } from "@/app/_format/num";
import { MONTHS, MONTH_KEYS, type MonthKey } from "@/app/_time/periods";
import { AVAIL_SERIES, ESTATE, LAST, MONTH_INDEX } from "./spine";
import {
  GAUGE_LABEL,
  MONTH_SHORT,
  PLOT,
  VIEW_BOX,
  buildGauge,
  buildSeriesTrend,
  clampPct,
  pct1,
  scopedLookup,
} from "./bespoke-shared";
import {
  NATIONAL,
  OUTLETS_BY_REGION,
  RETAILERS_BY_REGION,
  type RegionScopeId,
  type Scope,
} from "./scope";

/**
 * Store Management — coverage and store standardisation.
 *
 * Coverage reconciles with the estate the platform publishes: monthly coverage
 * is the 1,412 audited stores out of 1,847, which is the 76% every other screen
 * quotes. Weekly and daily are that divided down by the visit rhythm rather
 * than authored separately, so the three dials can never disagree.
 */

const CATEGORIES = [
  "Toothpaste",
  "Toothbrush",
  "Mouthwash",
  "Kids oral care",
  "Whitening",
];

/** Median photo, facing and linear-length counts per category. */
const STANDARDISATION: [string, number, number, number][] = [
  ["Toothpaste", 11, 754, 6162.61],
  ["Toothbrush", 7, 766, 3744.79],
  ["Mouthwash", 7, 907, 2771.99],
  ["Kids oral care", 5, 625, 3051.02],
  ["Whitening", 4, 311, 1936.18],
];

const STANDARD_SERIES = [73.1, 73.1, 67.3, 28.8, 59.9, 74.8];

/** The national coverage sample, replaced store-for-store under a region. */
const COVERAGE_ROWS: [store: string, brand: string, merch: string, photos: number][] = [
  ["3742 · Winlife HCM 94/54", "Winmart", "Nguyễn Văn An", 98],
  ["3207 · BHX HCM Q07 769A", "Bach Hoa Xanh", "Trần Thị Bích", 79],
  ["14830 · BHX HCM TPH 187", "Bach Hoa Xanh", "Lê Minh Quân", 57],
  ["Emart Gò Vấp", "Emart", "Phạm Thu Hà", 44],
  ["Co.opmart Nguyễn Đình Chiểu", "Co.opmart", "Võ Hoàng Nam", 43],
  ["Aeon Tân Phú", "Aeon", "Đỗ Thị Mai", 21],
  ["Lotte Mart Quận 7", "Lotte", "Bùi Quang Huy", 8],
];

const NATIONAL_MATRIX: [retailer: string, stores: string[]][] = [
  ["Bach Hoa Xanh", ["3207 · BHX HCM Q07 769A", "14830 · BHX HCM TPH 187"]],
  ["Winmart", ["3742 · Winlife HCM 94/54"]],
  ["Co.opmart", ["Co.opmart Nguyễn Đình Chiểu"]],
  ["Aeon", ["Aeon Tân Phú"]],
];

export type StoreManagementView = {
  period: MonthKey;
  monthLabel: string;
  gauges: { title: string; data: GaugeData }[];
  coverageTrend: GroupedColumnsData;
  coverageRaw: { columns: Column[]; rows: Row[] };
  categoryMatrix: { columns: string[]; groups: MatrixGroup[] };
  standardisation: { columns: Column[]; rows: Row[] };
  standardTrend: ReturnType<typeof buildSeriesTrend>;
};

function build(period: MonthKey, scope: Scope = NATIONAL): StoreManagementView {
  const i = MONTH_INDEX[period];
  const level = AVAIL_SERIES[i] / AVAIL_SERIES[LAST];
  const days = MONTHS[i].days;
  const share = scope.countShare;

  /* A category is scoped by ranging, not geography: the estate does not shrink,
     but the stores that carry Whitening are a fraction of it. Both arrive here
     as `countShare`, which is why one expression covers the two. */
  const estate = Math.round(ESTATE.estate * share);
  const monthly = Math.round(ESTATE.stores * level * share);
  /* A store is visited about once a month, so a week covers roughly a quarter
     of the month's stores and a day roughly a working day's worth. */
  const weekly = Math.round(monthly / 4.3);
  const daily = Math.round(monthly / (days * 0.72));

  const covered = AVAIL_SERIES.map((value) =>
    Math.round((ESTATE.stores * share * value) / AVAIL_SERIES[LAST]),
  );
  const domain: [number, number] = [0, estate * 1.1];
  const y = linearScale(domain, [PLOT.y1, PLOT.y0]);
  const xs = centredBandX(6, PLOT.x0, PLOT.x1);
  const slot = (PLOT.x1 - PLOT.x0) / 6;
  const rects = groupedColumns(
    covered.map((value) => [value, estate]),
    xs,
    slot,
    y,
    PLOT.y1,
    10,
  );

  /* A region swaps the stores; a category swaps the columns. The two tabs are
     scoped by different axes because they answer different questions — "which
     of my stores did we get to" against "was my category shot when we did". */
  const coverageRows =
    scope.kind === "region"
      ? OUTLETS_BY_REGION[scope.id as RegionScopeId].map((store, index) => {
          const [, brand, merch, photos] = COVERAGE_ROWS[index % COVERAGE_ROWS.length];
          return [store.outlet, brand, merch, photos] as (typeof COVERAGE_ROWS)[number];
        })
      : COVERAGE_ROWS;

  const matrixGroups =
    scope.kind === "region"
      ? RETAILERS_BY_REGION[scope.id as RegionScopeId]
      : NATIONAL_MATRIX;

  const matrixColumns =
    scope.kind === "category" && CATEGORIES.includes(scope.label)
      ? [scope.label]
      : CATEGORIES;

  const standardRows =
    scope.kind === "category"
      ? STANDARDISATION.filter(([name]) => name === scope.label)
      : STANDARDISATION;

  const gauge = (title: string, value: number, tone: "primary" | "secondary" | "tertiary") => ({
    title,
    data: buildGauge({
      value,
      min: 0,
      max: estate,
      label: group(value),
      caption: `of ${group(estate)} stores`,
      minLabel: "0",
      maxLabel: group(estate),
      tone,
      ariaLabel: `${title}: ${group(value)} of ${group(estate)} stores.`,
    }),
  });

  return {
    period,
    monthLabel: MONTHS[i].label,

    gauges: [
      gauge("Daily store coverage", daily, "secondary"),
      gauge("Weekly store coverage", weekly, "tertiary"),
      gauge("Monthly store coverage", monthly, "primary"),
    ],

    coverageTrend: {
      viewBox: VIEW_BOX,
      plot: PLOT,
      grid: gridLines(domain, y, 4, (v) => group(Math.round(v))),
      groups: covered.map((_, index) => ({
        label: MONTH_SHORT[index],
        bars: rects[index].map((rect, barIndex) => ({
          ...rect,
          tone: barIndex === 0 ? ("primary" as const) : ("target" as const),
          label: {
            x: +(rect.x + rect.width / 2).toFixed(1),
            y: +(rect.y - (barIndex === 0 ? 5 : 15)).toFixed(1),
            text: group(barIndex === 0 ? covered[index] : estate),
          },
        })),
      })),
      legend: [
        { label: "Stores covered", tone: "primary" },
        { label: "Target stores", tone: "target" },
      ],
      xLabels: xs.map((x, index) => ({
        x: +x.toFixed(1),
        label: `${MONTH_SHORT[index]} 2026`,
      })),
      axisTitle: { x: 12, y: 82, text: "Stores", rotate: -90 },
      ariaLabel: "Stores covered against the estate, February to July 2026.",
    },

    coverageRaw: {
      columns: [
        { key: "date", label: "Visit date" },
        { key: "store", label: "Store" },
        { key: "brand", label: "Store brand" },
        { key: "merch", label: "Merchandiser" },
        { key: "photos", label: "Active photos", align: "right" },
      ],
      rows: coverageRows.map(([store, brand, merch, photos], index) => ({
        id: `cov-${index}`,
        cells: [
          text(`${String((index % 27) + 2).padStart(2, "0")} ${MONTH_SHORT[i]} 2026`),
          text(store),
          text(brand),
          text(merch),
          num(group(Math.round(photos * level)), photos),
        ],
      })),
    },

    /* Which categories were captured at each store. A blank cell means the
       category was not shot on that visit — the same convention the trend
       matrix uses, so the two grids read the same way. */
    categoryMatrix: {
      columns: matrixColumns,
      groups: matrixGroups.map(([retailer, stores], groupIndex) => {
        const cellsFor = (seed: number) =>
          matrixColumns.map((_, index) =>
            (seed + index) % 6 === 4 ? { text: "" } : { text: "1", level: 3 as const },
          );
        return {
          id: `cat-${retailer}`,
          label: retailer,
          cells: cellsFor(groupIndex),
          children: stores.map((store, storeIndex) => ({
            id: `cat-${store}`,
            label: store,
            cells: cellsFor(groupIndex + storeIndex + 1),
          })),
        };
      }),
    },

    standardisation: {
      columns: [
        { key: "cat", label: "Category" },
        { key: "photos", label: "Photo count (median)", align: "right" },
        { key: "facings", label: "Facings count (median)", align: "right" },
        { key: "linear", label: "Linear length (median)", align: "right" },
      ],
      rows: standardRows.map(([name, photos, facings, linear]) => {
        const scaledPhotos = Math.round(photos * level);
        return {
          id: name,
          cells: [
            text(name),
            tiered(
              String(scaledPhotos),
              scaledPhotos,
              scaledPhotos >= 7 ? "good" : scaledPhotos >= 4 ? "warn" : "bad",
            ),
            num(group(Math.round(facings * level)), facings),
            num(group(Math.round(linear * level)), linear),
          ],
        };
      }),
    },

    standardTrend: buildSeriesTrend({
      series: [
        {
          label: "Store standardisation",
          values:
            scope.kind === "national"
              ? STANDARD_SERIES
              : STANDARD_SERIES.map((value) =>
                  +clampPct(value * scope.factors.osa).toFixed(1),
                ),
          tone: "primary",
          fill: true,
        },
      ],
      format: pct1,
      axisTitle: "Compliance",
      ariaLabel: "Store standardisation compliance, February to July 2026.",
    }),
  };
}

export const STORE_MANAGEMENT_VIEWS = Object.fromEntries(
  MONTH_KEYS.map((key) => [key, build(key)]),
) as Record<MonthKey, StoreManagementView>;

export const storeManagementView = scopedLookup(STORE_MANAGEMENT_VIEWS, build);

export { GAUGE_LABEL };
