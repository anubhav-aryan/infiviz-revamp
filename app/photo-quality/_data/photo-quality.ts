import { group, pct1 } from "@/app/_format/num";
import {
  rateTier,
  rejScore,
  type Delta,
  type RateTier,
  type ScoreTier,
} from "@/app/_reports/thresholds";
import {
  CURRENT_MONTH,
  MONTHS,
  type Month,
  type MonthKey,
} from "@/app/_time/periods";
import { lcg, shiftCount, shiftFor, shiftPct } from "@/app/_time/variants";

/**
 * Demo content for the Photo quality report. July 2026 is the month the design
 * doc authored, so its figures live in `CURRENT_FACTS` and reach `FACTS` by
 * reference — nothing in this file transforms them. The other five months are
 * produced by applying `PER_MONTH` to those facts, because the report trends up
 * across the window: a month further back captured less and passed less of it.
 *
 * Every derived figure is computed here at module scope so the server and
 * client renders cannot disagree, and so the views stay declarative.
 */

/** Pass-rate target, as the hero meter and the trend's dashed rule read it. */
const TARGET_PCT = 95;

/** The ≤5% rejection rate the by-region card rules off against. */
const TARGET_RATE = 5;

type ReasonFact = { name: string; pct: number; delta: Delta };
type RegionFact = [name: string, rate: number];
type WorstFact = [
  mrch: string,
  region: string,
  captures: number,
  rate: number,
  reason: string,
];
type RejectedFact = [
  reason: string,
  store: string,
  code: string,
  score: number,
];

type Facts = {
  /** The hero's pass rate, and the last reading of the trend under it. */
  passPct: number;
  /** The capture count the hero caption cites. */
  captures: number;
  /** Points gained on the month before — the hero's delta chip. */
  gainPts: number;
  /** Pass rate over the month. Twelve readings, plotted across a 0–100 domain. */
  pass: number[];
  reasons: ReasonFact[];
  regions: RegionFact[];
  worst: WorstFact[];
  rejected: RejectedFact[];
};

/* Direction and tone are written out per row rather than derived from one
   another: on a rejection reason a rising share is the bad case, so `up` pairs
   with `danger`. */
const CURRENT_FACTS: Facts = {
  passPct: 91.3,
  captures: 41320,
  gainPts: 1.8,
  pass: [88.4, 88.9, 89.2, 88.7, 89.6, 90.1, 90.4, 90.2, 90.8, 91.0, 91.1, 91.3],
  reasons: [
    {
      name: "Blurred",
      pct: 34,
      delta: { direction: "up", tone: "danger", label: "6" },
    },
    {
      name: "Shelf slanted",
      pct: 26,
      delta: { direction: "up", tone: "danger", label: "2" },
    },
    {
      name: "Obstructed",
      pct: 18,
      delta: { direction: "down", tone: "success", label: "3" },
    },
    {
      name: "Person in frame",
      pct: 12,
      delta: { direction: "down", tone: "success", label: "2" },
    },
    {
      name: "Not a shelf",
      pct: 10,
      delta: { direction: "down", tone: "success", label: "1" },
    },
  ],
  regions: [
    ["North Highlands", 14.2],
    ["Central", 11.8],
    ["Mekong Delta", 9.6],
    ["South East", 8.1],
    ["Red River Delta", 7.4],
    ["Ho Chi Minh City", 6.9],
  ],
  worst: [
    ["huy_le", "Central", 62, 21.4, "Blurred"],
    ["nam_hoang", "North Highlands", 48, 18.9, "Shelf slanted"],
    ["thao_vo", "Mekong Delta", 71, 16.2, "Blurred"],
    ["duc_ngo", "Red River Delta", 54, 13.7, "Obstructed"],
    ["mai_bui", "South East", 88, 11.9, "Shelf slanted"],
    ["quan_do", "Red River Delta", 96, 10.4, "Blurred"],
    ["linh_pham", "South East", 134, 8.8, "Person in frame"],
    ["minh_tran", "Ho Chi Minh City", 151, 7.9, "Blurred"],
    ["khang_nguyen", "Ho Chi Minh City", 168, 7.1, "Shelf slanted"],
    ["bao_vu", "Central", 42, 6.5, "Not a shelf"],
  ],
  rejected: [
    ["Blurred", "30151 BHX_HCM Vạn Kiếp", "VNC0304896", 38],
    ["Shelf slanted", "Winmart Q7 Trần", "VNC0207442", 54],
    ["Person in frame", "Co.opmart N.Đ.Chiểu", "VNC0182310", 47],
    ["Obstructed", "Aeon Tân Phú", "VNC0090114", 61],
    ["Not a shelf", "Lotte Mart Cần Thơ", "VNC0155201", 22],
    ["Blurred", "Emart Gò Vấp", "VNC0233900", 41],
    ["Shelf slanted", "MM Mega Market An Phú", "VNC0301778", 49],
  ],
};

