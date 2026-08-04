import type { IconName } from "@/app/_components/icon";
import type { CsvTable } from "@/app/_export/csv";
import {
  applyFilters,
  type Accessors,
  type ActiveFilter,
  type FilterDimension,
} from "@/app/_filters/model";
import { group } from "@/app/_format/num";
import {
  MONTHS,
  MONTH_BY_KEY,
  MONTH_KEYS,
  type MonthKey,
} from "@/app/_time/periods";

/**
 * Demo content for the Analytics screen, transcribed verbatim from the design
 * doc. There is no backend yet — every figure here is fixture data for
 * Colgate-Palmolive Vietnam.
 *
 * The shape is facts → build → per-period view, the same one Journey plans
 * proved. July 2026 is the month the designer authored: every builder
 * short-circuits on it and hands its `CURRENT_*` literals straight back by
 * reference, so no transform ever runs over the authored numbers. Earlier
 * months are derived from the history the fixtures already carry — the per-row
 * deltas and the two six-month national series — never authored a second time.
 *
 * Everything the design computes in `renderVals()` is computed at module scope,
 * so the server and the client emit the same markup and nothing depends on a
 * formatter running twice.
 */

export type Persona = "exec" | "regional" | "category" | "field";

/**
 * Arrow direction and colour are deliberately independent. A falling metric is
 * sometimes the good news (out-of-stock), and competitor deltas carry a
 * direction but no judgement at all — hence the third, toneless value.
 */
export type DeltaTone = "up" | "down" | "neutral";

/** The design writes deltas with U+2212 MINUS SIGN, not a hyphen. */
const MINUS = "−";

function signed(v: number): string {
  return (v >= 0 ? "+" : MINUS) + Math.abs(v).toFixed(1);
}

const round1 = (v: number) => +v.toFixed(1);

/** `42` prints as "42", `48.8` as "48.8" — the design's own loose formatting. */
const trim1 = (v: number) => String(round1(v));

/* ---------------------------------------------------------------- */
/* the six-month national spine                                      */
/* ---------------------------------------------------------------- */

/**
 * Availability and visibility, February through July. These two arrays are the
 * whole reason the month picker offers exactly Feb–Jul: they are the only
 * monthly history the design authors, and every derived month leans on them.
 */
const AVAIL_SERIES = [58, 59, 60, 61, 62, 63.8];
const VIS_SERIES = [45, 43, 42, 41, 40, 38.7];

/** Index of the authored month inside both series and inside `MONTH_KEYS`. */
const LAST = AVAIL_SERIES.length - 1;

const MONTH_INDEX = Object.fromEntries(
  MONTH_KEYS.map((key, i) => [key, i]),
) as Record<MonthKey, number>;

/**
 * One month further back than the series author. Continuing the spine's own
 * first step is the only way to give February a delta of its own without
 * inventing a seventh figure for each series.
 */
const before = (series: number[]) => series[0] - (series[1] - series[0]);

const availAt = (i: number) => (i < 0 ? before(AVAIL_SERIES) : AVAIL_SERIES[i]);
const visAt = (i: number) => (i < 0 ? before(VIS_SERIES) : VIS_SERIES[i]);

/** How much lower the whole board sat in month `i`, measured against July. */
const availLevel = (i: number) => availAt(i) / AVAIL_SERIES[LAST];
const visLevel = (i: number) => visAt(i) / VIS_SERIES[LAST];

/**
 * The same measure, but anchored on June instead.
 *
 * June is not derived: every authored delta means "versus the previous month",
 * so `osa − d` is the fixtures' own June figure, exact for every row. Anything
 * with such a figure therefore scales its earlier months from June, which keeps
 * the series continuous. Scaling them from July instead would leave May and
 * June resting on different bases and open a step between them that no fact
 * accounts for — worst where a row's own delta is far from the spine's, which
 * is exactly where the eye goes.
 */
const priorLevel = (i: number) => availAt(i) / AVAIL_SERIES[LAST - 1];

/* ---------------------------------------------------------------- */
/* shell                                                            */
/* ---------------------------------------------------------------- */

export const PERSONAS: { key: Persona; label: string }[] = [
  { key: "exec", label: "Executive" },
  { key: "regional", label: "Regional" },
  { key: "category", label: "Category" },
  { key: "field", label: "Field" },
];

/**
 * The scope trail is a caption, not a control. Nothing in the fixtures is
 * scoped by region — the ranked lists are national at every persona — so the
 * crumbs are rendered as a static path rather than as links that would set a
 * scope the data cannot honour. See the note in `analytics-header.tsx`.
 */
export const SCOPE: { label: string; current: boolean }[] = [
  { label: "National", current: false },
  { label: "South East", current: false },
  { label: "Ho Chi Minh City", current: true },
];

/**
 * The design draws these as live chips on load. The screen opens unfiltered
 * instead — otherwise the designer's headline figures never appear — so they
 * lead the Add-filter menu as suggestions.
 */
const DESIGN_FILTERS = ["Store type: Hypermarket"];

/* ---------------------------------------------------------------- */
/* dimensions — shared by every persona's band C                    */
/* ---------------------------------------------------------------- */

export type DimKey =
  | "Region"
  | "Retailer"
  | "Store type"
  | "Category"
  | "Brand"
  | "City"
  | "Store"
  | "Merchandiser"
  | "Sub-category"
  | "SKU";

/** `d` is the row's change against the previous month — the whole back-history. */
type DimFacts = [name: string, osa: number, d: number, stores: number, sos: number];

