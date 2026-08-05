import type { IconName } from "@/app/_components/icon";

/**
 * Demo content for the Landing screen. The design drew three states — an empty
 * account, one with captures beginning, and a fully live one — but the first
 * two are shown as a single screen here: the onboarding stepper sits above the
 * same activity layout, so progress and live data are read together rather
 * than on separate screens.
 *
 * There is no backend yet — every figure is fixture data for
 * Colgate-Palmolive Vietnam, July 2026.
 */

export type LandingStateId = "onboarding" | "live";

/* ================= Onboarding — captures beginning ================= */

export const STEPPER_TITLE = "Your onboarding";

export type Step = {
  num: string;
  name: string;
  desc: string;
  state: "done" | "active" | "pending";
  status: string;
};

/**
 * Progress matches what the rest of the screen shows: master data is confirmed
 * by the band below, and captures are visibly arriving in the feed, so the bar
 * sits on "First captures" rather than back on step 1.
 */
export const STEPS: Step[] = [
  {
    num: "1",
    name: "Master data received",
    desc: "Stores, users and journey plans configured.",
    state: "done",
    status: "Done",
  },
  {
    num: "2",
    name: "Catalog configured",
    desc: "Digitising your product catalogue.",
    state: "done",
    status: "Done",
  },
  {
    num: "3",
    name: "First captures",
    desc: "Photos begin arriving from the field.",
    state: "active",
    status: "In progress",
  },
  {
    num: "4",
    name: "Analytics live",
    desc: "Shelf metrics available.",
    state: "pending",
    status: "Upcoming",
  },
];

export const HEADER_B = {
  title: "Activity",
  subtitle: "Colgate-Palmolive Vietnam · what's happening in the field",
  synced: "Synced 12 min ago",
  locked: "Analytics unlocks when the first sessions are processed",
};

export type ConfirmTile = { icon: IconName; value: string; label: string };

export const CONFIRM_B: ConfirmTile[] = [
  { icon: "store", value: "1,847", label: "Stores configured" },
  { icon: "users", value: "148", label: "Merchandisers" },
  { icon: "calendar-check", value: "Loaded", label: "Journey plans" },
];

export type Meter = {
  title: string;
  value: string;
  unit: string;
  caption: string;
  /** Fill width and target-tick offset, both as a percentage of the track. */
  fill: number;
  target: number;
  note: string;
  targetLabel: string;
};

export const METERS_B: Meter[] = [
  {
    title: "Store coverage",
    value: "76",
    unit: "%",
    caption: "1,412 of 1,847 audited",
    fill: 76,
    target: 90,
    note: "Below 90% target",
    targetLabel: "Target 90%",
  },
  {
    title: "Photo quality",
    value: "91.3",
    unit: "%",
    caption: "passed this month",
    fill: 91.3,
    target: 95,
    note: "Just below 95% target",
    targetLabel: "Target 95%",
  },
];

export const RETAILERS_CARD = {
  title: "Visits by retailer",
  caption: "July · 12,847 total",
};

/**
 * `visits` is pre-grouped rather than run through `toLocaleString()` at render
 * time as the design does — that formatter is locale-dependent and would risk
 * an SSR/client hydration mismatch.
 */
const RETAILER_SHARE: { name: string; visits: string; pct: number }[] = [
  { name: "Bach Hoa Xanh", visits: "5,120", pct: 39.9 },
  { name: "Winmart", visits: "2,980", pct: 23.2 },
  { name: "Co.opmart", visits: "2,140", pct: 16.7 },
  { name: "Aeon", visits: "1,210", pct: 9.4 },
  { name: "Lotte", visits: "610", pct: 4.7 },
  { name: "Emart", visits: "430", pct: 3.3 },
  { name: "MM Mega Market", visits: "357", pct: 2.8 },
];

/** Bars are normalised against the largest share, not against the total. */
const MAX_RETAILER_PCT = RETAILER_SHARE[0].pct;

export const RETAILERS = RETAILER_SHARE.map((retailer) => ({
  name: retailer.name,
  visits: retailer.visits,
  pct: retailer.pct.toFixed(1),
  width: +((retailer.pct / MAX_RETAILER_PCT) * 100).toFixed(1),
}));

export const MONTHS_CARD = {
  title: "Sessions by month",
  caption: "Feb–Jul 2026",
};

const SESSIONS: [label: string, value: number][] = [
  ["Feb", 8420],
  ["Mar", 9310],
  ["Apr", 10120],
  ["May", 11040],
  ["Jun", 11890],
  ["Jul", 12847],
];

/** Columns are normalised against July, the tallest month. */
const MAX_SESSIONS = 12847;

export const MONTHS = SESSIONS.map(([label, value]) => ({
  label,
  value: `${(value / 1000).toFixed(1)}k`,
  height: +((value / MAX_SESSIONS) * 100).toFixed(1),
}));

export type ReportCard = {
  icon: IconName;
  title: string;
  stat: string;
  href: string;
};

/**
 * The design left these as `cursor:pointer` cards with no destination; they map
 * onto the two surfaces State B's nav has already unlocked.
 */
