import type { IconName } from "@/app/_components/icon";

/**
 * The map of what exists: every persona, the modules they see, and the tabs
 * inside each one.
 *
 * This is the single source for three things that must never disagree —
 * `generateStaticParams` (so every combination is prerendered), the section
 * rail (so a persona only sees modules that are theirs), and the coverage
 * checklist (so "nothing from PowerBI is missing" is mechanically verifiable
 * rather than asserted).
 *
 * A module appearing under more than one persona is deliberate: availability is
 * a category lead's problem and a field supervisor's problem, and both should
 * find it where they look. The content is the same component; what differs is
 * the rows it is given and which tabs are relevant.
 */

export type PersonaId = "exec" | "regional" | "category" | "field";

export type ModuleId =
  | "perfect-store"
  | "category-management"
  | "availability"
  | "revenue"
  | "space"
  | "roi"
  | "shelving"
  | "merchandiser"
  | "store-management";

export type TabId =
  | "analytics"
  | "gap-analysis"
  | "actions"
  | "merchandising-impact"
  | "trend-analysis"
  | "oos"
  | "raw-data"
  | "recommendations"
  | "attendance"
  | "photo-quality"
  | "store-coverage"
  | "category-coverage"
  | "store-standardisation";

export const PERSONAS: { id: PersonaId; label: string; blurb: string }[] = [
  { id: "exec", label: "Executive", blurb: "Where to put national attention" },
  { id: "regional", label: "Regional", blurb: "Which stores and cities to visit" },
  { id: "category", label: "Category", blurb: "Which brands and SKUs to fix" },
  { id: "field", label: "Field", blurb: "Who does what tomorrow" },
];

export const TAB_LABELS: Record<TabId, string> = {
  analytics: "Analytics",
  "gap-analysis": "Gap Analysis",
  actions: "Actions",
  "merchandising-impact": "Merchandising Impact",
  "trend-analysis": "Trend Analysis",
  oos: "Out of stock",
  "raw-data": "Raw Data",
  recommendations: "Recommendations",
  attendance: "Attendance",
  "photo-quality": "Photo Quality",
  "store-coverage": "Store Coverage",
  "category-coverage": "Category Coverage",
  "store-standardisation": "Store Standardisation",
};

export type ModuleDef = {
  id: ModuleId;
  label: string;
  /** Section-rail grouping. */
  group: string;
  icon: IconName;
  blurb: string;
  tabs: TabId[];
  /**
   * Whether this module has a screen yet. Unbuilt ones still appear in the rail
   * — inert, the same treatment Master Data gives its undesigned sub-surfaces —
   * so the rail is an honest map of the section rather than hiding what is
   * coming. They generate no routes until they are real.
   */
  built?: boolean;
};

/** The seven-tab shape the four measure modules share. */
/* `recommendations` sits after `actions` deliberately: Actions reports what was
   already raised and closed, Recommendations proposes what to do next. Reading
   them in that order is the difference between a report and a plan. */
const MEASURE_TABS: TabId[] = [
  "analytics",
  "gap-analysis",
  "actions",
  "recommendations",
  "merchandising-impact",
  "trend-analysis",
  "raw-data",
];

export const MODULES: Record<ModuleId, ModuleDef> = {
  "perfect-store": {
    id: "perfect-store",
    label: "Perfect Store",
    group: "Overview",
    icon: "check-circle-2",
    blurb: "One score per store, and its four components",
    tabs: ["analytics"],
    built: true,
  },
  "category-management": {
    id: "category-management",
    label: "Category Management",
    group: "Shelf & space",
    icon: "layout-grid",
    blurb: "Share of shelf, gaps and actions",
    tabs: MEASURE_TABS,
    built: true,
  },
  space: {
    id: "space",
    label: "Space Management",
    group: "Shelf & space",
    icon: "boxes",
    blurb: "Planogram compliance",
    tabs: ["analytics", "gap-analysis", "actions", "trend-analysis", "raw-data"],
    built: true,
  },
  shelving: {
    id: "shelving",
    label: "Shelving",
    group: "Shelf & space",
    icon: "list",
    blurb: "Brand, format and flavour blocks",
    tabs: ["analytics"],
    built: true,
  },
  availability: {
    id: "availability",
    label: "Availability",
    group: "Availability & revenue",
    icon: "package",
    blurb: "On-shelf availability and out of stock",
    /* Spelled out rather than sliced from `MEASURE_TABS`: a positional slice
       silently changes meaning the moment a tab is inserted upstream, which is
       exactly what happened when Recommendations was added. */
    tabs: [
      "analytics",
      "gap-analysis",
      "actions",
      "recommendations",
      "merchandising-impact",
      "oos",
      "trend-analysis",
      "raw-data",
    ],
    built: true,
  },
  revenue: {
    id: "revenue",
    label: "Revenue Management",
    group: "Availability & revenue",
    icon: "target",
    blurb: "Pricing and promotion compliance",
    tabs: MEASURE_TABS,
    built: true,
  },
  roi: {
    id: "roi",
    label: "ROI",
    group: "Commercial",
    icon: "trending-up",
    blurb: "Revenue impact, uplift and payout savings",
    tabs: ["analytics"],
    built: true,
  },
  merchandiser: {
    id: "merchandiser",
    label: "Merchandiser Management",
    group: "Field execution",
    icon: "users",
    blurb: "Attendance, PJP adherence and photo quality",
    tabs: ["attendance", "photo-quality", "raw-data"],
    built: true,
  },
  "store-management": {
    id: "store-management",
    label: "Store Management",
    group: "Field execution",
    icon: "store",
    blurb: "Coverage and store standardisation",
    tabs: ["store-coverage", "category-coverage", "store-standardisation"],
    built: true,
  },
};

