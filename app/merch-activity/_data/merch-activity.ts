import { group } from "@/app/_format/num";
import {
  adherenceTier,
  type AdherenceTier,
  type Delta,
} from "@/app/_reports/thresholds";
import {
  CURRENT_MONTH,
  MONTHS,
  type Month,
  type MonthKey,
} from "@/app/_time/periods";
import {
  lcg,
  shiftCount,
  shiftFor,
  shiftPct,
  type Shift,
} from "@/app/_time/variants";

/**
 * Demo content for the Merchandiser activity & store coverage report. July 2026
 * is the month the design doc authored, so its figures live in `CURRENT_FACTS`
 * and reach `FACTS` by reference — nothing in this file transforms them. The
 * other five months apply `PER_MONTH` to those facts: the team, the estate and
 * the coverage were all smaller further back.
 *
 * Everything derived is computed once at
 * module scope, so the server and client renders are guaranteed to agree.
 */

/** The 90% coverage target, and the fraction of the 0–100 bar domain it sits at. */
const TARGET_PCT = 90;
export const COVERAGE_TARGET_FRACTION = TARGET_PCT / 100;

type NotSeenFact = { name: string; region: string; days: number };
type CoverageFact = { name: string; pct: number };
/** Merchandiser → the run of days they were absent for. */
type ActivityFact = [
  mrch: string,
  region: string,
  stores: number,
  visits: number,
  adherence: number,
  photos: number,
  pass: number,
  lastActive: string,
];
type OverdueFact = [
  store: string,
  retailer: string,
  region: string,
  /** `null` is a store that has never been visited at all. */
  days: number | null,
  mrch: string,
];

type Facts = {
  activeToday: number;
  teamSize: number;
  activeThisMonth: number;
  avgVisitsPerDay: number;
  avgMinutesInStore: number;
  notSeen: NotSeenFact[];
  activity: ActivityFact[];
  /** Stores audited out of the whole estate: the coverage hero's two numbers. */
  audited: number;
  estate: number;
  /** Points gained on the month before — the coverage hero's delta chip. */
  coverageGainPts: number;
  coverageRegions: CoverageFact[];
  coverageRetailers: CoverageFact[];
  coverageTypes: CoverageFact[];
  overdue: OverdueFact[];
};

const CURRENT_FACTS: Facts = {
  activeToday: 142,
  teamSize: 148,
  activeThisMonth: 148,
  avgVisitsPerDay: 6.4,
  avgMinutesInStore: 11,
  notSeen: [
    { name: "bao_vu", region: "Central", days: 9 },
    { name: "duc_ngo", region: "Red River Delta", days: 12 },
    { name: "ha_pham", region: "North Highlands", days: 8 },
  ],
  activity: [
    ["khang_nguyen", "Ho Chi Minh City", 42, 152, 90, 1840, 94, "2h ago"],
    ["linh_pham", "South East", 38, 141, 93, 1712, 92, "1h ago"],
    ["minh_tran", "Ho Chi Minh City", 45, 149, 83, 1901, 92, "3h ago"],
    ["quan_do", "Red River Delta", 44, 170, 97, 2044, 90, "40m ago"],
    ["mai_bui", "South East", 36, 129, 90, 1488, 88, "5h ago"],
    ["huy_le", "Central", 40, 138, 86, 1602, 79, "6d ago"],
    ["thao_vo", "Mekong Delta", 33, 44, 67, 604, 84, "1d ago"],
    ["nam_hoang", "North Highlands", 29, 31, 53, 388, 81, "4d ago"],
  ],
  audited: 1412,
  estate: 1847,
  coverageGainPts: 3,
  coverageRegions: [
    { name: "Ho Chi Minh City", pct: 84 },
    { name: "South East", pct: 79 },
    { name: "Mekong Delta", pct: 74 },
    { name: "Red River Delta", pct: 71 },
    { name: "Central", pct: 66 },
    { name: "North Highlands", pct: 58 },
  ],
  coverageRetailers: [
    { name: "Bach Hoa Xanh", pct: 81 },
    { name: "Winmart", pct: 73 },
    { name: "Co.opmart", pct: 70 },
    { name: "Aeon", pct: 68 },
    { name: "Lotte", pct: 61 },
  ],
  coverageTypes: [
    { name: "Mini mart", pct: 80 },
    { name: "Supermarket", pct: 72 },
    { name: "Hypermarket", pct: 64 },
    { name: "Convenience", pct: 51 },
  ],
  overdue: [
    ["Emart Vinh", "Emart", "Central", null, "—"],
    [
      "MM Mega Market Hải Phòng",
      "MM Mega Market",
      "Red River Delta",
      null,
      "duc_ngo",
    ],
    ["Aeon Hà Đông", "Aeon", "Red River Delta", 73, "duc_ngo"],
    ["Lotte Mart Đà Nẵng", "Lotte", "Central", 61, "bao_vu"],
    [
      "2111 BHX_HCM_TPH - 138 Lý Th",
      "Bach Hoa Xanh",
      "North Highlands",
      52,
      "nam_hoang",
    ],
    [
      "VNC0010338 Co.opmart Long Xuyên",
      "Co.opmart",
      "Mekong Delta",
      41,
      "thao_vo",
    ],
    ["3157 Winlife 537 Nguyễn Duy", "Winmart", "Central", 34, "huy_le"],
    [
      "1933 BHX_HCM_TPH - 871 Âu Cơ",
      "Bach Hoa Xanh",
      "South East",
      28,
      "mai_bui",
    ],
  ],
};

