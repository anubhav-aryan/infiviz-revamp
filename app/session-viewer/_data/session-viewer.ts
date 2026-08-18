import { hashStoreId } from "@/app/_format/num";
import { storeById } from "@/app/_data/stores-geo";
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

/** The section rail's heading, above the six session filters. */
export const SECTION = {
  title: "Session Viewer",
  caption: "One capture session, its recognition and its shelf numbers.",
};

export const SESSION_TITLE = "3742 · Winlife HCM 94/54 - 56";

/** The authored session's id, for the rail's Session ID picker on the bare
 *  `/session-viewer` route, which has no `Visit` to read one from. */
export const DEFAULT_SESSION_ID = "a3f5c9e1-6b42-4d8a-9c17-2e5f8a1b3d47";

export const SESSION_HEADER: SessionHeaderRow[] = [
  { key: "Retailer", value: "Winmart" },
  { key: "Category", value: "Toothpaste" },
  { key: "Merchandiser", value: "minh_tran" },
  { key: "Visit", value: "04 Aug 09:31" },
  { key: "Photos", value: "5" },
  { key: "Capture quality", value: "Good" },
];

/**
 * What identifies a session; everything below it is the shared authored fixture.
 *
 * `header` is the key/value list the metrics drawer prints and `chat-prompts.ts`
 * reads. The flat fields beside it are what the page header renders as an icon
 * row — the same six facts Store Explorer's detail view shows. They are spelled
 * out here rather than derived in the component because `/session-viewer` with
 * no store has no `Visit` to derive them from, and a component that had to cope
 * with both shapes would be the thing that broke.
 */
export type SessionIdentity = {
  title: string;
  header: SessionHeaderRow[];
  date: string;
  retailer: string;
  /** "District, Region" — one line, already joined. */
  place: string;
  category: string;
  placement: string;
  merchandiser: string;
};

