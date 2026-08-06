import type { IconName } from "@/app/_components/icon";
import {
  type ActiveFilter,
  type FilterDimension,
  applyFilters,
} from "@/app/_filters/model";
import { clockFromMinutes, group } from "@/app/_format/num";
import { type Shift, lcg, shiftCount, shiftFor } from "@/app/_time/variants";
import {
  type Period,
  type PresetKey,
  WEEK_ACTIVE_DAYS,
  activeDays,
  periodLabel,
  periodPhrase,
  serializePeriod,
} from "./period";
import { STORES, storeById, type GeoStore } from "@/app/_data/stores-geo";

/**
 * Demo content for the Store Explorer screen. There is no backend yet — every
 * figure here is fixture data for Colgate-Palmolive Vietnam, 04 Aug 2026.
 *
 * The designer's Today figures are the authoritative ones and are stored
 * untouched in `CURRENT_FACTS`. Every other period is derived *from* them by a
 * recipe, and `FACTS.today` is that same object by reference — a spread would
 * make it possible for a later edit to drift the authored numbers without
 * anyone noticing.
 */

/* ---------- filterable dimensions ---------- */

/**
 * The dimension keys are the words the chips show, because `filterLabel`
 * renders `dim: value` and the design's chips read "Region: Ho Chi Minh City".
 */
export const DIM_RETAILER = "Retailer";
export const DIM_REGION = "Region";
export const DIM_TYPE = "Store type";

export type FacetRow = { name: string; visits: number };

/* ---------- visits ---------- */

export type VisitStatus = "Complete" | "Processing" | "Queued";

export type Visit = {
  store: string;
  retailer: string;
  region: string;
  type: string;
  time: string;
  merchandiser: string;
  photos: number;
  categories: string;
  status: VisitStatus;
};

/**
 * The eight rows the design drew: a sample of the day's 418 visits, not the
 * whole list, which is why the row count never matches the headline figure.
 *
 * Region and store type are authored per row to match the store name. Six of
 * the eight name an HCMC district outright; the two that don't — a Winlife with
 * no city token and MM Mega Market An Phú, which trades in Bình Dương — sit in
 * the South East.
 *
 * Exported because Session Viewer keys its per-store sessions off these rows.
 */
/**
 * Visit facts only. Store identity — name, retailer, region, type — comes from
 * `STORES`, so a store is described one way across the whole app and the map
 * cannot disagree with the list beside it.
 *
 * These eight `storeId`s resolve to the names that `/session-viewer/[store]`
 * prerenders, via `slugifyStore`, with `dynamicParams = false`. Repointing one
 * at a different store changes a live URL.
 */
const VISIT_SEED: (Omit<Visit, "store" | "retailer" | "region" | "type"> & {
  storeId: string;
})[] = [
  { storeId: "VNC0304137", time: "09:31", merchandiser: "minh_tran", photos: 7, categories: "Toothpaste, Toothbrush", status: "Complete" },
  { storeId: "VNC0304274", time: "09:48", merchandiser: "khang_nguyen", photos: 5, categories: "Toothpaste", status: "Complete" },
  { storeId: "VNC0304411", time: "10:05", merchandiser: "khang_nguyen", photos: 4, categories: "Multi-category", status: "Processing" },
  { storeId: "VNC0304548", time: "10:22", merchandiser: "thao_vo", photos: 8, categories: "Toothpaste, Toothbrush", status: "Complete" },
  { storeId: "VNC0304685", time: "10:40", merchandiser: "huy_le", photos: 6, categories: "Multi-category", status: "Complete" },
  { storeId: "VNC0304822", time: "11:02", merchandiser: "quan_do", photos: 3, categories: "Toothbrush", status: "Queued" },
  { storeId: "VNC0304959", time: "11:15", merchandiser: "minh_tran", photos: 5, categories: "Toothpaste", status: "Complete" },
  { storeId: "VNC0305096", time: "11:40", merchandiser: "mai_bui", photos: 9, categories: "Multi-category", status: "Complete" },
];

export const VISITS: Visit[] = VISIT_SEED.map(({ storeId, ...facts }) => {
  const store = storeById(storeId);
  return {
    store: store.name,
    retailer: store.retailer,
    region: store.region,
    type: store.type,
    ...facts,
  };
});

/* ---------- the authored day ---------- */