const DIM_SOURCE: Record<DimKey, DimFacts[]> = {
  Region: [
    ["Ho Chi Minh City", 71.2, 2.1, 412, 42],
    ["South East", 66.4, 1.3, 380, 40],
    ["Mekong Delta", 62.1, 0.4, 300, 38],
    ["Red River Delta", 59.8, -0.6, 210, 36],
    ["Central", 56.3, -1.2, 190, 35],
    ["North Highlands", 52.4, -2.1, 90, 31],
  ],
  Retailer: [
    ["Bach Hoa Xanh", 68.1, 1.8, 720, 40],
    ["Winmart", 62.3, 0.9, 300, 39],
    ["Co.opmart", 60.1, 0.2, 214, 38],
    ["Aeon", 58.4, 1.1, 78, 41],
    ["Lotte", 55.2, -0.8, 60, 37],
    ["Emart", 53.6, -1.4, 44, 36],
    ["MM Mega Market", 51.0, -1.9, 35, 34],
  ],
  "Store type": [
    ["Hypermarket", 70.2, 2.4, 141, 43],
    ["Supermarket", 65.1, 1.0, 372, 40],
    ["Mini mart", 61.3, 0.6, 1290, 38],
    ["Convenience", 54.0, -1.1, 44, 33],
  ],
  Category: [
    ["Toothpaste", 65.1, 1.2, 78, 40],
    ["Toothbrush", 61.0, 0.5, 43, 36],
  ],
  Brand: [
    ["Colgate Total", 74.0, 2.0, 610, 11],
    ["CDC", 71.2, 1.5, 590, 11],
    ["Max Fresh", 68.0, 1.1, 540, 6],
    ["Natural", 63.0, 0.3, 470, 4],
    ["Salt", 60.0, -0.2, 410, 4],
    ["Kid", 58.0, -0.4, 360, 3],
    ["Vitamin C", 55.0, -1.0, 300, 3],
    ["Optic White", 8.6, -6.4, 630, 2],
  ],
  City: [
    ["Quận 1", 72.1, 1.8, 64, 43],
    ["Quận 7", 69.4, 1.2, 58, 41],
    ["Bình Thạnh", 66.2, 0.6, 72, 39],
    ["Thủ Đức", 63.0, -0.4, 80, 37],
    ["Gò Vấp", 60.1, -0.9, 55, 36],
    ["Tân Phú", 57.3, -1.6, 48, 34],
  ],
  Store: [
    ["3742 Winlife 94/54", 74.0, 2.0, 1, 44],
    ["3207 BHX Q07", 66.0, 0.8, 1, 40],
    ["Co.opmart NĐC", 61.0, 0.2, 1, 38],
    ["Aeon Tân Phú", 58.0, 1.0, 1, 41],
    ["14830 BHX 187 Tân", 52.0, -1.2, 1, 35],
    ["MM An Phú", 49.0, -2.0, 1, 33],
  ],
  Merchandiser: [
    ["quan_do", 72.0, 1.6, 44, 41],
    ["linh_pham", 68.0, 1.1, 38, 40],
    ["khang_nguyen", 65.0, 0.7, 42, 39],
    ["mai_bui", 61.0, 0.3, 36, 37],
    ["huy_le", 56.0, -1.0, 40, 35],
    ["nam_hoang", 51.0, -2.1, 29, 32],
  ],
  "Sub-category": [
    ["Cavity protection", 70.0, 1.4, 40, 42],
    ["Whitening", 62.0, 0.5, 28, 38],
    ["Herbal", 58.0, -0.3, 18, 36],
    ["Kids", 54.0, -1.1, 14, 34],
  ],
  SKU: [
    ["COL TP CDC 225G", 78.0, 1.9, 1, 44],
    ["COL Total Charcoal 150G", 71.0, 1.0, 1, 40],
    ["COL Max Fresh 140G", 66.0, 0.6, 1, 39],
    ["COL Natural Salt 180G", 60.0, -0.4, 1, 37],
    ["COL Salt Original 200G", 54.0, -1.2, 1, 35],
    ["COL Optic White 100G", 8.6, -6.4, 1, 30],
  ],
};

export const DIM_KEYS = Object.keys(DIM_SOURCE) as DimKey[];

export type RankRow = {
  name: string;
  /** One-decimal display string. */
  osa: string;
  /** Bar width, in percent. The design plots OSA directly on a 0–100 track. */
  w: number;
  /** Where the bar sat a month ago — the compare toggle's ghost marker. */
  prevW: number;
  stores: number;
  sos: number;
  delta: string;
  tone: DeltaTone;
};

function rankRow(
  name: string,
  osa: number,
  d: number,
  stores: number,
  sos: number,
): RankRow {
  return {
    name,
    osa: osa.toFixed(1),
    w: osa,
    prevW: Math.max(0, round1(osa - d)),
    stores,
    sos,
    delta: signed(d),
    tone: d >= 0 ? "up" : "down",
  };
}

type Dims = Record<DimKey, RankRow[]>;

/** The designer's month, straight off the literals. */
const CURRENT_DIMS: Dims = Object.fromEntries(
  DIM_KEYS.map((key) => [
    key,
    DIM_SOURCE[key].map(([name, osa, d, stores, sos]) =>
      rankRow(name, osa, d, stores, sos),
    ),
  ]),
) as Dims;

/**
 * A row's availability in month `i`. June needs no recipe at all, and the
 * months before it ride the national spine down from June's exact figure.
 */
function osaAt(osa: number, d: number, i: number): number {
  if (i === LAST) return osa;
  const june = round1(osa - d);
  if (i === LAST - 1) return june;
  return round1(june * priorLevel(i));
}

function buildDims(i: number): Dims {
  if (i === LAST) return CURRENT_DIMS;

  return Object.fromEntries(
    DIM_KEYS.map((key) => [
      key,
      DIM_SOURCE[key].map(([name, osa, d, stores, sos]) => {
        const now = osaAt(osa, d, i);
        return rankRow(
          name,
          now,
          round1(now - osaAt(osa, d, i - 1)),
          // A single store stays a single store however far back you look.
          Math.max(1, Math.round(stores * availLevel(i))),
          Math.round(sos * visLevel(i)),
        );
      }),
    ]),
  ) as Dims;
}

export const DIM_OPTIONS: Record<Persona, DimKey[]> = {
  exec: ["Region", "Retailer", "Store type", "Category", "Brand"],
  regional: ["City", "Retailer", "Store type", "Store"],
  category: ["Brand", "Sub-category", "SKU", "Retailer", "Region"],
  field: ["Store", "Merchandiser", "Retailer"],
};

/** Switching persona resets the picker to that persona's own default slice. */
export const DEFAULT_DIM: Record<Persona, DimKey> = {
  exec: "Region",
  regional: "City",
  category: "Brand",
  field: "Store",
};

/**
 * The dashed 85% target line is absolutely positioned against the ranked-list
 * grid. The design hardcodes this `calc()` against the 140px/1fr/74px template
 * rather than deriving it, and it is off by the gutter — carried over verbatim
 * so the line lands where the design puts it.
 */
export const RANK_TARGET_LINE = "calc(140px + (100% - 214px) * 0.85)";

/* ---------------------------------------------------------------- */
/* filters                                                          */
/* ---------------------------------------------------------------- */

/** Ten dimensions and every value they hold, for free. Nothing is authored. */
export const FILTER_DIMENSIONS: FilterDimension[] = DIM_KEYS.map((key) => ({
  key,
  label: key,
  values: DIM_SOURCE[key].map(([name]) => name),
}));

export const SUGGESTED_FILTERS: ActiveFilter[] = DESIGN_FILTERS.map((label) => {
  const at = label.indexOf(": ");
  return { dim: label.slice(0, at), value: label.slice(at + 2) };
});

/**
 * `applyFilters` fails a row on any dimension it cannot answer for, which is
 * what you want inside one table and not what you want across a screen. Every
 * table therefore sees only the filters its own columns carry.
 */
