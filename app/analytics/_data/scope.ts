import { STORES } from "@/app/_data/stores-geo";
import { supervisorFor } from "@/app/photo-quality/_data/photo-quality";
import { SESSION_STORES } from "@/app/session-viewer/_data/session-viewer";
import { lcg } from "@/app/_time/variants";
import { group } from "@/app/_format/num";
import { AVAIL_SERIES, DIM_SOURCE, ESTATE, LAST, VIS_SERIES } from "./spine";
import type { PersonaId } from "./module-matrix";

/**
 * What a persona is looking at.
 *
 * Until now every module rendered the same national figures for all four
 * personas — a category lead saw the whole portfolio, a regional lead saw no
 * region. A scope is the answer to "whose numbers are these": a region for the
 * regional and field personas, a category for the category persona, the country
 * for the executive.
 *
 * Scope travels in the query string (`?scope=mekong-delta`), never the path.
 * That is what keeps `generateStaticParams` and `dynamicParams = false` intact
 * — the routes are unchanged, and the default scope is dropped from the URL the
 * same way month and measure already are.
 *
 * A scope is deliberately **not** a filtered dataset. It is two numbers and a
 * caption: multipliers on the national percentage spines, and a share of the
 * national counts. Every module then applies them in its own vocabulary, so a
 * region reads as a region everywhere without any module holding its own copy
 * of the region list.
 */

export type ScopeKind = "national" | "region" | "category";

export type RegionScopeId =
  | "ho-chi-minh-city"
  | "south-east"
  | "mekong-delta"
  | "red-river-delta"
  | "central"
  | "north-highlands";

export type CategoryScopeId =
  | "toothpaste"
  | "toothbrush"
  | "mouthwash"
  | "kids-oral-care"
  | "whitening";

export type ScopeId = "national" | RegionScopeId | CategoryScopeId;

export type Scope = {
  id: ScopeId;
  kind: ScopeKind;
  /** The name as the fixtures spell it — "Mekong Delta", "Kids oral care". */
  label: string;
  /**
   * Multipliers on the national spines. Two of them because a region is not
   * uniformly better or worse: Ho Chi Minh City is well ahead on availability
   * and only slightly ahead on share of shelf, and a module that scaled both by
   * the same factor would overstate one of them.
   */
  factors: { osa: number; sos: number };
  /** Share of national counts — stores, sessions, photos, actions, team. */
  countShare: number;
  /** The scope line in the module header: "Mekong Delta · 300 stores". */
  caption: string;
  /** Region scopes only. */
  stores?: number;
  supervisor?: string;
};

/* ---------------------------------------------------------------- */
/* regions                                                           */
/* ---------------------------------------------------------------- */

const REGION_IDS: Record<string, RegionScopeId> = {
  "Ho Chi Minh City": "ho-chi-minh-city",
  "South East": "south-east",
  "Mekong Delta": "mekong-delta",
  "Red River Delta": "red-river-delta",
  Central: "central",
  "North Highlands": "north-highlands",
};

/**
 * Divisor for `countShare`.
 *
 * `spine.ts` requires per-region store counts to sum to `ESTATE.stores`
 * (1,412); `DIM_SOURCE.Region` sums to 1,582 and has done since it was
 * authored. Shares are taken against the dimension's own total so they sum to
 * exactly 1 — a region can never claim more of the estate than exists — while
 * captions quote the dimension's raw count, which is the number every other
 * screen already shows for that region. Reconciling the two fixtures is a
 * separate change.
 */
const REGION_STORE_TOTAL = DIM_SOURCE.Region.reduce(
  (sum, [, , , stores]) => sum + stores,
  0,
);

const REGION_SCOPES: Record<RegionScopeId, Scope> = Object.fromEntries(
  DIM_SOURCE.Region.map(([label, osa, , stores, sos]) => {
    const id = REGION_IDS[label];
    return [
      id,
      {
        id,
        kind: "region" as const,
        label,
        factors: {
          osa: +(osa / AVAIL_SERIES[LAST]).toFixed(4),
          sos: +(sos / VIS_SERIES[LAST]).toFixed(4),
        },
        countShare: +(stores / REGION_STORE_TOTAL).toFixed(4),
        caption: `${label} · ${group(stores)} stores`,
        stores,
        supervisor: supervisorFor(label),
      },
    ];
  }),
) as Record<RegionScopeId, Scope>;

