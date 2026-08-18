import { MODULES, type ModuleId } from "@/app/analytics/_data/module-matrix";

/**
 * What a client's dashboard exposes, and how each metric is drawn.
 *
 * **The constraint that shapes this whole file: configurable presentation, not
 * configurable computation.** A PDM chooses which metrics a client sees and
 * which chart type each uses. They cannot change how a number is calculated,
 * because that is exactly where two clients end up with two different answers
 * to the same question. Everything here selects from what the platform already
 * computes; nothing here defines a measure.
 *
 * **Staging and published are separate on purpose.** A PDM works against the
 * full analytics for their account, and a half-finished selection must never
 * reach the client mid-edit. So edits land in staging, a preview renders from
 * staging, and publishing is a deliberate act that copies staging over the
 * published set.
 */

/** Only the shapes the platform can actually draw a metric with. */
export type ChartKind = "trend" | "columns" | "donut" | "gauge" | "matrix" | "table";

export const CHART_KINDS: { id: ChartKind; label: string; note: string }[] = [
  { id: "trend", label: "Trend line", note: "Movement over the six-month window" },
  { id: "columns", label: "Grouped columns", note: "Actual against target" },
  { id: "donut", label: "Donut", note: "Own share versus competition" },
  { id: "gauge", label: "Gauge", note: "One figure against its target" },
  { id: "matrix", label: "Matrix", note: "Store by brand, coloured by movement" },
  { id: "table", label: "Table", note: "The rows behind the number" },
];

export type MetricExposure = {
  moduleId: ModuleId;
  label: string;
  /** Whether the client sees this metric at all. */
  exposed: boolean;
  chart: ChartKind;
};

export type ExposureSet = Record<string, MetricExposure>;

/** Modules the factory drives, plus the bespoke ones — everything configurable. */
const CONFIGURABLE = (Object.keys(MODULES) as ModuleId[]).filter(
  (id) => MODULES[id].built,
);

function defaults(): ExposureSet {
  const out: ExposureSet = {};
  for (const id of CONFIGURABLE) {
    out[id] = {
      moduleId: id,
      label: MODULES[id].label,
      // Everything on by default; a PDM narrows rather than starts from nothing.
      exposed: true,
      chart: "trend",
    };
  }
  return out;
}

export const DEFAULT_EXPOSURE = defaults();

export const STORAGE_KEY = "infiviz:admin:exposure";

export type ExposureState = {
  staged: ExposureSet;
  published: ExposureSet;
};

export const INITIAL_STATE: ExposureState = {
  staged: defaults(),
  published: defaults(),
};

/** Which metrics differ between staging and what the client currently sees. */
export function pendingChanges(state: ExposureState): string[] {
  return Object.keys(state.staged).filter((id) => {
    const a = state.staged[id];
    const b = state.published[id];
    return !b || a.exposed !== b.exposed || a.chart !== b.chart;
  });
}