function narrow<T>(
  rows: T[],
  filters: ActiveFilter[],
  accessors: Accessors<T>,
): T[] {
  const carried = filters.filter((f) => f.dim in accessors);
  return carried.length ? applyFilters(rows, carried, accessors) : rows;
}

/**
 * A dimension filters its own ranked list and scatter and nothing else: a
 * region filter cannot narrow the retailer list, because no fact in these
 * fixtures ties a retailer to a region.
 */
function narrowDims(dims: Dims, filters: ActiveFilter[]): Dims {
  if (filters.length === 0) return dims;

  const out = { ...dims };
  for (const key of DIM_KEYS) {
    const values = filters.filter((f) => f.dim === key).map((f) => f.value);
    if (values.length) out[key] = dims[key].filter((r) => values.includes(r.name));
  }
  return out;
}

/**
 * What share of the audited estate survives the filters, read off the one
 * column that genuinely counts stores. Dimensions multiply, which assumes they
 * are independent — the fixtures carry no cross-tab that would say otherwise.
 */
function storeFraction(dims: Dims, filters: ActiveFilter[]): number {
  let fraction = 1;

  for (const key of DIM_KEYS) {
    const values = filters.filter((f) => f.dim === key).map((f) => f.value);
    if (values.length === 0) continue;

    const rows = dims[key];
    const total = rows.reduce((sum, r) => sum + r.stores, 0);
    if (total === 0) continue;
    const kept = rows
      .filter((r) => values.includes(r.name))
      .reduce((sum, r) => sum + r.stores, 0);
    fraction *= kept / total;
  }

  return fraction;
}

/* ---------------------------------------------------------------- */
/* band A                                                           */
/* ---------------------------------------------------------------- */

const CURRENT_BAND_A = {
  stores: 1412,
  coverage: 76,
  sessions: 12847,
  photos: 41320,
};

const CURRENT_FIELD_BAND_A = { active: 142, visits: "6.4" };

function bandA(i: number, fraction: number): string[] {
  const scale = availLevel(i) * fraction;
  return [
    `${group(Math.round(CURRENT_BAND_A.stores * scale))} stores audited`,
    `${Math.round(CURRENT_BAND_A.coverage * availLevel(i))}% coverage`,
    `${group(Math.round(CURRENT_BAND_A.sessions * scale))} sessions`,
    `${group(Math.round(CURRENT_BAND_A.photos * scale))} photos`,
    "synced 12 min ago",
  ];
}

function fieldBandA(i: number, fraction: number): string[] {
  return [
    `${group(Math.round(CURRENT_FIELD_BAND_A.active * availLevel(i) * fraction))} active today`,
    `${CURRENT_FIELD_BAND_A.visits} avg visits / merchandiser`,
    `${Math.round(CURRENT_BAND_A.coverage * availLevel(i))}% coverage this week`,
    "synced 12 min ago",
  ];
}

/* ---------------------------------------------------------------- */
/* executive                                                        */
/* ---------------------------------------------------------------- */

export type Hero = {
  name: string;
  val: string;
  target: number;
  delta: string;
  deltaIcon: IconName;
  tone: DeltaTone;
  deltaLabel: string;
  /** Where the metric sat a month ago — the compare toggle's ghost marker. */
  prev: number;
  spark: string;
  sub1k: string;
  sub1v: string;
  sub2k: string;
  sub2v: string;
  /** The Share-of-Shelf card swaps its second stat for a mini own/comp bar. */
  sub2Kind: "plain" | "ownComp";
};

const HERO_DELTA_LABEL = "vs previous month";

/**
 * The two headline cards. `delta` is signed: Share of Shelf fell 2.3 points,
 * so the compare ghost lands at 41.0 and the arrow points down.
 *
 * The spine's own last step is 1.8, not the 2.6 the design prints. For the
 * month the designer authored, the design wins.
 */
const CURRENT_HEROES: Hero[] = [
  {
    name: "On-Shelf Availability",
    val: "63.8",
    target: 85,
    delta: "2.6",
    deltaIcon: "arrow-up-right",
    tone: "up",
    deltaLabel: HERO_DELTA_LABEL,
    prev: 61.2,
    spark: "0,24 20,21 40,17 60,12 80,9 100,6",
    sub1k: "Must-have OSA",
    sub1v: "72.5%",
    sub2k: "Out of stock",
    sub2v: "36.2%",
    sub2Kind: "plain",
  },
  {
    name: "Share of Shelf",
    val: "38.7",
    target: 45,
    delta: "2.3",
    deltaIcon: "arrow-down-right",
    tone: "down",
    deltaLabel: HERO_DELTA_LABEL,
    prev: 41.0,
    spark: "0,7 20,9 40,12 60,15 80,20 100,23",
    sub1k: "Linear share",
    sub1v: "38.8%",
    sub2k: "Own vs competition",
    sub2v: "",
    sub2Kind: "ownComp",
  },
];

/**
 * The sparkline is hand-plotted, not a formula over the series — no linear map
 * reproduces its six y-values. An earlier month therefore keeps the authored
 * shape and simply stops where that month stops. February, first in the
 * window, has a single point and so draws nothing.
 */
function sparkUpTo(points: string, i: number): string {
  if (i === LAST) return points;
  const ys = points.split(" ").map((p) => p.split(",")[1]);
  const kept = ys.slice(0, i + 1);
  const step = kept.length > 1 ? 100 / (kept.length - 1) : 0;
  return kept.map((y, n) => `${round1(n * step)},${y}`).join(" ");
}

function buildHeroes(i: number): Hero[] {
  if (i === LAST) return CURRENT_HEROES;

  const series = [AVAIL_SERIES, VIS_SERIES];

  return CURRENT_HEROES.map((hero, n) => {
    const val = series[n][i];
    const delta = round1(val - (n === 0 ? availAt(i - 1) : visAt(i - 1)));
    const up = delta >= 0;

    return {
      ...hero,
      val: trim1(val),
      delta: Math.abs(delta).toFixed(1),
      deltaIcon: up ? "arrow-up-right" : "arrow-down-right",
      tone: up ? "up" : "down",
      prev: round1(val - delta),
      spark: sparkUpTo(hero.spark, i),
      sub1v:
        n === 0
          ? `${round1(72.5 * availLevel(i))}%`
          : `${round1(38.8 * visLevel(i))}%`,
      // Out-of-stock is the mirror of availability, so it rises as the board falls.
      sub2v: n === 0 ? `${round1(36.2 / availLevel(i))}%` : "",
    };
  });
}

export type OwnComp = { own: number; comp: number; label: string };

/** The own/competition split inside the Share-of-Shelf card. */
const CURRENT_OWN_COMP: OwnComp = { own: 38.3, comp: 61.7, label: "38.3 / 61.7" };

