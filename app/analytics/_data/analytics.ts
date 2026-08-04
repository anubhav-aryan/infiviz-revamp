import type { IconName } from "@/app/_components/icon";

/**
 * Demo content for the Analytics screen, transcribed verbatim from the design
 * doc. There is no backend yet — every figure here is fixture data for
 * Colgate-Palmolive Vietnam, July 2026.
 *
 * Everything the design computes in `renderVals()` is computed here at module
 * scope instead of at render time, so the server and the client emit the same
 * markup and nothing depends on a formatter running twice.
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

/* ---------------------------------------------------------------- */
/* shell                                                            */
/* ---------------------------------------------------------------- */

export const PERSONAS: { key: Persona; label: string }[] = [
  { key: "exec", label: "Executive" },
  { key: "regional", label: "Regional" },
  { key: "category", label: "Category" },
  { key: "field", label: "Field" },
];

/** The last crumb is the one you are scoped to, so it stops being a link. */
export const SCOPE: { label: string; current: boolean }[] = [
  { label: "National", current: false },
  { label: "South East", current: false },
  { label: "Ho Chi Minh City", current: true },
];

export const ACTIVE_FILTERS = ["Store type: Hypermarket"];

export const BAND_A = [
  "1,412 stores audited",
  "76% coverage",
  "12,847 sessions",
  "41,320 photos",
  "synced 12 min ago",
];

export const FIELD_BAND_A = [
  "142 active today",
  "6.4 avg visits / merchandiser",
  "76% coverage this week",
  "synced 12 min ago",
];

/* ---------------------------------------------------------------- */
/* dimensions — shared by every persona's band C                    */
/* ---------------------------------------------------------------- */

export type RankRow = {
  name: string;
  /** One-decimal display string. */
  osa: string;
  /** Bar width, in percent. The design plots OSA directly on a 0–100 track. */
  w: number;
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
    stores,
    sos,
    delta: signed(d),
    tone: d >= 0 ? "up" : "down",
  };
}

export const DIM = {
  Region: [
    rankRow("Ho Chi Minh City", 71.2, 2.1, 412, 42),
    rankRow("South East", 66.4, 1.3, 380, 40),
    rankRow("Mekong Delta", 62.1, 0.4, 300, 38),
    rankRow("Red River Delta", 59.8, -0.6, 210, 36),
    rankRow("Central", 56.3, -1.2, 190, 35),
    rankRow("North Highlands", 52.4, -2.1, 90, 31),
  ],
  Retailer: [
    rankRow("Bach Hoa Xanh", 68.1, 1.8, 720, 40),
    rankRow("Winmart", 62.3, 0.9, 300, 39),
    rankRow("Co.opmart", 60.1, 0.2, 214, 38),
    rankRow("Aeon", 58.4, 1.1, 78, 41),
    rankRow("Lotte", 55.2, -0.8, 60, 37),
    rankRow("Emart", 53.6, -1.4, 44, 36),
    rankRow("MM Mega Market", 51.0, -1.9, 35, 34),
  ],
  "Store type": [
    rankRow("Hypermarket", 70.2, 2.4, 141, 43),
    rankRow("Supermarket", 65.1, 1.0, 372, 40),
    rankRow("Mini mart", 61.3, 0.6, 1290, 38),
    rankRow("Convenience", 54.0, -1.1, 44, 33),
  ],
  Category: [
    rankRow("Toothpaste", 65.1, 1.2, 78, 40),
    rankRow("Toothbrush", 61.0, 0.5, 43, 36),
  ],
  Brand: [
    rankRow("Colgate Total", 74.0, 2.0, 610, 11),
    rankRow("CDC", 71.2, 1.5, 590, 11),
    rankRow("Max Fresh", 68.0, 1.1, 540, 6),
    rankRow("Natural", 63.0, 0.3, 470, 4),
    rankRow("Salt", 60.0, -0.2, 410, 4),
    rankRow("Kid", 58.0, -0.4, 360, 3),
    rankRow("Vitamin C", 55.0, -1.0, 300, 3),
    rankRow("Optic White", 8.6, -6.4, 630, 2),
  ],
  City: [
    rankRow("Quận 1", 72.1, 1.8, 64, 43),
    rankRow("Quận 7", 69.4, 1.2, 58, 41),
    rankRow("Bình Thạnh", 66.2, 0.6, 72, 39),
    rankRow("Thủ Đức", 63.0, -0.4, 80, 37),
    rankRow("Gò Vấp", 60.1, -0.9, 55, 36),
    rankRow("Tân Phú", 57.3, -1.6, 48, 34),
  ],
  Store: [
    rankRow("3742 Winlife 94/54", 74.0, 2.0, 1, 44),
    rankRow("3207 BHX Q07", 66.0, 0.8, 1, 40),
    rankRow("Co.opmart NĐC", 61.0, 0.2, 1, 38),
    rankRow("Aeon Tân Phú", 58.0, 1.0, 1, 41),
    rankRow("14830 BHX 187 Tân", 52.0, -1.2, 1, 35),
    rankRow("MM An Phú", 49.0, -2.0, 1, 33),
  ],
  Merchandiser: [
    rankRow("quan_do", 72.0, 1.6, 44, 41),
    rankRow("linh_pham", 68.0, 1.1, 38, 40),
    rankRow("khang_nguyen", 65.0, 0.7, 42, 39),
    rankRow("mai_bui", 61.0, 0.3, 36, 37),
    rankRow("huy_le", 56.0, -1.0, 40, 35),
    rankRow("nam_hoang", 51.0, -2.1, 29, 32),
  ],
  "Sub-category": [
    rankRow("Cavity protection", 70.0, 1.4, 40, 42),
    rankRow("Whitening", 62.0, 0.5, 28, 38),
    rankRow("Herbal", 58.0, -0.3, 18, 36),
    rankRow("Kids", 54.0, -1.1, 14, 34),
  ],
  SKU: [
    rankRow("COL TP CDC 225G", 78.0, 1.9, 1, 44),
    rankRow("COL Total Charcoal 150G", 71.0, 1.0, 1, 40),
    rankRow("COL Max Fresh 140G", 66.0, 0.6, 1, 39),
    rankRow("COL Natural Salt 180G", 60.0, -0.4, 1, 37),
    rankRow("COL Salt Original 200G", 54.0, -1.2, 1, 35),
    rankRow("COL Optic White 100G", 8.6, -6.4, 1, 30),
  ],
} satisfies Record<string, RankRow[]>;

