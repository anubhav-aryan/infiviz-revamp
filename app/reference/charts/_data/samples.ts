import type {
  DonutData,
  GroupedColumnsData,
  PieData,
  TrendChartData,
} from "@/app/_charts/chart-types";
import type { ActionsBlockData } from "@/app/_charts/actions-block";
import type { GapCard } from "@/app/_charts/gap-cards";
import type { BarRow } from "@/app/_charts/h-bar-list";
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
import { group } from "@/app/_format/num";

/**
 * Sample geometry for the chart reference poster.
 *
 * The figures are lifted from the PowerBI screenshots on purpose — the poster
 * is how the primitives get checked against the dashboard they replace, and a
 * chart drawn from the real numbers can be compared side by side. None of this
 * is application data; nothing outside `/reference/charts` imports it.
 *
 * Everything is computed at module scope, so the poster prerenders.
 */

const MONTHS = ["Feb", "Mar", "Apr", "May", "Jun", "Jul"];

/* ---------- trend: SOS, PowerBI's Apr–Sep relabelled to our window ---------- */

const SOS_VALUES = [30.38, 30.01, 30.17, 30.44, 30.54, 30.46];

function buildTrend(): TrendChartData {
  /* x0 clears the rotated axis title at x=12 plus the widest gridline label. */
  const plot = { x0: 64, x1: 574, y0: 14, y1: 150, labelY: 168 };
  const domain: [number, number] = [29.9, 30.7];
  const y = linearScale(domain, [plot.y1, plot.y0]);
  const xs = bandX(SOS_VALUES.length, plot.x0 + 14, plot.x1 - 14);
  const points = SOS_VALUES.map((value, i) => ({ x: xs[i], y: y(value) }));

  return {
    viewBox: "0 0 590 178",
    plot,
    grid: gridLines(domain, y, 5, (v) => `${v.toFixed(1)}%`),
    series: [
      {
        label: "Share of shelf",
        tone: "primary",
        line: linePoints(points),
        area: areaPath(points, plot.y1),
        dots: points.map((p) => ({ cx: Number(p.x.toFixed(1)), cy: Number(p.y.toFixed(1)) })),
        labels: points.map((p, i) => ({
          x: Number(p.x.toFixed(1)),
          // Lifted clear of the dot so the label never sits on the line.
          y: Number((p.y - 10).toFixed(1)),
          text: `${SOS_VALUES[i].toFixed(2)}%`,
        })),
      },
    ],
    trend: trendline(points) ?? undefined,
    xLabels: xs.map((x, i) => ({ x: Number(x.toFixed(1)), label: `${MONTHS[i]} 2026` })),
    axisTitle: { x: 12, y: 82, text: "SOS", rotate: -90 },
    ariaLabel:
      "Share of shelf by month, February to July 2026, rising from 30.38% to 30.46%.",
  };
}

export const TREND_SAMPLE = buildTrend();

/* ---------- grouped columns: actual vs target ---------- */

const ACTUAL = [30.38, 30.01, 30.17, 30.44, 30.54, 30.46];
const TARGET = [19.12, 19.17, 19.36, 19.61, 19.88, 19.81];

function buildColumns(): GroupedColumnsData {
  const plot = { x0: 64, x1: 574, y0: 14, y1: 150, labelY: 168 };
  const domain: [number, number] = [0, 40];
  const y = linearScale(domain, [plot.y1, plot.y0]);
  const xs = centredBandX(ACTUAL.length, plot.x0, plot.x1);
  const slot = (plot.x1 - plot.x0) / ACTUAL.length;

  const rects = groupedColumns(
    ACTUAL.map((value, i) => [value, TARGET[i]]),
    xs,
    slot,
    y,
    plot.y1,
    10,
  );

  return {
    viewBox: "0 0 590 178",
    plot,
    grid: gridLines(domain, y, 5, (v) => `${v.toFixed(0)}%`),
    groups: ACTUAL.map((_, i) => ({
      label: MONTHS[i],
      bars: rects[i].map((rect, barIndex) => ({
        ...rect,
        tone: barIndex === 0 ? ("tertiary" as const) : ("target" as const),
        label: {
          x: Number((rect.x + rect.width / 2).toFixed(1)),
          y: Number((rect.y - 4).toFixed(1)),
          text: `${(barIndex === 0 ? ACTUAL[i] : TARGET[i]).toFixed(2)}%`,
        },
      })),
    })),
    legend: [
      { label: "Actual SOS", tone: "tertiary" },
      { label: "Target", tone: "target" },
    ],
    xLabels: xs.map((x, i) => ({ x: Number(x.toFixed(1)), label: `${MONTHS[i]} 2026` })),
    axisTitle: { x: 12, y: 82, text: "Actual SOS", rotate: -90 },
    ariaLabel: "Actual share of shelf against target, February to July 2026.",
  };
}

