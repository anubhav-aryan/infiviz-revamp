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
const MEASURE_TABS: TabId[] = [
  "analytics",
  "gap-analysis",
  "actions",
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
    tabs: [...MEASURE_TABS.slice(0, 4), "oos", "trend-analysis", "raw-data"],
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
 * Which modules each persona sees, in rail order.
 *
 * Assignment rule: a module belongs to the persona whose decision it changes.
 * Overlap is intentional and listed explicitly rather than derived, so a change
 * here is a visible change to someone's job rather than a side effect.
 */
export const PERSONA_MODULES: Record<PersonaId, ModuleId[]> = {
  /* Owns the national P&L, so pricing compliance is theirs as much as
     availability is. */
  exec: [
    "perfect-store",
    "roi",
    "category-management",
    "availability",
    "revenue",
    "store-management",
  ],
  /* Owns the programme's return inside one region, which is why ROI is here
     and not only at the top. */
  regional: [
    "perfect-store",
    "availability",
    "revenue",
    "space",
    "roi",
    "merchandiser",
    "store-management",
  ],
  category: [
    "category-management",
    "availability",
    "revenue",
    "space",
    "shelving",
    "store-management",
  ],
  /* Category Management is gone: which brands to range is a category lead's
     decision, and a supervisor cannot act on it tomorrow. */
  field: ["perfect-store", "availability", "merchandiser", "store-management"],
};

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