/* ---- deriving the other five months ---- */

/**
 * How one month further back differs, per fact family. A recipe rather than a
 * literal per month: the screen states how fast it was growing, and the six
 * months fall out of that.
 */
const PER_MONTH = {
  /** Head-counts and volumes: a smaller team working a smaller estate. */
  volume: { scale: 0.94, bias: 0, spread: 0.04 },
  /** Effort per merchandiser — visits a day, minutes in store. */
  intensity: { scale: 0.97, bias: 0, spread: 0.03 },
  /** Coverage, in points — the same step the hero cites against last month. */
  coverage: { scale: 1, bias: -3, spread: 1.2 },
  /** Route adherence was a little weaker earlier in the window. */
  adherence: { scale: 1, bias: -1.4, spread: 1.1 },
  /** Photo pass rate, matching the step the Photo quality hero cites. */
  pass: { scale: 1, bias: -1.8, spread: 1 },
  /** Days a store has gone unvisited: shorter backlogs on a younger estate. */
  overdue: { scale: 0.9, bias: 0, spread: 0.12 },
};

const SEED = 7000;

/**
 * Absence streaks are authored per month rather than generated: they are the
 * one thing a reader is meant to notice, and every run is inside
 * its own month's day count. July's live on `CURRENT_FACTS`.
 */

/** Coverage percentages read off the two numbers the hero caption prints. */
function coveragePct(facts: Facts): number {
  return Math.round((facts.audited / facts.estate) * 100);
}

function deriveCoverage(
  rows: CoverageFact[],
  shift: Shift,
  rand: () => number,
): CoverageFact[] {
  return rows.map((row) => ({
    name: row.name,
    pct: Math.round(shiftPct(row.pct, shift, rand)),
  }));
}