export const COLUMNS_SAMPLE = buildColumns();

/* ---------- donut: own vs competition ---------- */

function buildDonut(): DonutData {
  const radius = 62;
  const segments = ringDash(
    [
      { label: "Company", value: 30.46 },
      { label: "Competitor", value: 69.54 },
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
    centre: { value: "30.5%", caption: "Company" },
    legend: [
      { label: "Company", value: "30.46%", tone: "primary" },
      { label: "Competitor", value: "69.54%", tone: "muted" },
    ],
    ariaLabel: "Share of shelf: company 30.46%, competitors 69.54%.",
  };
}

export const DONUT_SAMPLE = buildDonut();

/* ---------- pie: open vs closed tasks ---------- */

function buildPie(): PieData {
  const slices = pieSlices(
    [
      { label: "Open", value: 505 },
      { label: "Closed", value: 195 },
    ],
    150,
    100,
    72,
    84,
  );

  return {
    /* 300 wide for a 144-wide circle: the leader labels are anchored outside
       the arc and would otherwise paint beyond the card's padding. */
    viewBox: "0 0 300 200",
    slices: [
      { ...slices[0], tone: "primary", text: "505 (72.1%)" },
      { ...slices[1], tone: "secondary", text: "195 (27.9%)" },
    ],
    legend: [
      { label: "Open", value: "505", tone: "primary" },
      { label: "Closed", value: "195", tone: "secondary" },
    ],
    ariaLabel: "Task status: 505 open, 195 closed.",
  };
}

export const PIE_SAMPLE = buildPie();

/* ---------- gap cards ---------- */

export const GAP_SAMPLE: GapCard[] = [
  { name: "Toothpaste", gap: "5.28%", actual: "49.48%", target: "54.76%", tone: "behind" },
  { name: "Toothbrush", gap: "6.41%", actual: "59.72%", target: "53.30%", tone: "ahead" },
];

/* ---------- horizontal bars ---------- */

export const REASON_BARS: BarRow[] = [
  { label: "No stock — reported to store", value: "411", pct: 100 },
  { label: "Goods excluded from range", value: "288", pct: 70 },
  { label: "Stock present, not shelved", value: "1", pct: 1 },
];

export const CATEGORY_BARS: BarRow[] = [
  { label: "Optic White", value: "101", pct: 100 },
  { label: "Total", value: "100", pct: 99 },
  { label: "Max Fresh", value: "92", pct: 91 },
  { label: "Natural Salt", value: "61", pct: 60 },
  { label: "Salt Original", value: "52", pct: 51 },
  { label: "Vitamin C", value: "49", pct: 49 },
];

/* ---------- tables ---------- */

export const BRAND_COLUMNS: Column[] = [
  { key: "brand", label: "Brand" },
  { key: "facings", label: "Facings", align: "right" },
  { key: "sos", label: "SOS", align: "right" },
  { key: "mom", label: "Δ MoM", align: "right" },
];

const BRAND_FACTS: [string, number, number, number][] = [
  ["Colgate Total", 64759, 3.61, -0.07],
  ["Colgate CDC", 59300, 3.3, -0.04],
  ["Optic White", 58814, 3.28, -0.14],
  ["Max Fresh", 57343, 3.19, 0.01],
  ["Natural Salt", 50920, 2.84, -0.01],
];

export const BRAND_ROWS: Row[] = BRAND_FACTS.map(([name, facings, sos, mom]) => ({
  id: name,
  cells: [
    text(name),
    num(group(facings), facings),
    num(`${sos.toFixed(2)}%`, sos),
    {
      text: `${mom >= 0 ? "+" : "−"}${Math.abs(mom).toFixed(2)}%`,
      value: mom,
      delta: {
        direction: mom >= 0 ? ("up" as const) : ("down" as const),
        tone: mom >= 0 ? ("success" as const) : ("danger" as const),
        label: `${Math.abs(mom).toFixed(2)}%`,
      },
    },
  ],
}));

export const STORE_COLUMNS: Column[] = [
  { key: "store", label: "Store" },
  { key: "sos", label: "SOS", align: "right" },
  { key: "osa", label: "OSA compliance", align: "right" },
  { key: "pricing", label: "Pricing compliance", align: "right" },
  { key: "planogram", label: "Planogram compliance", align: "right" },
  { key: "score", label: "Store score", align: "right" },
];

const STORE_FACTS: [string, number, number, number, number][] = [
  ["3742 · Winlife HCM 94/54", 33.3, 100, 11.31, 51.54],
  ["3207 · BHX Q07 769A Tran", 34.35, 100, 6.09, 50.15],
  ["14830 · BHX 187 Tan Phu", 39.69, 75, 10.0, 44.9],
  ["Emart Gò Vấp", 37.83, 75, 7.35, 43.39],
  ["Lotte Q7", 34.0, 66.67, 9.66, 40.11],
];

function scoreTier(score: number) {
  return score >= 45 ? ("good" as const) : score >= 35 ? ("warn" as const) : ("bad" as const);
}

export const STORE_ROWS: Row[] = [
  ...STORE_FACTS.map(([name, sos, osa, pricing, planogram]) => {
    const score = (sos + osa + pricing + planogram) / 4;
    return {
      id: name,
      cells: [
        text(name),
        num(`${sos.toFixed(2)}%`, sos),
        num(`${osa.toFixed(2)}%`, osa),
        num(`${pricing.toFixed(2)}%`, pricing),
        num(`${planogram.toFixed(2)}%`, planogram),
        tiered(`${score.toFixed(2)}%`, score, scoreTier(score)),
      ],
    };
  }),
  {
    id: "total",
    total: true,
    cells: [
      text("Total"),
      num("30.46%", 30.46),
      num("32.42%", 32.42),
      num("8.12%", 8.12),
      num("27.00%", 27),
      num("24.50%", 24.5),
    ],
  },
];

/* ---------- detail table with SE links ---------- */

export const DETAIL_COLUMNS: Column[] = [
  { key: "date", label: "Visit date" },
  { key: "outlet", label: "Outlet" },
  { key: "category", label: "Category" },
  { key: "actual", label: "Actual SOS", align: "right" },
  { key: "target", label: "Target SOS", align: "right" },
];

const DETAIL_FACTS: [string, string, string, number, number, string | null][] = [
  ["11 Jul 2026", "3742 · Winlife HCM 94/54", "Toothpaste", 21.43, 30, "/session-viewer/3742-winlife-hcm-94-54-56"],
  ["11 Jul 2026", "3207 · BHX Q07 769A Tran", "Toothpaste", 60.34, 60, "/session-viewer/3207-bhx-hcm-q07-769a-tran"],
  ["12 Jul 2026", "Co.opmart NĐC", "Toothbrush", 24.32, 20, null],
  ["12 Jul 2026", "Aeon Tân Phú", "Toothpaste", 10.81, 20, null],
];

export const DETAIL_ROWS: Row[] = DETAIL_FACTS.map(
  ([date, outlet, category, actual, target, href]) => ({
    id: `${date}-${outlet}`,
    cells: [
      text(date),
      text(outlet),
      text(category),
      tiered(
        `${actual.toFixed(2)}%`,
        actual,
        actual >= target ? "good" : actual >= target * 0.6 ? "warn" : "bad",
      ),
      num(`${target.toFixed(2)}%`, target),
      { text: "", seLink: true, href: href ?? undefined },
    ],
  }),
);

/* ---------- actions block ---------- */

const COMPLETION_COLUMNS: Column[] = [
  { key: "merch", label: "Merchandiser" },
  { key: "open", label: "Open", align: "right" },
  { key: "closed", label: "Closed", align: "right" },
  { key: "pct", label: "Completion", align: "right" },
];

const COMPLETION_FACTS: [string, number, number][] = [
  ["Nguyễn Văn An", 30, 26],
  ["Trần Thị Bích", 19, 24],
  ["Lê Minh Quân", 97, 18],
  ["Phạm Thu Hà", 18, 14],
  ["Võ Hoàng Nam", 38, 13],
];

const ACTIONS_RAW_COLUMNS: Column[] = [
  { key: "date", label: "Visit date" },
  { key: "store", label: "Store" },
  { key: "retailer", label: "Retailer" },
  { key: "region", label: "Region" },
  { key: "status", label: "Status" },
];

export const ACTIONS_SAMPLE: ActionsBlockData = {
  stats: [
    {
      label: "Number of actions",
      value: "1,065",
      delta: { direction: "down", tone: "success", label: "379" },
      caption: "generated this month",
    },
    { label: "Actions per visit", value: "0.18", caption: "against 0.12 last month" },
    {
      label: "Actions completed",
      value: "27.9",
      unit: "%",
      delta: { direction: "down", tone: "danger", label: "62.8%" },
      caption: "297 of 1,065 closed",
    },
  ],
  openClosed: PIE_SAMPLE,
  reasons: {
    title: "Why availability was not fixed",
    rows: REASON_BARS,
    axisLabel: "Number of actions",
  },
  byCategory: {
    title: "Brand-wise actions generated",
    rows: CATEGORY_BARS,
    axisLabel: "Number of actions",
  },
  completion: {
    title: "Merchandiser-wise action completion",
    columns: COMPLETION_COLUMNS,
    rows: COMPLETION_FACTS.map(([name, open, closed]) => {
      const pct = (closed / (open + closed)) * 100;
      return {
        id: name,
        cells: [
          text(name),
          num(String(open), open),
          num(String(closed), closed),
          num(`${pct.toFixed(2)}%`, pct),
        ],
      };
    }),
  },
  raw: {
    title: "Actions raw data",
    columns: ACTIONS_RAW_COLUMNS,
    rows: DETAIL_FACTS.map(([date, outlet, category]) => ({
      id: `raw-${date}-${outlet}`,
      cells: [
        text(date),
        text(outlet),
        text(category === "Toothpaste" ? "Bach Hoa Xanh" : "Co.opmart"),
        text("Ho Chi Minh City"),
        text("Open"),
      ],
    })),
  },
};

/* ---------- raw table ---------- */

export const RAW_COLUMNS: Column[] = [
  { key: "date", label: "Date" },
  { key: "store", label: "Store" },
  { key: "category", label: "Category" },
  { key: "brand", label: "Brand" },
  { key: "sku", label: "SKU" },
  { key: "facings", label: "Facings", align: "right" },
];

/* 60 rows so the 50-row cap is visibly exercised by the poster. */
export const RAW_ROWS: Row[] = Array.from({ length: 60 }, (_, i) => {
  const facings = 1 + (i % 4);
  return {
    id: `raw-${i}`,
    cells: [
      text(`${String((i % 28) + 1).padStart(2, "0")} Jul 2026`),
      text(BRAND_FACTS[i % BRAND_FACTS.length][0]),
      text(i % 2 === 0 ? "Toothpaste" : "Toothbrush"),
      text("Colgate"),
      text(`COL SKU ${1000 + i}`),
      num(String(facings), facings),
    ],
  };
});

export const RAW_CSV = {
  headers: RAW_COLUMNS.map((column) => column.label),
  rows: RAW_ROWS.map((row) => row.cells.map((cell) => cell.text)),
};
