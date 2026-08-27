import { BRAND_SHELF } from "./shelf-facts";

export type VisitSnapshot = {
  /** The visit's date, as the history fixture prints it. */
  label: string;
  /** Facings per brand, same eleven brands as `BRAND_SHELF` — asserted below. */
  brandFacings: Record<string, number>;
  linearOwnCm: number;
  linearTotalCm: number;
  /** Must-stock SKUs absent that visit. Cross-checked in session-viewer.ts. */
  absentSkus: string[];
  countedFacings: number;
  /** Boxes (by today's shelf address) that were misplaced that visit. */
  misplacedBoxes: string[];
  accuracyOverall: number;
  /** Per-pair recognition accuracy from that visit's audit. */
  pairAccuracy: Record<string, number>;
};

/**
 * The store's prior visits, oldest first — the two the history fixture
 * invents ahead of the one authored capture.
 *
 * Everything the rail says about "last visit", and every column the Compare
 * page draws, derives from these objects. The deltas used to be authored
 * strings scattered through the KPI cards, which is how a card could claim
 * "+9 pts" while the arithmetic said +9.5; now the snapshots are the only
 * thing that is authored and every comparison is one visit minus the one
 * before it, so no two surfaces can disagree about what changed.
 *
 * Only this file invents history, and only as deep as the visit list goes —
 * a fixture pretending to a longer time series would be fabricating
 * measurements nobody took.
 */
export const VISIT_SNAPSHOTS: VisitSnapshot[] = [
  {
    label: "21 Jul 2026",
    brandFacings: {
      "P/S": 90,
      Closeup: 60,
      CDC: 40,
      Sensodyne: 38,
      "Colgate Total": 32,
      "Oral-B": 33,
      Natural: 25,
      "Max Fresh": 21,
      Salt: 2,
      "Optic White": 1,
      "Other brands": 29,
    },
    linearOwnCm: 274,
    linearTotalCm: 785,
    absentSkus: [
      "COL Max Fresh Blue Gel 140G",
      "COL Salt Original 200G",
      "COL Total Professional 100G",
    ],
    countedFacings: 12,
    misplacedBoxes: ["s1p7"],
    accuracyOverall: 90.9,
    pairAccuracy: {
      "Share of Shelf": 95.1,
      "On-Shelf Availability": 97.2,
    },
  },
  {
    label: "28 Jul 2026",
    brandFacings: {
      "P/S": 89,
      Closeup: 61,
      CDC: 41,
      Sensodyne: 38,
      "Colgate Total": 33,
      "Oral-B": 32,
      Natural: 25,
      "Max Fresh": 22,
      Salt: 2,
      "Optic White": 1,
      "Other brands": 28,
    },
    linearOwnCm: 272,
    linearTotalCm: 792,
    /* The same three gaps as the week before — nothing was fixed between the
       two visits, which is why the current capture's chips read the way they
       do regardless of which prior visit they are measured against. */
    absentSkus: [
      "COL Max Fresh Blue Gel 140G",
      "COL Salt Original 200G",
      "COL Total Professional 100G",
    ],
    countedFacings: 12,
    misplacedBoxes: ["s1p7"],
    accuracyOverall: 91.2,
    pairAccuracy: {
      "Share of Shelf": 95.3,
      "On-Shelf Availability": 96.8,
    },
  },
];

/** The visit the rail compares against — the latest one before this capture. */
export const PREVIOUS_VISIT = VISIT_SNAPSHOTS[VISIT_SNAPSHOTS.length - 1];

const facingsOf = (snapshot: VisitSnapshot, own: boolean) =>
  BRAND_SHELF.filter((brand) => brand.isOwn === own).reduce(
    (total, brand) => total + snapshot.brandFacings[brand.name],
    0,
  );

/** One decimal, like every percentage the rail prints. */
const pct1 = (part: number, whole: number) => +((part / whole) * 100).toFixed(1);

export const snapshotSosPct = (snapshot: VisitSnapshot) =>
  pct1(
    facingsOf(snapshot, true),
    facingsOf(snapshot, true) + facingsOf(snapshot, false),
  );

export const snapshotLinearPct = (snapshot: VisitSnapshot) =>
  pct1(snapshot.linearOwnCm, snapshot.linearTotalCm);

export const PREV_SOS_PCT = snapshotSosPct(PREVIOUS_VISIT); // 33.3
export const PREV_LINEAR_PCT = snapshotLinearPct(PREVIOUS_VISIT); // 34.3

/* ---- the longer trend ---- */

/**
 * One visit's worth of comparable numbers — what a Metric trend column needs.
 *
 * Two tiers of history feed this. The two visits before the capture carry full
 * snapshots above, and their metrics are *derived* from them. The eleven
 * visits before those carry only these aggregates, authored directly: the
 * trend table is the one consumer, and inventing eleven full facings-by-brand
 * tables to derive eleven numbers nobody else reads would be fabrication
 * without a reader.
 */
export type VisitMetrics = {
  label: string;
  sosPct: number;
  linearPct: number;
  /** Must-stock SKUs absent that visit — OSA, gaps and the matrix all read this. */
  absentSkus: string[];
  countedFacings: number;
  accuracyOverall: number;
};

