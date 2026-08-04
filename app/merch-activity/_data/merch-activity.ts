import {
  adherenceTier,
  heatLevel,
  type AdherenceTier,
  type Delta,
  type HeatLevel,
} from "@/app/_reports/thresholds";

/**
 * Demo content for the Merchandiser activity & store coverage report,
 * transcribed verbatim from the design doc. Everything derived — including the
 * 310 heatmap cells — is computed once at module scope, so the server and
 * client renders are guaranteed to agree.
 */

/* ---- field activity ---- */

export const ACTIVITY_TILES = [
  { label: "Active today", value: "142", sub: "of 148 merchandisers" },
  { label: "Active this month", value: "148", sub: "full team" },
  { label: "Avg visits / day", value: "6.4", sub: "per merchandiser" },
  { label: "Avg time in store", value: "11m", sub: "per visit" },
];

export const NOT_SEEN = [
  { name: "bao_vu", region: "Central", days: 9 },
  { name: "duc_ngo", region: "Red River Delta", days: 12 },
  { name: "ha_pham", region: "North Highlands", days: 8 },
];

/* ---- visits heatmap: 10 merchandisers × 31 days ---- */

export type HeatCell = { level: HeatLevel; title: string };
export type HeatRow = { name: string; cells: HeatCell[] };

const HEAT_NAMES = [
  "khang_nguyen",
  "linh_pham",
  "minh_tran",
  "thao_vo",
  "huy_le",
  "nam_hoang",
  "quan_do",
  "mai_bui",
  "duc_ngo",
  "bao_vu",
];

/** Deliberate absence streaks — the story the heatmap is there to tell. */
const GAPS: Record<string, [from: number, to: number]> = {
  huy_le: [11, 17],
  duc_ngo: [13, 24],
  bao_vu: [15, 22],
  nam_hoang: [20, 27],
};

/**
 * The design's LCG, reproduced expression-for-expression. `& 0x7fffffff` runs
 * the product through ToInt32, so the double-precision rounding above 2^53 is
 * part of the sequence — any "safer" arithmetic would produce a different map.
 */
function lcg(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

export const HEAT_ROWS: HeatRow[] = HEAT_NAMES.map((name, rowIndex) => {
  const rand = lcg(7000 + rowIndex * 131);
  const gap = GAPS[name];
  const cells: HeatCell[] = [];

  for (let day = 1; day <= 31; day++) {
    // July 2026. Local-time construction, but the weekday of a calendar date
    // is the same in every zone, so this stays stable across environments.
    const dow = new Date(2026, 6, day).getDay();
    const weekend = dow === 0 || dow === 6;

    let visits: number;
    if (gap && day >= gap[0] && day <= gap[1]) visits = 0;
    else if (weekend) visits = rand() < 0.75 ? 0 : 1;
    else visits = Math.max(0, Math.round(3 + (rand() - 0.35) * 7));

    cells.push({
      level: heatLevel(visits),
      title: `${name} · Jul ${day} · ${visits} visits`,
    });
  }

  return { name, cells };
});

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

const ACTIVITY_RAW: [
  mrch: string,
  region: string,
  stores: number,
  visits: number,
  adherence: number,
  photos: number,
  pass: number,
  lastActive: string,
][] = [
  ["khang_nguyen", "Ho Chi Minh City", 42, 152, 90, 1840, 94, "2h ago"],
  ["linh_pham", "South East", 38, 141, 93, 1712, 92, "1h ago"],
  ["minh_tran", "Ho Chi Minh City", 45, 149, 83, 1901, 92, "3h ago"],
  ["quan_do", "Red River Delta", 44, 170, 97, 2044, 90, "40m ago"],
  ["mai_bui", "South East", 36, 129, 90, 1488, 88, "5h ago"],
  ["huy_le", "Central", 40, 138, 86, 1602, 79, "6d ago"],
  ["thao_vo", "Mekong Delta", 33, 44, 67, 604, 84, "1d ago"],
  ["nam_hoang", "North Highlands", 29, 31, 53, 388, 81, "4d ago"],
];

export const ACTIVITY_ROWS: ActivityRow[] = ACTIVITY_RAW.map(
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
);

/* ---- estate coverage ---- */

export const COVERAGE_HERO = {
  label: "Stores audited",
  value: "76",
  pct: 76,
  targetPct: 90,
  delta: { direction: "up", tone: "success", label: "3 pts" } satisfies Delta,
  caption: "1,412 of 1,847 · vs last month",
  statusLabel: "Below target",
  targetLabel: "Target 90%",
};

/** Coverage bars are already percentages, so the bar width is the value. */
export const COVERAGE_REGIONS = [
  { name: "Ho Chi Minh City", pct: 84 },
  { name: "South East", pct: 79 },
  { name: "Mekong Delta", pct: 74 },
  { name: "Red River Delta", pct: 71 },
  { name: "Central", pct: 66 },
  { name: "North Highlands", pct: 58 },
];

/** The 90% target on a 0–100 domain. */
export const COVERAGE_TARGET_FRACTION = 0.9;

export const COVERAGE_RETAILERS = [
  { name: "Bach Hoa Xanh", pct: 81 },
  { name: "Winmart", pct: 73 },
  { name: "Co.opmart", pct: 70 },
  { name: "Aeon", pct: 68 },
  { name: "Lotte", pct: 61 },
];

export const COVERAGE_TYPES = [
  { name: "Mini mart", pct: 80 },
  { name: "Supermarket", pct: 72 },
  { name: "Hypermarket", pct: 64 },
  { name: "Convenience", pct: 51 },
];

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

export const OVERDUE: OverdueRow[] = [
  {
    store: "Emart Vinh",
    retailer: "Emart",
    region: "Central",
    days: "Never",
    mrch: "—",
    status: "notyet",
  },
  {
    store: "MM Mega Market Hải Phòng",
    retailer: "MM Mega Market",
    region: "Red River Delta",
    days: "Never",
    mrch: "duc_ngo",
    status: "notyet",
  },
  {
    store: "Aeon Hà Đông",
    retailer: "Aeon",
    region: "Red River Delta",
    days: "73",
    mrch: "duc_ngo",
    status: "overdue",
  },
  {
    store: "Lotte Mart Đà Nẵng",
    retailer: "Lotte",
    region: "Central",
    days: "61",
    mrch: "bao_vu",
    status: "overdue",
  },
  {
    store: "2111 BHX_HCM_TPH - 138 Lý Th",
    retailer: "Bach Hoa Xanh",
    region: "North Highlands",
    days: "52",
    mrch: "nam_hoang",
    status: "overdue",
  },
  {
    store: "VNC0010338 Co.opmart Long Xuyên",
    retailer: "Co.opmart",
    region: "Mekong Delta",
    days: "41",
    mrch: "thao_vo",
    status: "overdue",
  },
  {
    store: "3157 Winlife 537 Nguyễn Duy",
    retailer: "Winmart",
    region: "Central",
    days: "34",
    mrch: "huy_le",
    status: "overdue",
  },
  {
    store: "1933 BHX_HCM_TPH - 871 Âu Cơ",
    retailer: "Bach Hoa Xanh",
    region: "South East",
    days: "28",
    mrch: "mai_bui",
    status: "overdue",
  },
];
