import { storeById } from "@/app/_data/stores-geo";
import {
  VISITS,
  type Visit,
  type VisitStatus,
} from "@/app/store-explorer/_data/store-explorer";
import { BRAND_SHELF, TOTALS } from "./shelf-facts";

/**
 * Demo content for the Session Viewer screen, transcribed verbatim from the
 * design doc. One session — 04 Aug 2026, Winmart HCM, toothpaste — reached from
 * an Analytics number, so every figure here has to agree with that number.
 */

/** Why the user landed here; the headline is the Analytics figure being audited. */
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

/** The visit the transcribed session belongs to — the source for anything the
 *  store fixture already records, so nothing here restates it. */
export const FLAGSHIP_VISIT = VISITS.find(
  (visit) => visit.sessionId === DEFAULT_SESSION_ID,
)!;

export const SESSION_HEADER: SessionHeaderRow[] = [
  { key: "Retailer", value: "Winmart" },
  { key: "Category", value: "Toothpaste" },
  { key: "Merchandiser", value: "minh_tran" },
  { key: "Visit", value: "04 Aug 09:31" },
  /* Was "5", while the store fixture recorded seven for this visit. */
  { key: "Photos", value: String(FLAGSHIP_VISIT.photos) },
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
  /** The shop. The page's `<h1>` — a reader off a deep link needs this first. */
  store: string;
  /** How many photographs the capture produced, from the visit itself. */
  photos: number;
  status: VisitStatus;
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
/**
 * `/session-viewer` with no store still shows the design's transcribed
 * session. `photos` and `status` come from the flagship visit rather than
 * being retyped — the header used to claim five photographs for a visit the
 * store fixture records as seven.
 */
export const DEFAULT_SESSION: SessionIdentity = {
  title: SESSION_TITLE,
  store: SESSION_TITLE,
  photos: FLAGSHIP_VISIT.photos,
  status: FLAGSHIP_VISIT.status,
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
    store: visit.store,
    photos: visit.photos,
    status: visit.status,
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
  /**
   * Stable shelf address, `s{shelf}p{position}`. Exceptions and absent SKUs
   * are filed under this rather than an array index, so a box can be inserted
   * without silently re-pointing every reference to the ones after it.
   */
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  kind: BoxKind;
  /**
   * The recognised brand. Undefined exactly when `kind` is `"unrecognised"` —
   * that is what unrecognised means, and the assertion below holds them to it.
   */
  brand?: string;
  confidence: number;
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
  { id: "s1p1", x: 3, y: 4, w: 11, h: 15, brand: "CDC", kind: "own", confidence: 0.97, compliance: "compliant" },
  { id: "s1p2", x: 15, y: 4, w: 10, h: 15, brand: "Colgate Total", kind: "own", confidence: 0.95, compliance: "compliant" },
  { id: "s1p3", x: 26, y: 5, w: 9, h: 14, brand: "P/S", kind: "competitor", confidence: 0.91, compliance: "compliant" },
  { id: "s1p4", x: 36, y: 4, w: 11, h: 15, brand: "Closeup", kind: "competitor", confidence: 0.93, compliance: "compliant" },
  { id: "s1p5", x: 48, y: 5, w: 10, h: 14, brand: "Sensodyne", kind: "competitor", confidence: 0.88, compliance: "compliant" },
  { id: "s1p6", x: 59, y: 4, w: 9, h: 15, brand: "Natural", kind: "own", confidence: 0.96, compliance: "compliant" },
  { id: "s1p7", x: 69, y: 5, w: 10, h: 14, brand: "Oral-B", kind: "competitor", confidence: 0.9, compliance: "misplaced" },
  { id: "s1p8", x: 80, y: 4, w: 11, h: 15, kind: "unrecognised", confidence: 0.42, compliance: "missing" },
  { id: "s2p1", x: 4, y: 22, w: 12, h: 16, brand: "P/S", kind: "competitor", confidence: 0.89, compliance: "compliant" },
  { id: "s2p2", x: 17, y: 22, w: 11, h: 16, brand: "Max Fresh", kind: "own", confidence: 0.94, compliance: "compliant" },
  { id: "s2p3", x: 29, y: 23, w: 10, h: 15, brand: "Closeup", kind: "competitor", confidence: 0.87, compliance: "compliant" },
  { id: "s2p4", x: 40, y: 22, w: 12, h: 16, brand: "Sensodyne", kind: "competitor", confidence: 0.92, compliance: "compliant" },
  { id: "s2p5", x: 53, y: 22, w: 10, h: 16, brand: "Oral-B", kind: "competitor", confidence: 0.85, compliance: "misplaced" },
  { id: "s2p6", x: 64, y: 23, w: 11, h: 15, brand: "P/S", kind: "competitor", confidence: 0.9, compliance: "compliant" },
  { id: "s2p7", x: 76, y: 22, w: 12, h: 16, kind: "unrecognised", confidence: 0.38, compliance: "missing" },
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

/** The mock photograph standing in for the stitched shelf capture. */
export const SHELF_IMAGE = "/mock-shelf/shelf-toothpaste-wide.jpg";

/* ---- shelf metrics ---- */

export type ShelfMetric = {
  label: string;
  /** Definition surfaced as a native tooltip on the adjacent info icon. */
  definition: string;
  /** The number, for the accuracy tab to compare an auditor's count against. */
  pct: number;
  value: string;
  detail: string;
};

const metresOf = (cm: number) => (cm / 100).toFixed(1);

/**
 * Derived from `TOTALS`, not authored. Both figures used to be typed out here
 * and again in the tables; a projection cannot drift from what it projects.
 */
export const SHELF_METRICS: ShelfMetric[] = [
  {
    label: "Share of Shelf",
    definition: "Own facings ÷ total category facings",
    pct: +((TOTALS.ownFacings / TOTALS.facings) * 100).toFixed(1),
    value: `${((TOTALS.ownFacings / TOTALS.facings) * 100).toFixed(1)}%`,
    detail: `${TOTALS.ownFacings} of ${TOTALS.facings} facings`,
  },
  {
    label: "Linear Share of Shelf",
    definition: "Own linear shelf length ÷ total category linear length",
    pct: +((TOTALS.ownLinearCm / TOTALS.linearCm) * 100).toFixed(1),
    value: `${((TOTALS.ownLinearCm / TOTALS.linearCm) * 100).toFixed(1)}%`,
    detail: `${metresOf(TOTALS.ownLinearCm)} m of ${metresOf(TOTALS.linearCm)} m`,
  },
];

export const OWN_VS_COMPETITION = { label: "34 / 66", own: 34, competition: 66 };

/* ---- availability + must-stock list ---- */


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

export const RANGED_COUNT = MSL_RAW.length;
export const FOUND_COUNT = MSL_RAW.filter((sku) => sku.facings !== undefined).length;

export const AVAILABILITY = {
  label: "On-Shelf Availability",
  definition: "Ranged SKUs found on shelf ÷ total ranged (MSL) SKUs",
  /**
   * What recognition predicted. The auditor's own count of the same bay is
   * 75.0% — six of eight — and the three-point gap is not a rounding error but
   * the thing the Accuracy tab exists to report. See `session-accuracy.ts`,
   * which asserts the pair rather than letting the two figures drift apart.
   */
  pct: 72,
  value: "72%",
  note: `Must-stock list · ${RANGED_COUNT - FOUND_COUNT} absent, ${FOUND_COUNT} found — absent shown first`,
  detail: `${FOUND_COUNT} of ${RANGED_COUNT} must-stock SKUs found`,
};


/* ---- brand breakdown ---- */

const BRAND_MAX = Math.max(...BRAND_SHELF.map((brand) => brand.facings));

/** All eleven brands on the bay, biggest first — what the rail's scoped list reads. */
export const BRAND_SHARE_ROWS = BRAND_SHELF.map((brand) => ({
  name: brand.name,
  isOwn: brand.isOwn,
  facings: brand.facings,
  share: ((brand.facings / TOTALS.facings) * 100).toFixed(1),
  width: +((brand.facings / BRAND_MAX) * 100).toFixed(1),
})).sort((a, b) => b.facings - a.facings);

/**
 * The named eight. A projection of `BRAND_SHELF` rather than a second list of
 * facing counts — these used to be authored here and again in the tables, and
 * `chat-prompts.ts` reads them, so an assertion below pins the shares.
 */
export const BRAND_ROWS = BRAND_SHARE_ROWS.filter(
  (brand) => brand.name !== "Other brands",
).slice(0, 8);

/* ---- addressing, filters and scopes ---- */

/** `s1p7` → "Shelf 1 · position 7". One parser, so a position can never be
 *  written down twice and disagree with the box it points at. */
export function positionLabel(id: string): string {
  const match = /^s(\d+)p(\d+)$/.exec(id);
  if (!match) return id;
  return `Shelf ${match[1]} · position ${match[2]}`;
}

export const BOX_BY_ID = new Map(RECOGNITION_BOXES.map((box) => [box.id, box]));

/**
 * A brand is must-have iff a ranged must-have SKU carries it — read off the
 * must-stock list rather than typed out again beside it.
 */
export const MUST_HAVE_BRANDS: ReadonlySet<string> = new Set(
  MSL_RAW.filter((sku) => sku.mustHave).map((sku) => sku.brand),
);

/** The Brand filter's options: what recognition actually found, own brands first. */
export const DETECTED_BRANDS: string[] = BRAND_SHELF.filter((brand) =>
  RECOGNITION_BOXES.some((box) => box.brand === brand.name),
)
  .sort((a, b) => Number(b.isOwn) - Number(a.isOwn) || b.facings - a.facings)
  .map((brand) => brand.name);

export const MSL_FILTER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "must", label: "Must-have" },
  { value: "not", label: "Not must-have" },
] as const;

