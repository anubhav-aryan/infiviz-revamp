import type { IconName } from "@/app/_components/icon";

/**
 * The design encoded every threshold as an inline ternary chain inside
 * `renderVals()`. Hoisting them here keeps the cut-offs in one place, and each
 * returns a tier name rather than a colour so the stylesheets stay the only
 * thing that knows which token a tier maps to.
 */

/** Rejection rate — `rateTier` in the design. */
export type RateTier = "danger" | "warning" | "neutral";

export function rateTier(rate: number): RateTier {
  return rate >= 15 ? "danger" : rate >= 10 ? "warning" : "neutral";
}

/** Quality score on a rejected capture — lower is worse, so the test inverts. */
export type ScoreTier = "danger" | "warning" | "neutral";

export function rejScore(score: number): ScoreTier {
  return score < 45 ? "danger" : score < 60 ? "warning" : "neutral";
}

/** Route adherence — `adhStyleFor2` in the design. */
export type AdherenceTier = "success" | "warning" | "danger";

export function adherenceTier(adherence: number): AdherenceTier {
  return adherence >= 90 ? "success" : adherence >= 75 ? "warning" : "danger";
}

/**
 * Direction and tone are separate fields on purpose. A rising rejection share
 * pairs an up arrow with `--danger`, while a rising pass rate pairs the same
 * arrow with `--success` — deriving either from the other would silently break
 * one of the two.
 */
export type DeltaDirection = "up" | "down";
export type DeltaTone = "danger" | "success";

export type Delta = {
  direction: DeltaDirection;
  tone: DeltaTone;
  label: string;
};

export const DELTA_ICON: Record<DeltaDirection, IconName> = {
  up: "arrow-up-right",
  down: "arrow-down-right",
};
