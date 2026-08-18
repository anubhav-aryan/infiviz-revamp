import { canon } from "@/app/_filters/registry";
import type { Accessors } from "@/app/_filters/model";
import type { ActivityRow, OverdueRow } from "./merch-activity";

/** See the note in `photo-quality/_data/accessors.ts`. */
export const ACTIVITY_ACCESSORS: Accessors<ActivityRow> = {
  merchandiser: (row) => canon("merchandiser", row.mrch),
  region: (row) => canon("region", row.region),
};

export const OVERDUE_ACCESSORS: Accessors<OverdueRow> = {
  merchandiser: (row) => canon("merchandiser", row.mrch),
  region: (row) => canon("region", row.region),
  retailer: (row) => canon("retailer", row.retailer),
  store: (row) => canon("store", row.store),
};

export const COVERAGE_REGION_ACCESSORS: Accessors<{ name: string }> = {
  region: (row) => canon("region", row.name),
};