function buildOwnComp(i: number): OwnComp {
  if (i === LAST) return CURRENT_OWN_COMP;
  const own = round1(CURRENT_OWN_COMP.own * visLevel(i));
  const comp = round1(100 - own);
  return { own, comp, label: `${own} / ${comp}` };
}

/* --- OSA vs Share of Shelf scatter --- */

export type ScatterPoint = { cx: string; cy: string };

const SC_X0 = 36;
const SC_X1 = 286;
const SC_Y0 = 14;
const SC_Y1 = 180;

/** SOS runs 0–50 across the plot, OSA runs 0–90 up it. */
const scX = (sos: number) => (SC_X0 + (sos / 50) * (SC_X1 - SC_X0)).toFixed(1);
const scY = (osa: number) => (SC_Y1 - (osa / 90) * (SC_Y1 - SC_Y0)).toFixed(1);

export const SCATTER_GUIDES = {
  tx: scX(45),
  ty: scY(85),
  // Nudged off the already-rounded gridline, exactly as the design does it.
  tyLabel: (parseFloat(scY(85)) - 3).toFixed(1),
};

/* --- biggest moves dumbbell --- */

export type Dumbbell = {
  name: string;
  from: number;
  to: number;
  left: number;
  width: number;
  tone: DeltaTone;
  delta: string;
};

function dumbbell(name: string, from: number, to: number): Dumbbell {
  const good = to >= from;
  const lo = Math.min(from, to);
  const hi = Math.max(from, to);
  return {
    name,
    from,
    to,
    left: lo,
    width: hi - lo,
    tone: good ? "up" : "down",
    delta: (good ? "+" : MINUS) + Math.abs(to - from).toFixed(1),
  };
}

const DUMBBELL_SOURCE: [name: string, from: number, to: number][] = [
  ["Aeon", 58, 62],
  ["Ho Chi Minh City", 68, 71.2],
  ["Hypermarket", 67, 70.2],
  ["Must-have OSA", 70, 72.5],
  ["Bach Hoa Xanh", 66, 68],
  ["Optic White", 15, 8.6],
  ["North Highlands", 55, 52.4],
  ["Share of Shelf", 41, 38.7],
  ["Red River Delta", 62, 59.8],
  ["Central", 58, 56.3],
];

const CURRENT_DUMBBELL: Dumbbell[] = DUMBBELL_SOURCE.map(([name, from, to]) =>
  dumbbell(name, from, to),
);

/** The same moves on a board that sat lower — both ends ride the spine. */
function buildDumbbell(i: number): Dumbbell[] {
  if (i === LAST) return CURRENT_DUMBBELL;
  const k = availLevel(i);
  return DUMBBELL_SOURCE.map(([name, from, to]) =>
    dumbbell(name, round1(from * k), round1(to * k)),
  );
}

/* --- six-month dual line --- */

const L_X0 = 30;
const L_X1 = 352;
const L_Y0 = 12;
const L_Y1 = 178;

const lineX = (i: number) => (L_X0 + i * ((L_X1 - L_X0) / 5)).toFixed(1);
const lineY = (v: number) => (L_Y1 - (v / 100) * (L_Y1 - L_Y0)).toFixed(1);

export type LineView = {
  grid: { y: string; v: number }[];
  t85: string;
  t45: string;
  avail: string;
  vis: string;
  xl: { label: string; x: string }[];
  /**
   * Where the selected month sits on the window. Null on July, so the chart the
   * designer drew keeps exactly the marks the designer drew.
   */
  markX: string | null;
};

const CURRENT_LINE: LineView = {
  grid: [0, 50, 100].map((v) => ({ y: lineY(v), v })),
  t85: lineY(85),
  t45: lineY(45),
  avail: AVAIL_SERIES.map((v, i) => `${lineX(i)},${lineY(v)}`).join(" "),
  vis: VIS_SERIES.map((v, i) => `${lineX(i)},${lineY(v)}`).join(" "),
  xl: MONTHS.map((m, i) => ({ label: m.shortLabel, x: lineX(i) })),
  markX: null,
};

function buildLine(i: number): LineView {
  if (i === LAST) return CURRENT_LINE;
  return { ...CURRENT_LINE, markX: lineX(i) };
}

export type Insight = { icon: IconName; text: string; link: string };

/** Prose about the authored month; there is no monthly history behind it. */
export const INSIGHTS: Insight[] = [
  {
    icon: "trending-down",
    text: "Optic White availability 8.6% across 630 ranged store-SKUs — worst brand nationally.",
    link: "Open Optic White",
  },
  {
    icon: "swords",
    text: "P/S gained 9.3 points of shelf share; ours fell 2.3 in supermarkets.",
    link: "Open supermarkets",
  },
  {
    icon: "map-pin",
    text: "North Highlands below 55% availability for a third month.",
    link: "Scope to North Highlands",
  },
  {
    icon: "image-off",
    text: "142 sessions excluded for low photo quality this period.",
    link: "Open Photo quality",
  },
];

/* ---------------------------------------------------------------- */
/* regional lead                                                    */
/* ---------------------------------------------------------------- */

export type RegionalHero = {
  name: string;
  /** Doubles as the bar width, so it keeps the design's own formatting. */
  val: string;
  national: string;
  target: number;
  rank: string;
  delta: string;
  deltaIcon: IconName;
  tone: DeltaTone;
};

const CURRENT_REGIONAL_HEROES: RegionalHero[] = [
  {
    name: "On-Shelf Availability",
    val: "71.2",
    national: "63.8",
    target: 85,
    rank: "1st of 6 regions",
    delta: "2.1",
    deltaIcon: "arrow-up-right",
    tone: "up",
  },
  {
    // The design stores 42.0 as a number, so it prints as "42" — not "42.0".
    name: "Share of Shelf",
    val: "42",
    national: "38.7",
    target: 45,
    rank: "2nd of 6 regions",
    delta: "0.9",
    deltaIcon: "arrow-up-right",
    tone: "up",
  },
];

export const REGIONAL_HERO_SUB = "Ho Chi Minh City · vs previous month";

/**
 * Ho Chi Minh City against the nation. The city's availability is the Region
 * dimension's own top row, so it moves with the same arithmetic; every region
 * scales uniformly, which is why the rank badges never change.
 */
function buildRegionalHeroes(i: number): RegionalHero[] {
  if (i === LAST) return CURRENT_REGIONAL_HEROES;

  const [, osa, d] = DIM_SOURCE.Region[0];
  const vals = [osaAt(osa, d, i), round1(42 * visLevel(i))];
  const prevs = [osaAt(osa, d, i - 1), round1(42 * visLevel(i - 1))];
  const nationals = [availAt(i), visAt(i)];

  return CURRENT_REGIONAL_HEROES.map((hero, n) => {
    const delta = round1(vals[n] - prevs[n]);
    return {
      ...hero,
      val: trim1(vals[n]),
      national: trim1(nationals[n]),
      delta: Math.abs(delta).toFixed(1),
      deltaIcon: delta >= 0 ? "arrow-up-right" : "arrow-down-right",
      tone: delta >= 0 ? "up" : "down",
    };
  });
}

