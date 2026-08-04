import {
  rateTier,
  rejScore,
  type Delta,
  type RateTier,
  type ScoreTier,
} from "@/app/_reports/thresholds";

/**
 * Demo content for the Photo quality report, transcribed verbatim from the
 * design doc. Every derived figure is computed here at module scope so the
 * server and client renders cannot disagree, and so the views stay declarative.
 */

export const HERO = {
  label: "Captures passing quality checks",
  value: "91.3",
  pct: 91.3,
  targetPct: 95,
  // A rising pass rate is good — the inverse of the rejection-reason pairing.
  delta: { direction: "up", tone: "success", label: "1.8 pts" } satisfies Delta,
  caption: "vs last month · 41,320 captures",
  statusLabel: "Just below target",
  targetLabel: "Target 95%",
};

/* ---- 30-day trend ---- */

/** Pass rate over the month. Twelve readings, plotted across a 0–100 domain. */
const PASS = [
  88.4, 88.9, 89.2, 88.7, 89.6, 90.1, 90.4, 90.2, 90.8, 91.0, 91.1, 91.3,
];

const X0 = 40;
const X1 = 712;
const Y0 = 14;
const Y1 = 148;

/** The plot area only spans 80–100%, which is what makes the drift readable. */
const py = (v: number) => (Y1 - ((v - 80) / 20) * (Y1 - Y0)).toFixed(1);
const px = (i: number) => (X0 + i * ((X1 - X0) / (PASS.length - 1))).toFixed(1);

export const TREND = {
  line: PASS.map((v, i) => `${px(i)},${py(v)}`).join(" "),
  dots: PASS.map((v, i) => ({ cx: px(i), cy: py(v) })),
  grid: [80, 90, 100].map((v) => ({ y: py(v), label: String(v) })),
  targetY: py(95),
  // Only four of the six ticks are labelled; the blanks keep the spacing even.
  xLabels: (
    [
      ["1 Jul", 0],
      ["", 2],
      ["10 Jul", 4],
      ["", 6],
      ["20 Jul", 8],
      ["31 Jul", 11],
    ] as const
  ).map(([label, i]) => ({ label, x: px(i) })),
};

/* ---- why captures were rejected ---- */

export type RejectionReason = {
  name: string;
  pct: number;
  width: number;
  delta: Delta;
};

/* Direction and tone are written out per row rather than derived from one
   another: here a rising share is the bad case, so `up` pairs with `danger`. */
const REASONS_RAW: { name: string; pct: number; delta: Delta }[] = [
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
];

/** Bars are normalised to the leading reason, not to 100%. */
const REASON_MAX = REASONS_RAW[0].pct;

export const REJECTION_REASONS: RejectionReason[] = REASONS_RAW.map((r) => ({
  ...r,
  width: +((r.pct / REASON_MAX) * 100).toFixed(1),
}));

export const REASONS_CAPTION = "3,595 rejected captures · this month";
export const REASONS_NOTE =
  "Blur is the dominant reason and rising — the actionable signal this month.";

/* ---- rejection rate by region ---- */

const REGIONS_RAW: [name: string, rate: number][] = [
  ["North Highlands", 14.2],
  ["Central", 11.8],
  ["Mekong Delta", 9.6],
  ["South East", 8.1],
  ["Red River Delta", 7.4],
  ["Ho Chi Minh City", 6.9],
];

/** Bar domain is 0–14.2, the worst region — so the leader always fills. */
const REGION_MAX = 14.2;

export const REJECTION_REGIONS = REGIONS_RAW.map(([name, rate]) => ({
  name,
  rate: rate.toFixed(1),
  width: +((rate / REGION_MAX) * 100).toFixed(1),
}));

/** The ≤5% target, as a fraction of that same 0–14.2 domain. */
export const REGION_TARGET_FRACTION = 0.352;

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

const WORST_RAW: [
  mrch: string,
  region: string,
  captures: number,
  rate: number,
  reason: string,
][] = [
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
];

const WORST_MAX = 21.4;

export const WORST: WorstRow[] = WORST_RAW.map(
  ([mrch, region, captures, rate, reason]) => ({
    mrch,
    region,
    captures,
    reason,
    rate: rate.toFixed(1),
    width: +((rate / WORST_MAX) * 100).toFixed(1),
    tier: rateTier(rate),
  }),
);

/* ---- recent rejected sessions ---- */

export type RejectedSession = {
  reason: string;
  store: string;
  code: string;
  score: number;
  tier: ScoreTier;
};

const REJECTED_RAW: [
  reason: string,
  store: string,
  code: string,
  score: number,
][] = [
  ["Blurred", "30151 BHX_HCM Vạn Kiếp", "VNC0304896", 38],
  ["Shelf slanted", "Winmart Q7 Trần", "VNC0207442", 54],
  ["Person in frame", "Co.opmart N.Đ.Chiểu", "VNC0182310", 47],
  ["Obstructed", "Aeon Tân Phú", "VNC0090114", 61],
  ["Not a shelf", "Lotte Mart Cần Thơ", "VNC0155201", 22],
  ["Blurred", "Emart Gò Vấp", "VNC0233900", 41],
  ["Shelf slanted", "MM Mega Market An Phú", "VNC0301778", 49],
];

export const REJECTED: RejectedSession[] = REJECTED_RAW.map(
  ([reason, store, code, score]) => ({
    reason,
    store,
    code,
    score,
    tier: rejScore(score),
  }),
);
