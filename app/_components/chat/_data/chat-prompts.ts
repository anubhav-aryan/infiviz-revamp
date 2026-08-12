import type { IconName } from "@/app/_components/icon";
import type { NavId } from "@/app/_components/nav";
import { CURRENT_MSL_GAP, INSIGHTS } from "@/app/analytics/_data/analytics";
import { DIM_SOURCE, ESTATE } from "@/app/analytics/_data/spine";
import type { BarRow } from "@/app/_charts/h-bar-list";
import { group } from "@/app/_format/num";
import { CURRENT_MONTH, MONTH_BY_KEY } from "@/app/_time/periods";
import { PHOTO_QUALITY, REASONS_NOTE } from "@/app/photo-quality/_data/photo-quality";
import {
  BRAND_ROWS,
  SESSION_HEADER,
  SESSION_TITLE,
} from "@/app/session-viewer/_data/session-viewer";
import { SOURCES, SUGGESTIONS, type SourceId } from "@/app/tickets/_data/tickets";

/**
 * What the assistant mockup can point at, per screen.
 *
 * Nothing here is invented. Suggestions are not authored — they are read out
 * of the same fixtures Tickets already turns into its board, the same
 * discipline that file documents: a hint on this panel is literally the fact
 * the source screen is showing, not a retyped or generated one. Screens with
 * nothing analogous get hand-written copy that still names real regions,
 * retailers and categories rather than invented figures.
 */

/**
 * `title` is the short hook a suggestion card shows; `question` is the full
 * sentence actually sent when it's clicked. Splitting them is what makes a
 * card read like a real assistant's own suggestions (a bold hook, a fuller
 * line under it) instead of a flat pill of raw question text.
 */
export type ChatPrompt = { title: string; question: string };
export type ChatHint = {
  text: string;
  label: string;
  href: string;
  /** Optional grounded chart the hub renders under the reply — hub variant only. */
  chart?: { rows: BarRow[]; caption: string };
  /** Decorative follow-up labels; never wired to a real drill-down. */
  pills?: string[];
};
export type ChatContext = { prompts: ChatPrompt[]; hint: ChatHint };

function hintFromSource(source: SourceId): ChatHint {
  const suggestion =
    SUGGESTIONS.find((entry) => entry.source === source) ?? SUGGESTIONS[0];
  const from = SOURCES[source];
  return {
    text: `${suggestion.title} — ${suggestion.detail}`,
    label: from.label,
    href: from.href,
  };
}