export type MslFilter = (typeof MSL_FILTER_OPTIONS)[number]["value"];

export const SCOPE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "top", label: "Top 10" },
  { value: "bottom", label: "Bottom 10" },
] as const;

export type Scope = (typeof SCOPE_OPTIONS)[number]["value"];

/** Shared by the three scoped lists in the rail. Assumes `rows` is sorted. */
export function scoped<T>(rows: T[], scope: Scope): T[] {
  if (scope === "top") return rows.slice(0, 10);
  if (scope === "bottom") return rows.slice(-10);
  return rows;
}

/* ---- the identities this file has to hold ---- */

/* `unrecognised` and "no brand" are the same statement; anything else means a
   box claims a brand nobody can see, or hides one it recognised. */
for (const box of RECOGNITION_BOXES) {
  if ((box.kind === "unrecognised") !== (box.brand === undefined)) {
    throw new Error(
      `Box ${box.id} is ${box.kind} but ${box.brand === undefined ? "carries no brand" : `carries "${box.brand}"`}. ` +
        `Unrecognised boxes have no brand and recognised boxes have one — see session-viewer.ts.`,
    );
  }
  if (box.brand && !BRAND_SHELF.some((brand) => brand.name === box.brand)) {
    throw new Error(
      `Box ${box.id} names brand "${box.brand}", which is not on the bay. ` +
        `Add it to BRAND_SHELF in shelf-facts.ts or fix the box.`,
    );
  }
}

