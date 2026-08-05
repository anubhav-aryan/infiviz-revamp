"use client";

import { StoreMap, type StatusStyle } from "./store-map/store-map";
import { STORES } from "@/app/_data/stores-geo";
import styles from "./store-map/store-map.module.css";

/**
 * `"use client"` because Leaflet is browser-only. A Server Component can render
 * a Client Component directly, so `merch-activity-report.tsx` needs no change.
 *
 * `STORES` is imported here rather than passed down as a prop: as a prop it
 * would be serialised into the RSC payload of all seven merch-activity pages,
 * where importing it puts the data in one shared client chunk instead.
 */

/** Matches the legend in `merch-activity-report.tsx`. */
const COVERAGE_RAMP: Record<string, StatusStyle> = {
  notyet: { className: styles.notyet, size: 9, label: "Not visited", layer: 0 },
  overdue: { className: styles.overdue, size: 10, label: "Overdue", layer: 1 },
  covered: { className: styles.covered, size: 9, label: "Covered", layer: 2 },
};

export function CoverageMap() {
  return (
    <StoreMap
      points={STORES}
      statusKey="coverage"
      ramp={COVERAGE_RAMP}
      height={440}
      ariaLabel="Map of Vietnam showing covered, overdue and not-yet-visited stores. Use the zoom buttons, or tab to a store for its details."
    />
  );
}