export const CHAT_CONTEXT: Partial<Record<NavId, ChatContext>> = {
  activity: {
    prompts: [
      { title: "Today's visits", question: "How many stores were visited today?" },
      { title: "Busiest retailer", question: "Which retailer has the most visits today?" },
      { title: "Processing backlog", question: "How many sessions are still awaiting processing?" },
    ],
    hint: {
      text: "Today's activity is summarised right here — visits, coverage and photos captured, broken down by retailer and region.",
      label: "Activity",
      href: "/",
    },
  },
  analytics: {
    prompts: [
      { title: "Worst brand", question: "Which brand has the worst availability nationally?" },
      { title: "Where to focus", question: "Where should merchandising focus this month?" },
      { title: "Regional comparison", question: "How is Ho Chi Minh City doing vs other regions?" },
    ],
    hint: { text: INSIGHTS[0].text, label: "Analytics", href: SOURCES.availability.href },
  },
  "store-explorer": {
    prompts: [
      { title: "Bach Hoa Xanh today", question: "How many Bach Hoa Xanh visits happened today?" },
      { title: "South East region", question: "Show me every visit in the South East region." },
      { title: "Still processing", question: "Which sessions are still processing?" },
    ],
    hint: {
      text: "Store Explorer filters by retailer, region, store type, placement, category, store and session — the list and the map narrow together.",
      label: "Store Explorer",
      href: "/store-explorer",
    },
  },
  "master-data": {
    prompts: [
      { title: "Store count", question: "How many stores are configured for the network?" },
      { title: "User access", question: "Who has access to Master Data?" },
      { title: "Journey plan", question: "What does this week's journey plan look like?" },
    ],
    hint: {
      text: "Master Data holds the store list, users and journey plans the rest of the platform is built on.",
      label: "Master data",
      href: "/master-data",
    },
  },
  catalog: {
    prompts: [
      { title: "Toothpaste SKUs", question: "How many SKUs are in the Toothpaste range?" },
      { title: "Tracked brands", question: "Which brands are in the catalog?" },
      { title: "Must-stock list", question: "What's the must-stock list for Toothbrush?" },
    ],
    hint: {
      text: "The catalog holds every SKU, brand and category the platform tracks on shelf.",
      label: "Catalog",
      href: "/catalog",
    },
  },
  "photo-quality": {
    prompts: [
      { title: "Most rejections", question: "Which merchandiser has the most rejected captures?" },
      { title: "Top reason", question: "What's the most common rejection reason?" },
      { title: "Needs a re-shoot", question: "Which stores need a re-shoot?" },
    ],
    hint: hintFromSource("photo-quality"),
  },
  "merch-activity": {
    prompts: [
      { title: "Overdue stores", question: "Which stores are overdue for a visit?" },
      { title: "No check-in", question: "Who hasn't checked in this week?" },
      { title: "Network coverage", question: "What's our coverage against the configured network?" },
    ],
    hint: hintFromSource("coverage"),
  },
  tickets: {
    prompts: [
      { title: "Open suggestions", question: "What suggestions are still open?" },
      { title: "HCMC team", question: "What's assigned to the Ho Chi Minh City team?" },
      { title: "Overdue tickets", question: "What's overdue across all tickets?" },
    ],
    hint: {
      text: `${SUGGESTIONS.length} suggestions are waiting on the Tickets board — pulled from Photo quality, Coverage, Analytics and the must-stock gap list.`,
      label: "Tickets",
      href: "/tickets",
    },
  },
};

/* ------------------------------------------------------------------ */
/* chart-bearing hub suggestions                                      */
/* ------------------------------------------------------------------ */

const ESTATE_CAPTION = `Read from ${group(ESTATE.sessions)} sessions across ${group(ESTATE.stores)} stores · ${MONTH_BY_KEY[CURRENT_MONTH].label}`;

const REGION_SOS_ROWS: BarRow[] = (() => {
  const rows = DIM_SOURCE.Region.map(([name, , , , sos]) => ({ name, sos }));
  const max = Math.max(...rows.map((r) => r.sos));
  return rows.map((r) => ({
    label: r.name,
    value: `${r.sos}%`,
    pct: +((r.sos / max) * 100).toFixed(1),
  }));
})();

const RETAILER_OSA_ROWS: BarRow[] = (() => {
  const rows = DIM_SOURCE.Retailer.map(([name, osa]) => ({ name, osa }));
  const max = Math.max(...rows.map((r) => r.osa));
  return rows.map((r) => ({
    label: r.name,
    value: `${r.osa.toFixed(1)}%`,
    pct: +((r.osa / max) * 100).toFixed(1),
  }));
})();

/** `width` is already normalised to the leading reason — reused, not recomputed. */
const REJECTION_ROWS: BarRow[] = PHOTO_QUALITY[CURRENT_MONTH].reasons.map((r) => ({
  label: r.name,
  value: `${r.pct}%`,
  pct: r.width,
  tone: r.delta.tone === "danger" ? ("danger" as const) : undefined,
}));

/** `width` is already normalised to the largest brand — reused, not recomputed. */
const BRAND_SHARE_ROWS: BarRow[] = BRAND_ROWS.map((b) => ({
  label: b.name,
  value: `${b.share}%`,
  pct: b.width,
}));

const SESSION_VISIT = SESSION_HEADER.find((row) => row.key === "Visit")?.value ?? "";

