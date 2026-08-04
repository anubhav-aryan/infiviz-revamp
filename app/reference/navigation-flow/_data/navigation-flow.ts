/**
 * Content for the "Platform navigation flow" reference poster, transcribed
 * verbatim from the design doc. The poster is a static document — nothing here
 * is fetched, derived or filtered.
 */

export const HEADER = {
  eyebrow: "InfiViz · reference",
  title: "Platform navigation flow",
  lede: "How the surfaces connect. Two detail pages are each reachable by exactly one path — Session Viewer only from Analytics, App Images only from Store Explorer — and those paths never cross.",
};

export const ENTRY = {
  kicker: "Entry",
  name: "Landing page",
  caption: "Activity feed — what's happening in the field",
};

/** The user question each of the two branches off the landing page answers. */
export const BRANCH_INTENT = {
  experiences: "“what's happening now?”",
  configured: "“what's configured?”",
};

export type TerminalPage = {
  /** Sits on the arrow into the detail page, naming the intent that path serves. */
  intent: string;
  name: string;
  caption: string;
  entryPill: string;
};

export type Experience = {
  name: string;
  caption: string;
  /** Only Analytics and Store Explorer lead onward; Activity is the home feed. */
  terminal: TerminalPage | null;
  note: string | null;
};

export const EXPERIENCES_HEADING = "Three top-level experiences";

export const EXPERIENCES: Experience[] = [
  {
    name: "Activity",
    caption: "The landing page",
    terminal: null,
    note: "No outbound detail path — it's the home feed.",
  },
  {
    name: "Analytics",
    caption: "Shelf metrics",
    terminal: {
      intent: "“why is this number low?”",
      name: "Session Viewer",
      caption: "Terminal detail page",
      entryPill: "Only from Analytics",
    },
    note: null,
  },
  {
    name: "Store Explorer",
    caption: "Visits on a map",
    terminal: {
      intent: "“what did we shoot today?”",
      name: "App Images",
      caption: "Terminal detail page",
      entryPill: "Only from Store Explorer",
    },
    note: null,
  },
];

export const EXPERIENCES_FOOTNOTE =
  "Two one-way paths that never cross · Analytics → Session Viewer · Store Explorer → App Images · raw photos carry no recognition overlay.";

export const CONFIGURED_HEADING = "Configured surfaces · reachable from landing";

export type ConfigNode = {
  name: string;
  phase: string;
  /** Phase 1 nodes read indigo; anything later reads amber. */
  phaseOne: boolean;
};

export const CONFIG_NODES: ConfigNode[] = [
  { name: "Master data", phase: "Phase 1", phaseOne: true },
  { name: "Photo quality", phase: "Phase 1", phaseOne: true },
  {
    name: "Merchandiser activity & store coverage",
    phase: "Phase 1",
    phaseOne: true,
  },
  { name: "Catalog", phase: "Phase 2", phaseOne: false },
];

export const CONFIGURED_FOOTNOTE =
  "Each appears only once its phase's data is populated (see the readiness map).";

export const OPEN_QUESTION = {
  glyph: "?",
  name: "Data Quality Studio",
  // Split so the emphasis the design sets in <b> survives transcription.
  body: {
    before: "Internal tool. Where it sits in this structure is ",
    emphasis: "still undecided",
    after: " — shown here as an open question, not a guess.",
  },
};

export type LegendVariant =
  | "entry"
  | "experience"
  | "terminal"
  | "undecided"
  | "intent";

export type LegendEntry = { variant: LegendVariant; label: string };

export const LEGEND: LegendEntry[] = [
  { variant: "entry", label: "Entry" },
  { variant: "experience", label: "Top-level experience" },
  { variant: "terminal", label: "Terminal detail page (one entry only)" },
  { variant: "undecided", label: "Placement undecided" },
  { variant: "intent", label: "User intent the path serves" },
];

/** The intent legend entry is swatched with a miniature intent pill. */
export const LEGEND_INTENT_SAMPLE = "“…”";
