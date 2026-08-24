import { MODULES, modulePath, type ModuleId, type PersonaId, type TabId } from "./module-matrix";
import type { DimKey } from "./analytics";

/**
 * Where each overview card goes when you want the detail behind it.
 *
 * The overview is a curated read: every card is a figure someone else
 * assembled. This file is the answer to "assembled from what" — one editorial
 * statement per card, naming the module and tab that substantiates it.
 *
 * Kept out of `module-matrix.ts` deliberately. That file is the map of what
 * *exists* and is read by `generateStaticParams` on the server; this is a claim
 * about what explains what, and it changes on a different clock. The dependency
 * runs one way — this imports the matrix, never the reverse.
 */

export type DrillTarget = {
  module: ModuleId;
  tab: TabId;
  /**
   * Only when it differs from the module's default measure. See the note above
   * `DRILL` for why this is authored rather than derived.
   */
  measure?: string;
};

/**
 * One id per *card*, not per destination.
 *
 * Three cards point at `availability/oos` today. Collapsing them to one id
 * would make the map shorter and the audit impossible: the question this file
 * answers is "which cards have a way down, and where does each go", and three
 * cards sharing a destination is a fact worth being able to watch change.
 */
export type DrillId =
  | "priorities-exec"
  | "priorities-regional"
  | "priorities-category"
  | "priorities-field"
  | "sos-panels"
  | "osa-panels"
  | "ranked-measure"
  | "ranked-rows"
  | "band-movement"
  | "dumbbell"
  | "line-trend"
  | "heat-city-retailer"
  | "audit-coverage"
  | "facings-ribbon"
  | "who-has-shelf"
  | "whats-missing"
  | "msl-checklist"
  | "shelf-ribbon";

/**
 * `measure` is stated only where it differs from the module's default —
 * availability `osa`, category-management `sos`, revenue `pricing`, space
 * `planogram`.
 *
 * Authored rather than computed from `defaultMeasureId`: every module config
 * runs `precomputeModule()` at module scope, so importing one to check its
 * default would pull all four modules' precomputed view tables into the
 * *overview's* client bundle — where none of them are today — to decide whether
 * to print six characters. And the failure mode is cosmetic: `module-screen`
 * coerces an unrecognised or absent measure back to the default, so a stale
 * entry here renders correctly and merely looks untidy in the URL.
 */
export const DRILL: Record<DrillId, DrillTarget> = {
  /* Each persona's "Today's priorities" band goes wherever its own act lives. */
  "priorities-exec": { module: "availability", tab: "recommendations" },
  "priorities-regional": { module: "availability", tab: "analytics" },
  "priorities-category": { module: "availability", tab: "oos", measure: "msl" },
  "priorities-field": { module: "availability", tab: "actions" },

  /* The two category cards are the same component; they part company here. */
  "sos-panels": { module: "category-management", tab: "analytics" },
  "osa-panels": { module: "availability", tab: "analytics" },

  /* See `rankedDrill` — which of these two applies depends on the dimension. */
  "ranked-measure": { module: "availability", tab: "analytics" },
  "ranked-rows": { module: "availability", tab: "raw-data" },

  "band-movement": { module: "category-management", tab: "trend-analysis" },
  "dumbbell": { module: "availability", tab: "analytics" },
  "line-trend": { module: "availability", tab: "trend-analysis" },

  "heat-city-retailer": { module: "availability", tab: "trend-analysis" },
  /* The same route Merch Activity's "Audit State" section already points at —
     the two screens agree on where coverage is explained. */
  "audit-coverage": { module: "store-management", tab: "store-coverage" },

  "facings-ribbon": { module: "category-management", tab: "analytics" },
  "who-has-shelf": { module: "category-management", tab: "analytics" },
  "shelf-ribbon": { module: "category-management", tab: "analytics" },

  /* "Ranged, and not on the shelf" is precisely what the OOS table reports. */
  "whats-missing": { module: "availability", tab: "oos", measure: "msl" },
  "msl-checklist": { module: "availability", tab: "oos", measure: "msl" },
};

/**
 * The ranked list is the one card whose destination moves with its own control.
 *
 * A Brand or Category cut is a measure the Analytics tab draws directly; every
 * other cut — Region, Retailer, Store, City, Merchandiser, Store type — is a
 * row shape only Raw Data carries. Stated once here rather than three times in
 * the bodies: all three personas that draw this band share the rule, and
 * `DIM_OPTIONS` gives Brand and Category to exec alone, so it needs no persona.
 */
export function rankedDrill(dim: DimKey): DrillId {
  return dim === "Brand" || dim === "Category" ? "ranked-measure" : "ranked-rows";
}

/** The overview state a drill-down carries down with it. */
export type CarriedState = { f: string; d: string };

export const NO_CARRIED_STATE: CarriedState = { f: "", d: "" };

/**
 * Key order matches `KEPT` in `rail-controls.tsx`, so a drilled URL is
 * byte-identical to the one the rail produces for the same state. Two ways down
 * should not produce two different-looking URLs for one view.
 */
function withQuery(path: string, measure: string | undefined, carried: CarriedState): string {
  const query = new URLSearchParams();
  if (measure) query.set("measure", measure);
  if (carried.f) query.set("f", carried.f);
  if (carried.d) query.set("d", carried.d);
  const serialized = query.toString();
  return serialized ? `${path}?${serialized}` : path;
}

/** The href for one card's way down, carrying the overview's filters and date. */
export function drillHref(persona: PersonaId, id: DrillId, carried: CarriedState): string {
  const target = DRILL[id];
  return withQuery(modulePath(persona, target.module, target.tab), target.measure, carried);
}

/**
 * The same query appended to a path the caller already holds — the header's
 * "Detailed Dashboard" pill resolves its own destination from `railGroupsFor`.
 */
export function carriedHref(path: string, carried: CarriedState): string {
  return withQuery(path, undefined, carried);
}

/**
 * The `ModuleId` and `TabId` unions catch a typo; they cannot catch a real tab
 * on the wrong module. `category-management/oos` is the live trap — `oos` is a
 * tab, but only Availability has it — and with `dynamicParams = false` that
 * mistake is a 404 in production rather than a compile error. So fail loudly in
 * development instead.
 */
if (process.env.NODE_ENV !== "production") {
  for (const [id, target] of Object.entries(DRILL)) {
    const def = MODULES[target.module];
    if (!def.built || !def.tabs.includes(target.tab)) {
      throw new Error(
        `Drill target "${id}" points at ${target.module}/${target.tab}, which is not a built route. ` +
          `See DRILL in analytics/_data/drill.ts.`,
      );
    }
  }
}