export type DimKey = keyof typeof DIM;

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

/** Only the top six of a dimension ever render, however long the table is. */
export const RANK_ROWS: Record<DimKey, RankRow[]> = Object.fromEntries(
  (Object.keys(DIM) as DimKey[]).map((k) => [k, DIM[k].slice(0, 6)]),
) as Record<DimKey, RankRow[]>;

/**
 * The dashed 85% target line is absolutely positioned against the ranked-list
 * grid. The design hardcodes this `calc()` against the 140px/1fr/74px template
 * rather than deriving it, and it is off by the gutter — carried over verbatim
 * so the line lands where the design puts it.
 */
export const RANK_TARGET_LINE = "calc(140px + (100% - 214px) * 0.85)";

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
  spark: string;
  sub1k: string;
  sub1v: string;
  sub2k: string;
  sub2v: string;
  /** The Share-of-Shelf card swaps its second stat for a mini own/comp bar. */
  sub2Kind: "plain" | "ownComp";
};

export const HEROES: Hero[] = [
  {
    name: "On-Shelf Availability",
    val: "63.8",
    target: 85,
    delta: "2.6",
    deltaIcon: "arrow-up-right",
    tone: "up",
    deltaLabel: "vs previous month",
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
    deltaLabel: "vs previous month",
    spark: "0,7 20,9 40,12 60,15 80,20 100,23",
    sub1k: "Linear share",
    sub1v: "38.8%",
    sub2k: "Own vs competition",
    sub2v: "",
    sub2Kind: "ownComp",
  },
];

/** The own/competition split inside the Share-of-Shelf card. */
export const OWN_COMP = { own: 38.3, comp: 61.7, label: "38.3 / 61.7" };

/* --- OSA vs Share of Shelf scatter --- */

export type ScatterPoint = { cx: string; cy: string };

const SC_X0 = 36;
const SC_X1 = 286;
const SC_Y0 = 14;
const SC_Y1 = 180;

/** SOS runs 0–50 across the plot, OSA runs 0–90 up it. */
const scX = (sos: number) => (SC_X0 + (sos / 50) * (SC_X1 - SC_X0)).toFixed(1);
const scY = (osa: number) => (SC_Y1 - (osa / 90) * (SC_Y1 - SC_Y0)).toFixed(1);