export type Facts = {
  label: string;
  phrase: string;
  visits: number;
  stores: number;
  photos: number;
  merchandisers: number;
  configured: number;
  awaiting: number;
  retailers: FacetRow[];
  regions: FacetRow[];
  storeTypes: FacetRow[];
  visitRows: Visit[];
};

/**
 * The designer's figures, verbatim.
 *
 * The three facet tables are marginals of the same 418 visits, and they agree:
 * the six named retailers account for 402, the remaining 16 are MM Mega Market
 * (the only wholesale row). Store type is the retailers rolled up by format —
 * 168 Bach Hoa Xanh plus Winmart's 63 Winlife minimarts make Minimart 231,
 * Winmart's other 29 plus Co.opmart's 61 make Supermarket 90, and Aeon, Lotte
 * and Emart make Hypermarket 81.
 */
const CURRENT_FACTS: Facts = {
  label: "today",
  phrase: "today",
  visits: 418,
  stores: 392,
  photos: 6204,
  merchandisers: 142,
  configured: 1847,
  awaiting: 76,
  retailers: [
    { name: "Bach Hoa Xanh", visits: 168 },
    { name: "Winmart", visits: 92 },
    { name: "Co.opmart", visits: 61 },
    { name: "Aeon", visits: 38 },
    { name: "Lotte", visits: 24 },
    { name: "Emart", visits: 19 },
  ],
  regions: [
    { name: "Ho Chi Minh City", visits: 186 },
    { name: "South East", visits: 74 },
    { name: "Mekong Delta", visits: 58 },
    { name: "Red River Delta", visits: 52 },
    { name: "Central", visits: 31 },
    { name: "North Highlands", visits: 17 },
  ],
  storeTypes: [
    { name: "Minimart", visits: 231 },
    { name: "Supermarket", visits: 90 },
    { name: "Hypermarket", visits: 81 },
    { name: "Wholesale", visits: 16 },
  ],
  visitRows: VISITS,
};

/** The share of visits the six named retailers account for: 402 of 418. */
const RETAILER_COVERAGE =
  CURRENT_FACTS.retailers.reduce((total, row) => total + row.visits, 0) /
  CURRENT_FACTS.visits;

/**
 * The one cross-tab the fixtures do carry: how each retailer's visits split by
 * format. It is where the Store type marginals above come from, and it is what
 * lets a Store type filter answer with the retailers that actually trade in
 * that format instead of scaling every bar by a blanket fraction.
 */
const TYPE_MIX: Record<string, Record<string, number>> = {
  "Bach Hoa Xanh": { Minimart: 168 },
  Winmart: { Minimart: 63, Supermarket: 29 },
  "Co.opmart": { Supermarket: 61 },
  Aeon: { Hypermarket: 38 },
  Lotte: { Hypermarket: 24 },
  Emart: { Hypermarket: 19 },
};

/** The format the retailers outside the authored six trade in: MM Mega Market. */
const TAIL_TYPE = "Wholesale";

/** The share of a retailer's visits that happened in one of `types`. */
function typeShare(retailer: string, types: string[]): number {
  const mix = TYPE_MIX[retailer];
  if (!mix) return 0;
  let kept = 0;
  let all = 0;
  for (const [name, visits] of Object.entries(mix)) {
    all += visits;
    if (types.includes(name)) kept += visits;
  }
  return all ? kept / all : 0;
}

/**
 * Store types for a derived period are rolled up from that period's retailer
 * table rather than scaled on their own, so the two tables cannot drift apart.
 */
function typeFacetFrom(retailers: FacetRow[], visits: number): FacetRow[] {
  const totals = new Map<string, number>();
  let named = 0;
  for (const row of retailers) {
    named += row.visits;
    for (const type of CURRENT_FACTS.storeTypes) {
      const share = typeShare(row.name, [type.name]);
      if (share > 0) totals.set(type.name, (totals.get(type.name) ?? 0) + row.visits * share);
    }
  }
  totals.set(TAIL_TYPE, (totals.get(TAIL_TYPE) ?? 0) + (visits - named));

  const rows = CURRENT_FACTS.storeTypes.map((type) => ({
    name: type.name,
    visits: Math.max(0, Math.round(totals.get(type.name) ?? 0)),
  }));
  // Rounding must not leave the table disagreeing with the headline count.
  let largest = 0;
  for (let i = 1; i < rows.length; i += 1) {
    if (rows[i].visits > rows[largest].visits) largest = i;
  }
  rows[largest].visits += visits - rows.reduce((total, row) => total + row.visits, 0);
  return rows;
}

