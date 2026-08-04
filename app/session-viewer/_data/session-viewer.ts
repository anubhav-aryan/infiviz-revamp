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

export const SESSION_TITLE = "3742 · Winlife HCM 94/54 - 56";

export const SESSION_HEADER: { key: string; value: string }[] = [
  { key: "Retailer", value: "Winmart" },
  { key: "Category", value: "Toothpaste" },
  { key: "Merchandiser", value: "minh_tran" },
  { key: "Visit", value: "04 Aug 09:31" },
  { key: "Photos", value: "5" },
  { key: "Capture quality", value: "Good" },
];

/* ---- stitched shelf ---- */

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
};

/**
 * Coordinates live on the design's 100×56 canvas; the overlay is drawn with
 * `preserveAspectRatio="none"` so they stretch with the 16:9 shelf container.
 * Two shelf rows: eight facings on top, seven below.
 */
export const RECOGNITION_BOXES: RecognitionBox[] = [
  { x: 3, y: 4, w: 11, h: 15, kind: "own" },
  { x: 15, y: 4, w: 10, h: 15, kind: "own" },
  { x: 26, y: 5, w: 9, h: 14, kind: "competitor" },
  { x: 36, y: 4, w: 11, h: 15, kind: "competitor" },
  { x: 48, y: 5, w: 10, h: 14, kind: "competitor" },
  { x: 59, y: 4, w: 9, h: 15, kind: "own" },
  { x: 69, y: 5, w: 10, h: 14, kind: "competitor" },
  { x: 80, y: 4, w: 11, h: 15, kind: "unrecognised" },
  { x: 4, y: 22, w: 12, h: 16, kind: "competitor" },
  { x: 17, y: 22, w: 11, h: 16, kind: "own" },
  { x: 29, y: 23, w: 10, h: 15, kind: "competitor" },
  { x: 40, y: 22, w: 12, h: 16, kind: "competitor" },
  { x: 53, y: 22, w: 10, h: 16, kind: "competitor" },
  { x: 64, y: 23, w: 11, h: 15, kind: "competitor" },
  { x: 76, y: 22, w: 12, h: 16, kind: "unrecognised" },
];

export const BOX_LEGEND: { kind: BoxKind; label: string }[] = [
  { kind: "own", label: "Own products" },
  { kind: "competitor", label: "Competitors" },
  { kind: "unrecognised", label: "Unrecognised" },
];

/** The five raw captures the stitch was assembled from, in capture order. */
export const STITCH_PHOTOS = [
  "09:18 · #01",
  "09:19 · #02",
  "09:20 · #03",
  "09:21 · #04",
  "09:22 · #05",
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