/** The scatter plots the whole dimension, not just the six ranked rows. */
export const SCATTER_BY_DIM: Record<DimKey, ScatterPoint[]> = Object.fromEntries(
  (Object.keys(DIM) as DimKey[]).map((k) => [
    k,
    DIM[k].map((r) => ({ cx: scX(r.sos), cy: scY(parseFloat(r.osa)) })),
  ]),
) as Record<DimKey, ScatterPoint[]>;

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

export const DUMBBELL: Dumbbell[] = [
  dumbbell("Aeon", 58, 62),
  dumbbell("Ho Chi Minh City", 68, 71.2),
  dumbbell("Hypermarket", 67, 70.2),
  dumbbell("Must-have OSA", 70, 72.5),
  dumbbell("Bach Hoa Xanh", 66, 68),
  dumbbell("Optic White", 15, 8.6),
  dumbbell("North Highlands", 55, 52.4),
  dumbbell("Share of Shelf", 41, 38.7),
  dumbbell("Red River Delta", 62, 59.8),
  dumbbell("Central", 58, 56.3),
];

/* --- six-month dual line --- */

const L_X0 = 30;
const L_X1 = 352;
const L_Y0 = 12;
const L_Y1 = 178;

const lineX = (i: number) => (L_X0 + i * ((L_X1 - L_X0) / 5)).toFixed(1);
const lineY = (v: number) => (L_Y1 - (v / 100) * (L_Y1 - L_Y0)).toFixed(1);

const AVAIL_SERIES = [58, 59, 60, 61, 62, 63.8];
const VIS_SERIES = [45, 43, 42, 41, 40, 38.7];

export const LINE = {
  grid: [0, 50, 100].map((v) => ({ y: lineY(v), v })),
  t85: lineY(85),
  t45: lineY(45),
  avail: AVAIL_SERIES.map((v, i) => `${lineX(i)},${lineY(v)}`).join(" "),
  vis: VIS_SERIES.map((v, i) => `${lineX(i)},${lineY(v)}`).join(" "),
  xl: ["Feb", "Mar", "Apr", "May", "Jun", "Jul"].map((label, i) => ({
    label,
    x: lineX(i),
  })),
};

export type Insight = { icon: IconName; text: string; link: string };

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