const SKU_GAP_MAX = Math.max(...CURRENT_MSL_GAP.map((g) => g.stores));
const SKU_GAP_ROWS: BarRow[] = [...CURRENT_MSL_GAP]
  .sort((a, b) => b.stores - a.stores)
  .map((gap) => ({
    label: gap.name,
    value: `${gap.stores} stores`,
    pct: +((gap.stores / SKU_GAP_MAX) * 100).toFixed(1),
  }));

/**
 * The hub's own starter set, for `/infichat` — five examples that each pair
 * a real answer with a chart drawn straight from the fixture the source
 * screen already renders, so the numbers can never drift from what that
 * screen shows. `pct` in every `BarRow[]` above is normalised to that row
 * set's own widest value, per `HBarList`'s contract.
 */
export const HUB_SUGGESTIONS: { prompt: ChatPrompt; icon: IconName; hint: ChatHint }[] = [
  {
    prompt: {
      title: "Share of shelf by region",
      question: "How does share of shelf compare across regions?",
    },
    icon: "bar-chart-3",
    hint: {
      text: "Share of shelf runs from 42% in Ho Chi Minh City down to 31% in the North Highlands — the widest spread of any region split.",
      label: "Analytics",
      href: SOURCES.availability.href,
      chart: { rows: REGION_SOS_ROWS, caption: ESTATE_CAPTION },
      pills: ["Split by retailer", "Compare to June", "Show the stores"],
    },
  },
  {
    prompt: {
      title: "OSA by retailer",
      question: "Which retailer has the best on-shelf availability?",
    },
    icon: "bar-chart-3",
    hint: {
      text: "On-shelf availability tops out at 68.1% with Bach Hoa Xanh and falls to 51.0% at MM Mega Market.",
      label: "Analytics",
      href: SOURCES.availability.href,
      chart: { rows: RETAILER_OSA_ROWS, caption: ESTATE_CAPTION },
      pills: ["Split by region", "Compare to June", "Show the worst stores"],
    },
  },
  {
    prompt: {
      title: "Why captures get rejected",
      question: "What's the most common reason captures get rejected?",
    },
    icon: "camera",
    hint: {
      text: REASONS_NOTE,
      label: "Photo quality",
      href: SOURCES["photo-quality"].href,
      chart: {
        rows: REJECTION_ROWS,
        caption: PHOTO_QUALITY[CURRENT_MONTH].reasonsCaption,
      },
      pills: ["Split by merchandiser", "Compare to June", "Show the stores"],
    },
  },
  {
    prompt: {
      title: "Brands winning shelf space",
      question: "Which brands are winning shelf space in this session?",
    },
    icon: "map",
    hint: {
      text: "P/S leads this session's shelf with 23.5% share; our best-placed own brand, CDC, holds 11.2%.",
      label: "Session Viewer",
      href: "/session-viewer",
      chart: {
        rows: BRAND_SHARE_ROWS,
        caption: `Read from session ${SESSION_TITLE} · ${SESSION_VISIT}`,
      },
      pills: ["Split by category", "Compare to last visit", "Show competitor SKUs"],
    },
  },
  {
    prompt: {
      title: "SKUs missing the most stores",
      question: "Which SKUs are missing from the most stores?",
    },
    icon: "bar-chart-3",
    hint: {
      text: "COL Optic White Plus Shine 100G is missing from 576 stores — more than three times the next-worst gap.",
      label: "Analytics",
      href: SOURCES["must-stock"].href,
      chart: {
        rows: SKU_GAP_ROWS,
        caption: `Missing across ${group(ESTATE.estate)} stores in the configured network.`,
      },
      pills: ["Split by retailer", "Compare to June", "Show the stores"],
    },
  },
];

/** What the hub replies with when you type instead of picking a suggestion. */
export const HUB_DEFAULT_HINT: ChatHint = {
  text: "I don't have a live answer for that yet — try one of the suggestions for a preview grounded in real platform data.",
  label: "InfiChat",
  href: "/infichat",
};
