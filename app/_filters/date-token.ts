import { CURRENT_MONTH, MONTHS, type MonthKey } from "@/app/_time/periods";
import {
  CUSTOM_RANGE_MAX,
  CUSTOM_RANGE_MIN,
  DATE_PRESETS,
  type CustomRange,
  type DatePreset,
} from "@/app/_time/presets";

/**
 * The global date filter, as one URL token.
 *
 * The bar carries one token and each screen that reads it resolves the token
 * with its own resolver — Analytics calls `presetToMonth()`. Store Explorer is
 * not one of them: it owns its own `Period` again and no longer reads this.
 *
 * Grammar: a preset id (`today`, `wtd`, …) or `c:START..END` for a custom range.
 */

export type DateToken = { preset: DatePreset; custom?: CustomRange };

export const DEFAULT_DATE: DateToken = { preset: "today" };

const CUSTOM_PREFIX = "c:";
const RANGE_SEP = "..";

const PRESET_IDS = new Set<string>(DATE_PRESETS.map((p) => p.id));

/** ISO `YYYY-MM-DD` inside the authored Feb–Jul 2026 window. */
function isAuthoredDate(value: string): boolean {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    value >= CUSTOM_RANGE_MIN &&
    value <= CUSTOM_RANGE_MAX
  );
}

export function serializeDate(token: DateToken): string {
  if (token.preset === "custom" && token.custom) {
    return `${CUSTOM_PREFIX}${token.custom.start}${RANGE_SEP}${token.custom.end}`;
  }
  return token.preset;
}

/** Anything unrecognised falls back to the default rather than throwing — the
 *  same posture `parseFilters` takes with a hand-edited `?f=`. */
export function parseDate(raw: string | null | undefined): DateToken {
  if (!raw) return DEFAULT_DATE;

  if (raw.startsWith(CUSTOM_PREFIX)) {
    const [start, end] = raw.slice(CUSTOM_PREFIX.length).split(RANGE_SEP);
    if (isAuthoredDate(start) && isAuthoredDate(end) && start <= end) {
      return { preset: "custom", custom: { start, end } };
    }
    return DEFAULT_DATE;
  }

  return PRESET_IDS.has(raw) ? { preset: raw as DatePreset } : DEFAULT_DATE;
}

export function dateLabel(token: DateToken): string {
  if (token.preset === "custom" && token.custom) {
    /* A range that is exactly one authored month reads as that month. This is
       the shape `monthToDate` produces, so a month picked on a module screen
       shows up in the bar as "June 2026" rather than as its two end dates. */
    const whole = MONTHS.find(
      (month) =>
        token.custom?.start === `${month.key}-01` &&
        token.custom?.end === `${month.key}-${String(month.days).padStart(2, "0")}`,
    );
    if (whole) return whole.label;
    return `${token.custom.start} → ${token.custom.end}`;
  }
  return DATE_PRESETS.find((p) => p.id === token.preset)?.label ?? "Today";
}

/** True when the token is the default, so the bar can omit it from the URL. */
export function isDefaultDate(token: DateToken): boolean {
  return token.preset === DEFAULT_DATE.preset && !token.custom;
}

/**
 * The token that means "this authored month" — the inverse of `presetToMonth`.
 *
 * A month has no preset of its own (`today`/`mtd` all collapse to the current
 * one), so it is expressed as the custom range covering it; `presetToMonth`
 * resolves a custom range by the month containing its `end`, which makes the
 * round-trip exact. This is what lets a month picker write to the global date
 * instead of keeping a `?month=` of its own beside it.
 *
 * It lives here rather than next to `presetToMonth` because `_time/presets`
 * knows nothing about `DateToken` — the dependency runs this way, and reversing
 * it would be a cycle.
 */
export function monthToDate(month: MonthKey): DateToken {
  const entry = MONTHS.find((candidate) => candidate.key === month);
  if (!entry || month === CURRENT_MONTH) return DEFAULT_DATE;
  return {
    preset: "custom",
    custom: {
      start: `${month}-01`,
      end: `${month}-${String(entry.days).padStart(2, "0")}`,
    },
  };
}
