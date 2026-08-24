import {
  CURRENT_MONTH,
  MONTHS,
  MONTH_BY_KEY,
  type Month,
  type MonthKey,
  isMonthKey,
  isWeekend,
  stepMonth,
} from "@/app/_time/periods";

/**
 * The Store Explorer's time control.
 *
 * The other screens step through months; this one is a day-grained screen
 * ("418 visits today"), so its periods are a day, a day back, a rolling week,
 * or a custom range. The custom range is still bounded by `MONTHS` — Feb–Jul
 * 2026 is exactly the history the fixtures encode, and offering a day outside
 * it would mean inventing one.
 *
 * Every value here is derived from `MONTHS`, which is itself built at module
 * scope. Nothing calls `new Date()` at render time.
 */

export type DayRef = { month: MonthKey; day: number };

/** `today` is the day the designer authored; its figures are authoritative. */
export type PresetKey = "today" | "yesterday" | "last7";

export type Period =
  | { kind: PresetKey }
  | { kind: "custom"; from: DayRef; to: DayRef };

export const TODAY: Period = { kind: "today" };

export const PRESETS: { kind: PresetKey; label: string }[] = [
  { kind: "today", label: "Today" },
  { kind: "yesterday", label: "Yesterday" },
  { kind: "last7", label: "Last 7 days" },
];

/* ---------- day arithmetic over the authored window ---------- */

/** Days elapsed before each month starts, so a day gets one comparable index. */
const MONTH_START: Record<MonthKey, number> = (() => {
  const out = {} as Record<MonthKey, number>;
  let elapsed = 0;
  for (const month of MONTHS) {
    out[month.key] = elapsed;
    elapsed += month.days;
  }
  return out;
})();

export const FIRST_DAY: DayRef = { month: MONTHS[0].key, day: 1 };
export const LAST_DAY: DayRef = {
  month: MONTHS[MONTHS.length - 1].key,
  day: MONTHS[MONTHS.length - 1].days,
};

export function dayIndex(ref: DayRef): number {
  return MONTH_START[ref.month] + ref.day;
}

export function sameDay(a: DayRef, b: DayRef): boolean {
  return a.month === b.month && a.day === b.day;
}

function isDayRef(month: string, day: number): boolean {
  return (
    isMonthKey(month) &&
    Number.isInteger(day) &&
    day >= 1 &&
    day <= MONTH_BY_KEY[month].days
  );
}

/** Walks a range month by month; ranges may cross month boundaries. */
function eachDay(
  from: DayRef,
  to: DayRef,
  visit: (month: Month, day: number) => void,
): void {
  let key: MonthKey | null = from.month;
  while (key) {
    const month = MONTH_BY_KEY[key];
    const first = key === from.month ? from.day : 1;
    const last = key === to.month ? to.day : month.days;
    for (let day = first; day <= last; day += 1) visit(month, day);
    if (key === to.month) break;
    key = stepMonth(key, 1);
  }
}

export function spanDays(from: DayRef, to: DayRef): number {
  return dayIndex(to) - dayIndex(from) + 1;
}

/**
 * A weekend is a trading day for the stores but a thin one for the field team,
 * so it counts for a fraction of a weekday when sizing a range's volume.
 */
const WEEKEND_WEIGHT = 0.35;

export function activeDays(from: DayRef, to: DayRef): number {
  let total = 0;
  eachDay(from, to, (month, day) => {
    total += isWeekend(month, day) ? WEEKEND_WEIGHT : 1;
  });
  return total;
}

/** A rolling week: five weekdays and two thin weekend days. */
export const WEEK_ACTIVE_DAYS = 5 + 2 * WEEKEND_WEIGHT;

/* ---------- labels ---------- */

function pad(day: number): string {
  return String(day).padStart(2, "0");
}

export function formatDay(ref: DayRef): string {
  return `${pad(ref.day)} ${MONTH_BY_KEY[ref.month].shortLabel}`;
}

export function rangeLabel(from: DayRef, to: DayRef): string {
  if (sameDay(from, to)) return formatDay(from);
  if (from.month === to.month) {
    return `${pad(from.day)}–${pad(to.day)} ${MONTH_BY_KEY[from.month].shortLabel}`;
  }
  return `${formatDay(from)} – ${formatDay(to)}`;
}

export function periodLabel(period: Period): string {
  if (period.kind === "custom") return rangeLabel(period.from, period.to);
  if (period.kind === "yesterday") return "yesterday";
  if (period.kind === "last7") return "last 7 days";
  return "today";
}

/** Slots after a verb: "Stores visited today", "Visits in 04–19 Mar". */
export function periodPhrase(period: Period): string {
  if (period.kind === "custom") return `in ${rangeLabel(period.from, period.to)}`;
  if (period.kind === "last7") return "in the last 7 days";
  return periodLabel(period);
}

/* ---------- URL round-trip ---------- */

const RANGE_SEP = "..";

/** `""` for the default, so a pristine Today view carries no query at all. */
export function serializePeriod(period: Period): string {
  if (period.kind === "today") return "";
  if (period.kind !== "custom") return period.kind;
  return `${period.from.month}-${pad(period.from.day)}${RANGE_SEP}${period.to.month}-${pad(period.to.day)}`;
}

function parseDay(raw: string): DayRef | null {
  // `2026-03-04` — the month key is the first seven characters by construction.
  const month = raw.slice(0, 7);
  const day = Number(raw.slice(8));
  if (raw.length !== 10 || raw[7] !== "-" || !isDayRef(month, day)) return null;
  return { month: month as MonthKey, day };
}

/** Anything unrecognised falls back to Today rather than erroring the screen. */
export function parsePeriod(raw: string | null | undefined): Period {
  if (!raw || raw === "today") return TODAY;
  if (raw === "yesterday" || raw === "last7") return { kind: raw };

  const at = raw.indexOf(RANGE_SEP);
  if (at < 0) return TODAY;
  const from = parseDay(raw.slice(0, at));
  const to = parseDay(raw.slice(at + RANGE_SEP.length));
  if (!from || !to || dayIndex(from) > dayIndex(to)) return TODAY;
  return { kind: "custom", from, to };
}

/* ---------- the custom picker's calendar ---------- */

export type PickerCell = { day: number | null; disabled: boolean };

/** The month the picker opens on when there is no range yet. */
export const PICKER_INITIAL_MONTH: MonthKey = CURRENT_MONTH;

/** Leading blanks pad the grid to the 1st's weekday, as the design's grids do. */
const CALENDARS: Record<MonthKey, PickerCell[]> = Object.fromEntries(
  MONTHS.map((month) => {
    const cells: PickerCell[] = [];
    for (let i = 0; i < month.firstDow; i += 1) {
      cells.push({ day: null, disabled: true });
    }
    for (let day = 1; day <= month.days; day += 1) {
      cells.push({ day, disabled: false });
    }
    return [month.key, cells];
  }),
) as Record<MonthKey, PickerCell[]>;

export function calendarFor(month: MonthKey): PickerCell[] {
  return CALENDARS[month];
}

export const PICKER_WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

export function monthLabel(month: MonthKey): string {
  return MONTH_BY_KEY[month].label;
}

export function stepPickerMonth(month: MonthKey, delta: number): MonthKey | null {
  return stepMonth(month, delta);
}
