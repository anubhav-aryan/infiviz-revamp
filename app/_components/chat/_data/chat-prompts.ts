import type { NavId } from "@/app/_components/nav";
import { INSIGHTS } from "@/app/analytics/_data/analytics";
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
export type ChatHint = { text: string; label: string; href: string };
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

/**
 * The hub's own starter set, for `/infichat` — the four screens already
 * backed by real `INSIGHTS`/`SUGGESTIONS` data, not all eight. A fresh chat's
 * empty state shows a handful of good examples, not every screen in the app.
 */
export const HUB_SUGGESTIONS: { id: NavId; prompt: ChatPrompt; hint: ChatHint }[] = (
  ["analytics", "photo-quality", "merch-activity", "tickets"] as const
).map((id) => ({ id, prompt: CHAT_CONTEXT[id]!.prompts[0], hint: CHAT_CONTEXT[id]!.hint }));

/** What the hub replies with when you type instead of picking a suggestion. */
export const HUB_DEFAULT_HINT: ChatHint = {
  text: "I don't have a live answer for that yet — try one of the suggestions for a preview grounded in real platform data.",
  label: "InfiChat",
  href: "/infichat",
};