/** `/session-viewer` with no store is still the design's transcribed session. */
export const DEFAULT_SESSION: SessionIdentity = {
  title: SESSION_TITLE,
  header: SESSION_HEADER,
  date: "04 Aug 2026",
  retailer: "Winmart",
  place: "Q. Bình Thạnh, Ho Chi Minh City",
  category: "Toothpaste",
  placement: "Eye Level",
  merchandiser: "minh_tran",
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
  const store = storeById(visit.storeId);
  return {
    title: visit.store,
    header: [
      { key: "Retailer", value: visit.retailer },
      { key: "Category", value: visit.category },
      { key: "Merchandiser", value: visit.merchandiser },
      { key: "Visit", value: `${VISIT_DATE} ${visit.time}` },
      { key: "Photos", value: String(visit.photos) },
    ],
    date: `${VISIT_DATE} 2026 · ${visit.time}`,
    retailer: visit.retailer,
    place: `${store.district}, ${store.region}`,
    category: visit.category,
    placement: visit.placement,
    merchandiser: visit.merchandiser,
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

/** How a facing reads against the planogram, for the compliance view. */
export type ComplianceKind = "compliant" | "misplaced" | "missing";

/** A counted facing. Every shelf metric and every session table is computed
 *  from exactly these — which is why `compliance` is required here and absent
 *  from `ExtraBox` below. */
export type RecognitionBox = {
  x: number;
  y: number;
  w: number;
  h: number;
  kind: BoxKind;
  /** Model confidence for this box, 0–1. Lower for `unrecognised` boxes by
   *  construction — that's the same signal that kept them unrecognised. */
  confidence: number;
  /** Where this facing sits against the planogram. */
  compliance: ComplianceKind;
};

/** Why an extra box is drawn but never counted. */
export type ExtraKind = "posm" | "overlap" | "excluded";

/**
 * A box the overlay can draw but no metric counts. The three shelf toggles each
 * reveal one `kind` of these — they only ever *add* marks to the stitch, so the
 * facing count under the shelf never moves and the tables never disagree with
 * what is on screen.
 */
export type ExtraBox = {
  x: number;
  y: number;
  w: number;
  h: number;
  kind: ExtraKind;
  /** What the mark is, for the hover label. */
  label: string;
};

/**
 * Coordinates live on the design's 100×56 canvas; the overlay is drawn with
 * `preserveAspectRatio="none"` so they stretch with the 16:9 shelf container.
 * Two shelf rows: eight facings on top, seven below.
 */
export const RECOGNITION_BOXES: RecognitionBox[] = [
  { x: 3, y: 4, w: 11, h: 15, kind: "own", confidence: 0.97, compliance: "compliant" },
  { x: 15, y: 4, w: 10, h: 15, kind: "own", confidence: 0.95, compliance: "compliant" },
  { x: 26, y: 5, w: 9, h: 14, kind: "competitor", confidence: 0.91, compliance: "compliant" },
  { x: 36, y: 4, w: 11, h: 15, kind: "competitor", confidence: 0.93, compliance: "compliant" },
  { x: 48, y: 5, w: 10, h: 14, kind: "competitor", confidence: 0.88, compliance: "compliant" },
  { x: 59, y: 4, w: 9, h: 15, kind: "own", confidence: 0.96, compliance: "compliant" },
  { x: 69, y: 5, w: 10, h: 14, kind: "competitor", confidence: 0.9, compliance: "misplaced" },
  { x: 80, y: 4, w: 11, h: 15, kind: "unrecognised", confidence: 0.42, compliance: "missing" },
  { x: 4, y: 22, w: 12, h: 16, kind: "competitor", confidence: 0.89, compliance: "compliant" },
  { x: 17, y: 22, w: 11, h: 16, kind: "own", confidence: 0.94, compliance: "compliant" },
  { x: 29, y: 23, w: 10, h: 15, kind: "competitor", confidence: 0.87, compliance: "compliant" },
  { x: 40, y: 22, w: 12, h: 16, kind: "competitor", confidence: 0.92, compliance: "compliant" },
  { x: 53, y: 22, w: 10, h: 16, kind: "competitor", confidence: 0.85, compliance: "misplaced" },
  { x: 64, y: 23, w: 11, h: 15, kind: "competitor", confidence: 0.9, compliance: "compliant" },
  { x: 76, y: 22, w: 12, h: 16, kind: "unrecognised", confidence: 0.38, compliance: "missing" },
];

export const BOX_LEGEND: { kind: BoxKind; label: string }[] = [
  { kind: "own", label: "Own products" },
  { kind: "competitor", label: "Competitors" },
  { kind: "unrecognised", label: "Unrecognised" },
];

/**
 * The marks the three shelf toggles reveal. None of these is a facing: the two
 * price rails and the wobbler are point-of-sale material, the two overlaps are
 * the same product seen twice where the stitch seams meet, and the two
 * exclusions were dropped before the counts were taken. They sit in their own
 * array rather than as flags on `RECOGNITION_BOXES` precisely so that no code
 * path can accidentally count them.
 */
export const EXTRA_BOXES: ExtraBox[] = [
  { x: 3, y: 19.4, w: 88, h: 2.2, kind: "posm", label: "Price rail" },
  { x: 4, y: 38.4, w: 84, h: 2.2, kind: "posm", label: "Price rail" },
  { x: 44, y: 41.5, w: 9, h: 7, kind: "posm", label: "Wobbler" },
  { x: 47.2, y: 5.4, w: 10, h: 14, kind: "overlap", label: "Seam duplicate" },
  { x: 52.2, y: 22.5, w: 10, h: 16, kind: "overlap", label: "Seam duplicate" },
  { x: 91.6, y: 41, w: 7.5, h: 12, kind: "excluded", label: "Excluded · blurred" },
  { x: 3, y: 42, w: 12, h: 11, kind: "excluded", label: "Excluded · other category" },
];

/** The three toggles, and which `ExtraBox.kind` each one reveals. */
export const SHELF_TOGGLES: { kind: ExtraKind; label: string; short: string }[] = [
  { kind: "posm", label: "Show POSM", short: "POSM" },
  { kind: "overlap", label: "Show Overlap", short: "overlap" },
  { kind: "excluded", label: "Show Exclusions", short: "excluded" },
];

/** Paint for the marks the toggles reveal — all dashed, none of them a facing. */
export const EXTRA_PAINT: Record<ExtraKind, { fill: string; stroke: string; dash: string }> = {
  posm: { fill: "rgba(217,119,6,.12)", stroke: "#D97706", dash: "1.2 1" },
  overlap: { fill: "rgba(14,165,233,.12)", stroke: "#0EA5E9", dash: "1.2 1" },
  excluded: { fill: "rgba(100,116,139,.10)", stroke: "#64748B", dash: "1.2 1" },
};

/** Counted facings, stated under the shelf so the invariant is visible. */
export const COUNTED_FACINGS = RECOGNITION_BOXES.length;

/** `+3 POSM · +2 overlap · +2 excluded`, derived so it cannot drift. */
export const EXTRA_COUNTS = SHELF_TOGGLES.map((toggle) => ({
  ...toggle,
  count: EXTRA_BOXES.filter((box) => box.kind === toggle.kind).length,
}));

/* ---- planogram compliance view ---- */

/**
 * The second paint map the compliance view swaps in. Same boxes, same
 * geometry — only the colouring changes, so the two views are provably about
 * the same 15 facings. 11 compliant + 2 misplaced = 13 of 15 detected, which is
 * the same story the 72% OSA and "2 absent" note below tell.
 */
export const COMPLIANCE_PAINT: Record<
  ComplianceKind,
  { fill: string; stroke: string; dash: string }
> = {
  compliant: { fill: "rgba(22,163,74,.14)", stroke: "#16A34A", dash: "0" },
  misplaced: { fill: "rgba(217,119,6,.16)", stroke: "#D97706", dash: "0" },
  missing: { fill: "rgba(220,38,38,.10)", stroke: "#DC2626", dash: "1.4 1.2" },
};

export const COMPLIANCE_LEGEND: { kind: ComplianceKind; label: string }[] = [
  { kind: "compliant", label: "Compliant" },
  { kind: "misplaced", label: "Misplaced" },
  { kind: "missing", label: "Missing" },
];

/** The two views the toolbar switches between. */
export type ShelfView = "store" | "compliance";

/**
 * The stitch is assembled from four overlapping panels; the design labels each
 * one under the image. Widths are percentages of the stitch, left to right.
 */
export const STITCH_PANELS = [
  { shelf: "Others", brand: "Others" },
  { shelf: "Others", brand: "Others" },
  { shelf: "Others", brand: "Others" },
  { shelf: "Others", brand: "Others" },
];

/** The mock photograph standing in for the stitched shelf capture. */
export const SHELF_IMAGE = "/mock-shelf/shelf-toothpaste-wide.jpg";

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