export const REGION_SCOPE_IDS = Object.keys(REGION_SCOPES) as RegionScopeId[];

/* ---------------------------------------------------------------- */
/* categories                                                        */
/* ---------------------------------------------------------------- */

/**
 * The five categories every metric module already breaks itself down by.
 *
 * `osa` mirrors the `groups` facts in `availability.ts` and `skus` extends the
 * two counts `DIM_SOURCE.Category` publishes. They are authored here rather
 * than imported because the module configs import the factory and the factory
 * imports this file — reading them back would close a cycle.
 *
 * The factory does **not** use these: it derives a category's scale from each
 * module's own `groups` row, so a category-scoped headline reconciles exactly
 * with the group card the national view shows. These drive the bespoke modules,
 * which have no `groups` of their own.
 */
const CATEGORY_FACTS: [
  id: CategoryScopeId,
  label: string,
  osa: number,
  sos: number,
  countShare: number,
  skus: number,
][] = [
  ["toothpaste", "Toothpaste", 65.1, 40, 0.42, 78],
  ["toothbrush", "Toothbrush", 61.0, 36, 0.18, 43],
  ["mouthwash", "Mouthwash", 58.4, 34, 0.14, 31],
  ["kids-oral-care", "Kids oral care", 54.0, 31, 0.12, 26],
  ["whitening", "Whitening", 46.2, 28, 0.14, 34],
];

const CATEGORY_SCOPES: Record<CategoryScopeId, Scope> = Object.fromEntries(
  CATEGORY_FACTS.map(([id, label, osa, sos, countShare, skus]) => [
    id,
    {
      id,
      kind: "category" as const,
      label,
      factors: {
        osa: +(osa / AVAIL_SERIES[LAST]).toFixed(4),
        sos: +(sos / VIS_SERIES[LAST]).toFixed(4),
      },
      countShare,
      caption: `${label} · ${skus} SKUs`,
    },
  ]),
) as Record<CategoryScopeId, Scope>;

export const CATEGORY_SCOPE_IDS = CATEGORY_FACTS.map(([id]) => id);

/** Category label → scope id, for modules that hold category names not ids. */
export const CATEGORY_SCOPE_BY_LABEL: Record<string, CategoryScopeId> =
  Object.fromEntries(CATEGORY_FACTS.map(([id, label]) => [label, id]));

/* ---------------------------------------------------------------- */
/* the national scope, and the registry                              */
/* ---------------------------------------------------------------- */

/**
 * The identity scope. Its factors and share are exactly 1, which is what makes
 * the unscoped path provably unchanged: every module multiplies by them and
 * lands back on the figures it published before scoping existed.
 */
export const NATIONAL: Scope = {
  id: "national",
  kind: "national",
  label: "National",
  factors: { osa: 1, sos: 1 },
  countShare: 1,
  caption: `National · ${group(ESTATE.stores)} stores`,
};

export const SCOPES: Record<ScopeId, Scope> = {
  national: NATIONAL,
  ...REGION_SCOPES,
  ...CATEGORY_SCOPES,
};

/* ---------------------------------------------------------------- */
/* who may look at what                                              */
/* ---------------------------------------------------------------- */

export type ScopePicker = "none" | "region" | "category" | "supervisor";

/**
 * Each persona's vocabulary.
 *
 * A category lead owns one category and a regional lead owns one region, so
 * those are the only things they can be scoped to. The field persona picks a
 * region too, but the control names the supervisor rather than the region —
 * that is who a field lead thinks in terms of.
 */
export const PERSONA_SCOPES: Record<
  PersonaId,
  { kind: ScopeKind; options: ScopeId[]; defaultScope: ScopeId; picker: ScopePicker; label: string }
