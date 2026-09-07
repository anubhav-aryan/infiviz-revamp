import type { ModuleId } from "./module-matrix";

/**
 * What a board can hold.
 *
 * **Why these are presets and not a chart builder.** Every component in
 * `app/_charts/` is handed finished geometry — polyline point strings, pixel
 * plot boxes, pre-formatted value strings — all of it built ahead of time in
 * `_data`. Nothing in this app aggregates at render. So "pick any measure, pick
 * any chart type" would need a query engine and a geometry layer that do not
 * exist, and inventing them for a mockup would mean a second, parallel version
 * of every number the real modules already publish.
 *
 * Instead each entry here names a measure the four factory-driven modules
 * already precompute, plus which part of that view to draw. `metricViewFor`
 * resolves it at render, so a board widget shows exactly the figure its module
 * shows, and this file carries no data of its own.
 *
 * The consequence worth knowing: a board can only hold what a module already
 * publishes. Adding a widget for something new means teaching a module the
 * measure first — which is the right order anyway.
 */

/** Which part of a `MetricModuleView` a widget draws. */
export type WidgetKind =
  | "headline"
  | "trend"
  | "groupCards"
  | "brandTable"
  | "gapCards"
  | "donut";

export type BoardWidget = {
  id: string;
  label: string;
  /** One-line description, shown under the label in the catalogue. */
  blurb: string;
  /** Catalogue section. */
  group: string;
  /** Half-width unless the content needs the full row. */
  span: "half" | "full";
  kind: WidgetKind;
  module: ModuleId;
  measure: string;
};

/**
 * Grouped by the question they answer rather than by the module they come
 * from — a reader building a board is thinking "how are we doing on
 * availability", not "which PowerBI module owned this".
 */
export const WIDGET_GROUPS = [
  "Availability",
  "Share of shelf",
  "Space & compliance",
  "Revenue",
] as const;

export const BOARD_WIDGETS: BoardWidget[] = [
  /* ---------- Availability ---------- */
  {
    id: "osa-headline",
    label: "On-shelf availability",
    blurb: "Headline OSA with its month-on-month move",
    group: "Availability",
    span: "half",
    kind: "headline",
    module: "availability",
    measure: "osa",
  },
  {
    id: "osa-trend",
    label: "OSA trend",
    blurb: "Six months of on-shelf availability against target",
    group: "Availability",
    span: "half",
    kind: "trend",
    module: "availability",
    measure: "osa",
  },
  {
    id: "osa-gap",
    label: "OSA gap to target",
    blurb: "Where availability sits behind, by category",
    group: "Availability",
    span: "full",
    kind: "gapCards",
    module: "availability",
    measure: "osa",
  },
  {
    id: "msl-headline",
    label: "MSL availability",
    blurb: "Must-stock-list OSA headline",
    group: "Availability",
    span: "half",
    kind: "headline",
    module: "availability",
    measure: "msl",
  },
  {
    id: "msl-brands",
    label: "MSL by brand",
    blurb: "Must-stock availability, brand by brand",
    group: "Availability",
    span: "full",
    kind: "brandTable",
    module: "availability",
    measure: "msl",
  },

  /* ---------- Share of shelf ---------- */
  {
    id: "sos-headline",
    label: "Share of shelf",
    blurb: "Headline SOS with its month-on-month move",
    group: "Share of shelf",
    span: "half",
    kind: "headline",
    module: "category-management",
    measure: "sos",
  },
  {
    id: "sos-trend",
    label: "SOS trend",
    blurb: "Six months of share of shelf",
    group: "Share of shelf",
    span: "half",
    kind: "trend",
    module: "category-management",
    measure: "sos",
  },
  {
    id: "sos-categories",
    label: "SOS by category",
    blurb: "Share of shelf per category, with its move",
    group: "Share of shelf",
    span: "full",
    kind: "groupCards",
    module: "category-management",
    measure: "sos",
  },
  {
    id: "sof-donut",
    label: "Share of facings",
    blurb: "How facings split across the portfolio",
    group: "Share of shelf",
    span: "half",
    kind: "donut",
    module: "category-management",
    measure: "sof",
  },

  /* ---------- Space & compliance ---------- */
  {
    id: "planogram-headline",
    label: "Planogram compliance",
    blurb: "Headline compliance with its month-on-month move",
    group: "Space & compliance",
    span: "half",
    kind: "headline",
    module: "space",
    measure: "planogram",
  },
  {
    id: "planogram-trend",
    label: "Planogram trend",
    blurb: "Six months of planogram compliance against target",
    group: "Space & compliance",
    span: "half",
    kind: "trend",
    module: "space",
    measure: "planogram",
  },
  {
    id: "sequence-gap",
    label: "Sequence gap",
    blurb: "Where shelf sequence sits behind target",
    group: "Space & compliance",
    span: "full",
    kind: "gapCards",
    module: "space",
    measure: "sequence",
  },

  /* ---------- Revenue ---------- */
  {
    id: "pricing-headline",
    label: "Pricing compliance",
    blurb: "Headline pricing compliance",
    group: "Revenue",
    span: "half",
    kind: "headline",
    module: "revenue",
    measure: "pricing",
  },
  {
    id: "promotion-trend",
    label: "Promotion compliance trend",
    blurb: "Six months of promotion compliance",
    group: "Revenue",
    span: "half",
    kind: "trend",
    module: "revenue",
    measure: "promotion",
  },
];

export const WIDGET_BY_ID = new Map(BOARD_WIDGETS.map((w) => [w.id, w]));

/** The catalogue, grouped for the picker. Empty groups are dropped. */
export function widgetsByGroup(): { group: string; widgets: BoardWidget[] }[] {
  return WIDGET_GROUPS.map((group) => ({
    group,
    widgets: BOARD_WIDGETS.filter((w) => w.group === group),
  })).filter((entry) => entry.widgets.length > 0);
}
