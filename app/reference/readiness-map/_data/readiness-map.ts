/**
 * Content for the "Platform readiness map" reference poster, transcribed
 * verbatim from the design doc — Colgate-Palmolive Vietnam, mock data.
 */

export const HEADER = {
  eyebrow: "InfiViz · reference",
  title: "Platform readiness map",
  lede: "Which surface exists, and in what state, as a customer moves through the four journey phases. A surface only appears once its data is populated — a brand-new account is a coherent screen, not a dashboard of zeros.",
};

export const CLIENT = {
  name: "Colgate-Palmolive Vietnam",
  note: "First client · mock data",
};

export type Readiness = "live" | "partial" | "locked" | "hidden" | "internal";

/** One label per state, reused by the matrix, the legend and the day-one panel. */
export const READINESS_LABEL: Record<Readiness, string> = {
  live: "Live",
  partial: "Partial",
  locked: "Locked",
  hidden: "Hidden",
  internal: "Internal",
};

export type LegendEntry = { kind: Readiness; desc: string };

export const LEGEND: LegendEntry[] = [
  { kind: "live", desc: "Fully available" },
  { kind: "partial", desc: "Visible, limited data + note" },
  { kind: "locked", desc: "In nav, disabled · hover for unlock" },
  { kind: "hidden", desc: "Not rendered at all" },
  { kind: "internal", desc: "Never shown to customers" },
];

export const MATRIX_CORNER_LABEL = "Phase ↓ / surface →";

export type Column = {
  label: string;
  /** The internal-only column is ruled off in near-black rather than indigo. */
  internal?: boolean;
};

export const COLUMNS: Column[] = [
  { label: "Activity feed" },
  { label: "Master Data" },
  { label: "Users & Journey plans" },
  { label: "Photo Quality" },
  { label: "Merchandiser Activity & Store Coverage" },
  { label: "Catalog" },
  { label: "Store Explorer" },
  { label: "App Images" },
  { label: "Analytics" },
  { label: "Session Viewer" },
  { label: "Data Quality Studio", internal: true },
];

/* The four rules that recur across rows. These are the actual unlock
   conditions, so they are content rather than hover decoration. */
const CAT_UNLOCK = "Unlocks when your catalog is digitised";
const AN_UNLOCK = "Unlocks when the first sessions are processed";
const SV_HIDE = "Not rendered — reachable only from Analytics";
const DQ_INT = "Never shown to customers";

export type Cell = { kind: Readiness; title?: string };

export type Row = {
  num: string;
  name: string;
  note: string;
  /** Eleven cells, one per entry in COLUMNS and in the same order. */
  cells: Cell[];
};

const cell = (kind: Readiness, title?: string): Cell => ({ kind, title });

export const ROWS: Row[] = [
  {
    num: "1",
    name: "Onboarding",
    note: "Setup proof + the two CS reports",
    cells: [
      cell("partial", "Config + capture events; no analytics events yet"),
      cell("live"),
      cell("live"),
      cell("live"),
      cell("live"),
      cell("locked", CAT_UNLOCK),
      cell("partial", "Visits appear as captures arrive — sparse early"),
      cell("live"),
      cell("locked", AN_UNLOCK),
      cell("hidden", SV_HIDE),
      cell("internal", DQ_INT),
    ],
  },
  {
    num: "2",
    name: "Catalog",
    note: "Category-by-category catalog confirmation",
    cells: [
      cell("partial", "Adds catalog-update events; no analytics yet"),
      cell("live"),
      cell("live"),
      cell("live"),
      cell("live"),
      cell("live"),
      cell("live"),
      cell("live"),
      cell("locked", AN_UNLOCK),
      cell("hidden", SV_HIDE),
      cell("internal", DQ_INT),
    ],
  },
  {
    num: "3",
    name: "AI pipeline",
    note: "No visible change — all work is internal",
    cells: [
      cell("partial", "Field-ops events only; no analytics yet"),
      cell("live"),
      cell("live"),
      cell("live"),
      cell("live"),
      cell("live"),
      cell("live"),
      cell("live"),
      cell("locked", AN_UNLOCK),
      cell("hidden", SV_HIDE),
      cell("internal", "Model training, evaluation & promotion happen here"),
    ],
  },
  {
    num: "4",
    name: "Analytics",
    note: "Full shelf metrics — the product everyone pictures",
    cells: [
      cell("live"),
      cell("live"),
      cell("live"),
      cell("live"),
      cell("live"),
      cell("live"),
      cell("live"),
      cell("live"),
      cell("live"),
      cell("live"),
      cell("internal", DQ_INT),
    ],
  },
];