export const CATALOGUE: FilterDimension[] = [
  {
    key: DIM_RETAILER,
    label: DIM_RETAILER,
    values: CURRENT_FACTS.retailers.map((row) => row.name),
  },
  {
    key: DIM_REGION,
    label: DIM_REGION,
    values: CURRENT_FACTS.regions.map((row) => row.name),
  },
  {
    key: DIM_TYPE,
    label: DIM_TYPE,
    values: CURRENT_FACTS.storeTypes.map((row) => row.name),
  },
];

/**
 * The design draws these two chips on load. Making them live would mean the
 * screen opens already filtered and the authored headline figures never appear,
 * so they are offered as the menu's first suggestions instead.
 */
export const SUGGESTED_FILTERS: ActiveFilter[] = [
  { dim: DIM_REGION, value: "Ho Chi Minh City" },
  { dim: DIM_RETAILER, value: "Bach Hoa Xanh" },
];

/* ---------- deriving the other periods ---------- */

type Recipe = {
  label: string;
  phrase: string;
  /** Weekday-equivalent days in the window; Today is 1. */
  days: number;
  /** Multiplier for how the field team was performing, 1 being today. */
  drift: number;
  spread: number;
  seed: number;
  /** A window that has fully played out: nothing left in the queue. */
  settled: boolean;
};

function toMinutes(time: string): number {
  return Number(time.slice(0, 2)) * 60 + Number(time.slice(3));
}

function jitter(rand: () => number, spread: number): number {
  return 1 + (rand() - 0.5) * 2 * spread;
}

/**
 * Scales a facet table to a new total, jittered per row. The residual from
 * rounding lands on the largest row, where it is proportionally smallest, so
 * the table still sums to the figure the KPI tiles quote.
 */
function distribute(
  rows: FacetRow[],
  target: number,
  rand: () => number,
  spread: number,
): FacetRow[] {
  const base = rows.reduce((total, row) => total + row.visits, 0);
  const scaled = rows.map((row) => ({
    name: row.name,
    visits: Math.max(0, Math.round((row.visits * target * jitter(rand, spread)) / base)),
  }));

  let largest = 0;
  for (let i = 1; i < scaled.length; i += 1) {
    if (scaled[i].visits > scaled[largest].visits) largest = i;
  }
  const residual = target - scaled.reduce((total, row) => total + row.visits, 0);
  scaled[largest].visits = Math.max(0, scaled[largest].visits + residual);
  return scaled;
}

function deriveVisits(rand: () => number, spread: number, settled: boolean): Visit[] {
  return VISITS.map((visit) => ({
    ...visit,
    // Times are rebuilt from minutes rather than nudged as strings, which keeps
    // the variant off wall-clock arithmetic entirely.
    time: clockFromMinutes(toMinutes(visit.time) + Math.round((rand() - 0.5) * 70)),
    photos: Math.max(1, Math.round(visit.photos * jitter(rand, spread + 0.25))),
    status: settled ? "Complete" : visit.status,
  }));
}

function deriveFacts(recipe: Recipe): Facts {
  const rand = lcg(recipe.seed);
  const volume: Shift = {
    scale: recipe.days * recipe.drift,
    bias: 0,
    spread: recipe.spread,
    seed: recipe.seed,
  };
  const quality: Shift = { ...volume, scale: recipe.drift };

  const visits = shiftCount(CURRENT_FACTS.visits, volume, rand);

  // Distinct stores saturate: a longer window keeps re-visiting stores it has
  // already counted, so coverage approaches the configured network instead of
  // growing with the visit count.
  const perDay = CURRENT_FACTS.stores / CURRENT_FACTS.configured;
  const reach = 1 - Math.pow(1 - perDay, recipe.days);
  const stores = shiftCount(
    Math.round(CURRENT_FACTS.configured * reach),
    quality,
    rand,
  );

  // Headcount is a roster, not a total: a longer window picks up merchandisers
  // who were off on any single day, but only a few of them.
  const roster: Shift = {
    ...quality,
    scale: recipe.drift * Math.min(1.3, 1 + 0.045 * (recipe.days - 1)),
  };

  const retailers = distribute(
    CURRENT_FACTS.retailers,
    Math.round(visits * RETAILER_COVERAGE),
    rand,
    recipe.spread,
  );

  return {
    label: recipe.label,
    phrase: recipe.phrase,
    visits,
    stores,
    photos: shiftCount(CURRENT_FACTS.photos, volume, rand),
    merchandisers: shiftCount(CURRENT_FACTS.merchandisers, roster, rand),
    // The configured network is the same store list whatever window you ask for.
    configured: CURRENT_FACTS.configured,
    // The backlog is a live queue rather than an accumulation, so a window that
    // has already played out has drained almost to nothing.
    awaiting: shiftCount(
      CURRENT_FACTS.awaiting,
      { ...quality, scale: recipe.settled ? 0.09 : recipe.drift },
      rand,
    ),
    retailers,
    regions: distribute(CURRENT_FACTS.regions, visits, rand, recipe.spread),
    storeTypes: typeFacetFrom(retailers, visits),
    visitRows: deriveVisits(rand, recipe.spread, recipe.settled),
  };
}