/**
 * Which modules each persona sees.
 *
 * Every persona sees every module. This was a hand-authored allow-list per
 * persona, on the rule that a module belongs to whoever it changes a decision
 * for — which reads well until you are an executive who wants to look at the
 * shelving blocks, or a field supervisor asked about a category's revenue, and
 * the rail simply does not offer it. Worse, switching persona while reading a
 * module the next persona did not "own" bounced you to their landing screen
 * without saying why.
 *
 * Nothing in the data layer was ever persona-aware, so this cost nothing to
 * open: `ModuleScreen` resolves persona to a *scope* and every module builds
 * from that, so the modules a persona could not reach were always able to
 * render for them. What the persona still decides is the scope — national, a
 * region, or a category — which is the difference that was doing the real work
 * all along.
 *
 * Derived from `MODULES` rather than listed four times, so a new module appears
 * for everyone and cannot be forgotten in one of the four lists.
 */
export const PERSONA_MODULES: Record<PersonaId, ModuleId[]> = Object.fromEntries(
  PERSONAS.map((persona) => [persona.id, Object.keys(MODULES) as ModuleId[]]),
) as Record<PersonaId, ModuleId[]>;

/**
 * The order rail groups appear in, for every persona.
 *
 * Groups used to fall out of whichever module happened to be listed first,
 * which put "Shelf & space" at the top for a category lead and at the bottom
 * for a field supervisor. The rail is the same map wherever you stand in the
 * hierarchy; only its contents change.
 */
export const GROUP_ORDER = [
  "Overview",
  "Shelf & space",
  "Availability & revenue",
  "Commercial",
  "Field execution",
];

export const PERSONA_IDS = PERSONAS.map((persona) => persona.id);

export function modulesFor(persona: PersonaId): ModuleDef[] {
  return PERSONA_MODULES[persona].map((id) => MODULES[id]);
}

/** Rail groups, in the order they should appear, for one persona. */
export function railGroupsFor(persona: PersonaId) {
  const groups: { label: string; items: ModuleDef[] }[] = [];
  for (const def of modulesFor(persona)) {
    const existing = groups.find((entry) => entry.label === def.group);
    if (existing) existing.items.push(def);
    else groups.push({ label: def.group, items: [def] });
  }
  return groups.sort(
    (a, b) => GROUP_ORDER.indexOf(a.label) - GROUP_ORDER.indexOf(b.label),
  );
}

/**
 * Where a persona lands. Kept separate from the rail's order so re-sorting the
 * rail cannot silently change which module someone opens on.
 */
export function landingModule(persona: PersonaId): ModuleDef {
  return MODULES[PERSONA_MODULES[persona][0]];
}

export const modulePath = (persona: PersonaId, module: ModuleId, tab: TabId) =>
  `/analytics/${persona}/${module}/${tab}`;

/**
 * Back to the curated overview, in the persona you were reading as.
 *
 * `/analytics` reads persona from `?persona=`, omitted for the exec default —
 * the same rule `analytics.tsx`'s own `toQuery` follows, so this link lands
 * exactly where the "Detailed Dashboard" link on that page would have sent you
 * back from.
 *
 * Lives here rather than in the route because the module screen's breadcrumb
 * needs it too, and two copies of a routing rule is how they drift.
 */
export function overviewPath(persona: PersonaId): string {
  return persona === "exec" ? "/analytics" : `/analytics?persona=${persona}`;
}

/**
 * Every prerenderable combination. `generateStaticParams` reads this, so the
 * built route list is exactly the matrix — nothing reachable is unbuilt, and
 * nothing built is unreachable.
 */
export function allRoutes(): { persona: PersonaId; module: ModuleId; tab: TabId }[] {
  const out: { persona: PersonaId; module: ModuleId; tab: TabId }[] = [];
  for (const persona of PERSONA_IDS) {
    for (const def of modulesFor(persona)) {
      if (!def.built) continue;
      for (const tab of def.tabs) {
        out.push({ persona, module: def.id, tab });
      }
    }
  }
  return out;
}
