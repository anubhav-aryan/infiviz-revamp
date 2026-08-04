import { type MonthKey, monthsBefore } from "./periods";

/**
 * Deriving earlier months from the authored one.
 *
 * The rule this file exists to enforce: the designer's figures are the current
 * month, untouched. Earlier months are produced by applying a recipe to them,
 * so no transform ever runs over the authored values themselves.
 */

/**
 * The design's LCG, reproduced expression-for-expression (it also lives in
 * `merch-activity/_data` where it generates the heatmap). `& 0x7fffffff` runs
 * the product through ToInt32, so the double-precision rounding above 2^53 is
 * part of the sequence — "safer" arithmetic would produce a different result.
 */
export function lcg(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

export type Shift = {
  /** Multiplies count-like facts (visits, photos, sessions). */
  scale: number;
  /** Adds to percentage-like facts, in points. Usually negative going back. */
  bias: number;
  /** Envelope for the deterministic per-row jitter, in the fact's own units. */
  spread: number;
  seed: number;
};

/**
 * One recipe per month back, so a screen only names how fast it was growing
 * rather than authoring a figure per month. Trending up over the window means
 * earlier months are smaller and slightly worse, which is the story the
 * fixtures already tell through their deltas.
 */
export function shiftFor(key: MonthKey, perMonth: Omit<Shift, "seed">, seed: number): Shift {
  const back = monthsBefore(key);
  return {
    scale: Math.pow(perMonth.scale, back),
    bias: perMonth.bias * back,
    spread: back === 0 ? 0 : perMonth.spread,
    seed: seed + back * 977,
  };
}

/** A count, scaled and jittered. Never returns below zero. */
export function shiftCount(value: number, shift: Shift, rand: () => number): number {
  if (shift.scale === 1 && shift.bias === 0 && shift.spread === 0) return value;
  const jitter = shift.spread === 0 ? 0 : (rand() - 0.5) * 2 * shift.spread;
  return Math.max(0, Math.round(value * shift.scale * (1 + jitter)));
}

/**
 * A percentage, biased and jittered, clamped to `[0, max]` and rounded to one
 * decimal — the precision every percentage in this codebase displays at.
 */
export function shiftPct(
  value: number,
  shift: Shift,
  rand: () => number,
  max = 100,
): number {
  if (shift.bias === 0 && shift.spread === 0) return value;
  const jitter = shift.spread === 0 ? 0 : (rand() - 0.5) * 2 * shift.spread;
  return +Math.min(max, Math.max(0, value + shift.bias + jitter)).toFixed(1);
}

/** Identity recipe — what the authored month gets, so it is provably untouched. */
export const NO_SHIFT: Shift = { scale: 1, bias: 0, spread: 0, seed: 0 };