const CURRENT_PERIOD = "today" as const;

export const FACTS: Record<PresetKey, Facts> = {
  // By reference, never a spread: this *is* the designer's object.
  [CURRENT_PERIOD]: CURRENT_FACTS,
  yesterday: deriveFacts({
    label: "yesterday",
    phrase: "yesterday",
    days: 1,
    // Comparable to today but not identical — a shade quieter, fully processed.
    drift: 0.94,
    spread: 0.05,
    seed: 8140,
    settled: true,
  }),
  last7: deriveFacts({
    label: "last 7 days",
    phrase: "in the last 7 days",
    days: WEEK_ACTIVE_DAYS,
    drift: 0.985,
    spread: 0.04,
    seed: 8141,
    settled: false,
  }),
};

/**
 * How much weaker a window looks the further back it sits. Only the bias, the
 * spread and the seed are read: `shiftFor`'s compounding `scale` is about
 * month-on-month growth, and a custom range takes its volume from its own
 * length instead.
 */
const PER_MONTH_DRIFT = { scale: 1, bias: -2.4, spread: 0.05 };

function customRecipe(period: Extract<Period, { kind: "custom" }>): Recipe {
  // The range's end month decides how far back it sits.
  const shift = shiftFor(period.to.month, PER_MONTH_DRIFT, 5210);
  const days = activeDays(period.from, period.to);
  return {
    label: periodLabel(period),
    phrase: periodPhrase(period),
    days,
    drift: 1 + shift.bias / 100,
    // `shiftFor` gives the authored month no spread at all, but two different
    // days in it should still not report identical figures.
    spread: Math.max(shift.spread, 0.035),
    seed: shift.seed + Math.round(days * 7) + period.from.day,
    settled: true,
  };
}

/**
 * Custom ranges are unbounded in number, so they are built on demand and
 * memoised. Presets stay module-scope constants, which is what lets the first
 * client render match the prerendered HTML.
 */
const CUSTOM_FACTS = new Map<string, Facts>();

export function factsFor(period: Period): Facts {
  if (period.kind !== "custom") return FACTS[period.kind];
  const key = serializePeriod(period);
  const cached = CUSTOM_FACTS.get(key);
  if (cached) return cached;
  const built = deriveFacts(customRecipe(period));
  CUSTOM_FACTS.set(key, built);
  return built;
}

/* ---------- the view a period + filter set produces ---------- */

export type SummaryTile = { icon: IconName; value: string; label: string };
export type RetailerBar = {
  name: string;
  visits: number;
  pct: string;
  width: number;
};

export type View = {
  periodLabel: string;
  summary: SummaryTile[];
  storesVisited: { count: string; target: string; awaiting: string };
  storesVisitedLabel: string;
  retailerHeading: string;
  retailers: RetailerBar[];
  visitsLabel: string;
  visits: Visit[];
  pins: GeoStore[];
};

const VISIT_ACCESSORS = {
  [DIM_RETAILER]: (visit: Visit) => visit.retailer,
  [DIM_REGION]: (visit: Visit) => visit.region,
  [DIM_TYPE]: (visit: Visit) => visit.type,
};

const PIN_ACCESSORS = {
  // Stores now carry their own type, so this reads the field instead of
  // inferring the format from the banner.
  [DIM_RETAILER]: (store: GeoStore) => store.retailer,
  [DIM_REGION]: (store: GeoStore) => store.region,
  [DIM_TYPE]: (store: GeoStore) => store.type,
};

