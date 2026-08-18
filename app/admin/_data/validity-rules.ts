/**
 * The three mechanisms that decide whether a session counts.
 *
 * **They do not behave the same way, and the UI must not imply that they do.**
 *
 * - A **photo-quality score** below the threshold can auto-disable, because a
 *   capture that failed the quality gate is not a judgement call.
 * - A **photo-count drop** measured against the store's own history only ever
 *   flags for review. A store that usually sends 10 and sends 6 might have had
 *   half its bay stripped out — that is a real finding, not a bad capture, and
 *   auto-disabling it would delete the very signal worth looking at.
 * - A **percentile cutoff** trims the tail of a distribution. Also review-only:
 *   being in the bottom fifth is a position, not a defect.
 *
 * Thresholds are per-account because the review queue they feed is only useful
 * if it stays short. Set them too wide and every session lands in it, which is
 * how a review queue becomes a thing people stop opening.
 */

export type RuleOutcome = "auto" | "review";

export type ValidityRule = {
  id: string;
  name: string;
  note: string;
  outcome: RuleOutcome;
  outcomeLabel: string;
  fields: { key: string; label: string; value: number; unit: string }[];
  /** Sessions this rule would have caught in the authored month. */
  wouldCatch: number;
};

export const VALIDITY_RULES: ValidityRule[] = [
  {
    id: "photo-quality",
    name: "Photo quality score",
    note: "Sessions whose capture score falls below the disable threshold are taken out automatically. Between the two thresholds they go to review instead, so a borderline session is looked at rather than dropped.",
    outcome: "auto",
    outcomeLabel: "Can auto-disable",
    fields: [
      { key: "disable", label: "Auto-disable below", value: 45, unit: "score" },
      { key: "review", label: "Send to review below", value: 60, unit: "score" },
    ],
    wouldCatch: 34,
  },
  {
    id: "photo-count",
    name: "Photo count vs the store's own history",
    note: "Compares this visit against what the store normally sends. A store steady at 10 photos arriving with 6 is outside the band and gets flagged. Never auto-disables — a genuine drop in shelf space produces exactly this pattern, and it is worth seeing.",
    outcome: "review",
    outcomeLabel: "Review only",
    fields: [
      { key: "band", label: "Allowed band", value: 3, unit: "± photos" },
      { key: "history", label: "History window", value: 6, unit: "visits" },
    ],
    wouldCatch: 18,
  },
  {
    id: "percentile",
    name: "Percentile cutoff",
    note: "Trims the tail of a chosen measure — the bottom slice by share of shelf, for instance. Review only: a low position is a result, not a fault, and disabling it would quietly improve every number above it.",
    outcome: "review",
    outcomeLabel: "Review only",
    fields: [
      { key: "cutoff", label: "Bottom percentile", value: 20, unit: "%" },
    ],
    wouldCatch: 61,
  },
];