/* --- OSA heatmap, city × retailer --- */

export const HEAT_COLS = ["BHX", "Winmart", "Co.op", "Aeon", "Lotte"];

const heatColor = (v: number) =>
  v >= 72
    ? "var(--indigo-700)"
    : v >= 66
      ? "var(--indigo-500)"
      : v >= 60
        ? "var(--indigo-300)"
        : v >= 54
          ? "var(--indigo-100)"
          : "var(--neutral-100)";

const heatFg = (v: number) => (v >= 66 ? "#fff" : "var(--text-secondary)");

const HEAT_SOURCE: [name: string, vals: number[]][] = [
  ["Quận 1", [74, 71, 69, 72, 58]],
  ["Quận 7", [70, 68, 66, 69, 55]],
  ["Bình Thạnh", [67, 64, 62, 60, 53]],
  ["Thủ Đức", [63, 61, 60, 58, 51]],
  ["Gò Vấp", [60, 59, 57, 55, 49]],
  ["Tân Phú", [57, 56, 54, 52, 47]],
];

export type HeatRow = {
  name: string;
  cells: { v: number; color: string; fg: string; title: string }[];
};

const CURRENT_HEAT_ROWS: HeatRow[] = HEAT_SOURCE.map(([name, vals]) => ({
  name,
  cells: vals.map((v) => ({
    v,
    color: heatColor(v),
    fg: heatFg(v),
    title: `${name} · ${v}% OSA`,
  })),
}));

function buildHeatRows(i: number): HeatRow[] {
  if (i === LAST) return CURRENT_HEAT_ROWS;
  const k = availLevel(i);
  return HEAT_SOURCE.map(([name, vals]) => ({
    name,
    cells: vals.map((raw) => {
      const v = Math.round(raw * k);
      return { v, color: heatColor(v), fg: heatFg(v), title: `${name} · ${v}% OSA` };
    }),
  }));
}

/* --- audit coverage vs availability scatter --- */

const covX = (c: number) => (36 + (c / 100) * 250).toFixed(1);
const covY = (o: number) => (180 - (o / 90) * 166).toFixed(1);

const COV_SOURCE: [coverage: number, osa: number][] = [
  [84, 72],
  [79, 69],
  [76, 66],
  [71, 63],
  [66, 60],
  [58, 57],
];

const CURRENT_COV_SCATTER: ScatterPoint[] = COV_SOURCE.map(([c, o]) => ({
  cx: covX(c),
  cy: covY(o),
}));

function buildCovScatter(i: number): ScatterPoint[] {
  if (i === LAST) return CURRENT_COV_SCATTER;
  const k = availLevel(i);
  return COV_SOURCE.map(([c, o]) => ({ cx: covX(c * k), cy: covY(o * k) }));
}

/* --- store league table --- */

const leagueSpark = (arr: number[]) =>
  arr.map((v, i) => `${i * 14},${(17 - (v / 100) * 15).toFixed(1)}`).join(" ");

export type LeagueRow = {
  store: string;
  retailer: string;
  type: string;
  osa: number;
  sos: number;
  sessions: number;
  lastVisit: string;
  spark: string;
};

const LEAGUE_SOURCE: [
  store: string,
  retailer: string,
  type: string,
  osa: number,
  sos: number,
  sessions: number,
  lastVisit: string,
  spark: number[],
][] = [
  ["MM An Phú", "MM Mega", "Hyper", 49, 33, 74, "2d ago", [52, 50, 49, 48, 49]],
  ["14830 BHX 187 Tân", "BHX", "Mini", 52, 35, 88, "today", [56, 54, 53, 52, 52]],
  ["Emart Gò Vấp", "Emart", "Hyper", 54, 34, 61, "1d ago", [58, 57, 56, 55, 54]],
  ["Lotte Q7", "Lotte", "Hyper", 55, 37, 96, "3d ago", [59, 58, 57, 56, 55]],
  ["Co.opmart NĐC", "Co.op", "Super", 61, 38, 120, "today", [59, 60, 60, 61, 61]],
  ["3207 BHX Q07", "BHX", "Mini", 66, 40, 84, "today", [62, 63, 64, 65, 66]],
  ["Aeon Tân Phú", "Aeon", "Hyper", 68, 41, 203, "today", [64, 65, 66, 67, 68]],
  ["3742 Winlife 94/54", "Winmart", "Super", 74, 44, 152, "today", [70, 71, 72, 73, 74]],
];

const CURRENT_LEAGUE: LeagueRow[] = LEAGUE_SOURCE.map(
  ([store, retailer, type, osa, sos, sessions, lastVisit, sp]) => ({
    store,
    retailer,
    type,
    osa,
    sos,
    sessions,
    lastVisit,
    spark: leagueSpark(sp),
  }),
);

function buildLeague(i: number): LeagueRow[] {
  if (i === LAST) return CURRENT_LEAGUE;
  const a = availLevel(i);
  const v = visLevel(i);
  return CURRENT_LEAGUE.map((row) => ({
    ...row,
    osa: Math.round(row.osa * a),
    sos: Math.round(row.sos * v),
    sessions: Math.round(row.sessions * a),
    // The trend spark and "last visit" are relative to the row, not the
    // calendar, so they read the same in every month of the window.
  }));
}

/**
 * The league table abbreviates the two columns it shares with the dimension
 * catalogue, so the filter values have to be mapped back onto its own spelling.
 */
const LEAGUE_RETAILER: Record<string, string> = {
  BHX: "Bach Hoa Xanh",
  Winmart: "Winmart",
  "Co.op": "Co.opmart",
  Aeon: "Aeon",
  Lotte: "Lotte",
  Emart: "Emart",
  "MM Mega": "MM Mega Market",
};

const LEAGUE_TYPE: Record<string, string> = {
  Hyper: "Hypermarket",
  Super: "Supermarket",
  Mini: "Mini mart",
};

const LEAGUE_ACCESSORS: Accessors<LeagueRow> = {
  Retailer: (row) => LEAGUE_RETAILER[row.retailer],
  "Store type": (row) => LEAGUE_TYPE[row.type],
  Store: (row) => row.store,
};

/* ---------------------------------------------------------------- */
/* category lead                                                    */
/* ---------------------------------------------------------------- */

/** Competitor blocks are hatched rather than coloured — kept as authored. */
export const HATCH =
  "repeating-linear-gradient(45deg,#e2e8f0 0 6px,#cbd5e1 6px 12px)";

