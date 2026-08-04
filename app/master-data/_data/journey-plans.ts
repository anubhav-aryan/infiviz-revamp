import {
  CURRENT_MONTH,
  MONTHS,
  type Month,
  type MonthKey,
  isWeekend,
} from "@/app/_time/periods";
import { lcg, shiftFor } from "@/app/_time/variants";

/**
 * Journey plans fixtures. July 2026 is the month the design authored, with
 * "today" on the 24th; the calendar is generated from the design's arithmetic
 * rather than transcribed cell by cell, because the design generates it too.
 *
 * Earlier months are derived — a past month is fully played out (no "today",
 * nothing pending), so its calendar completes every weekday and its adherence
 * drifts slightly from the authored figures.
 */

export const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** July's in-progress day. Earlier months have no "today" at all. */
const TODAY_IN_CURRENT = 24;

export type CalendarCell = {
  /** `null` on the leading blanks that pad the grid to the 1st's weekday. */
  day: number | null;
  isToday: boolean;
  isFuture: boolean;
  /** Weekends carry no plan and render an em dash instead of a bar. */
  rest: boolean;
  planned: number;
  completed: number;
  /** Bar width, already clamped to 100. */
  fill: number;
};

/**
 * Built at module scope: `new Date(…)` during render would let the server and
 * the client disagree and blow up hydration, so every cell reaches the
 * component as a plain number.
 *
 * `today` is `null` for a month that has already finished.
 */
function buildCalendar(month: Month, today: number | null): CalendarCell[] {
  const cells: CalendarCell[] = [];

  for (let i = 0; i < month.firstDow; i += 1) {
    cells.push({
      day: null,
      isToday: false,
      isFuture: false,
      rest: false,
      planned: 0,
      completed: 0,
      fill: 0,
    });
  }

  for (let d = 1; d <= month.days; d += 1) {
    const weekend = isWeekend(month, d);
    const planned = weekend ? 0 : 38 + ((d * 13) % 20);
    const isToday = today !== null && d === today;
    const isPast = today === null || d < today;

    // Past days land near their plan, today is still only part-way through,
    // and future days have nothing completed at all.
    let completed = 0;
    if (!weekend) {
      if (isPast) completed = Math.round(planned * (0.8 + (d % 6) * 0.03));
      else if (isToday) completed = Math.round(planned * 0.58);
    }

    cells.push({
      day: d,
      isToday,
      isFuture: today !== null && d > today,
      rest: weekend,
      planned,
      completed,
      fill: planned ? Math.min(100, Math.round((completed / planned) * 100)) : 0,
    });
  }

  return cells;
}

export type AdherenceTier = "high" | "mid" | "low";

/** The design's thresholds: 90 and 75 split success / amber / danger. */
export function adherenceTier(adh: number): AdherenceTier {
  if (adh >= 90) return "high";
  if (adh >= 75) return "mid";
  return "low";
}

export type PlanRow = {
  mrch: string;
  region: string;
  stores: number;
  freq: string;
  planned: number;
  done: number;
  adh: number;
};

/** The designer's figures. July reads these unmodified. */
const CURRENT_PLAN_ROWS: PlanRow[] = [
  { mrch: "khang_nguyen", region: "Ho Chi Minh City", stores: 42, freq: "Weekly", planned: 168, done: 152, adh: 90 },
  { mrch: "linh_pham", region: "South East", stores: 38, freq: "Weekly", planned: 152, done: 141, adh: 93 },
  { mrch: "minh_tran", region: "Ho Chi Minh City", stores: 45, freq: "Weekly", planned: 180, done: 149, adh: 83 },
  { mrch: "thao_vo", region: "Mekong Delta", stores: 33, freq: "Bi-weekly", planned: 66, done: 44, adh: 67 },
  { mrch: "huy_le", region: "Central", stores: 40, freq: "Weekly", planned: 160, done: 138, adh: 86 },
  { mrch: "nam_hoang", region: "North Highlands", stores: 29, freq: "Bi-weekly", planned: 58, done: 31, adh: 53 },
  { mrch: "quan_do", region: "Red River Delta", stores: 44, freq: "Weekly", planned: 176, done: 170, adh: 97 },
  { mrch: "mai_bui", region: "South East", stores: 36, freq: "Weekly", planned: 144, done: 129, adh: 90 },
];

/** Adherence was a little weaker earlier in the window. */
const PER_MONTH = { scale: 1, bias: -1.4, spread: 1.1 };

function buildPlanRows(key: MonthKey, month: Month): PlanRow[] {
  if (key === CURRENT_MONTH) return CURRENT_PLAN_ROWS;

  const shift = shiftFor(key, PER_MONTH, 4100);
  const rand = lcg(shift.seed);
  // Weekdays drive how many visits a month can hold, so `planned` follows the
  // calendar rather than being jittered independently of it.
  const weekdays = countWeekdays(month);
  const currentWeekdays = countWeekdays(
    MONTHS[MONTHS.length - 1],
  );

  return CURRENT_PLAN_ROWS.map((row) => {
    const planned = Math.round((row.planned / currentWeekdays) * weekdays);
    const adh = Math.round(
      Math.min(99, Math.max(35, row.adh + shift.bias + (rand() - 0.5) * 2 * shift.spread)),
    );
    return { ...row, planned, done: Math.round((planned * adh) / 100), adh };
  });
}

function countWeekdays(month: Month): number {
  let n = 0;
  for (let d = 1; d <= month.days; d += 1) if (!isWeekend(month, d)) n += 1;
  return n;
}

export type JourneyPlansView = {
  monthLabel: string;
  calendar: CalendarCell[];
  planRows: PlanRow[];
};

export const JOURNEY_PLANS: Record<MonthKey, JourneyPlansView> = Object.fromEntries(
  MONTHS.map((month) => [
    month.key,
    {
      monthLabel: month.label,
      calendar: buildCalendar(
        month,
        month.key === CURRENT_MONTH ? TODAY_IN_CURRENT : null,
      ),
      planRows: buildPlanRows(month.key, month),
    },
  ]),
) as Record<MonthKey, JourneyPlansView>;
