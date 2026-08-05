import { MONTH_KEYS, type MonthKey } from "@/app/_time/periods";

/**
 * The shared spine every Analytics module derives from.
 *
 * These were already the spine inside `analytics.ts`; they just were not named
 * as one. Nine module data files now lean on the same six-month history, the
 * same dimension catalogue and the same formatting, so they live here rather
 * than being re-authored — a second copy of `AVAIL_SERIES` would be a second
 * version of the truth.
 *
 * Everything in this file was moved verbatim. The bodies are unchanged; only
 * the `export` keywords are new.
 */

/** The design writes deltas with U+2212 MINUS SIGN, not a hyphen. */
export const MINUS = "−";

export function signed(v: number): string {
  return (v >= 0 ? "+" : MINUS) + Math.abs(v).toFixed(1);
}

export const round1 = (v: number) => +v.toFixed(1);

/** `42` prints as "42", `48.8` as "48.8" — the design's own loose formatting. */
export const trim1 = (v: number) => String(round1(v));
/* ---------------------------------------------------------------- */
/* the six-month national spine                                      */
/* ---------------------------------------------------------------- */

/**
 * Availability and visibility, February through July. These two arrays are the
 * whole reason the month picker offers exactly Feb–Jul: they are the only
 * monthly history the design authors, and every derived month leans on them.
 */
export const AVAIL_SERIES = [58, 59, 60, 61, 62, 63.8];
export const VIS_SERIES = [45, 43, 42, 41, 40, 38.7];

/** Index of the authored month inside both series and inside `MONTH_KEYS`. */
export const LAST = AVAIL_SERIES.length - 1;

export const MONTH_INDEX = Object.fromEntries(
  MONTH_KEYS.map((key, i) => [key, i]),
) as Record<MonthKey, number>;

/**
 * One month further back than the series author. Continuing the spine's own
 * first step is the only way to give February a delta of its own without
 * inventing a seventh figure for each series.
 */
export const before = (series: number[]) => series[0] - (series[1] - series[0]);

export const availAt = (i: number) => (i < 0 ? before(AVAIL_SERIES) : AVAIL_SERIES[i]);
export const visAt = (i: number) => (i < 0 ? before(VIS_SERIES) : VIS_SERIES[i]);

/** How much lower the whole board sat in month `i`, measured against July. */
export const availLevel = (i: number) => availAt(i) / AVAIL_SERIES[LAST];
export const visLevel = (i: number) => visAt(i) / VIS_SERIES[LAST];

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
export const priorLevel = (i: number) => availAt(i) / AVAIL_SERIES[LAST - 1];
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
export type DimFacts = [name: string, osa: number, d: number, stores: number, sos: number];

export const DIM_SOURCE: Record<DimKey, DimFacts[]> = {
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


/* ---------------------------------------------------------------- */
/* the estate                                                       */
/* ---------------------------------------------------------------- */

/**
 * The published size of the account, and the single source for it.
 *
 * `merch-activity/_data` authored `audited: 1412` and `estate: 1847`
 * independently of Analytics' band A; both now read from here, so a new
 * module cannot quietly disagree with a figure the platform already shows.
 * Every derived measure has to reconcile against these: coverage is
 * 1,412/1,847, and any new per-region store count has to sum to 1,412.
 */
export const ESTATE = {
  /** Stores audited this month. */
  stores: 1412,
  /** Stores in the account overall. */
  estate: 1847,
  /** Percent of the estate audited — 1412/1847 rounded. */
  coverage: 76,
  sessions: 12847,
  photos: 41320,
  /** Merchandisers on the account. */
  team: 148,
  activeToday: 142,
} as const;

/* ---------------------------------------------------------------- */
/* the new measure spines                                           */
/* ---------------------------------------------------------------- */

/**
 * Six-month histories for the measures PowerBI reports that the original
 * fixtures never carried. Authored the same way as `AVAIL_SERIES`: six figures,
 * July last, and every earlier month derived from them rather than authored
 * again.
 *
 * July is anchored so the Perfect Store score reconciles. PowerBI computes that
 * score as the unweighted mean of its four components, so with SOS 38.7 and OSA
 * 63.8 already published, pricing and planogram are what the score is made of:
 * (38.7 + 63.8 + 41.2 + 57.5) / 4 = 50.3.
 */
export const PRICING_SERIES = [33.4, 34.1, 35.6, 37.2, 39.4, 41.2];
export const PLANOGRAM_SERIES = [47.9, 49.6, 51.8, 53.9, 55.8, 57.5];

/** Perfect Store score — derived, never authored. */
export const PERFECT_SERIES = AVAIL_SERIES.map((osa, i) =>
  +((osa + VIS_SERIES[i] + PRICING_SERIES[i] + PLANOGRAM_SERIES[i]) / 4).toFixed(1),
);

const pricingAt = (i: number) =>
  i < 0 ? before(PRICING_SERIES) : PRICING_SERIES[i];
const planogramAt = (i: number) =>
  i < 0 ? before(PLANOGRAM_SERIES) : PLANOGRAM_SERIES[i];

export const pricingLevel = (i: number) => pricingAt(i) / PRICING_SERIES[LAST];
export const planogramLevel = (i: number) =>
  planogramAt(i) / PLANOGRAM_SERIES[LAST];
