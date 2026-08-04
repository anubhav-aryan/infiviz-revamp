/**
 * Journey plans fixtures. The month is July 2026 and "today" is the 24th — the
 * calendar is generated from the design's arithmetic rather than transcribed
 * cell by cell, because the design generates it too.
 */

export const MONTH_LABEL = "July 2026";

export const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const YEAR = 2026;
/** Zero-based, so 6 is July. */
const MONTH = 6;
const DAYS_IN_MONTH = 31;
const TODAY = 24;

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
 * Built once at module scope: `new Date(…)` during render would let the server
 * and the client disagree and blow up hydration, so every cell reaches the
 * component as a plain number.
 */
function buildCalendar(): CalendarCell[] {
  const cells: CalendarCell[] = [];
  const firstDow = new Date(YEAR, MONTH, 1).getDay();

  for (let i = 0; i < firstDow; i += 1) {
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

  for (let d = 1; d <= DAYS_IN_MONTH; d += 1) {
    const dow = new Date(YEAR, MONTH, d).getDay();
    const weekend = dow === 0 || dow === 6;
    const planned = weekend ? 0 : 38 + ((d * 13) % 20);
    const isToday = d === TODAY;

    // Past days land near their plan, today is still only part-way through,
    // and future days have nothing completed at all.
    let completed = 0;
    if (!weekend) {
      if (d < TODAY) completed = Math.round(planned * (0.8 + (d % 6) * 0.03));
      else if (isToday) completed = Math.round(planned * 0.58);
    }

    cells.push({
      day: d,
      isToday,
      isFuture: d > TODAY,
      rest: weekend,
      planned,
      completed,
      fill: planned ? Math.min(100, Math.round((completed / planned) * 100)) : 0,
    });
  }

  return cells;
}

export const CALENDAR = buildCalendar();

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

export const PLAN_ROWS: PlanRow[] = [
  { mrch: "khang_nguyen", region: "Ho Chi Minh City", stores: 42, freq: "Weekly", planned: 168, done: 152, adh: 90 },
  { mrch: "linh_pham", region: "South East", stores: 38, freq: "Weekly", planned: 152, done: 141, adh: 93 },
  { mrch: "minh_tran", region: "Ho Chi Minh City", stores: 45, freq: "Weekly", planned: 180, done: 149, adh: 83 },
  { mrch: "thao_vo", region: "Mekong Delta", stores: 33, freq: "Bi-weekly", planned: 66, done: 44, adh: 67 },
  { mrch: "huy_le", region: "Central", stores: 40, freq: "Weekly", planned: 160, done: 138, adh: 86 },
  { mrch: "nam_hoang", region: "North Highlands", stores: 29, freq: "Bi-weekly", planned: 58, done: 31, adh: 53 },
  { mrch: "quan_do", region: "Red River Delta", stores: 44, freq: "Weekly", planned: 176, done: 170, adh: 97 },
  { mrch: "mai_bui", region: "South East", stores: 36, freq: "Weekly", planned: 144, done: 129, adh: 90 },
];
