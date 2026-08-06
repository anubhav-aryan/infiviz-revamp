import type { MonthKey } from "@/app/_time/periods";
import { AVAILABILITY, AVAILABILITY_VIEWS } from "./availability";
import { CATEGORY_MANAGEMENT, CATEGORY_MANAGEMENT_VIEWS } from "./category-management";
import {
  scopedViewFor,
  type MetricModuleConfig,
  type MetricModuleView,
} from "./metric-module";
import { REVENUE, REVENUE_VIEWS } from "./revenue";
import { SPACE, SPACE_VIEWS } from "./space";
import type { ModuleId } from "./module-matrix";
import type { Scope } from "./scope";

/**
 * Which config and precomputed views belong to which module id.
 *
 * The screen looks a module up here rather than importing one directly, so the
 * four measure modules share a single component. A module missing from this map
 * is one the factory does not drive — Perfect Store, ROI, Shelving,
 * Merchandiser and Store Management each have their own shape.
 */

export type MetricModuleEntry = {
  config: MetricModuleConfig;
  views: Record<string, Record<MonthKey, MetricModuleView>>;
};

export const METRIC_MODULES: Partial<Record<ModuleId, MetricModuleEntry>> = {
  "category-management": {
    config: CATEGORY_MANAGEMENT,
    views: CATEGORY_MANAGEMENT_VIEWS,
  },
  availability: { config: AVAILABILITY, views: AVAILABILITY_VIEWS },
  revenue: { config: REVENUE, views: REVENUE_VIEWS },
  space: { config: SPACE, views: SPACE_VIEWS },
};

/** One cache per module, so a scope built for Availability is kept for it. */
const SCOPE_CACHES = new Map<ModuleId, Map<string, MetricModuleView>>();

/**
 * The scoped view for a module, or `undefined` where the factory does not drive
 * it. This is the only way the screen reads a metric module — it never touches
 * `views` directly, so there is one place that knows how a scope is resolved.
 */
export function metricViewFor(
  module: ModuleId,
  scope: Scope,
  measureId: string,
  period: MonthKey,
): MetricModuleView | undefined {
  const entry = METRIC_MODULES[module];
  if (!entry) return undefined;
  let cache = SCOPE_CACHES.get(module);
  if (!cache) {
    cache = new Map();
    SCOPE_CACHES.set(module, cache);
  }
  return scopedViewFor(entry.config, entry.views, scope, measureId, period, cache);
}