export const CONDITIONS_HEADING = "Conditions & notes";

export type Condition = { kind: Readiness; text: string };

export const CONDITIONS: Condition[] = [
  {
    kind: "locked",
    text: "Catalog — unlocks when your catalog is digitised (Phase 2).",
  },
  {
    kind: "locked",
    text: "Analytics — unlocks when the first sessions are processed (Phase 4).",
  },
  {
    kind: "hidden",
    text: "Session Viewer — no nav entry; reached only by clicking a metric in Analytics.",
  },
  {
    kind: "partial",
    text: "Activity feed & Store Explorer run before analytics — they simply lack analytics-driven events.",
  },
];

export const DAY_ONE_PANEL = {
  kicker: "The whole point",
  title: "What the customer sees on day one",
  lede: "Phase 1 surfaces only. Everything below is live the moment master data is configured and captures begin.",
  laterHeading: "Present but not yet usable",
};

export type DayOneSurface = { name: string; kind: Extract<Readiness, "live" | "partial"> };

export const DAY_ONE: DayOneSurface[] = [
  { name: "Master Data", kind: "live" },
  { name: "Users & Journey plans", kind: "live" },
  { name: "Photo Quality", kind: "live" },
  { name: "Merchandiser Activity & Store Coverage", kind: "live" },
  { name: "App Images", kind: "live" },
  { name: "Activity feed", kind: "partial" },
  { name: "Store Explorer", kind: "partial" },
];

export type DayOneLaterSurface = {
  name: string;
  kind: Extract<Readiness, "locked" | "hidden" | "internal">;
};

export const DAY_ONE_LATER: DayOneLaterSurface[] = [
  { name: "Catalog", kind: "locked" },
  { name: "Analytics", kind: "locked" },
  { name: "Session Viewer", kind: "hidden" },
  { name: "Data Quality Studio", kind: "internal" },
];

export const PHASES_HEADING = "The four phases";

export const PHASES_SUBHEADING =
  "what we receive · what we do · what the customer sees · what advances them";

export const PHASE_FIELD_LABELS = {
  given: "Customer gives us",
  system: "In our system",
  sees: "Customer sees",
};

/** `dark` is the internal-only phase; `indigo` is the phase the product ships in. */
export type PhaseTheme = "light" | "dark" | "indigo";

export type Phase = {
  num: string;
  name: string;
  tag: string;
  theme: PhaseTheme;
  given: string;
  system: string;
  sees: string;
  triggerLabel: string;
  trigger: string;
};

export const PHASES: Phase[] = [
  {
    num: "1",
    name: "Onboarding",
    tag: "Phase 1 · setup",
    theme: "light",
    given:
      "Store list (1,847), field users (148) and journey plans — which merchandiser visits which store, when.",
    system:
      "Stores, users and plans configured; visit tasks pushed to the InfiShots app; photos begin arriving.",
    sees: "Master Data confirmation, the two CS reports (Photo Quality, and Merchandiser Activity & Store Coverage) and the activity feed.",
    triggerLabel: "Advances to Catalog when",
    trigger: "Store master table populated and first captures received.",
  },
  {
    num: "2",
    name: "Catalog",
    tag: "Phase 2 · digitise",
    theme: "light",
    given:
      "Product catalog master data — SKU names, pack shots, brand hierarchy and attributes.",
    system:
      "Catalog digitised — 121 SKUs (78 toothpaste, 43 toothbrush), brands and sub-categories mapped.",
    sees: "The Catalog section — category-by-category confirmation that products are set up.",
    triggerLabel: "Advances to AI pipeline when",
    trigger: "Catalog signed off and the training set is assembled.",
  },
  {
    num: "3",
    name: "AI pipeline",
    tag: "Phase 3 · internal only",
    theme: "dark",
    given:
      "Nothing new — uses the photos already captured and the digitised catalog.",
    system:
      "Model training, evaluation and promotion to production (Curation, InfiBrain, SEAM).",
    sees: "No change. The customer front-end is identical to the Catalog phase — this phase is never surfaced.",
    triggerLabel: "Advances to Analytics when",
    trigger: "First sessions are processed through to production.",
  },
  {
    num: "4",
    name: "Analytics",
    tag: "Phase 4 · the product",
    theme: "indigo",
    given: "Ongoing captures on the recurring journey plan.",
    system:
      "Sessions processed into shelf facts; OSA, Share of Shelf and MSL metrics computed.",
    sees: "Analytics hero metrics, Session Viewer behind every number, and the full map-based Store Explorer.",
    triggerLabel: "Steady state",
    trigger:
      "The recurring audit loop — new sessions refresh the metrics each cycle.",
  },
];
