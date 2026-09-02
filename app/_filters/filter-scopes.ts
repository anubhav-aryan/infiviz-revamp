import type { ActiveFilter } from "./model";
import type { DimId } from "./registry";

/**
 * Which dimensions each screen offers, and therefore which screens show the bar
 * at all.
 *
 * A screen appears here only if the filters mean something on it. Catalog
 * filters SKU master data (packshot, trained, ownership), Master data is
 * configuration and Tickets is a work queue — "what defines a session" is not a
 * question any of them is asking, so they get no bar and its absence is itself
 * information.
 *
 * A dimension appears in a scope only if that screen can answer for it, or is
 * about it. Offering a Brand filter on Photo quality would be offering a
 * control that quietly does nothing: `narrowFilters` would have every table
 * abstain from it.
 */

/**
 * Only the two dashboards. The bar answers "what slice of the business am I
 * looking at", which is a question Activity and Analytics are asking and the
 * other screens are not: Store Explorer is a store list with its own filters,
 * Session Viewer is one capture, and the two reports are month-scoped.
 * Putting the bar on those was offering a control that belonged to a different
 * question.
 */
export type FilterScopeId = "activity" | "analytics" | "session-viewer";

/**
 * The three session-defining defaults the bar always draws, in row order.
 * Every scope carries them, which is what makes them *default* rather than a
 * per-screen choice — and their fixed count is what guarantees the row cannot
 * overflow.
 */
const DEFAULTS: DimId[] = ["placementType", "category", "retailer"];

export const FILTER_SCOPES: Record<FilterScopeId, DimId[]> = {
  activity: [...DEFAULTS, "region", "storeType"],
  /* Menu order is this array's order (`catalogueFor` preserves it), so this is
     a priority list: brand sits with the defaults at the top, store type last. */
  /**
   * The Session Viewer index draws its own chip row rather than the bar — see
   * `BARLESS_SCOPES` — but shares the state, so a slice chosen while browsing
   * visits is the slice the dashboards open on.
   */
  "session-viewer": ["retailer", "region", "placement", "category", "store", "storeType"],
  analytics: [
    ...DEFAULTS,
    "brand",
    "region",
    "store",
    "merchandiser",
    "subCategory",
    "city",
    "sku",
    "storeType",
  ],
};

/**
 * What a scope opens on when the user has no saved selection.
 *
 * "All categories" is not a neutral default — it is the case that produces a
 * blended number describing no shelf anyone can point at, which is the whole
 * complaint behind the share-of-shelf rework. So the dashboards open scoped to
 * the largest category by volume and let the user widen from there, rather than
 * opening on an average and leaving them to discover it was meaningless.
 *
 * Only the two dashboard scopes seed. The operational screens are about
 * coverage and capture rather than category performance, and narrowing them on
 * arrival would hide work rather than focus it.
 */
export const SCOPE_SEEDS: Partial<Record<FilterScopeId, ActiveFilter[]>> = {
  analytics: [{ dim: "category", value: "toothpaste" }],
  activity: [{ dim: "category", value: "toothpaste" }],
};

export function isFilterScope(value: string): value is FilterScopeId {
  return value in FILTER_SCOPES;
}

/**
 * Scopes whose date lives in the URL path rather than in `?d=`. Empty now that
 * the month-routed reports no longer carry the bar; kept because the provider
 * still takes the flag and the reports are the obvious candidates if it ever
 * goes back on them.
 */
export const DATE_IN_PATH: ReadonlySet<FilterScopeId> = new Set<FilterScopeId>();

/**
 * Scopes that mount the provider but draw no bar.
 *
 * Store Explorer already has a chip row and an Add-filter menu built from this
 * same registry; a bar above them would be a second copy of the same control.
 * It joins the shared state so a slice chosen there is the slice the dashboards
 * open on — the sharing is the point, not the chrome.
 */
/* Empty since Store Explorer was retired — it was the one scope that shared
   the filter state without drawing a bar. Kept because the rule it encodes
   (a scope may opt out of the bar) is still how `FilterRegion` decides. */
export const BARLESS_SCOPES: ReadonlySet<FilterScopeId> = new Set<FilterScopeId>([
  "session-viewer",
]);
