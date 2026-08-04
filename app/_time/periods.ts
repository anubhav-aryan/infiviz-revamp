/**
 * The reporting calendar shared by every screen that has a time control.
 *
 * The window is Feb–Jul 2026 because that is exactly the history the design's
 * fixtures encode: `AVAIL_SERIES` is a six-month spine, and every ranked row
 * carries a delta against the prior month. Offering more months would mean
 * inventing figures; offering fewer would throw away authored ones.
 *
 * Everything here is computed at module scope. `new Date(...)` during render
 * would let the server and client disagree and break hydration.
 */

export type MonthKey =
  | "2026-02"
  | "2026-03"
  | "2026-04"
  | "2026-05"
  | "2026-06"
  | "2026-07";

export type Month = {
  key: MonthKey;
  /** Zero-based, matching `Date`. */
  monthIndex: number;
  year: number;
  label: string;
  shortLabel: string;
  days: number;
  /** Weekday of the 1st, 0 = Sunday. */
  firstDow: number;
};

/** The month the designer authored. Its figures are the authoritative ones. */
export const CURRENT_MONTH: MonthKey = "2026-07";

const RAW: [key: MonthKey, monthIndex: number, label: string, short: string][] = [
  ["2026-02", 1, "February 2026", "Feb"],
  ["2026-03", 2, "March 2026", "Mar"],
  ["2026-04", 3, "April 2026", "Apr"],
  ["2026-05", 4, "May 2026", "May"],
  ["2026-06", 5, "June 2026", "Jun"],
  ["2026-07", 6, "July 2026", "Jul"],
];

const YEAR = 2026;

export const MONTHS: Month[] = RAW.map(([key, monthIndex, label, shortLabel]) => ({
  key,
  monthIndex,
  year: YEAR,
  label,
  shortLabel,
  // Day 0 of the next month is the last day of this one.
  days: new Date(YEAR, monthIndex + 1, 0).getDate(),
  firstDow: new Date(YEAR, monthIndex, 1).getDay(),
}));

export const MONTH_BY_KEY = Object.fromEntries(
  MONTHS.map((m) => [m.key, m]),
) as Record<MonthKey, Month>;

export const MONTH_KEYS = MONTHS.map((m) => m.key);

export function isMonthKey(value: string): value is MonthKey {
  return Object.prototype.hasOwnProperty.call(MONTH_BY_KEY, value);
}

/** Neighbouring months, or `null` at the ends of the authored window. */
export function stepMonth(key: MonthKey, delta: number): MonthKey | null {
  const i = MONTH_KEYS.indexOf(key) + delta;
  return i >= 0 && i < MONTH_KEYS.length ? MONTH_KEYS[i] : null;
}

export function previousMonth(key: MonthKey): MonthKey | null {
  return stepMonth(key, -1);
}

/**
 * How far back a month sits from the authored one, so variant recipes can scale
 * with distance instead of hardcoding a figure per month.
 */
export function monthsBefore(key: MonthKey): number {
  return MONTH_KEYS.indexOf(CURRENT_MONTH) - MONTH_KEYS.indexOf(key);
}

/** Weekday index for a day of a month, 0 = Sunday. Precomputed per month. */
export function weekdayOf(month: Month, day: number): number {
  return (month.firstDow + day - 1) % 7;
}

export function isWeekend(month: Month, day: number): boolean {
  const dow = weekdayOf(month, day);
  return dow === 0 || dow === 6;
}
