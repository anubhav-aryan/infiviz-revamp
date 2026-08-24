import {
  BOX_BY_ID,
  MSL,
  positionLabel,
  RECOGNITION_BOXES,
} from "./session-viewer";

/**
 * The planogram exceptions — what the bay was supposed to hold and what
 * recognition actually read.
 *
 * Two kinds, and they are genuinely different failures. A **misplaced** SKU is
 * on the shelf in the wrong slot: recognition found it, the planogram disagrees
 * about where. An **absent** one is a ranged must-stock SKU that is not on the
 * shelf at all — which is why both of them point at the two boxes recognition
 * could not identify. Every row pins a box on the capture, so "position 7" is
 * something you can look at rather than a coordinate you take on trust.
 *
 * Every `found` label is derived from the box it names. The design authored
 * them by hand and one had drifted a position out of step with its own
 * geometry, which is exactly the kind of error a derived label cannot make.
 */

export type ExceptionKind = "absent" | "misplaced";

export type Exception = {
  kind: ExceptionKind;
  brand: string;
  /** The box this row pins on the capture. */
  boxId: string;
  expected: string;
  /** Derived — `positionLabel(boxId)` for a misplaced row, "Not detected" otherwise. */
  found: string;
  note: string;
  /** Absent rows only: the must-stock row to flag in the availability tab. */
  sku?: string;
};

const ABSENT: Exception[] = [
  {
    kind: "absent",
    brand: "Optic White",
    sku: "COL Optic White Plus Shine 100G",
    boxId: "s1p8",
    expected: positionLabel("s1p8"),
    found: "Not detected",
    note: "Ranged must-stock SKU absent from the bay",
  },
  {
    kind: "absent",
    brand: "Max Fresh",
    sku: "COL Max Fresh Blue Gel 140G",
    boxId: "s2p7",
    expected: positionLabel("s2p7"),
    found: "Not detected",
    note: "Ranged must-stock SKU absent from the bay",
  },
];

/**
 * `expected` is the planogram's slot and is the one thing here that has to be
 * authored — the shelf plan is not in this fixture. `found` is read off the
 * box, so the two can never be quietly transposed.
 */
const MISPLACED: Exception[] = [
  {
    kind: "misplaced",
    brand: "Oral-B",
    boxId: "s1p7",
    expected: "Shelf 1 · position 4",
    found: positionLabel("s1p7"),
    note: "Sequence break — Oral-B sits ahead of Colgate Total",
  },
  {
    kind: "misplaced",
    brand: "Oral-B",
    boxId: "s2p5",
    expected: "Shelf 2 · position 3",
    /* The design's note named Sensodyne here, but the box it points at is
       Oral-B. The box is what the overlay paints amber, so the note moved
       rather than the box. */
    found: positionLabel("s2p5"),
    note: "Sequence break — Oral-B sits inside the Colgate block",
  },
];

/** Absent first: a SKU that is not on the shelf outranks one in the wrong slot. */
export const EXCEPTIONS: Exception[] = [...ABSENT, ...MISPLACED];

export const EXCEPTION_BY_BOX = new Map(EXCEPTIONS.map((row) => [row.boxId, row]));

export const COMPLIANCE_CAPTION = `${ABSENT.length} missing · ${MISPLACED.length} misplaced`;

/* ---- the identities this file has to hold ---- */

for (const row of EXCEPTIONS) {
  const box = BOX_BY_ID.get(row.boxId);
  if (!box) {
    throw new Error(
      `Exception for ${row.brand} points at box ${row.boxId}, which does not exist. See session-compliance.ts.`,
    );
  }
  const wanted = row.kind === "absent" ? "missing" : "misplaced";
  if (box.compliance !== wanted) {
    throw new Error(
      `Exception for ${row.brand} is "${row.kind}" but box ${row.boxId} is ${box.compliance}. ` +
        `An exception must name the box that actually failed — see session-compliance.ts.`,
    );
  }
  if (row.kind === "misplaced" && row.found !== positionLabel(row.boxId)) {
    throw new Error(`Exception for ${row.brand} reports "${row.found}" but sits at ${positionLabel(row.boxId)}.`);
  }
}

/* One exception per failing box, in both directions — a compliance failure the
   rail does not list is a failure nobody can act on. */
const MISPLACED_BOXES = RECOGNITION_BOXES.filter((box) => box.compliance === "misplaced");
if (MISPLACED.length !== MISPLACED_BOXES.length) {
  throw new Error(
    `${MISPLACED_BOXES.length} boxes are misplaced but ${MISPLACED.length} exceptions are listed. See session-compliance.ts.`,
  );
}

/* Every absent row must be a must-stock SKU the list agrees is missing. */
const ABSENT_SKUS = MSL.filter((sku) => sku.facings === undefined);
if (ABSENT.length !== ABSENT_SKUS.length) {
  throw new Error(
    `${ABSENT_SKUS.length} must-stock SKUs are absent but ${ABSENT.length} exceptions are listed. See session-compliance.ts.`,
  );
}
for (const row of ABSENT) {
  const match = ABSENT_SKUS.find((sku) => sku.name === row.sku);
  if (!match) {
    throw new Error(
      `Exception names "${row.sku}", which is not an absent must-stock SKU. ` +
        `Either the must-stock list in session-viewer.ts changed or the exception is stale.`,
    );
  }
  if (match.brand !== row.brand) {
    throw new Error(`Exception for "${row.sku}" says ${row.brand} but the SKU is ${match.brand}.`);
  }
}
