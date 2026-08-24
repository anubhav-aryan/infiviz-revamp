import { BRAND_SHELF, OWN_BRANDS, SHELF_SKUS, TOTALS } from "./shelf-facts";
import { AVAILABILITY, FOUND_COUNT, RANGED_COUNT, SHELF_METRICS } from "./session-viewer";

/**
 * How close recognition got, measured against a human recount of the same bay.
 *
 * This tab is the reason the screen can publish two different availability
 * figures without either being wrong. Recognition **predicted** 72%; the
 * auditor walking the aisle counted six of eight ranged SKUs, which is 75%.
 * The three-point gap is the finding, not a rounding error — and the assertion
 * at the foot of this file makes that structural, so nobody can later "fix"
 * one of the numbers to match the other and delete the finding by accident.
 *
 * Only the auditor's own counts are authored here. Every predicted figure is
 * read from the page's own data.
 */

export type AccuracyPair = {
  label: string;
  definition: string;
  predicted: number;
  actual: number;
  /** Signed difference in points, e.g. `"+1.4 pts"`. */
  error: string;
  errorTone: "ok" | "warn" | "bad";
  /** `100 − |error ÷ actual|·100`, one decimal. */
  accuracy: number;
};

function pair(label: string, definition: string, predicted: number, actual: number): AccuracyPair {
  const delta = +(predicted - actual).toFixed(1);
  const magnitude = Math.abs(delta);
  return {
    label,
    definition,
    predicted,
    actual,
    error: `${delta >= 0 ? "+" : "−"}${magnitude.toFixed(1)} pts`,
    errorTone: magnitude <= 2 ? "ok" : magnitude <= 3.5 ? "warn" : "bad",
    accuracy: +(100 - (magnitude / actual) * 100).toFixed(1),
  };
}

/** The auditor's recount of share of shelf. The one authored figure on the tab. */
const AUDITED_SOS = 32.8;

export const ACCURACY_PAIRS: AccuracyPair[] = [
  pair(
    "Share of Shelf",
    "Predicted share of shelf against the auditor's own count of the bay",
    SHELF_METRICS[0].pct,
    AUDITED_SOS,
  ),
  pair(
    "On-Shelf Availability",
    "Predicted OSA against the auditor's must-stock check",
    AVAILABILITY.pct,
    +((FOUND_COUNT / RANGED_COUNT) * 100).toFixed(1),
  ),
];

export const ACCURACY_AUTHOR = "Actuals entered by Anand K · 05 Aug 2026";

/** Per-brand recognition accuracy, for the eleven brands on this bay. */
export const BRAND_ACCURACY: Record<string, number> = {
  CDC: 97.1,
  "Colgate Total": 95.4,
  Natural: 96.0,
  "Max Fresh": 91.2,
  "P/S": 93.8,
  Closeup: 92.5,
  Sensodyne: 90.2,
  "Oral-B": 86.4,
  Salt: 93.1,
  "Optic White": 74.0,
  "Other brands": 77.8,
};

/**
 * Per-SKU accuracy, keyed by product code rather than display name — the names
 * carry Vietnamese diacritics and a key that has to survive being retyped is a
 * key that will one day be retyped wrong.
 */
export const SKU_ACCURACY: Record<string, number> = {
  "OPW-SHN-100": 74.0,
  "MXF-BLU-140": 80.5,
  "OB-3DW-120": 85.7,
  "CDC-225-36": 98.2,
  "TOT-CHR-150": 96.4,
  "PS-M123-180": 94.1,
  "CDC-100-72": 97.6,
  "CDC-180-48": 98.0,
  "TOT-PRO-100": 86.9,
  "TOT-ADV-150": 95.1,
  "NAT-SLT-180": 92.4,
  "NAT-CHR-180": 94.8,
  "MXF-GRN-140": 93.3,
  "SLT-ORG-200": 89.5,
  "OPW-ADV-100": 82.1,
  "OPW-O2F-085": 78.4,
  "CU-LB-180": 91.9,
  "CU-NHH-180": 88.1,
  "SEN-RR-100": 90.6,
  "SEN-FM-100": 89.8,
  "OB-PH-130": 87.2,
  /* The design omitted this one. 93.5 is not free: with 42 facings against
     PS-M123-180's 46, it is what makes P/S's two SKUs average to the 93.8 its
     brand row claims. */
  "PS-TXHC-180": 93.5,
};

