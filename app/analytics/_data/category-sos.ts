import { DIM_SOURCE, LAST, VIS_SERIES } from "./spine";

/**
 * Share of shelf, per category — the single source of truth.
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

export type CategorySos = {
  /** Matches `CategoryScopeId` in `scope.ts` and the `groups` label in the modules. */
  id: string;
  label: string;
  /** July's share of shelf for this category, in points. */
  sos: number;
  /** Share of audited stores carrying the category. Sums to 1. */
  countShare: number;
  /** Month-on-month movement, for the card's delta chip. */
  delta: number;
};

/**
 * Authored so that `Σ(sos × countShare) = VIS_SERIES[LAST]` — see the assertion
 * below, which is what stops a future edit from quietly reintroducing the
 * disagreement. Toothpaste carries the reconciliation because it is the
 * flagship and the largest share; the other four keep the spread the modules
 * already published.
 */
export const CATEGORY_SOS: CategorySos[] = [
  { id: "toothpaste", label: "Toothpaste", sos: 46.7, countShare: 0.42, delta: -2.08 },
  { id: "toothbrush", label: "Toothbrush", sos: 21.3, countShare: 0.18, delta: -0.58 },
  { id: "mouthwash", label: "Mouthwash", sos: 19.6, countShare: 0.14, delta: -0.05 },
  { id: "kids-oral-care", label: "Kids oral care", sos: 34.6, countShare: 0.12, delta: 0.47 },
  { id: "whitening", label: "Whitening", sos: 59.7, countShare: 0.14, delta: -1.14 },
];

export const SOS_BY_LABEL = new Map(CATEGORY_SOS.map((row) => [row.label, row]));
export const SOS_BY_ID = new Map(CATEGORY_SOS.map((row) => [row.id, row]));

/** The blended national figure, *derived* rather than quoted. */
export const NATIONAL_SOS = +CATEGORY_SOS.reduce(
  (total, row) => total + row.sos * row.countShare,
  0,
).toFixed(1);

/**
 * The identity this file exists to hold. A drift of more than a tenth means
 * someone edited a category without rebalancing, and the national number on
 * every other screen is now a different measurement from these panels.
 */
if (Math.abs(NATIONAL_SOS - VIS_SERIES[LAST]) > 0.1) {
  throw new Error(
    `Per-category SOS weights to ${NATIONAL_SOS} but the national series ends at ` +
      `${VIS_SERIES[LAST]}. Rebalance CATEGORY_SOS — see the note in category-sos.ts.`,
  );
}

/**
 * `spine.ts` repeats these two values inside `DIM_SOURCE.Category` because it
 * cannot import this module without a cycle. This is the check that keeps the
 * copy honest.
 */
for (const [label, sos] of DIM_SOURCE.Category.map(
  (row) => [row[0], row[4]] as const,
)) {
  const canonical = SOS_BY_LABEL.get(label);
  if (canonical && Math.abs(canonical.sos - sos) > 0.05) {
    throw new Error(
      `DIM_SOURCE.Category has ${label} at ${sos}% share of shelf but ` +
        `CATEGORY_SOS says ${canonical.sos}%. Update spine.ts to match.`,
    );
  }
}

/** The spread, for the card that has to explain why it refuses to average. */
export const SOS_RANGE = {
  low: CATEGORY_SOS.reduce((a, b) => (a.sos <= b.sos ? a : b)),
  high: CATEGORY_SOS.reduce((a, b) => (a.sos >= b.sos ? a : b)),
};

/** Scaled back through the six-month spine, so earlier months move together. */
export function categorySosAt(row: CategorySos, level: number): number {
  return +(row.sos * level).toFixed(1);
}
