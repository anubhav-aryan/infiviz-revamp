import { StoreMap, type StatusStyle } from "@/app/_components/store-map/store-map";
import type { GeoStore } from "@/app/_data/stores-geo";
import styles from "@/app/_components/store-map/store-map.module.css";

/**
 * The ramp mirrors the legend rendered above the map in `explorer-view.tsx`.
 * Both read the same design tokens — the legend through its own inline
 * `var(--indigo-600)`, the markers through these module classes — so they can
 * no longer drift, which they could when the SVG hardcoded hex.
 */
const VISIT_RAMP: Record<string, StatusStyle> = {
  none: { className: styles.none, size: 9, label: "Not visited", layer: 0 },
  range: { className: styles.range, size: 9, label: "Visited in range", layer: 1 },
  today: { className: styles.today, size: 11, label: "Visited today", layer: 2 },
};

export function VietnamMap({ pins }: { pins: GeoStore[] }) {
  return (
    <StoreMap
      points={pins}
      statusKey="visit"
      ramp={VISIT_RAMP}
      height={520}
      ariaLabel={`Map of Vietnam showing ${pins.length} stores, coloured by whether they were visited today, visited in range, or not visited. Use the zoom buttons, or tab to a store for its details.`}
    />
  );
}
