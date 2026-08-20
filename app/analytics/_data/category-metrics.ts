import { AVAIL_SERIES, DIM_SOURCE, LAST, VIS_SERIES } from "./spine";

/**
 * Share of shelf **and on-shelf availability**, per category — the single
 * source of truth for both.
 *
 * **Why this file exists.** SOS used to be authored in three places that
 * disagreed. `DIM_SOURCE.Category` and `CATEGORY_FACTS` both said Toothpaste
 * was 40; `CATEGORY_MANAGEMENT.groups` said 49.5. Worse, neither set
 * weight-averaged to the 38.7 the platform publishes nationally — the first
 * came to 35.68, the second to 39.88 — so scoping to a category and reading the
 * national number gave two answers that could not both be true.
 *
 * That is the arithmetic behind the meeting's complaint. Averaging share of
 * shelf across categories produces a figure that describes nothing, and the
 * spread here is the proof: 19.6% on mouthwash against 59.7% on whitening. The
 * blended 38.7 is not a fact about any shelf anyone can point at.
 *
 * **The rule this file enforces.** Per-category values weight-average — by the
 * same `countShare` the scope model already authors — back to the national
 * series' last value. So a category panel and the national headline are
 * provably the same measurement at two levels of aggregation, rather than two
 * unrelated numbers that happen to sit on one screen.
 *
 * Nothing may author a per-category SOS anywhere else. Read `CATEGORY_SOS`.
 */

export type CategoryMetrics = {
  /** Matches `CategoryScopeId` in `scope.ts` and the `groups` label in the modules. */
  id: string;
  label: string;
  /** July's share of shelf for this category, in points. */
  sos: number;
  /** July's on-shelf availability for this category, in points. */
  osa: number;
  /** Share of audited stores carrying the category. Sums to 1. */
  countShare: number;
  /** Month-on-month movement in share of shelf. */
  delta: number;
  /** Month-on-month movement in availability. */
  osaDelta: number;
};

/** @deprecated Kept so existing imports of the old name still compile. */
export type CategorySos = CategoryMetrics;

/**
 * Authored so that `Σ(sos × countShare) = VIS_SERIES[LAST]` — see the assertion
 * below, which is what stops a future edit from quietly reintroducing the
 * disagreement. Toothpaste carries the reconciliation because it is the
 * flagship and the largest share; the other four keep the spread the modules
 * already published.
 */
/**
 * `osa` had the same defect `sos` did: the values authored in `scope.ts` and
 * `availability.ts` (65.1 / 61.0 / 58.4 / 54.0 / 46.2) weight-averaged to 59.4
 * while the platform published 63.8, so a category panel and the headline were
 * describing different populations. Every row is scaled by the same 1.07324
 * rather than loading the whole correction onto the flagship — the error came
 * from the set, so the set absorbs it, and the ordering and spread survive.
 */
export const CATEGORY_SOS: CategoryMetrics[] = [
  { id: "toothpaste", label: "Toothpaste", sos: 46.7, osa: 69.9, countShare: 0.42, delta: -2.08, osaDelta: 1.2 },
  { id: "toothbrush", label: "Toothbrush", sos: 21.3, osa: 65.5, countShare: 0.18, delta: -0.58, osaDelta: 0.5 },
  { id: "mouthwash", label: "Mouthwash", sos: 19.6, osa: 62.7, countShare: 0.14, delta: -0.05, osaDelta: -0.3 },
  { id: "kids-oral-care", label: "Kids oral care", sos: 34.6, osa: 58.0, countShare: 0.12, delta: 0.47, osaDelta: -1.1 },
  { id: "whitening", label: "Whitening", sos: 59.7, osa: 49.6, countShare: 0.14, delta: -1.14, osaDelta: -2.4 },
];

/** The canonical name, now that the table carries two metrics. */
export const CATEGORY_METRICS = CATEGORY_SOS;

export const SOS_BY_LABEL = new Map(CATEGORY_SOS.map((row) => [row.label, row]));
export const SOS_BY_ID = new Map(CATEGORY_SOS.map((row) => [row.id, row]));

const blended = (pick: (row: CategoryMetrics) => number) =>
  +CATEGORY_SOS.reduce((total, row) => total + pick(row) * row.countShare, 0).toFixed(1);

/** The blended national figures, *derived* rather than quoted. */
export const NATIONAL_SOS = blended((row) => row.sos);
export const NATIONAL_OSA = blended((row) => row.osa);

/**
 * The identity this file exists to hold. A drift of more than a tenth means
 * someone edited a category without rebalancing, and the national number on
 * every other screen is now a different measurement from these panels.
 */
if (Math.abs(NATIONAL_SOS - VIS_SERIES[LAST]) > 0.1) {
  throw new Error(
    `Per-category SOS weights to ${NATIONAL_SOS} but the national series ends at ` +
      `${VIS_SERIES[LAST]}. Rebalance CATEGORY_METRICS — see category-metrics.ts.`,
  );
}

if (Math.abs(NATIONAL_OSA - AVAIL_SERIES[LAST]) > 0.1) {
  throw new Error(
    `Per-category OSA weights to ${NATIONAL_OSA} but the national series ends at ` +
      `${AVAIL_SERIES[LAST]}. Rebalance CATEGORY_METRICS — see category-metrics.ts.`,
  );
}

/**
 * `spine.ts` repeats these two values inside `DIM_SOURCE.Category` because it
 * cannot import this module without a cycle. This is the check that keeps the
 * copy honest.
 */