export const REGIONAL_HEROES: RegionalHero[] = [
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

export const HEAT_ROWS = HEAT_SOURCE.map(([name, vals]) => ({
  name,
  cells: vals.map((v) => ({
    v,
    color: heatColor(v),
    fg: heatFg(v),
    title: `${name} · ${v}% OSA`,
  })),
}));

/* --- audit coverage vs availability scatter --- */

const covX = (c: number) => (36 + (c / 100) * 250).toFixed(1);
const covY = (o: number) => (180 - (o / 90) * 166).toFixed(1);

export const COV_SCATTER: ScatterPoint[] = (
  [
    [84, 72],
    [79, 69],
    [76, 66],
    [71, 63],
    [66, 60],
    [58, 57],
  ] as [number, number][]
).map(([c, o]) => ({ cx: covX(c), cy: covY(o) }));

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

export const LEAGUE: LeagueRow[] = LEAGUE_SOURCE.map(
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

/* ---------------------------------------------------------------- */
/* category lead                                                    */
/* ---------------------------------------------------------------- */

/** Competitor blocks are hatched rather than coloured — kept as authored. */
export const HATCH =
  "repeating-linear-gradient(45deg,#e2e8f0 0 6px,#cbd5e1 6px 12px)";

export const CATEGORY_OSA = {
  name: "On-Shelf Availability · Toothpaste",
  val: "65.1",
  delta: "1.2",
  deltaIcon: "arrow-up-right" as IconName,
  tone: "up" as DeltaTone,
  target: 85,
};

export const CATEGORY_SOS = {
  name: "Share of Shelf · Toothpaste",
  val: "38.9",
  delta: "2.1",
  deltaIcon: "arrow-down-right" as IconName,
  tone: "down" as DeltaTone,
  own: 38.9,
  comp: 61.1,
};

/** Band B's ribbon is the whole category collapsed to us-versus-everyone. */
export const CATEGORY_SUMMARY_RIBBON: RibbonSegment[] = [
  {
    label: "Colgate",
    w: "38.9",
    bg: "var(--indigo-600)",
    fg: "#fff",
    short: "Colgate 38.9%",
  },
  {
    label: "Competitors",
    w: "61.1",
    bg: HATCH,
    fg: "var(--text-secondary)",
    short: "Competitors 61.1%",
  },
];

export type RibbonSegment = {
  label: string;
  w: string;
  bg: string;
  fg: string;
  /** Blank when the block is too narrow to hold its own label. */
  short: string;
};

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

function ribbon(breakout: boolean): RibbonSegment[] {
  return [
    ...OWN_SEGMENTS.map(([label, w, bg, fg]) => ({
      label,
      w: w.toFixed(1),
      bg,
      fg,
      short: w > 5 ? label.split(" ")[0] : "",
    })),
    ...(breakout ? COMP_BROKEN_OUT : COMP_COLLAPSED).map(([label, w]) => ({
      label,
      w: w.toFixed(1),
      bg: HATCH,
      fg: "var(--text-secondary)",
      short: w > 8 ? label : "",
    })),
  ];
}

export const RIBBON_COLLAPSED = ribbon(false);
export const RIBBON_BROKEN_OUT = ribbon(true);

export type ShelfShare = {
  name: string;
  share: string;
  w: number;
  dot: string;
  delta: string;
  tone: DeltaTone;
};

/** Bars scale against the biggest shelf holder (P/S at 23.5), not the total. */
const SHELF_MAX = 23.5;

function shelfShare(
  name: string,
  own: boolean,
  share: number,
  d: number,
): ShelfShare {
  return {
    name,
    share: share.toFixed(1),
    w: +((share / SHELF_MAX) * 100).toFixed(1),
    dot: own ? "var(--indigo-600)" : "var(--neutral-400)",
    delta: signed(d),
    // A rival gaining shelf is not "good news" to colour green, so competitor
    // rows keep the arrow's sign but drop the tone entirely.
    tone: own ? (d >= 0 ? "up" : "down") : "neutral",
  };
}

export const WHO_SHELF: ShelfShare[] = [
  shelfShare("P/S", false, 23.5, 2.1),
  shelfShare("Closeup", false, 16.3, 0.4),
  shelfShare("CDC", true, 11.2, -0.6),
  shelfShare("Sensodyne", false, 10.2, 0.8),
  shelfShare("Colgate Total", true, 9.1, -0.3),
  shelfShare("Oral-B", false, 8.3, 0.5),
  shelfShare("Natural", true, 7.0, -0.2),
  shelfShare("Max Fresh", true, 5.9, -0.4),
];

export type OsaTier = "good" | "warn" | "bad";

export type MissingRow = {
  name: string;
  ranged: number;
  present: number;
  absent: number;
  osa: string;
  tier: OsaTier;
  spark: string;
};

const osaTier = (v: number): OsaTier =>
  v >= 70 ? "good" : v >= 40 ? "warn" : "bad";

function missing(
  name: string,
  ranged: number,
  present: number,
  osa: number,
  sp: number[],
): MissingRow {
  return {
    name,
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

export const WHATS_MISSING: MissingRow[] = [
  missing("COL Optic White 100G", 630, 54, 8.6, [15, 13, 11, 10, 9]),
  missing("COL Max Fresh 140G", 540, 356, 65.9, [60, 62, 63, 65, 66]),
  missing("COL Salt Original 200G", 410, 240, 58.5, [62, 61, 60, 59, 58]),
  missing("COL Natural Salt 180G", 470, 296, 63.0, [60, 61, 62, 62, 63]),
  missing("COL Vitamin C 120G", 300, 165, 55.0, [59, 58, 57, 56, 55]),
  missing("COL TP CDC 225G", 590, 472, 80.0, [76, 77, 78, 79, 80]),
];

export type MslGap = { name: string; brand: string; stores: number };

export const MSL_GAP: MslGap[] = [
  { name: "COL Optic White Plus Shine 100G", brand: "Optic White", stores: 576 },
  { name: "COL Max Fresh Blue Gel 140G", brand: "Max Fresh", stores: 184 },
  { name: "COL Vitamin C Fresh 120G", brand: "Vitamin C", stores: 135 },
  { name: "COL Salt Original 200G", brand: "Salt", stores: 170 },
];

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

export const FIELD_HEROES: FieldHero[] = [
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