/* ---- deriving the other five months ---- */

/**
 * How one month further back differs, per fact family. A recipe rather than a
 * literal per month: the only thing the screen has to state is how fast it was
 * improving, and the six months fall out of that.
 */
const PER_MONTH = {
  /** Capture volume: a smaller estate and a smaller team behind it. */
  volume: { scale: 0.93, bias: 0, spread: 0.05 },
  /** Pass rate, in points — the same step the hero cites against last month. */
  pass: { scale: 1, bias: -1.8, spread: 0.5 },
  /** A point off the pass rate is a point onto every rejection rate. */
  rate: { scale: 1, bias: 1.8, spread: 0.8 },
  /** Reason shares only wobble; blur stays the dominant story throughout. */
  share: { scale: 1, bias: 0, spread: 1.6 },
  /** The quality score on a capture that was already rejected. */
  score: { scale: 1, bias: -1.2, spread: 2.5 },
};

const SEED = 5300;

/**
 * Shares are a breakdown of one pool, so jitter cannot be allowed to move their
 * total off 100. Renormalising and handing the rounding remainder to the
 * leading reason keeps both the total and the ordering the caption assumes.
 */
function deriveShares(
  reasons: ReasonFact[],
  key: MonthKey,
): ReasonFact[] {
  const shift = shiftFor(key, PER_MONTH.share, SEED + 3);
  const rand = lcg(shift.seed);
  const jittered = reasons.map((r) => Math.max(1, shiftPct(r.pct, shift, rand)));
  const total = jittered.reduce((sum, v) => sum + v, 0);
  const shares = jittered.map((v) => Math.round((v / total) * 100));
  shares[0] += 100 - shares.reduce((sum, v) => sum + v, 0);
  return reasons.map((r, i) => ({ ...r, pct: shares[i] }));
}

/** Rejection rates are read as a ranking, so a shuffled month has to re-sort. */
function byRateDesc<T extends { rate: number }>(rows: T[]): T[] {
  return [...rows].sort((a, b) => b.rate - a.rate);
}

