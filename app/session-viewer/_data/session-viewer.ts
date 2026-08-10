import { hashStoreId } from "@/app/_format/num";
import { VISITS, type Visit } from "@/app/store-explorer/_data/store-explorer";

/**
 * Demo content for the Session Viewer screen, transcribed verbatim from the
 * design doc. One session — 04 Aug 2026, Winmart HCM, toothpaste — reached from
 * an Analytics number, so every figure here has to agree with that number.
 */

/** Why the user landed here; the headline is the Analytics figure being audited. */
export const CONTEXT = {
  eyebrow: "You're here because",
  headline: "Optic White OSA was 33% in this session",
};

export type SessionHeaderRow = { key: string; value: string };

export const SESSION_TITLE = "3742 · Winlife HCM 94/54 - 56";

export const SESSION_HEADER: SessionHeaderRow[] = [
  { key: "Retailer", value: "Winmart" },
  { key: "Category", value: "Toothpaste" },
  { key: "Merchandiser", value: "minh_tran" },
  { key: "Visit", value: "04 Aug 09:31" },
  { key: "Photos", value: "5" },
  { key: "Capture quality", value: "Good" },
];

/** What identifies a session; everything below it is the shared authored fixture. */
export type SessionIdentity = { title: string; header: SessionHeaderRow[] };

/** `/session-viewer` with no store is still the design's transcribed session. */
export const DEFAULT_SESSION: SessionIdentity = {
  title: SESSION_TITLE,
  header: SESSION_HEADER,
};

/* ---- per-store sessions, keyed off the Store Explorer visit list ---- */

/**
 * Store names carry Vietnamese diacritics plus `·`, `/`, `_` and spaced
 * hyphens. NFD splits each accented letter into a base letter and a combining
 * mark, so dropping the U+0300–U+036F block turns `Tân` into `Tan`; `đ`/`Đ` is
 * a stroked letter with no decomposition, so it is mapped by hand before the
 * lowercase pass. Whatever is left outside [a-z0-9] collapses to a single
 * hyphen, which is what keeps `94/54 - 56` from producing empty path segments.
 */