const MAX_FRESH = "COL Max Fresh Blue Gel 140G";
const SALT_ORIGINAL = "COL Salt Original 200G";
const TOTAL_PROFESSIONAL = "COL Total Professional 100G";
const NATURAL_HERBAL = "COL Natural Salt Herbal 180G";

/** Oldest first. The arc: share creeping up over the quarter, Max Fresh's gap
 *  opening mid-June and never closing — the recurring exception the rail flags. */
const EARLIER_VISITS: VisitMetrics[] = [
  { label: "05 May 2026", sosPct: 30.8, linearPct: 35.2, absentSkus: [SALT_ORIGINAL, TOTAL_PROFESSIONAL], countedFacings: 11, accuracyOverall: 89.4 },
  { label: "12 May 2026", sosPct: 31.2, linearPct: 35.0, absentSkus: [SALT_ORIGINAL], countedFacings: 12, accuracyOverall: 89.8 },
  { label: "19 May 2026", sosPct: 31.0, linearPct: 34.9, absentSkus: [SALT_ORIGINAL, NATURAL_HERBAL], countedFacings: 12, accuracyOverall: 90.1 },
  { label: "26 May 2026", sosPct: 31.5, linearPct: 35.1, absentSkus: [NATURAL_HERBAL], countedFacings: 12, accuracyOverall: 89.6 },
  { label: "02 Jun 2026", sosPct: 31.9, linearPct: 34.8, absentSkus: [SALT_ORIGINAL, TOTAL_PROFESSIONAL], countedFacings: 12, accuracyOverall: 90.3 },
  { label: "09 Jun 2026", sosPct: 32.1, linearPct: 34.6, absentSkus: [TOTAL_PROFESSIONAL], countedFacings: 12, accuracyOverall: 90.0 },
  { label: "16 Jun 2026", sosPct: 31.8, linearPct: 34.7, absentSkus: [MAX_FRESH, TOTAL_PROFESSIONAL], countedFacings: 12, accuracyOverall: 90.5 },
  { label: "23 Jun 2026", sosPct: 32.3, linearPct: 34.9, absentSkus: [MAX_FRESH], countedFacings: 13, accuracyOverall: 90.2 },
  { label: "30 Jun 2026", sosPct: 32.0, linearPct: 35.0, absentSkus: [MAX_FRESH, SALT_ORIGINAL], countedFacings: 12, accuracyOverall: 90.7 },
  { label: "07 Jul 2026", sosPct: 32.4, linearPct: 34.8, absentSkus: [MAX_FRESH, SALT_ORIGINAL, TOTAL_PROFESSIONAL], countedFacings: 12, accuracyOverall: 90.4 },
  { label: "14 Jul 2026", sosPct: 32.2, linearPct: 34.9, absentSkus: [MAX_FRESH, SALT_ORIGINAL], countedFacings: 12, accuracyOverall: 90.8 },
];

const metricsOf = (snapshot: VisitSnapshot): VisitMetrics => ({
  label: snapshot.label,
  sosPct: snapshotSosPct(snapshot),
  linearPct: snapshotLinearPct(snapshot),
  absentSkus: snapshot.absentSkus,
  countedFacings: snapshot.countedFacings,
  accuracyOverall: snapshot.accuracyOverall,
});

/** Every prior visit's metrics, oldest first — the trend's column pool. */
export const VISIT_METRICS: VisitMetrics[] = [
  ...EARLIER_VISITS,
  ...VISIT_SNAPSHOTS.map(metricsOf),
];

/** Current − previous facings, per brand. */
export const BRAND_FACING_DELTAS: ReadonlyMap<string, number> = new Map(
  BRAND_SHELF.map((brand) => [
    brand.name,
    brand.facings - PREVIOUS_VISIT.brandFacings[brand.name],
  ]),
);

/**
 * `+1.6 pts`, `−2`, or null for no movement — the chips hide rather than
 * print a zero. The true minus sign, matching the design's own delta strings.
 */
export function formatDelta(
  value: number,
  options: { unit?: string; decimals?: number } = {},
): string | null {
  const { unit, decimals = 0 } = options;
  const rounded = +value.toFixed(decimals);
  if (rounded === 0) return null;
  const sign = rounded > 0 ? "+" : "−";
  return `${sign}${Math.abs(rounded).toFixed(decimals)}${unit ? ` ${unit}` : ""}`;
}

/* ---- the identities this file has to hold ---- */

/* Every snapshot names exactly the bay's brands — a brand present in one list
   and not the other would silently drop out of every delta and every column. */
for (const snapshot of VISIT_SNAPSHOTS) {
  for (const brand of BRAND_SHELF) {
    if (!(brand.name in snapshot.brandFacings)) {
      throw new Error(
        `The ${snapshot.label} snapshot has no facings for ${brand.name} — see session-previous.ts.`,
      );
    }
  }
  for (const name of Object.keys(snapshot.brandFacings)) {
    if (!BRAND_SHELF.some((brand) => brand.name === name)) {
      throw new Error(`The ${snapshot.label} snapshot names brand "${name}", which is not on the bay.`);
    }
  }
}