function deriveFacts(key: MonthKey, previous: Facts | null): Facts {
  const volume = shiftFor(key, PER_MONTH.volume, SEED);
  const pass = shiftFor(key, PER_MONTH.pass, SEED + 1);
  const rate = shiftFor(key, PER_MONTH.rate, SEED + 2);
  const score = shiftFor(key, PER_MONTH.score, SEED + 4);

  const randVolume = lcg(volume.seed);
  const randPass = lcg(pass.seed);
  const randRate = lcg(rate.seed);
  const randScore = lcg(score.seed);

  const series = CURRENT_FACTS.pass.map((v) => shiftPct(v, pass, randPass));
  const passPct = series[series.length - 1];

  const regions = byRateDesc(
    CURRENT_FACTS.regions.map(([name, r]) => ({
      name,
      rate: shiftPct(r, rate, randRate),
    })),
  ).map(({ name, rate: r }): RegionFact => [name, r]);

  const worst = byRateDesc(
    CURRENT_FACTS.worst.map(([mrch, region, captures, r, reason]) => ({
      mrch,
      region,
      captures: shiftCount(captures, volume, randVolume),
      rate: shiftPct(r, rate, randRate),
      reason,
    })),
  ).map(
    ({ mrch, region, captures, rate: r, reason }): WorstFact => [
      mrch,
      region,
      captures,
      r,
      reason,
    ],
  );

  return {
    passPct,
    captures: shiftCount(CURRENT_FACTS.captures, volume, randVolume),
    // February has no month before it inside the window, so it falls back to
    // the recipe's nominal step rather than inventing a January.
    gainPts: previous
      ? +(passPct - previous.passPct).toFixed(1)
      : -PER_MONTH.pass.bias,
    pass: series,
    reasons: deriveShares(CURRENT_FACTS.reasons, key),
    regions,
    worst,
    rejected: CURRENT_FACTS.rejected.map(
      ([reason, store, code, s]): RejectedFact => [
        reason,
        store,
        code,
        Math.round(shiftPct(s, score, randScore)),
      ],
    ),
  };
}

/**
 * Built in calendar order so a month can read its gain off the one before it.
 * July is assigned by reference — no spread — so the authored figures are
 * provably the ones the current month renders.
 */
const FACTS: Record<MonthKey, Facts> = (() => {
  const out = {} as Record<MonthKey, Facts>;
  let previous: Facts | null = null;
  for (const month of MONTHS) {
    out[month.key] =
      month.key === CURRENT_MONTH
        ? CURRENT_FACTS
        : deriveFacts(month.key, previous);
    previous = out[month.key];
  }
  return out;
})();

/* ---- hero ---- */

type Hero = {
  label: string;
  value: string;
  pct: number;
  targetPct: number;
  delta: Delta;
  caption: string;
  statusLabel: string;
  targetLabel: string;
};

/** Within five points of the target is close enough to say so. */
function statusFor(pct: number, target: number): string {
  if (pct >= target) return "On target";
  return target - pct <= 5 ? "Just below target" : "Below target";
}

function buildHero(facts: Facts): Hero {
  return {
    label: "Captures passing quality checks",
    value: pct1(facts.passPct),
    pct: facts.passPct,
    targetPct: TARGET_PCT,
    // A rising pass rate is good — the inverse of the rejection-reason pairing.
    delta: {
      direction: facts.gainPts >= 0 ? "up" : "down",
      tone: facts.gainPts >= 0 ? "success" : "danger",
      label: `${pct1(Math.abs(facts.gainPts))} pts`,
    },
    caption: `vs last month · ${group(facts.captures)} captures`,
    statusLabel: statusFor(facts.passPct, TARGET_PCT),
    targetLabel: `Target ${TARGET_PCT}%`,
  };
}

/* ---- 30-day trend ---- */

const X0 = 40;
const X1 = 712;
const Y0 = 14;
const Y1 = 148;

/** The plot area only spans 80–100%, which is what makes the drift readable. */
const py = (v: number) => (Y1 - ((v - 80) / 20) * (Y1 - Y0)).toFixed(1);
const px = (i: number) =>
  (X0 + i * ((X1 - X0) / (CURRENT_FACTS.pass.length - 1))).toFixed(1);

/**
 * Only four of the six ticks are labelled; the blanks keep the spacing even.
 * `"last"` is the final day of the month, so it moves with the calendar.
 */
const TICKS: [day: number | "last" | null, index: number][] = [
  [1, 0],
  [null, 2],
  [10, 4],
  [null, 6],
  [20, 8],
  ["last", 11],
];

type Trend = {
  line: string;
  dots: { cx: string; cy: string }[];
  grid: { y: string; label: string }[];
  targetY: string;
  xLabels: { label: string; x: string }[];
  ariaLabel: string;
};