export const REPORTS: ReportCard[] = [
  {
    icon: "camera",
    title: "Photo quality",
    stat: "91.3% of captures passed quality checks this month, just below the 95% target.",
    href: "/photo-quality",
  },
  {
    icon: "users",
    title: "Merch activity & coverage",
    stat: "142 merchandisers active today · 76% of the estate audited so far.",
    href: "/merch-activity",
  },
];

export const REPORT_CTA = "Open report";

/* ================= Activity feed — shared by both states ================= */

export const FEED_CARD = { title: "Activity feed", caption: "Today" };

/* Rows are ordered oldest to newest; the card's "Today" caption carries the
   timeframe, so individual rows are not timestamped. `text` is the React key,
   so keep each row's text distinct. */
export type FeedRow = {
  icon: IconName;
  text: string;
  figure: string;
  pill?: string;
  pillTone?: "warning" | "danger";
};

export const FEED: FeedRow[] = [
  { icon: "users", text: "Merchandisers active in the field", figure: "142" },
  { icon: "map-pin", text: "Stores visited today", figure: "418" },
  { icon: "camera", text: "Photos captured", figure: "6,204" },
  { icon: "cpu", text: "Sessions processed", figure: "1,880" },
  {
    icon: "target",
    text: "Coverage milestone — Ho Chi Minh City",
    figure: "75%",
  },
  {
    icon: "alert-triangle",
    text: "Photo quality dipped at MM Mega Market",
    figure: "88%",
    pill: "12 blurred",
    pillTone: "warning",
  },
  {
    icon: "package",
    text: "Catalog updated — Optic White SKUs added",
    figure: "+3",
  },
  {
    icon: "trending-down",
    text: "North Highlands behind plan this week",
    figure: "−18%",
    pill: "Behind plan",
    pillTone: "danger",
  },
];

/* ================= State C — fully live ================= */

export const HEADER_C = {
  title: "Activity",
  subtitle: "Colgate-Palmolive Vietnam · July 2026",
  synced: "Synced 12 min ago · 76% coverage",
};

export type HeroTile = {
  title: string;
  /** Sparkline polyline, in the design's 100×30 viewBox. */
  spark: string;
  value: string;
  unit: string;
  delta: string;
  /** Arrow direction and colour tone are independent — see `SECONDARY`. */
  deltaDirection: "up" | "down";
  deltaTone: "positive" | "negative";
  deltaCaption: string;
  fill: number;
  target: number;
  note: string;
  targetLabel: string;
};

export const OSA: HeroTile = {
  title: "On-Shelf Availability",
  spark: "0,24 20,21 40,17 60,12 80,9 100,6",
  value: "63.8",
  unit: "%",
  delta: "2.6 pts",
  deltaDirection: "up",
  deltaTone: "positive",
  deltaCaption: "vs last month",
  fill: 63.8,
  target: 85,
  note: "Below target",
  targetLabel: "Target 85%",
};

export const OSA_STATS = [
  { label: "Must-have OSA", value: "72.5%" },
  { label: "Out of stock", value: "36.2%" },
];

export const SOS: HeroTile = {
  title: "Share of Shelf",
  spark: "0,7 20,9 40,12 60,15 80,20 100,23",
  value: "38.7",
  unit: "%",
  delta: "2.3 pts",
  deltaDirection: "down",
  deltaTone: "negative",
  deltaCaption: "vs last month",
  fill: 38.7,
  target: 45,
  note: "Below target",
  targetLabel: "Target 45%",
};

export const SOS_SPLIT = {
  label: "Own vs competition",
  ratio: "38.3 / 61.7",
  own: 38.3,
  competition: 61.7,
  ownLabel: "Colgate",
  competitionLabel: "Competitors",
};

export const SECONDARY_TITLE = "More metrics";

export type Kpi = {
  name: string;
  value: string;
  delta: string;
  direction: "up" | "down";
  tone: "positive" | "negative";
};

/**
 * Direction and tone are two independent fields on purpose: "Out of stock vs
 * MSL" falls, which is good news, so the design pairs a down arrow with the
 * positive (green) treatment. Deriving the colour from the arrow would break it.
 */
export const SECONDARY: Kpi[] = [
  { name: "Must-have OSA", value: "72.5%", delta: "2.6", direction: "up", tone: "positive" },
  { name: "Out of stock vs MSL", value: "36.2%", delta: "2.5", direction: "down", tone: "positive" },
  { name: "Linear share of shelf", value: "38.8%", delta: "1.4", direction: "down", tone: "negative" },
  { name: "Perfect store index", value: "58.3", delta: "1.9", direction: "up", tone: "positive" },
  { name: "Planogram compliance", value: "66.3%", delta: "2.3", direction: "up", tone: "positive" },
  { name: "Pricing & promo", value: "74.1%", delta: "1.6", direction: "up", tone: "positive" },
];

export const ACTIONS = {
  analytics: {
    icon: "bar-chart-3" as IconName,
    title: "Open Analytics",
    desc: "Shelf metrics by region, retailer, category and brand.",
    href: "/analytics",
  },
  explorer: {
    icon: "map" as IconName,
    title: "Open Store Explorer",
    desc: "See which stores were visited, on a map and in a list.",
    href: "/store-explorer",
  },
};