> = {
  exec: {
    kind: "national",
    options: ["national"],
    defaultScope: "national",
    picker: "none",
    label: "Scope",
  },
  regional: {
    kind: "region",
    options: REGION_SCOPE_IDS,
    defaultScope: "ho-chi-minh-city",
    picker: "region",
    label: "Region",
  },
  category: {
    kind: "category",
    options: CATEGORY_SCOPE_IDS,
    defaultScope: "toothpaste",
    picker: "category",
    label: "Category",
  },
  field: {
    kind: "region",
    options: REGION_SCOPE_IDS,
    defaultScope: "ho-chi-minh-city",
    picker: "supervisor",
    label: "Territory",
  },
};

/**
 * Resolve `?scope=` for a persona.
 *
 * Anything outside the persona's own vocabulary falls back to their default,
 * which is what makes switching persona safe: the switcher drops the parameter,
 * and a hand-edited or stale link resolves rather than rendering a category's
 * numbers under a regional lead's rail.
 */
export function scopeFor(persona: PersonaId, param: string | null | undefined): Scope {
  const config = PERSONA_SCOPES[persona];
  if (param && (config.options as string[]).includes(param)) {
    return SCOPES[param as ScopeId];
  }
  return SCOPES[config.defaultScope];
}

/** The label a picker shows for one option — supervisors for the field lead. */
export function scopeOptionLabel(picker: ScopePicker, scope: Scope): string {
  if (picker === "supervisor" && scope.supervisor) {
    return `${scope.supervisor} · ${scope.label}`;
  }
  return scope.label;
}

/* ---------------------------------------------------------------- */
/* the stores behind a region                                        */
/* ---------------------------------------------------------------- */

export type ScopeOutlet = {
  outlet: string;
  code: string;
  /** Multiplier on whichever module's authored outlet value this replaces. */
  skew: number;
  /** Session slug where evidence exists, `null` otherwise. */
  session: string | null;
};

/** Deterministic and stable per store — never `Math.random`. */
const hashOf = (value: string) => {
  let h = 7;
  for (let i = 0; i < value.length; i += 1) {
    h = (h * 31 + value.charCodeAt(i)) & 0x7fffffff;
  }
  return h;
};

const SESSION_SLUG_BY_NAME = new Map(
  SESSION_STORES.map(({ slug, visit }) => [visit.store, slug]),
);

/**
 * Eight stores per region, drawn from the geographic estate.
 *
 * Capped because a detail table is a sample, not an export — Ho Chi Minh City
 * has 56 stores and North Highlands has 5, and a table that swung between those
 * lengths would read as a bug. The cap is the same for every region so the
 * shape of the screen does not move when the scope does.
 */
export const OUTLETS_BY_REGION: Record<RegionScopeId, ScopeOutlet[]> =
  Object.fromEntries(
    REGION_SCOPE_IDS.map((id) => {
      const label = SCOPES[id].label;
      const stores = STORES.filter((store) => store.region === label).slice(0, 8);
      return [
        id,
        stores.map((store) => {
          const rand = lcg(hashOf(store.id));
          return {
            outlet: store.name,
            code: store.id,
            /* ±18%, so the region's stores spread around its own level rather
               than all landing on it. */
            skew: +(0.82 + rand() * 0.36).toFixed(4),
            session: SESSION_SLUG_BY_NAME.get(store.name) ?? null,
          };
        }),
      ];
    }),
  ) as Record<RegionScopeId, ScopeOutlet[]>;

/**
 * A region's stores grouped by the banner that owns them, capped the same way
 * as `OUTLETS_BY_REGION`. Retailer comes off the store record rather than being
 * read out of its name, so nothing can land under the wrong banner.
 */
export const RETAILERS_BY_REGION: Record<
  RegionScopeId,
  [retailer: string, stores: string[]][]
> = Object.fromEntries(
  REGION_SCOPE_IDS.map((id) => {
    const label = SCOPES[id].label;
    const grouped = new Map<string, string[]>();
    for (const store of STORES.filter((entry) => entry.region === label).slice(0, 8)) {
      const existing = grouped.get(store.retailer);
      if (existing) existing.push(store.name);
      else grouped.set(store.retailer, [store.name]);
    }
    return [id, [...grouped.entries()]];
  }),
) as Record<RegionScopeId, [string, string[]][]>;