function buildTrend(month: Month, pass: number[]): Trend {
  const first = pass[0];
  const last = pass[pass.length - 1];
  return {
    line: pass.map((v, i) => `${px(i)},${py(v)}`).join(" "),
    dots: pass.map((v, i) => ({ cx: px(i), cy: py(v) })),
    grid: [80, 90, 100].map((v) => ({ y: py(v), label: String(v) })),
    targetY: py(TARGET_PCT),
    xLabels: TICKS.map(([day, i]) => ({
      label:
        day === null
          ? ""
          : `${day === "last" ? month.days : day} ${month.shortLabel}`,
      x: px(i),
    })),
    ariaLabel: `Pass rate over the last 30 days, ${
      last >= first ? "rising" : "falling"
    } from ${pct1(first)}% to ${pct1(last)}% against a ${TARGET_PCT}% target`,
  };
}

/* ---- why captures were rejected ---- */

export type RejectionReason = {
  name: string;
  pct: number;
  width: number;
  delta: Delta;
};

export const REASONS_NOTE =
  "Blur is the dominant reason and rising — the actionable signal this month.";

/** Bars are normalised to the leading reason of that month, not to 100%. */
function buildReasons(reasons: ReasonFact[]): RejectionReason[] {
  const max = Math.max(...reasons.map((r) => r.pct));
  return reasons.map((r) => ({
    ...r,
    width: +((r.pct / max) * 100).toFixed(1),
  }));
}

/* ---- rejection rate by region ---- */

type RegionRow = { name: string; rate: string; width: number };

export type PhotoQualityView = {
  monthLabel: string;
  hero: Hero;
  trend: Trend;
  reasons: RejectionReason[];
  reasonsCaption: string;
  regions: RegionRow[];
  /** Where the ≤5% target falls along that month's own bar domain. */
  regionTargetFraction: number;
  worst: WorstRow[];
  rejected: RejectedSession[];
};

/* ---- merchandisers by rejection rate ---- */

export type WorstRow = {
  mrch: string;
  region: string;
  captures: number;
  rate: string;
  width: number;
  tier: RateTier;
  reason: string;
};

/* ---- recent rejected sessions ---- */

export type RejectedSession = {
  reason: string;
  store: string;
  code: string;
  score: number;
  tier: ScoreTier;
};

function buildView(month: Month, facts: Facts): PhotoQualityView {
  // Both bar domains run 0–worst, so the leader always fills its track. The max
  // is that month's own — normalising against July would leave every earlier
  // month's bars short of the end of the track.
  const regionMax = Math.max(...facts.regions.map(([, rate]) => rate));
  const worstMax = Math.max(...facts.worst.map(([, , , rate]) => rate));

  return {
    monthLabel: month.label,
    hero: buildHero(facts),
    trend: buildTrend(month, facts.pass),
    reasons: buildReasons(facts.reasons),
    // The rejected pool is what the pass rate left behind.
    reasonsCaption: `${group(
      Math.round((facts.captures * (100 - facts.passPct)) / 100),
    )} rejected captures · this month`,
    regions: facts.regions.map(([name, rate]) => ({
      name,
      rate: rate.toFixed(1),
      width: +((rate / regionMax) * 100).toFixed(1),
    })),
    regionTargetFraction: +(TARGET_RATE / regionMax).toFixed(3),
    worst: facts.worst.map(([mrch, region, captures, rate, reason]) => ({
      mrch,
      region,
      captures,
      reason,
      rate: rate.toFixed(1),
      width: +((rate / worstMax) * 100).toFixed(1),
      tier: rateTier(rate),
    })),
    rejected: facts.rejected.map(([reason, store, code, score]) => ({
      reason,
      store,
      code,
      score,
      tier: rejScore(score),
    })),
  };
}

export const PHOTO_QUALITY: Record<MonthKey, PhotoQualityView> =
  Object.fromEntries(
    MONTHS.map((month) => [month.key, buildView(month, FACTS[month.key])]),
  ) as Record<MonthKey, PhotoQualityView>;