function deriveFacts(key: MonthKey, previous: Facts | null): Facts {
  const volume = shiftFor(key, PER_MONTH.volume, SEED);
  const intensity = shiftFor(key, PER_MONTH.intensity, SEED + 1);
  const coverage = shiftFor(key, PER_MONTH.coverage, SEED + 2);
  const adherence = shiftFor(key, PER_MONTH.adherence, SEED + 3);
  const pass = shiftFor(key, PER_MONTH.pass, SEED + 4);
  const overdue = shiftFor(key, PER_MONTH.overdue, SEED + 5);

  const randVolume = lcg(volume.seed);
  const randIntensity = lcg(intensity.seed);
  const randCoverage = lcg(coverage.seed);
  const randAdherence = lcg(adherence.seed);
  const randPass = lcg(pass.seed);
  const randOverdue = lcg(overdue.seed);

  const teamSize = shiftCount(CURRENT_FACTS.teamSize, volume, randVolume);
  const estate = shiftCount(CURRENT_FACTS.estate, volume, randVolume);
  const auditedPct = shiftPct(
    (CURRENT_FACTS.audited / CURRENT_FACTS.estate) * 100,
    coverage,
    randCoverage,
  );
  const facts: Facts = {
    activeToday: Math.round(
      (teamSize * CURRENT_FACTS.activeToday) / CURRENT_FACTS.teamSize,
    ),
    teamSize,
    // A team that was still hiring did not have everyone in the field all month.
    activeThisMonth: Math.round(teamSize * 0.97),
    avgVisitsPerDay: +(CURRENT_FACTS.avgVisitsPerDay * intensity.scale).toFixed(
      1,
    ),
    avgMinutesInStore: shiftCount(
      CURRENT_FACTS.avgMinutesInStore,
      intensity,
      randIntensity,
    ),
    notSeen: CURRENT_FACTS.notSeen.map((person) => ({
      ...person,
      // The card's own heading promises 7+ days, so the floor is part of it.
      days: Math.max(7, shiftCount(person.days, overdue, randOverdue)),
    })),
    activity: CURRENT_FACTS.activity.map(
      ([
        mrch,
        region,
        stores,
        visits,
        adh,
        photos,
        passRate,
        lastActive,
      ]): ActivityFact => [
        mrch,
        region,
        shiftCount(stores, volume, randVolume),
        shiftCount(visits, volume, randVolume),
        Math.round(shiftPct(adh, adherence, randAdherence, 99)),
        shiftCount(photos, volume, randVolume),
        Math.round(shiftPct(passRate, pass, randPass)),
        lastActive,
      ],
    ),
    audited: Math.round((estate * auditedPct) / 100),
    estate,
    coverageGainPts: 0,
    coverageRegions: deriveCoverage(
      CURRENT_FACTS.coverageRegions,
      coverage,
      randCoverage,
    ),
    coverageRetailers: deriveCoverage(
      CURRENT_FACTS.coverageRetailers,
      coverage,
      randCoverage,
    ),
    coverageTypes: deriveCoverage(
      CURRENT_FACTS.coverageTypes,
      coverage,
      randCoverage,
    ),
    overdue: CURRENT_FACTS.overdue.map(
      ([store, retailer, region, days, mrch]): OverdueFact => [
        store,
        retailer,
        region,
        days === null ? null : shiftCount(days, overdue, randOverdue),
        mrch,
      ],
    ),
  };

  // February has no month before it inside the window, so it falls back to the
  // recipe's nominal step rather than inventing a January.
  facts.coverageGainPts = previous
    ? coveragePct(facts) - coveragePct(previous)
    : -PER_MONTH.coverage.bias;

  return facts;
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

/* ---- field activity ---- */

type Tile = { label: string; value: string; sub: string };

function buildTiles(facts: Facts): Tile[] {
  return [
    {
      label: "Active today",
      value: String(facts.activeToday),
      sub: `of ${group(facts.teamSize)} merchandisers`,
    },
    {
      label: "Active this month",
      value: String(facts.activeThisMonth),
      sub:
        facts.activeThisMonth >= facts.teamSize
          ? "full team"
          : `of ${group(facts.teamSize)}`,
    },
    {
      label: "Avg visits / day",
      value: facts.avgVisitsPerDay.toFixed(1),
      sub: "per merchandiser",
    },
    {
      label: "Avg photo taking in store",
      value: `${facts.avgMinutesInStore}m`,
      sub: "per visit",
    },
  ];
}


/* ---- merchandiser activity table ---- */

export type ActivityRow = {
  mrch: string;
  region: string;
  stores: number;
  visits: number;
  adherence: number;
  adherenceTier: AdherenceTier;
  photos: number;
  pass: number;
  lastActive: string;
};

/* ---- estate coverage ---- */

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

function buildCoverageHero(facts: Facts): Hero {
  const pct = coveragePct(facts);
  const gain = facts.coverageGainPts;
  return {
    label: "Stores audited",
    value: String(pct),
    pct,
    targetPct: TARGET_PCT,
    delta: {
      direction: gain >= 0 ? "up" : "down",
      tone: gain >= 0 ? "success" : "danger",
      label: `${Math.abs(gain)} pts`,
    },
    caption: `${group(facts.audited)} of ${group(facts.estate)} · vs last month`,
    // Within five points of the target is close enough to say so.
    statusLabel:
      pct >= TARGET_PCT
        ? "On target"
        : TARGET_PCT - pct <= 5
          ? "Just below target"
          : "Below target",
    targetLabel: `Target ${TARGET_PCT}%`,
  };
}

/* ---- never-visited & overdue stores ---- */

export type OverdueRow = {
  store: string;
  retailer: string;
  region: string;
  days: string;
  mrch: string;
  /** Matches the coverage map's legend: never visited vs merely overdue. */
  status: "notyet" | "overdue";
};

/**
 * Never-visited stores head the list; the rest run longest-overdue first.
 * `MAX_SAFE_INTEGER` rather than `Infinity` so two never-visited stores compare
 * as 0 instead of `NaN` and keep their authored order.
 */
function buildOverdue(facts: Facts): OverdueRow[] {
  const rank = (days: number | null) => days ?? Number.MAX_SAFE_INTEGER;
  return [...facts.overdue]
    .sort((a, b) => rank(b[3]) - rank(a[3]))
    .map(([store, retailer, region, days, mrch]) => ({
      store,
      retailer,
      region,
      days: days === null ? "Never" : String(days),
      mrch,
      status: days === null ? "notyet" : "overdue",
    }));
}

/* ---- the month's view ---- */

export type MerchActivityView = {
  monthLabel: string;
  tiles: Tile[];
  notSeen: NotSeenFact[];
  activityRows: ActivityRow[];
  coverageHero: Hero;
  coverageRegions: CoverageFact[];
  coverageRetailers: CoverageFact[];
  coverageTypes: CoverageFact[];
  overdue: OverdueRow[];
};

function buildView(month: Month, facts: Facts): MerchActivityView {
  return {
    monthLabel: month.label,
    tiles: buildTiles(facts),
    notSeen: facts.notSeen,
    activityRows: facts.activity.map(
      ([mrch, region, stores, visits, adherence, photos, pass, lastActive]) => ({
        mrch,
        region,
        stores,
        visits,
        adherence,
        adherenceTier: adherenceTier(adherence),
        photos,
        pass,
        lastActive,
      }),
    ),
    coverageHero: buildCoverageHero(facts),
    // Coverage bars are already percentages of their own row's estate, so the
    // domain is a fixed 0–100 — the same domain the dashed 90% rule rides.
    coverageRegions: facts.coverageRegions,
    coverageRetailers: facts.coverageRetailers,
    coverageTypes: facts.coverageTypes,
    overdue: buildOverdue(facts),
  };
}

export const MERCH_ACTIVITY: Record<MonthKey, MerchActivityView> =
  Object.fromEntries(
    MONTHS.map((month) => [month.key, buildView(month, FACTS[month.key])]),
  ) as Record<MonthKey, MerchActivityView>;
