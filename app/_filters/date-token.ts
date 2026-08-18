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
    return `${token.custom.start} → ${token.custom.end}`;
  }
  return DATE_PRESETS.find((p) => p.id === token.preset)?.label ?? "Today";
}

/** True when the token is the default, so the bar can omit it from the URL. */
export function isDefaultDate(token: DateToken): boolean {
  return token.preset === DEFAULT_DATE.preset && !token.custom;
}
