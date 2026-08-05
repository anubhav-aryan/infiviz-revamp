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
  pct1,
} from "./bespoke-shared";

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

function build(period: MonthKey): StoreManagementView {
  const i = MONTH_INDEX[period];
  const level = AVAIL_SERIES[i] / AVAIL_SERIES[LAST];
  const days = MONTHS[i].days;

  const monthly = Math.round(ESTATE.stores * level);
  /* A store is visited about once a month, so a week covers roughly a quarter
     of the month's stores and a day roughly a working day's worth. */
  const weekly = Math.round(monthly / 4.3);
  const daily = Math.round(monthly / (days * 0.72));

  const covered = AVAIL_SERIES.map((value) =>
    Math.round((ESTATE.stores * value) / AVAIL_SERIES[LAST]),
  );
  const domain: [number, number] = [0, ESTATE.estate * 1.1];
  const y = linearScale(domain, [PLOT.y1, PLOT.y0]);
  const xs = centredBandX(6, PLOT.x0, PLOT.x1);
  const slot = (PLOT.x1 - PLOT.x0) / 6;
  const rects = groupedColumns(
    covered.map((value) => [value, ESTATE.estate]),
    xs,
    slot,
    y,
    PLOT.y1,
    10,
  );

  const gauge = (title: string, value: number, tone: "primary" | "secondary" | "tertiary") => ({
    title,
    data: buildGauge({
      value,
      min: 0,
      max: ESTATE.estate,
      label: group(value),
      caption: `of ${group(ESTATE.estate)} stores`,
      minLabel: "0",
      maxLabel: group(ESTATE.estate),
      tone,
      ariaLabel: `${title}: ${group(value)} of ${group(ESTATE.estate)} stores.`,
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
            text: group(barIndex === 0 ? covered[index] : ESTATE.estate),
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
      rows: [
        ["3742 · Winlife HCM 94/54", "Winmart", "Nguyễn Văn An", 98],
        ["3207 · BHX HCM Q07 769A", "Bach Hoa Xanh", "Trần Thị Bích", 79],
        ["14830 · BHX HCM TPH 187", "Bach Hoa Xanh", "Lê Minh Quân", 57],
        ["Emart Gò Vấp", "Emart", "Phạm Thu Hà", 44],
        ["Co.opmart Nguyễn Đình Chiểu", "Co.opmart", "Võ Hoàng Nam", 43],
        ["Aeon Tân Phú", "Aeon", "Đỗ Thị Mai", 21],
        ["Lotte Mart Quận 7", "Lotte", "Bùi Quang Huy", 8],
      ].map(([store, brand, merch, photos], index) => ({
        id: `cov-${index}`,
        cells: [
          text(`${String((index % 27) + 2).padStart(2, "0")} ${MONTH_SHORT[i]} 2026`),
          text(store as string),
          text(brand as string),
          text(merch as string),
          num(group(Math.round((photos as number) * level)), photos as number),
        ],
      })),
    },

    /* Which categories were captured at each store. A blank cell means the
       category was not shot on that visit — the same convention the trend
       matrix uses, so the two grids read the same way. */
    categoryMatrix: {
      columns: CATEGORIES,
      groups: [
        ["Bach Hoa Xanh", ["3207 · BHX HCM Q07 769A", "14830 · BHX HCM TPH 187"]],
        ["Winmart", ["3742 · Winlife HCM 94/54"]],
        ["Co.opmart", ["Co.opmart Nguyễn Đình Chiểu"]],
        ["Aeon", ["Aeon Tân Phú"]],
      ].map(([retailer, stores], groupIndex) => {
        const cellsFor = (seed: number) =>
          CATEGORIES.map((_, index) =>
            (seed + index) % 6 === 4 ? { text: "" } : { text: "1", level: 3 as const },
          );
        return {
          id: `cat-${retailer as string}`,
          label: retailer as string,
          cells: cellsFor(groupIndex),
          children: (stores as string[]).map((store, storeIndex) => ({
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
      rows: STANDARDISATION.map(([name, photos, facings, linear]) => {
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
        { label: "Store standardisation", values: STANDARD_SERIES, tone: "primary", fill: true },
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

export { GAUGE_LABEL };