export type CategoryOsa = {
  name: string;
  val: string;
  delta: string;
  deltaIcon: IconName;
  tone: DeltaTone;
  target: number;
  /** Where it sat a month ago — the compare toggle's ghost marker. */
  prev: number;
};

export type CategorySos = {
  name: string;
  val: string;
  delta: string;
  deltaIcon: IconName;
  tone: DeltaTone;
  own: number;
  comp: number;
};

const CURRENT_CATEGORY_OSA: CategoryOsa = {
  name: "On-Shelf Availability · Toothpaste",
  val: "65.1",
  delta: "1.2",
  deltaIcon: "arrow-up-right",
  tone: "up",
  target: 85,
  prev: 63.9,
};

const CURRENT_CATEGORY_SOS: CategorySos = {
  name: "Share of Shelf · Toothpaste",
  val: "38.9",
  delta: "2.1",
  deltaIcon: "arrow-down-right",
  tone: "down",
  own: 38.9,
  comp: 61.1,
};

/** Toothpaste is the Category dimension's own first row, deltas and all. */
function buildCategoryOsa(i: number): CategoryOsa {
  if (i === LAST) return CURRENT_CATEGORY_OSA;

  const [, osa, d] = DIM_SOURCE.Category[0];
  const val = osaAt(osa, d, i);
  const prev = osaAt(osa, d, i - 1);
  const delta = round1(val - prev);

  return {
    ...CURRENT_CATEGORY_OSA,
    val: trim1(val),
    delta: Math.abs(delta).toFixed(1),
    deltaIcon: delta >= 0 ? "arrow-up-right" : "arrow-down-right",
    tone: delta >= 0 ? "up" : "down",
    prev,
  };
}

function buildCategorySos(i: number): CategorySos {
  if (i === LAST) return CURRENT_CATEGORY_SOS;

  const own = round1(CURRENT_CATEGORY_SOS.own * visLevel(i));
  const delta = round1(own - round1(CURRENT_CATEGORY_SOS.own * visLevel(i - 1)));

  return {
    ...CURRENT_CATEGORY_SOS,
    val: trim1(own),
    delta: Math.abs(delta).toFixed(1),
    deltaIcon: delta >= 0 ? "arrow-up-right" : "arrow-down-right",
    tone: delta >= 0 ? "up" : "down",
    own,
    comp: round1(100 - own),
  };
}

export type RibbonSegment = {
  label: string;
  w: string;
  bg: string;
  fg: string;
  /** Blank when the block is too narrow to hold its own label. */
  short: string;
};

function summaryRibbon(sos: CategorySos): RibbonSegment[] {
  return [
    {
      label: "Colgate",
      w: trim1(sos.own),
      bg: "var(--indigo-600)",
      fg: "#fff",
      short: `Colgate ${trim1(sos.own)}%`,
    },
    {
      label: "Competitors",
      w: trim1(sos.comp),
      bg: HATCH,
      fg: "var(--text-secondary)",
      short: `Competitors ${trim1(sos.comp)}%`,
    },
  ];
}

/**
 * Own-brand segments carry the design's hardcoded indigo ramp — these hexes are
 * literals in the source, not token references, so they stay literals here.
 */
const OWN_SEGMENTS: [label: string, w: number, bg: string, fg: string][] = [
  ["CDC", 11.2, "#4F46E5", "#fff"],
  ["Colgate Total", 9.1, "#6366F1", "#fff"],
  ["Natural", 7.0, "#818CF8", "#fff"],
  ["Max Fresh", 5.9, "#A5B4FC", "var(--indigo-900)"],
  ["Salt", 3.0, "#C7D2FE", "var(--indigo-900)"],
  ["Vitamin C", 2.7, "#E0E7FF", "var(--indigo-900)"],
];

const COMP_COLLAPSED: [label: string, w: number][] = [["Competitors", 61.1]];

const COMP_BROKEN_OUT: [label: string, w: number][] = [
  ["P/S", 23.5],
  ["Closeup", 16.3],
  ["Sensodyne", 10.2],
  ["Oral-B", 8.3],
  ["Others", 2.8],
];

/**
 * `own` scales with the visibility spine and the competitors absorb whatever is
 * left, so the ribbon always adds to 100 and always agrees with the card above
 * it. Which competitor gained the space is not a fact these fixtures hold, so
 * they scale together.
 */
const OWN_TOTAL = CURRENT_CATEGORY_SOS.own;

/** Whatever the own brands give up, the competitors take. */
const compScaleFor = (ownScale: number) =>
  (100 - OWN_TOTAL * ownScale) / (100 - OWN_TOTAL);

function ribbon(breakout: boolean, ownScale: number): RibbonSegment[] {
  const compScale = compScaleFor(ownScale);

  return [
    ...OWN_SEGMENTS.map(([label, raw, bg, fg]) => {
      const w = round1(raw * ownScale);
      return { label, w: w.toFixed(1), bg, fg, short: w > 5 ? label.split(" ")[0] : "" };
    }),
    ...(breakout ? COMP_BROKEN_OUT : COMP_COLLAPSED).map(([label, raw]) => {
      const w = round1(raw * compScale);
      return {
        label,
        w: w.toFixed(1),
        bg: HATCH,
        fg: "var(--text-secondary)",
        short: w > 8 ? label : "",
      };
    }),
  ];
}

const CURRENT_RIBBON_COLLAPSED = ribbon(false, 1);
const CURRENT_RIBBON_BROKEN_OUT = ribbon(true, 1);

export type ShelfShare = {
  name: string;
  share: string;
  w: number;
  dot: string;
  delta: string;
  tone: DeltaTone;
};

const SHELF_SOURCE: [name: string, own: boolean, share: number, d: number][] = [
  ["P/S", false, 23.5, 2.1],
  ["Closeup", false, 16.3, 0.4],
  ["CDC", true, 11.2, -0.6],
  ["Sensodyne", false, 10.2, 0.8],
  ["Colgate Total", true, 9.1, -0.3],
  ["Oral-B", false, 8.3, 0.5],
  ["Natural", true, 7.0, -0.2],
  ["Max Fresh", true, 5.9, -0.4],
];

function whoShelf(ownScale: number): ShelfShare[] {
  const compScale = compScaleFor(ownScale);
  const shares = SHELF_SOURCE.map(([, own, share]) =>
    round1(share * (own ? ownScale : compScale)),
  );
  // Bars scale against the biggest shelf holder, not against the total.
  const max = Math.max(...shares);

  return SHELF_SOURCE.map(([name, own, , d], i) => ({
    name,
    share: shares[i].toFixed(1),
    w: +((shares[i] / max) * 100).toFixed(1),
    dot: own ? "var(--indigo-600)" : "var(--neutral-400)",
    delta: signed(d),
    // A rival gaining shelf is not "good news" to colour green, so competitor
    // rows keep the arrow's sign but drop the tone entirely.
    tone: own ? (d >= 0 ? "up" : "down") : "neutral",
  }));
}