/** Districts inside a region, with their share of its stores. */
export const DISTRICTS_BY_REGION: Record<RegionScopeId, [name: string, share: number][]> =
  Object.fromEntries(
    REGION_SCOPE_IDS.map((id) => {
      const label = SCOPES[id].label;
      const stores = STORES.filter((store) => store.region === label);
      const counts = new Map<string, number>();
      for (const store of stores) {
        counts.set(store.district, (counts.get(store.district) ?? 0) + 1);
      }
      const total = stores.length || 1;
      return [
        id,
        [...counts.entries()]
          .sort((a, b) => b[1] - a[1])
          .map(([name, count]) => [name, +(count / total).toFixed(4)] as [string, number]),
      ];
    }),
  ) as Record<RegionScopeId, [string, number][]>;

/* ---------------------------------------------------------------- */
/* what a category is made of                                        */
/* ---------------------------------------------------------------- */

/** `skew` multiplies the category's own level; `delta` is against last month. */
export type ScopeRow = [name: string, skew: number, delta: number];

/**
 * The brands inside each category.
 *
 * Authored, because the catalog cannot supply them: it carries twelve SKUs, all
 * toothpaste, across two categories. Toothpaste is absent from this map on
 * purpose — every module's own brand list already *is* the toothpaste range, so
 * scoping to it keeps those rows rather than replacing them with a paraphrase.
 */
export const CATEGORY_BRANDS: Partial<Record<CategoryScopeId, ScopeRow[]>> = {
  toothbrush: [
    ["Colgate SlimSoft", 1.14, 1.6],
    ["Colgate 360°", 1.05, 0.9],
    ["Colgate Extra Clean", 0.98, 0.2],
    ["Colgate ZigZag", 0.91, -0.7],
    ["Colgate Kids brush", 0.84, -1.4],
  ],
  mouthwash: [
    ["Plax Fresh Mint", 1.12, 1.3],
    ["Plax Peppermint", 1.02, 0.6],
    ["Colgate Total Mouthwash", 0.95, -0.2],
    ["Plax Zero Alcohol", 0.88, -1.1],
  ],
  "kids-oral-care": [
    ["Colgate Kids 3-5", 1.11, 1.1],
    ["Colgate Kids 0-2", 1.01, 0.4],
    ["Colgate Minions", 0.93, -0.6],
    ["Colgate Bubble Fruit", 0.86, -1.5],
  ],
  whitening: [
    ["Optic White Advanced", 1.16, 1.8],
    ["Optic White Charcoal", 1.03, 0.5],
    ["Optic White Purple", 0.92, -0.9],
    ["Colgate Whitening Salt", 0.85, -1.7],
  ],
};

/**
 * What replaces the five category cards when you are already inside a category.
 *
 * Toothpaste's four are the sub-categories `DIM_SOURCE` already publishes, so
 * they are derived rather than invented; the others are authored, since no
 * fixture breaks them down.
 */
export const CATEGORY_SEGMENTS: Record<CategoryScopeId, ScopeRow[]> = {
  toothpaste: DIM_SOURCE["Sub-category"].map(
    ([name, osa, delta]) => [name, +(osa / 65.1).toFixed(4), delta] as ScopeRow,
  ),
  toothbrush: [
    ["Soft bristle", 1.09, 1.2],
    ["Medium bristle", 1.0, 0.4],
    ["Charcoal bristle", 0.94, -0.5],
    ["Kids bristle", 0.87, -1.3],
  ],
  mouthwash: [
    ["Fresh mint", 1.1, 1.0],
    ["Herbal", 0.99, 0.3],
    ["Zero alcohol", 0.92, -0.8],
    ["Travel pack", 0.85, -1.6],
  ],
  "kids-oral-care": [
    ["Ages 0–2", 1.08, 0.9],
    ["Ages 3–5", 1.0, 0.2],
    ["Ages 6–9", 0.93, -0.7],
    ["Family pack", 0.86, -1.4],
  ],
  whitening: [
    ["Daily whitening", 1.12, 1.4],
    ["Intensive", 1.01, 0.5],
    ["Charcoal", 0.93, -0.6],
    ["Whitening pen", 0.84, -1.8],
  ],
};