export function slugifyStore(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** The eight visits Store Explorer lists, addressable by slug. */
export const SESSION_STORES = VISITS.map((visit) => ({
  slug: slugifyStore(visit.store),
  visit,
}));

const VISIT_BY_SLUG = new Map(SESSION_STORES.map(({ slug, visit }) => [slug, visit]));

export function visitBySlug(slug: string): Visit | undefined {
  return VISIT_BY_SLUG.get(slug);
}

/**
 * Every Store Explorer visit belongs to the same authored day, and that date is
 * spelled out there rather than derived — no `new Date()` anywhere in render.
 */
const VISIT_DATE = "04 Aug";

/**
 * Only the header varies per store, and only across the four facts the `Visit`
 * record actually holds. `Capture quality` is dropped rather than defaulted:
 * it is not in the visit data, and asserting "Good" for eight stores would be
 * inventing a measurement.
 */
export function sessionFor(visit: Visit): SessionIdentity {
  return {
    title: visit.store,
    header: [
      { key: "Retailer", value: visit.retailer },
      { key: "Category", value: visit.category },
      { key: "Merchandiser", value: visit.merchandiser },
      { key: "Visit", value: `${VISIT_DATE} ${visit.time}` },
      { key: "Photos", value: String(visit.photos) },
    ],
  };
}

/* ---- stitched shelf ---- */

/*
 * Everything from here down is the one authored session's evidence — the same
 * stitch, shelf metrics, must-stock list and brand breakdown on every
 * `/session-viewer/[store]` page. These numbers were transcribed from a real
 * design; generating eight plausible-looking variants would be fabricating
 * measurements that no capture backs, which is exactly the failure this screen
 * exists to prevent. Per-store data arrives when a backend does.
 */

export type BoxKind = "own" | "competitor" | "unrecognised";

/**
 * Stroke/fill are the design's own hardcoded rgba values — deliberately outside
 * the token set, because they are overlay tints tuned against the shelf photo
 * rather than UI surfaces.
 */
export const BOX_PAINT: Record<
  BoxKind,
  { fill: string; stroke: string; dash: string }
> = {
  own: { fill: "rgba(79,70,229,.14)", stroke: "#4F46E5", dash: "0" },
  competitor: { fill: "rgba(100,116,139,.12)", stroke: "#94A3B8", dash: "0" },
  unrecognised: { fill: "rgba(148,163,184,.06)", stroke: "#94A3B8", dash: "1.4 1.2" },
};

export type RecognitionBox = {
  x: number;
  y: number;
  w: number;
  h: number;
  kind: BoxKind;
  /** Model confidence for this box, 0–1. Lower for `unrecognised` boxes by
   *  construction — that's the same signal that kept them unrecognised. */
  confidence: number;
};

/**
 * Coordinates live on the design's 100×56 canvas; the overlay is drawn with
 * `preserveAspectRatio="none"` so they stretch with the 16:9 shelf container.
 * Two shelf rows: eight facings on top, seven below.
 */
export const RECOGNITION_BOXES: RecognitionBox[] = [
  { x: 3, y: 4, w: 11, h: 15, kind: "own", confidence: 0.97 },
  { x: 15, y: 4, w: 10, h: 15, kind: "own", confidence: 0.95 },
  { x: 26, y: 5, w: 9, h: 14, kind: "competitor", confidence: 0.91 },
  { x: 36, y: 4, w: 11, h: 15, kind: "competitor", confidence: 0.93 },
  { x: 48, y: 5, w: 10, h: 14, kind: "competitor", confidence: 0.88 },
  { x: 59, y: 4, w: 9, h: 15, kind: "own", confidence: 0.96 },
  { x: 69, y: 5, w: 10, h: 14, kind: "competitor", confidence: 0.9 },
  { x: 80, y: 4, w: 11, h: 15, kind: "unrecognised", confidence: 0.42 },
  { x: 4, y: 22, w: 12, h: 16, kind: "competitor", confidence: 0.89 },
  { x: 17, y: 22, w: 11, h: 16, kind: "own", confidence: 0.94 },
  { x: 29, y: 23, w: 10, h: 15, kind: "competitor", confidence: 0.87 },
  { x: 40, y: 22, w: 12, h: 16, kind: "competitor", confidence: 0.92 },
  { x: 53, y: 22, w: 10, h: 16, kind: "competitor", confidence: 0.85 },
  { x: 64, y: 23, w: 11, h: 15, kind: "competitor", confidence: 0.9 },
  { x: 76, y: 22, w: 12, h: 16, kind: "unrecognised", confidence: 0.38 },
];

export const BOX_LEGEND: { kind: BoxKind; label: string }[] = [
  { kind: "own", label: "Own products" },
  { kind: "competitor", label: "Competitors" },
  { kind: "unrecognised", label: "Unrecognised" },
];

/** The mock photograph standing in for the stitched shelf capture. */
export const SHELF_IMAGE = "/mock-shelf/shelf-toothpaste-wide.jpg";

/** The five raw captures the stitch was assembled from, in capture order. */
export const STITCH_PHOTOS = [
  { label: "09:18 · #01", src: "/mock-shelf/toothpaste-1.jpg" },
  { label: "09:19 · #02", src: "/mock-shelf/toothpaste-2.jpg" },
  { label: "09:20 · #03", src: "/mock-shelf/toothpaste-3.jpg" },
  { label: "09:21 · #04", src: "/mock-shelf/toothpaste-4.jpg" },
  { label: "09:22 · #05", src: "/mock-shelf/toothpaste-5.jpg" },
];

/* ---- shelf metrics ---- */

export type ShelfMetric = {
  label: string;
  /** Definition surfaced as a native tooltip on the adjacent info icon. */
  definition: string;
  value: string;
  detail: string;
};

export const SHELF_METRICS: ShelfMetric[] = [
  {
    label: "Share of Shelf",
    definition: "Own facings ÷ total category facings",
    value: "34.2%",
    detail: "128 of 374 facings",
  },
  {
    label: "Linear Share of Shelf",
    definition: "Own linear shelf length ÷ total category linear length",
    value: "33.8%",
    detail: "2.7 m of 8.0 m",
  },
];

export const OWN_VS_COMPETITION = { label: "34 / 66", own: 34, competition: 66 };

/* ---- availability + must-stock list ---- */

export const AVAILABILITY = {
  label: "On-Shelf Availability",
  definition: "Ranged SKUs found on shelf ÷ total ranged (MSL) SKUs",
  value: "72%",
  note: "Must-stock list · 2 absent, 6 found — absent shown first",
};

export type MslRow = {
  name: string;
  brand: string;
  mustHave: boolean;
  /** `undefined` facings means the SKU was not found on the shelf. */
  facings?: number;
};

/** Ordered absent-first, matching the note above the list. */
const MSL_RAW: MslRow[] = [
  { name: "COL Optic White Plus Shine 100G", brand: "Optic White", mustHave: true },
  { name: "COL Max Fresh Blue Gel 140G", brand: "Max Fresh", mustHave: true },
  { name: "COL TP CDC 225G x 36", brand: "CDC", mustHave: true, facings: 4 },
  {
    name: "COL Total Charcoal Deep Clean 150G",
    brand: "Colgate Total",
    mustHave: true,
    facings: 3,
  },
  { name: "COL TP CDC 100g x 72", brand: "CDC", mustHave: false, facings: 5 },
  { name: "COL Natural Salt Herbal 180G", brand: "Natural", mustHave: false, facings: 2 },
  { name: "COL Salt Original 200G", brand: "Salt", mustHave: false, facings: 2 },
  {
    name: "COL Total Professional 100G",
    brand: "Colgate Total",
    mustHave: false,
    facings: 3,
  },
];

export const MSL = MSL_RAW.map((sku) => ({
  ...sku,
  status: sku.facings === undefined ? ("absent" as const) : ("found" as const),
  statusLabel:
    sku.facings === undefined ? "Absent" : `Found · ${sku.facings}`,
}));

export type MslChecklistRow = MslRow & {
  detected: boolean;
  detail: string;
};

/**
 * Per-store expected-vs-detected checklist. Membership — which 8 SKUs make up
 * the must-stock list — stays the one shared authored fact; only *found vs
 * absent* varies per store, and only by flipping one row, picked
 * deterministically from the store id so it's stable across renders without
 * inventing facings counts the fixture never captured. The no-`Visit` default
 * session keeps the static `MSL` output above, unchanged.
 */
export function mslFor(visit: Visit): MslChecklistRow[] {
  const flipIndex = hashStoreId(visit.storeId) % MSL_RAW.length;
  return MSL_RAW.map((sku, i) => {
    const baseDetected = sku.facings !== undefined;
    const detected = i === flipIndex ? !baseDetected : baseDetected;
    return {
      ...sku,
      detected,
      detail: detected
        ? sku.facings !== undefined
          ? `Found · ${sku.facings} facings`
          : "Found on shelf"
        : "Not found on shelf",
    };
  });
}

/* ---- visit context: timeline + photo quality ---- */

export type TimelineEvent = { time: string; label: string };

function clockFromMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/**
 * 4–6 events derived from the visit's own start time and photo count —
 * arrival, spaced captures, departure — rather than hand-authoring eight full
 * timelines with no capture-level data behind them. Capped at 4 capture
 * events so a 9-photo visit doesn't produce an implausibly long timeline.
 */
export function visitTimeline(visit: Visit): TimelineEvent[] {
  const [h, m] = visit.time.split(":").map(Number);
  const start = h * 60 + m;
  const captures = Math.min(visit.photos, 4);

  const events: TimelineEvent[] = [
    { time: clockFromMinutes(start), label: "Arrived at store" },
  ];
  for (let i = 0; i < captures; i += 1) {
    events.push({
      time: clockFromMinutes(start + 1 + i * 2),
      label: `Capture ${i + 1} of ${visit.photos}`,
    });
  }
  events.push({
    time: clockFromMinutes(start + 2 + captures * 2),
    label: "Left store",
  });
  return events;
}

export type PhotoQualityTier = "good" | "fair" | "poor";

const PHOTO_QUALITY_LABEL: Record<PhotoQualityTier, string> = {
  good: "Good",
  fair: "Fair",
  poor: "Poor",
};

/**
 * Doesn't exist per-store today — `sessionFor()` deliberately drops "Capture
 * quality" because it isn't in `Visit` data. This derives a coarse tier the
 * same deterministic way as `mslFor`, rather than asserting "Good" for every
 * store the way the removed field would have.
 */
export function photoQualityFor(visit: Visit): { tier: PhotoQualityTier; label: string } {
  const bucket = hashStoreId(visit.storeId) % 10;
  const tier: PhotoQualityTier = bucket < 6 ? "good" : bucket < 9 ? "fair" : "poor";
  return { tier, label: PHOTO_QUALITY_LABEL[tier] };
}

/* ---- brand breakdown ---- */

const BRAND_FACINGS: [name: string, isOwn: boolean, facings: number, share: number][] =
  [
    ["P/S", false, 88, 23.5],
    ["Closeup", false, 61, 16.3],
    ["CDC", true, 42, 11.2],
    ["Sensodyne", false, 38, 10.2],
    ["Colgate Total", true, 34, 9.1],
    ["Oral-B", false, 31, 8.3],
    ["Natural", true, 26, 7.0],
    ["Max Fresh", true, 22, 5.9],
  ];

const BRAND_MAX = 88;

/** Bars scale against the biggest brand; the label carries the true share. */
export const BRAND_ROWS = BRAND_FACINGS.map(([name, isOwn, facings, share]) => ({
  name,
  isOwn,
  facings,
  share: share.toFixed(1),
  width: +((facings / BRAND_MAX) * 100).toFixed(1),
}));