const CURRENT_WHO_SHELF = whoShelf(1);

export type OsaTier = "good" | "warn" | "bad";

export type MissingRow = {
  name: string;
  /** Carried so a brand filter can reach the SKU table. */
  brand: string;
  ranged: number;
  present: number;
  absent: number;
  osa: string;
  tier: OsaTier;
  spark: string;
};

const osaTier = (v: number): OsaTier =>
  v >= 70 ? "good" : v >= 40 ? "warn" : "bad";

const MISSING_SOURCE: [
  name: string,
  brand: string,
  ranged: number,
  present: number,
  osa: number,
  spark: number[],
][] = [
  ["COL Optic White 100G", "Optic White", 630, 54, 8.6, [15, 13, 11, 10, 9]],
  ["COL Max Fresh 140G", "Max Fresh", 540, 356, 65.9, [60, 62, 63, 65, 66]],
  ["COL Salt Original 200G", "Salt", 410, 240, 58.5, [62, 61, 60, 59, 58]],
  ["COL Natural Salt 180G", "Natural", 470, 296, 63.0, [60, 61, 62, 62, 63]],
  ["COL Vitamin C 120G", "Vitamin C", 300, 165, 55.0, [59, 58, 57, 56, 55]],
  ["COL TP CDC 225G", "CDC", 590, 472, 80.0, [76, 77, 78, 79, 80]],
];

function missing(
  name: string,
  brand: string,
  ranged: number,
  present: number,
  osa: number,
  sp: number[],
): MissingRow {
  return {
    name,
    brand,
    ranged,
    present,
    absent: ranged - present,
    osa: osa.toFixed(1),
    tier: osaTier(osa),
    spark: sp
      .map((v, i) => `${i * 12},${(16 - (v / 100) * 14).toFixed(1)}`)
      .join(" "),
  };
}

const CURRENT_WHATS_MISSING: MissingRow[] = MISSING_SOURCE.map(
  ([name, brand, ranged, present, osa, sp]) =>
    missing(name, brand, ranged, present, osa, sp),
);

/**
 * Five of these six SKUs are also rows of the SKU dimension, which carries a
 * real per-month delta for each. Reading it here is what keeps one SKU at one
 * figure wherever it appears — the Optic White collapse especially, whose −6.4
 * is nothing like the uniform step the spine would otherwise impose on it.
 */
const SKU_DELTA = new Map(DIM_SOURCE.SKU.map(([name, , d]) => [name, d]));

function buildWhatsMissing(i: number): MissingRow[] {
  if (i === LAST) return CURRENT_WHATS_MISSING;

  return MISSING_SOURCE.map(([name, brand, ranged, , osa, sp]) => {
    const d = SKU_DELTA.get(name);
    // The one SKU with no row of its own falls back to the national spine.
    const scaled = d === undefined ? round1(osa * availLevel(i)) : osaAt(osa, d, i);
    // Present follows from OSA against a range that does not move month to month.
    return missing(name, brand, ranged, Math.round((ranged * scaled) / 100), scaled, sp);
  });
}

const MISSING_ACCESSORS: Accessors<MissingRow> = {
  SKU: (row) => row.name,
  Brand: (row) => row.brand,
};

export type MslGap = { name: string; brand: string; stores: number };

const CURRENT_MSL_GAP: MslGap[] = [
  { name: "COL Optic White Plus Shine 100G", brand: "Optic White", stores: 576 },
  { name: "COL Max Fresh Blue Gel 140G", brand: "Max Fresh", stores: 184 },
  { name: "COL Vitamin C Fresh 120G", brand: "Vitamin C", stores: 135 },
  { name: "COL Salt Original 200G", brand: "Salt", stores: 170 },
];

/** A gap is the absence of availability, so it widens as the board falls. */
function buildMslGap(i: number): MslGap[] {
  if (i === LAST) return CURRENT_MSL_GAP;
  return CURRENT_MSL_GAP.map((gap) => ({
    ...gap,
    stores: Math.round(gap.stores / availLevel(i)),
  }));
}

const MSL_ACCESSORS: Accessors<MslGap> = {
  SKU: (gap) => gap.name,
  Brand: (gap) => gap.brand,
};

/* ---------------------------------------------------------------- */
/* field supervisor                                                 */
/* ---------------------------------------------------------------- */

export type FieldHero = {
  name: string;
  val: string;
  unit: string;
  sub: string;
  w: number;
  barColor: string;
};

const CURRENT_FIELD_HEROES: FieldHero[] = [
  {
    name: "On-Shelf Availability",
    val: "64",
    unit: "%",
    sub: "your cluster · today",
    w: 64,
    barColor: "var(--warning)",
  },
  {
    name: "Share of Shelf",
    val: "37",
    unit: "%",
    sub: "your cluster · today",
    w: 37,
    barColor: "var(--warning)",
  },
  {
    name: "Stores visited",
    val: "418",
    unit: "/540",
    sub: "planned this week",
    w: 77,
    barColor: "var(--indigo-500)",
  },
];

const FIELD_PLANNED = 540;

function buildFieldHeroes(i: number): FieldHero[] {
  if (i === LAST) return CURRENT_FIELD_HEROES;

  const osa = Math.round(64 * availLevel(i));
  const sos = Math.round(37 * visLevel(i));
  const visited = Math.round(418 * availLevel(i));
  const vals = [osa, sos, visited];
  const widths = [osa, sos, Math.round((visited / FIELD_PLANNED) * 100)];

  return CURRENT_FIELD_HEROES.map((hero, n) => ({
    ...hero,
    val: String(vals[n]),
    w: widths[n],
  }));
}

export const FIELD_STORE_CAPTION =
  "3742 · Winlife HCM 94/54 - 56 — what's ranged vs what's facing out";

export type MslItem = {
  name: string;
  found: boolean;
  icon: IconName;
  tag: string;
};

const MSL_SOURCE: [name: string, ok: boolean][] = [
  ["COL Optic White Plus Shine 100G", false],
  ["COL Max Fresh Blue Gel 140G", false],
  ["COL TP CDC 225G x 36", true],
  ["COL Total Charcoal Deep Clean 150G", true],
  ["COL Natural Salt Herbal 180G", true],
  ["COL Salt Original 200G", true],
];

export const STORE_MSL: MslItem[] = MSL_SOURCE.map(([name, ok]) => ({
  name,
  found: ok,
  icon: ok ? ("check" as IconName) : ("x" as IconName),
  tag: ok ? "Found" : "Absent",
}));

