import { canon } from "@/app/_filters/registry";
import type { Accessors } from "@/app/_filters/model";
import type { RejectedSession, WorstRow } from "./photo-quality";

/**
 * What the report's row-level tables can be filtered by. Everything else the
 * global bar offers — photo type, category, retailer — has no field on these
 * rows, so `narrowFilters` abstains and the figure carries an "unfiltered" mark
 * instead of quietly emptying.
 */
export const WORST_ACCESSORS: Accessors<WorstRow> = {
  merchandiser: (row) => canon("merchandiser", row.mrch),
  region: (row) => canon("region", row.region),
};

export const REJECTED_ACCESSORS: Accessors<RejectedSession> = {
  store: (row) => canon("store", row.store),
};

export const REGION_ACCESSORS: Accessors<{ name: string }> = {
  region: (row) => canon("region", row.name),
};
