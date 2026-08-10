import { CURRENT_MONTH, MONTH_KEYS, previousMonth, type MonthKey } from "./periods";

/**
 * Quick date presets, resolved down to the one granularity the fixtures
 * actually have: a `MonthKey`. There is no daily/weekly data anywhere in this
 * app, and `new Date()` is never read at render (hydration-safety rule for
 * this codebase — see `periods.ts`), so a preset can only ever pick *which*
 * authored month counts as "now" — it can't manufacture day- or week-level
 * figures that don't exist.
 */

export type DatePreset = "today" | "yesterday" | "wtd" | "last-week" | "mtd" | "custom";

export const DATE_PRESETS: { id: DatePreset; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "wtd", label: "Week to date" },
  { id: "last-week", label: "Last week" },
  { id: "mtd", label: "Month to date" },
];

export type CustomRange = { start: string; end: string };

/**
 * `today`/`yesterday`/`wtd`/`mtd` all honestly resolve to the one authored
 * "current" month — there's no finer data to distinguish them by. `last-week`
 * is the closest concept the fixtures support: the prior authored month.
 * `custom` maps the range's end date to whichever authored month contains it,
 * clamped to the Feb–Jul 2026 window the date inputs are already limited to.
 */
export function presetToMonth(preset: DatePreset, custom?: CustomRange): MonthKey {
  switch (preset) {
    case "last-week":
      return previousMonth(CURRENT_MONTH) ?? CURRENT_MONTH;
    case "custom":
      return custom ? monthContaining(custom.end) : CURRENT_MONTH;
    default:
      return CURRENT_MONTH;
  }
}

function monthContaining(isoDate: string): MonthKey {
  const key = isoDate.slice(0, 7) as MonthKey;
  return MONTH_KEYS.includes(key) ? key : CURRENT_MONTH;
}

export const CUSTOM_RANGE_MIN = `${MONTH_KEYS[0]}-01`;
export const CUSTOM_RANGE_MAX = `${MONTH_KEYS[MONTH_KEYS.length - 1]}-31`;