export const FIELD_RIBBON: RibbonSegment[] = [
  { label: "CDC", w: "14", bg: "#4F46E5", fg: "#fff", short: "CDC" },
  { label: "Colgate Total", w: "11", bg: "#6366F1", fg: "#fff", short: "Total" },
  { label: "Max Fresh", w: "7", bg: "#A5B4FC", fg: "var(--indigo-900)", short: "MF" },
  { label: "P/S", w: "34", bg: HATCH, fg: "var(--text-secondary)", short: "P/S" },
  { label: "Closeup", w: "22", bg: HATCH, fg: "var(--text-secondary)", short: "Closeup" },
  { label: "Others", w: "12", bg: HATCH, fg: "var(--text-secondary)", short: "" },
];

export type FixItem = { store: string; issue: string; skus: number };

export const FIX_LIST: FixItem[] = [
  {
    store: "3742 · Winlife HCM 94/54 - 56",
    issue: "2 must-haves absent (Optic White, Max Fresh)",
    skus: 2,
  },
  {
    store: "14830 · BHX_HCM_TPH - 187 Tân",
    issue: "Optic White out of stock",
    skus: 1,
  },
  {
    store: "MM Mega Market An Phú",
    issue: "Low share vs P/S on hero shelf",
    skus: 5,
  },
  {
    store: "3207 · BHX HCM Q07 - 769A Trần",
    issue: "Slanted captures — re-shoot",
    skus: 3,
  },
  { store: "Emart Gò Vấp", issue: "Coverage overdue 8 days", skus: 0 },
];

/* ---------------------------------------------------------------- */
/* the per-period view                                              */
/* ---------------------------------------------------------------- */

export type AnalyticsView = {
  period: MonthKey;
  monthLabel: string;
  /** Also drives the header pill, so the two can never disagree. */
  coverage: number;
  bandA: string[];
  fieldBandA: string[];
  /** Only the top six of a dimension ever render, however long the table is. */
  ranked: Record<DimKey, RankRow[]>;
  /** The scatter plots the whole dimension, not just the six ranked rows. */
  scatter: Record<DimKey, ScatterPoint[]>;
  heroes: Hero[];
  ownComp: OwnComp;
  dumbbell: Dumbbell[];
  line: LineView;
  regionalHeroes: RegionalHero[];
  heatRows: HeatRow[];
  covScatter: ScatterPoint[];
  league: LeagueRow[];
  categoryOsa: CategoryOsa;
  categorySos: CategorySos;
  summaryRibbon: RibbonSegment[];
  ribbonCollapsed: RibbonSegment[];
  ribbonBrokenOut: RibbonSegment[];
  whoShelf: ShelfShare[];
  whatsMissing: MissingRow[];
  mslGap: MslGap[];
  fieldHeroes: FieldHero[];
};

/**
 * Filters reach only the tables whose rows genuinely carry the column: the
 * named dimension's own ranked list and scatter, the league table's retailer,
 * type and store, the SKU and brand names in the two category tables, and the
 * band A counts via the store column.
 *
 * The hero cards, the dumbbell, the six-month line, the city × retailer heatmap
 * and every ribbon deliberately do not respond. There is no cross-dimensional
 * fact table behind these fixtures — nothing says how much of Hypermarket's
 * share of shelf belongs to P/S — and inventing one would put figures on screen
 * that no one authored.
 */
export function buildView(period: MonthKey, filters: ActiveFilter[]): AnalyticsView {
  const i = MONTH_INDEX[period];

  const dims = buildDims(i);
  const shown = narrowDims(dims, filters);
  const fraction = storeFraction(dims, filters);
  const categorySos = buildCategorySos(i);
  const ownScale = visLevel(i);

  return {
    period,
    monthLabel: MONTH_BY_KEY[period].label,
    coverage: Math.round(CURRENT_BAND_A.coverage * availLevel(i)),
    bandA: bandA(i, fraction),
    fieldBandA: fieldBandA(i, fraction),
    ranked: Object.fromEntries(
      DIM_KEYS.map((k) => [k, shown[k].slice(0, 6)]),
    ) as Record<DimKey, RankRow[]>,
    scatter: Object.fromEntries(
      DIM_KEYS.map((k) => [
        k,
        shown[k].map((r) => ({ cx: scX(r.sos), cy: scY(parseFloat(r.osa)) })),
      ]),
    ) as Record<DimKey, ScatterPoint[]>,
    heroes: buildHeroes(i),
    ownComp: buildOwnComp(i),
    dumbbell: buildDumbbell(i),
    line: buildLine(i),
    regionalHeroes: buildRegionalHeroes(i),
    heatRows: buildHeatRows(i),
    covScatter: buildCovScatter(i),
    league: narrow(buildLeague(i), filters, LEAGUE_ACCESSORS),
    categoryOsa: buildCategoryOsa(i),
    categorySos,
    summaryRibbon: summaryRibbon(categorySos),
    ribbonCollapsed: i === LAST ? CURRENT_RIBBON_COLLAPSED : ribbon(false, ownScale),
    ribbonBrokenOut: i === LAST ? CURRENT_RIBBON_BROKEN_OUT : ribbon(true, ownScale),
    whoShelf: i === LAST ? CURRENT_WHO_SHELF : whoShelf(ownScale),
    whatsMissing: narrow(buildWhatsMissing(i), filters, MISSING_ACCESSORS),
    mslGap: narrow(buildMslGap(i), filters, MSL_ACCESSORS),
    fieldHeroes: buildFieldHeroes(i),
  };
}

/**
 * Every month's unfiltered view, built once at module scope. The first client
 * render reads straight out of here, so it matches the prerendered HTML; only a
 * user event ever pays for a `buildView` call.
 */
export const PRECOMPUTED: Record<MonthKey, AnalyticsView> = Object.fromEntries(
  MONTH_KEYS.map((key) => [key, buildView(key, [])]),
) as Record<MonthKey, AnalyticsView>;

/* ---------------------------------------------------------------- */
/* export                                                           */
/* ---------------------------------------------------------------- */

const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-");

/** The ranked list the persona is actually looking at, column for column. */
export function rankedCsv(dim: DimKey, rows: RankRow[]): CsvTable {
  return {
    headers: [dim, "OSA %", "Change vs previous month", "Stores", "SOS %"],
    rows: rows.map((r) => [r.name, r.osa, r.delta, r.stores, r.sos]),
  };
}

/** Category has no ranked list on screen; its SKU table is what it reads. */
export function missingCsv(rows: MissingRow[]): CsvTable {
  return {
    headers: ["SKU", "Brand", "Ranged", "Present", "Absent", "OSA %"],
    rows: rows.map((r) => [r.name, r.brand, r.ranged, r.present, r.absent, r.osa]),
  };
}

export function exportFilename(
  persona: Persona,
  dim: DimKey,
  period: MonthKey,
): string {
  const what = persona === "category" ? "whats-missing" : slug(dim);
  return `analytics-${persona}-${what}-${period}`;
}
