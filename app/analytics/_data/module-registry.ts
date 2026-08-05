import type { MonthKey } from "@/app/_time/periods";
import { AVAILABILITY, AVAILABILITY_VIEWS } from "./availability";
import { CATEGORY_MANAGEMENT, CATEGORY_MANAGEMENT_VIEWS } from "./category-management";
import type { MetricModuleConfig, MetricModuleView } from "./metric-module";
import { REVENUE, REVENUE_VIEWS } from "./revenue";
import { SPACE, SPACE_VIEWS } from "./space";
import type { ModuleId } from "./module-matrix";

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