for (const [label, osa, , , sos] of DIM_SOURCE.Category) {
  const canonical = SOS_BY_LABEL.get(label);
  if (!canonical) continue;
  if (Math.abs(canonical.sos - sos) > 0.05) {
    throw new Error(
      `DIM_SOURCE.Category has ${label} at ${sos}% share of shelf but ` +
        `CATEGORY_METRICS says ${canonical.sos}%. Update spine.ts to match.`,
    );
  }
  if (Math.abs(canonical.osa - osa) > 0.05) {
    throw new Error(
      `DIM_SOURCE.Category has ${label} at ${osa}% availability but ` +
        `CATEGORY_METRICS says ${canonical.osa}%. Update spine.ts to match.`,
    );
  }
}

/** The spreads, for the cards that have to explain why they refuse to average. */
export const SOS_RANGE = {
  low: CATEGORY_SOS.reduce((a, b) => (a.sos <= b.sos ? a : b)),
  high: CATEGORY_SOS.reduce((a, b) => (a.sos >= b.sos ? a : b)),
};

export const OSA_RANGE = {
  low: CATEGORY_SOS.reduce((a, b) => (a.osa <= b.osa ? a : b)),
  high: CATEGORY_SOS.reduce((a, b) => (a.osa >= b.osa ? a : b)),
};

/** Scaled back through the six-month spine, so earlier months move together. */
export function categorySosAt(row: CategoryMetrics, level: number): number {
  return +(row.sos * level).toFixed(1);
}

export function categoryOsaAt(row: CategoryMetrics, level: number): number {
  return +(row.osa * level).toFixed(1);
}

/* ================= Toothpaste sub-categories ================= */

/**
 * The one category the fixtures break down a level further. Same contract as
 * `CATEGORY_METRICS` one level up: share-weighted rows must blend back to
 * toothpaste's own canonical figures, so the sub-category panels and the
 * toothpaste panel are one measurement at two levels of aggregation.
 *
 * The spine's authored rows had the same defect the category rows once did —
 * they blended to 38.7 SOS / 63.4 OSA against toothpaste's 46.7 / 69.9 — so
 * every row is scaled by the same set-wide factor (SOS ×1.20734, OSA ×1.10322):
 * the error came from the set, so the set absorbs it, and the ordering and
 * spread survive.
 *
 * `countShare` here is the sub-category's share of toothpaste's audited stores
 * (the spine's `stores` column over 100), not a national share.
 */
export const SUBCATEGORY_METRICS: CategoryMetrics[] = [
  { id: "cavity-protection", label: "Cavity protection", sos: 50.7, osa: 77.2, countShare: 0.4, delta: -2.6, osaDelta: 1.4 },
  { id: "whitening", label: "Whitening", sos: 45.9, osa: 68.4, countShare: 0.28, delta: -2.1, osaDelta: 0.5 },
  { id: "herbal", label: "Herbal", sos: 43.5, osa: 64.0, countShare: 0.18, delta: -1.6, osaDelta: -0.3 },
  { id: "kids", label: "Kids", sos: 41.0, osa: 59.6, countShare: 0.14, delta: -1.0, osaDelta: -1.1 },
];

/** The parent row the sub-category blend must reproduce. */
export const TOOTHPASTE = SOS_BY_ID.get("toothpaste")!;

const subBlended = (pick: (row: CategoryMetrics) => number) =>
  +SUBCATEGORY_METRICS.reduce((total, row) => total + pick(row) * row.countShare, 0).toFixed(1);

/* The two identities this table exists to hold. */
if (Math.abs(subBlended((row) => row.sos) - TOOTHPASTE.sos) > 0.1) {
  throw new Error(
    `Sub-category SOS weights to ${subBlended((row) => row.sos)} but toothpaste ` +
      `is ${TOOTHPASTE.sos}. Rebalance SUBCATEGORY_METRICS — see category-metrics.ts.`,
  );
}

if (Math.abs(subBlended((row) => row.osa) - TOOTHPASTE.osa) > 0.1) {
  throw new Error(
    `Sub-category OSA weights to ${subBlended((row) => row.osa)} but toothpaste ` +
      `is ${TOOTHPASTE.osa}. Rebalance SUBCATEGORY_METRICS — see category-metrics.ts.`,
  );
}

/* The same keep-the-copy-honest check `DIM_SOURCE.Category` gets. */
const SUB_BY_LABEL = new Map(SUBCATEGORY_METRICS.map((row) => [row.label, row]));
for (const [label, osa, , , sos] of DIM_SOURCE["Sub-category"]) {
  const canonical = SUB_BY_LABEL.get(label);
  if (!canonical) continue;
  if (Math.abs(canonical.sos - sos) > 0.05 || Math.abs(canonical.osa - osa) > 0.05) {
    throw new Error(
      `DIM_SOURCE["Sub-category"] has ${label} at osa ${osa} / sos ${sos} but ` +
        `SUBCATEGORY_METRICS says ${canonical.osa} / ${canonical.sos}. Update spine.ts to match.`,
    );
  }
}

/** Sub-category spreads, for the same refuse-to-average footnote. */
export const SUB_SOS_RANGE = {
  low: SUBCATEGORY_METRICS.reduce((a, b) => (a.sos <= b.sos ? a : b)),
  high: SUBCATEGORY_METRICS.reduce((a, b) => (a.sos >= b.sos ? a : b)),
};

export const SUB_OSA_RANGE = {
  low: SUBCATEGORY_METRICS.reduce((a, b) => (a.osa <= b.osa ? a : b)),
  high: SUBCATEGORY_METRICS.reduce((a, b) => (a.osa >= b.osa ? a : b)),
};