if (new Set(RECOGNITION_BOXES.map((box) => box.id)).size !== RECOGNITION_BOXES.length) {
  throw new Error("Duplicate box id in RECOGNITION_BOXES — ids address exceptions, so they must be unique.");
}

/* The metrics are derived now; this pins the strings they render to the ratio,
   so a formatting change cannot quietly restate the number. */
for (const metric of SHELF_METRICS) {
  if (metric.value !== `${metric.pct.toFixed(1)}%`) {
    throw new Error(
      `SHELF_METRICS "${metric.label}" prints ${metric.value} but its figure is ${metric.pct}. See session-viewer.ts.`,
    );
  }
}

/* BRAND_ROWS moved from authored to derived. These are the shares the drawer,
   the tables and `chat-prompts.ts` have always shown. */
const BRAND_SHARE_GUARD = ["23.5", "16.3", "11.2", "10.2", "9.1", "8.3", "7.0", "5.9"];
BRAND_ROWS.forEach((row, index) => {
  if (row.share !== BRAND_SHARE_GUARD[index]) {
    throw new Error(
      `BRAND_ROWS[${index}] (${row.name}) is ${row.share}% but was ${BRAND_SHARE_GUARD[index]}%. ` +
        `Either BRAND_SHELF changed or TOTALS.facings did — see shelf-facts.ts.`,
    );
  }
});

if (MUST_HAVE_BRANDS.size !== 4) {
  throw new Error(
    `MUST_HAVE_BRANDS derived ${MUST_HAVE_BRANDS.size} brands, expected 4 (CDC, Colgate Total, Max Fresh, Optic White). ` +
      `The must-stock list in session-viewer.ts changed.`,
  );
}

/* The transcribed session must stay the flagship visit's: `SESSION_TITLE` is
   slugified into the prerendered routes, so a drift here is a 404 in the
   Analytics deep links, not a cosmetic mismatch. */
if (slugifyStore(SESSION_TITLE) !== slugifyStore(FLAGSHIP_VISIT.store)) {
  throw new Error(
    `SESSION_TITLE is "${SESSION_TITLE}" but the flagship visit is "${FLAGSHIP_VISIT.store}". ` +
      `They share a slug in the route table — see session-viewer.ts.`,
  );
}
if (DEFAULT_SESSION.photos !== FLAGSHIP_VISIT.photos) {
  throw new Error(
    `DEFAULT_SESSION claims ${DEFAULT_SESSION.photos} photos but the visit recorded ${FLAGSHIP_VISIT.photos}.`,
  );
}
