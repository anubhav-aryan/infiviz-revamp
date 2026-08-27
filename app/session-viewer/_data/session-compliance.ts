import { PREVIOUS_VISIT } from "./session-previous";
import {
  BOX_BY_ID,
  MSL,
  MSL_CHANGE,
  positionLabel,
  RECOGNITION_BOXES,
} from "./session-viewer";

/**
 * The planogram exceptions — what the bay was supposed to hold and what
 * recognition actually read.
 *
 * Two kinds, and they are genuinely different failures. A **misplaced** SKU is
 * on the shelf in the wrong slot: recognition found it, the planogram disagrees
 * about where — so it has a box, and picking the row pins that box on the
 * capture. An **absent** one is not on the shelf at all, so it has **no** box:
 * there is no rectangle to draw around a gap. Picking one of those rows takes
 * the reader to the must-stock list instead, which is where a gap is answerable.
 *
 * Every `found` label is derived from the box it names. The design authored
 * them by hand and one had drifted a position out of step with its own
 * geometry, which is exactly the kind of error a derived label cannot make.
 */

export type ExceptionKind = "absent" | "misplaced";

export type Exception = {
  kind: ExceptionKind;
  brand: string;
  /** The box this row pins on the capture. Misplaced rows only — see above. */
  boxId?: string;
  expected: string;
  /** `positionLabel(boxId)` for a misplaced row, "Not detected" for an absent one. */
  found: string;
  note: string;
  /** Absent rows only: the must-stock row to flag in the availability tab. */
  sku?: string;
  /** Derived: this same failure was already on the last visit's capture. */
  recurring: boolean;
};

const ABSENT_RAW: Omit<Exception, "recurring">[] = [
  {
    kind: "absent",
    brand: "Optic White",
    sku: "COL Optic White Plus Shine 100G",
    expected: "Shelf 1 · position 8",
    found: "Not detected",
    note: "Ranged must-stock SKU absent from the bay",
  },
  {
    kind: "absent",
    brand: "Max Fresh",
    sku: "COL Max Fresh Blue Gel 140G",
    expected: "Shelf 2 · position 9",
    found: "Not detected",
    note: "Ranged must-stock SKU absent from the bay",
  },
];

/**
 * `expected` is the planogram's slot and is the one thing here that has to be
 * authored — the shelf plan is not in this fixture. `found` is read off the
 * box, so the two can never be quietly transposed.
 */
const MISPLACED_RAW: Omit<Exception, "recurring">[] = [
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

/**
 * Recurring is derived, never authored: an absent row recurs iff the previous
 * visit's snapshot lists its SKU, a misplaced row iff it lists its box. The
 * snapshot is the one place that knows what last visit looked like.
 */
const ABSENT: Exception[] = ABSENT_RAW.map((row) => ({
  ...row,
  recurring: MSL_CHANGE.get(row.sku ?? "") === "recurring",
}));
const MISPLACED: Exception[] = MISPLACED_RAW.map((row) => ({
  ...row,
  recurring: row.boxId !== undefined && PREVIOUS_VISIT.misplacedBoxes.includes(row.boxId),
}));

/** Absent first: a SKU that is not on the shelf outranks one in the wrong slot. */
export const EXCEPTIONS: Exception[] = [...ABSENT, ...MISPLACED];

export const EXCEPTION_BY_BOX = new Map(
  EXCEPTIONS.flatMap((row) => (row.boxId === undefined ? [] : [[row.boxId, row] as const])),
);

export const COMPLIANCE_CAPTION = `${ABSENT.length} missing · ${MISPLACED.length} misplaced`;

/** What the same two counts were on 21 Jul — one authored misplacement plus
 *  the snapshot's absent list, so it can never contradict the availability tab. */
export const COMPLIANCE_PREVIOUS_CAPTION = `was ${PREVIOUS_VISIT.absentSkus.length} · ${PREVIOUS_VISIT.misplacedBoxes.length} last visit`;

/* ---- the identities this file has to hold ---- */

for (const row of EXCEPTIONS) {
  if (row.kind === "absent") {
    if (row.boxId !== undefined) {
      throw new Error(
        `Exception for ${row.brand} is absent but names box ${row.boxId}. ` +
          `An absent SKU is a gap on the shelf, not a detection — see session-compliance.ts.`,
      );
    }
    continue;
  }
  if (row.boxId === undefined) {
    throw new Error(
      `Exception for ${row.brand} is misplaced but names no box. ` +
        `A misplaced facing was found somewhere, and the row has to say where.`,
    );
  }
  const box = BOX_BY_ID.get(row.boxId);
  if (!box) {
    throw new Error(
      `Exception for ${row.brand} points at box ${row.boxId}, which does not exist. See session-compliance.ts.`,
    );
  }
  if (box.compliance !== "misplaced") {
    throw new Error(
      `Exception for ${row.brand} is "misplaced" but box ${row.boxId} is ${box.compliance}. ` +
        `An exception must name the box that actually failed — see session-compliance.ts.`,
    );
  }
  if (row.found !== positionLabel(row.boxId)) {
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