function facetFor(facts: Facts, dim: string): FacetRow[] {
  if (dim === DIM_RETAILER) return facts.retailers;
  if (dim === DIM_REGION) return facts.regions;
  return facts.storeTypes;
}

export function facetCount(facts: Facts, dim: string, value: string): number {
  return facetFor(facts, dim).find((row) => row.name === value)?.visits ?? 0;
}

/**
 * The whole screen for one period and one filter set.
 *
 * The fixtures are mostly marginals, so there are two paths. One filtered
 * dimension is answered exactly from its authored table — Bach Hoa Xanh is 168
 * visits, not a scaled 167. A combination has no authored answer, so it
 * multiplies the fractions that survived each dimension, and every other figure
 * on the screen is scaled by the share of visits left standing.
 */
export function build(facts: Facts, filters: ActiveFilter[]): View {
  const selected = new Map<string, string[]>();
  for (const filter of filters) {
    const values = selected.get(filter.dim);
    if (values) values.push(filter.value);
    else selected.set(filter.dim, [filter.value]);
  }

  const sums = new Map<string, number>();
  const fractions = new Map<string, number>();
  for (const [dim, values] of selected) {
    const sum = facetFor(facts, dim)
      .filter((row) => values.includes(row.name))
      .reduce((total, row) => total + row.visits, 0);
    sums.set(dim, sum);
    fractions.set(dim, facts.visits ? sum / facts.visits : 0);
  }

  const dims = [...selected.keys()];
  let visits = facts.visits;
  if (dims.length === 1) visits = sums.get(dims[0]) ?? 0;
  else if (dims.length > 1) {
    let combined = 1;
    for (const fraction of fractions.values()) combined *= fraction;
    visits = Math.round(facts.visits * combined);
  }

  const surviving = facts.visits ? visits / facts.visits : 0;

  // Everything outside the retailer table scales with the surviving share.
  // Headcount is the exception: one merchandiser covers several retailers, so
  // narrowing the question doesn't shed people proportionally.
  const stores = Math.round(facts.stores * surviving);
  const photos = Math.round(facts.photos * surviving);
  const merchandisers = Math.round(
    facts.merchandisers * Math.pow(surviving, 0.75),
  );

  // The retailer bars survive their own selection at their authored counts —
  // which is why a lone retailer filter leaves 168 / 92 / 61 … untouched. Store
  // type is answered from the cross-tab, so only formats a retailer actually
  // trades in contribute. Region has no cross-tab and scales the bars flat.
  let others = 1;
  for (const [dim, fraction] of fractions) {
    if (dim !== DIM_RETAILER && dim !== DIM_TYPE) others *= fraction;
  }
  const keepRetailers = selected.get(DIM_RETAILER);
  const keepTypes = selected.get(DIM_TYPE);
  const bars = facts.retailers
    .filter((row) => !keepRetailers || keepRetailers.includes(row.name))
    .map((row) => ({
      name: row.name,
      visits: Math.round(
        row.visits * others * (keepTypes ? typeShare(row.name, keepTypes) : 1),
      ),
    }))
    .filter((row) => row.visits > 0);

  const max = bars.reduce((peak, row) => Math.max(peak, row.visits), 0) || 1;
  const total = visits || 1;

  return {
    periodLabel: facts.label,
    summary: [
      { icon: "footprints", value: group(visits), label: `Visits ${facts.phrase}` },
      { icon: "store", value: group(stores), label: "Stores covered" },
      { icon: "image", value: group(photos), label: "Photos captured" },
      { icon: "users", value: group(merchandisers), label: "Merchandisers in field" },
    ],
    storesVisited: {
      count: group(stores),
      target: group(Math.round(facts.configured * surviving)),
      awaiting: group(Math.round(facts.awaiting * surviving)),
    },
    storesVisitedLabel: `Stores visited ${facts.phrase}`,
    retailerHeading: `Visits by retailer · ${facts.label}`,
    retailers: bars.map((row) => ({
      name: row.name,
      visits: row.visits,
      pct: ((row.visits / total) * 100).toFixed(1),
      width: +((row.visits / max) * 100).toFixed(1),
    })),
    visitsLabel: `${group(visits)} visits`,
    visits: applyFilters(facts.visitRows, filters, VISIT_ACCESSORS),
    pins: applyFilters(STORES, filters, PIN_ACCESSORS),
  };
}