export type AccuracyRow = { name: string; accuracy: number; facings: number; isOwn: boolean };

export const BRAND_ACCURACY_ROWS: AccuracyRow[] = BRAND_SHELF.map((brand) => ({
  name: brand.name,
  accuracy: BRAND_ACCURACY[brand.name],
  facings: brand.facings,
  isOwn: brand.isOwn,
})).sort((a, b) => a.accuracy - b.accuracy);

export const SKU_ACCURACY_ROWS: AccuracyRow[] = SHELF_SKUS.map((sku) => ({
  name: sku.name,
  accuracy: SKU_ACCURACY[sku.productCode],
  facings: sku.facings,
  isOwn: OWN_BRANDS.has(sku.brand),
})).sort((a, b) => a.accuracy - b.accuracy);

/**
 * Weighted by facings, so the headline describes the same 374 facings every
 * other number on this screen does. The design authored 91.3%, which
 * reconciles with nothing — not the brand mean, not the SKU mean, not the
 * pairs.
 */
export const ACCURACY_OVERALL = +(
  BRAND_SHELF.reduce((total, brand) => total + BRAND_ACCURACY[brand.name] * brand.facings, 0) /
  TOTALS.facings
).toFixed(1);

/* ---- the identities this file has to hold ---- */

/* The predicted column is the page's own figure, never a copy of it. */
if (ACCURACY_PAIRS[0].predicted !== SHELF_METRICS[0].pct) {
  throw new Error("Share of Shelf accuracy is not reading SHELF_METRICS. See session-accuracy.ts.");
}
if (ACCURACY_PAIRS[1].predicted !== AVAILABILITY.pct) {
  throw new Error("OSA accuracy is not reading AVAILABILITY. See session-accuracy.ts.");
}

/* The 72-vs-75 reconciliation, made structural. The actual column *is* the
   must-stock count; if the list changes, this tab moves with it rather than
   continuing to report a gap that no longer exists. */
const AUDITED_OSA = +((FOUND_COUNT / RANGED_COUNT) * 100).toFixed(1);
if (ACCURACY_PAIRS[1].actual !== AUDITED_OSA) {
  throw new Error(
    `The OSA accuracy pair claims the auditor counted ${ACCURACY_PAIRS[1].actual}% but the ` +
      `must-stock list says ${AUDITED_OSA}% (${FOUND_COUNT} of ${RANGED_COUNT}). See session-accuracy.ts.`,
  );
}

/* Coverage is total both ways: an unscored brand or SKU would render blank. */
for (const brand of BRAND_SHELF) {
  if (BRAND_ACCURACY[brand.name] === undefined) {
    throw new Error(`No accuracy for brand "${brand.name}". Add it to BRAND_ACCURACY in session-accuracy.ts.`);
  }
}
if (Object.keys(BRAND_ACCURACY).length !== BRAND_SHELF.length) {
  throw new Error(
    `BRAND_ACCURACY has ${Object.keys(BRAND_ACCURACY).length} entries for ${BRAND_SHELF.length} brands on the bay.`,
  );
}
for (const sku of SHELF_SKUS) {
  if (SKU_ACCURACY[sku.productCode] === undefined) {
    throw new Error(`No accuracy for SKU ${sku.productCode} ("${sku.name}"). Add it in session-accuracy.ts.`);
  }
}
if (Object.keys(SKU_ACCURACY).length !== SHELF_SKUS.length) {
  throw new Error(
    `SKU_ACCURACY has ${Object.keys(SKU_ACCURACY).length} entries for ${SHELF_SKUS.length} SKUs on the bay.`,
  );
}