/** The unfiltered view of each preset, built once at module scope. */
const PRECOMPUTED: Record<PresetKey, View> = {
  today: build(FACTS.today, []),
  yesterday: build(FACTS.yesterday, []),
  last7: build(FACTS.last7, []),
};

const CUSTOM_VIEWS = new Map<string, View>();

export function unfilteredView(period: Period): View {
  if (period.kind !== "custom") return PRECOMPUTED[period.kind];
  const key = serializePeriod(period);
  const cached = CUSTOM_VIEWS.get(key);
  if (cached) return cached;
  const built = build(factsFor(period), []);
  CUSTOM_VIEWS.set(key, built);
  return built;
}

/* ---- App Images: the one visit that is drilled into ---- */

export const VISIT_DETAIL = {
  title: "3742 · Winlife HCM 94/54 - 56",
  retailer: "Winmart",
  address: "94/54 Nguyễn Duy, Q. Bình Thạnh, HCMC",
  date: "04 Aug 2026",
  merchandiser: "minh_tran",
  photoCountLabel: "7 photos · raw captures",
  totalTime: "19 min",
};

export type TimelineStep = {
  icon: IconName;
  label: string;
  time: string;
  gap?: string;
};

export const TIMELINE: TimelineStep[] = [
  { icon: "log-in", label: "Arrived at store", time: "09:12" },
  { icon: "camera", label: "Toothpaste captured", time: "09:18", gap: "6 min" },
  { icon: "camera", label: "Toothbrush captured", time: "09:27", gap: "9 min" },
  { icon: "check", label: "Visit confirmed", time: "09:31", gap: "4 min" },
];

export type Photo = {
  category: string;
  seq: string;
  time: string;
  quality: "good" | "flag";
  /** Mock capture image — real photography stands in for the raw frame. */
  src: string;
};

/** Flat list — the lightbox pages through it by index. */
export const PHOTOS: Photo[] = [
  { category: "Toothpaste", seq: "01", time: "09:18", quality: "good", src: "/mock-shelf/toothpaste-1.jpg" },
  { category: "Toothpaste", seq: "02", time: "09:19", quality: "good", src: "/mock-shelf/toothpaste-2.jpg" },
  { category: "Toothpaste", seq: "03", time: "09:20", quality: "flag", src: "/mock-shelf/toothpaste-3.jpg" },
  { category: "Toothpaste", seq: "04", time: "09:21", quality: "good", src: "/mock-shelf/toothpaste-4.jpg" },
  { category: "Toothbrush", seq: "05", time: "09:27", quality: "good", src: "/mock-shelf/toothbrush-1.jpg" },
  { category: "Toothbrush", seq: "06", time: "09:28", quality: "good", src: "/mock-shelf/toothbrush-2.jpg" },
  { category: "Toothbrush", seq: "07", time: "09:29", quality: "good", src: "/mock-shelf/toothbrush-3.jpg" },
];

/**
 * The visit list/gallery has no per-photo data, only a `categories` summary
 * string (e.g. "Toothpaste, Toothbrush", "Multi-category") — this picks the
 * mock thumbnail that best represents it.
 */
export function categoryThumb(categories: string): string {
  if (categories === "Multi-category") return "/mock-shelf/toothpaste-5.jpg";
  if (categories.includes("Toothbrush") && !categories.includes("Toothpaste")) {
    return "/mock-shelf/toothbrush-1.jpg";
  }
  return "/mock-shelf/toothpaste-1.jpg";
}

/** Category groupings, addressing `PHOTOS` by index so the lightbox stays in sync. */
export const PHOTO_GROUPS = [
  { name: "Toothpaste", timeRange: "09:18–09:21", from: 0, to: 4 },
  { name: "Toothbrush", timeRange: "09:27–09:29", from: 4, to: 7 },
];

export function photoMetadata(photo: Photo) {
  return [
    { key: "Timestamp", value: `04 Aug ${photo.time}` },
    { key: "Category", value: photo.category },
    { key: "Sequence", value: `#${photo.seq}` },
    { key: "Device", value: "Samsung A54" },
    { key: "GPS accuracy", value: "±8 m" },
    { key: "Quality", value: photo.quality === "flag" ? "Flagged" : "Good" },
  ];
}
