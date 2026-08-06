import { FIX_LIST, INSIGHTS, PRECOMPUTED } from "@/app/analytics/_data/analytics";
import { MERCH_ACTIVITY } from "@/app/merch-activity/_data/merch-activity";
import { PHOTO_QUALITY } from "@/app/photo-quality/_data/photo-quality";
import { CURRENT_MONTH, MONTHS, MONTH_KEYS } from "@/app/_time/periods";
import {
  EXEC,
  LEADS,
  MERCHANDISERS,
  SUPERVISORS,
  merchandiserByHandle,
  personByName,
  supervisorOf,
  type Person,
} from "./people";

/**
 * Tickets and the suggestions that become them.
 *
 * **Suggestions are not authored here.** They are read out of the fixtures the
 * dashboard already renders — the analytics fix list and insights, the overdue
 * stores on Merchandiser activity, the bad-capture stores on Photo quality —
 * so a suggestion on this board is literally the same fact the other screen is
 * showing, not a retyped copy that could drift from it.
 *
 * Everything is built at module scope, and every date is a label derived from
 * the authored month rather than a clock, per the house rule.
 */

export type TicketStatus = "todo" | "in-progress" | "done";
export type Priority = "high" | "medium" | "low";

/** Which screen raised a suggestion, so a card can point back at it. */
export type SourceId =
  | "availability"
  | "photo-quality"
  | "coverage"
  | "must-stock"
  | "field";

export const SOURCES: Record<SourceId, { label: string; href: string }> = {
  availability: { label: "Analytics · Availability", href: "/analytics/exec/availability/analytics" },
  "photo-quality": { label: "Photo quality", href: "/photo-quality" },
  coverage: { label: "Merch activity & coverage", href: "/merch-activity" },
  "must-stock": { label: "Analytics · Category", href: "/analytics/category/category-management/analytics" },
  field: { label: "Analytics · Field", href: "/analytics/field/availability/analytics" },
};

export type Suggestion = {
  id: string;
  title: string;
  detail: string;
  source: SourceId;
  priority: Priority;
  /** Pre-formatted figure the suggestion turns on, e.g. `"8.6% OSA"`. */
  figure?: string;
  /** Where the work is — a store, brand, SKU or region. */
  subject: string;
  /** Suggested assignee, where the source already knows who owns it. */
  assigneeId?: string;
};

export type Ticket = {
  key: string;
  title: string;
  detail: string;
  status: TicketStatus;
  priority: Priority;
  reporterId: string;
  assigneeId: string;
  subject: string;
  figure?: string;
  /** Set when the ticket began life as a suggestion. */
  source?: SourceId;
  created: string;
  due: string;
  labels: string[];
};

/* ---------------------------------------------------------------- */
/* dates                                                             */
/* ---------------------------------------------------------------- */

const MONTH_INDEX = MONTH_KEYS.indexOf(CURRENT_MONTH);
const MONTH = MONTHS[MONTH_INDEX];

/** `4` → `"04 Jul"`. Derived from the authored month, never from a clock. */
const dayLabel = (day: number) =>
  `${String(Math.max(1, Math.min(MONTH.days, day))).padStart(2, "0")} ${MONTH.shortLabel}`;

/* ---------------------------------------------------------------- */
/* suggestions, read out of the dashboard's own data                 */
/* ---------------------------------------------------------------- */

/** Display name for a merchandiser handle, for suggestion titles. */
const nameOf = (handle: string) => merchandiserByHandle(handle)?.name ?? handle;

const view = PRECOMPUTED[CURRENT_MONTH];
const photo = PHOTO_QUALITY[CURRENT_MONTH];
const merch = MERCH_ACTIVITY[CURRENT_MONTH];

/** The field fix list — already the closest thing to a ticket in the app. */
const FIX_SUGGESTIONS: Suggestion[] = FIX_LIST.slice(0, 3).map((fix, i) => ({
  id: `sug-fix-${i}`,
  title: fix.issue,
  detail: `Raised against ${fix.store}. ${
    fix.skus > 0 ? `${fix.skus} SKUs affected.` : "Coverage issue, no SKUs listed."
  }`,
  source: "field",
  priority: fix.skus >= 3 ? "high" : fix.skus > 0 ? "medium" : "low",
  figure: fix.skus > 0 ? `${fix.skus} SKUs` : undefined,
  subject: fix.store,
}));

/**
 * Overdue stores. The only source that already knows its owner — each row
 * carries the merchandiser the store is assigned to.
 */
const COVERAGE_SUGGESTIONS: Suggestion[] = merch.overdue
  .filter((row) => row.mrch !== "—")
  .slice(0, 3)
  .map((row, i) => ({
    id: `sug-cov-${i}`,
    title:
      row.status === "notyet"
        ? `${row.store} has never been visited`
        : `${row.store} overdue by ${row.days} days`,
    detail: `${row.retailer} · ${row.region}. Assigned to this store's merchandiser.`,
    source: "coverage",
    priority: row.status === "notyet" || Number(row.days) > 60 ? "high" : "medium",
    figure: row.status === "notyet" ? "Never visited" : `${row.days} days`,
    subject: row.store,
    assigneeId: row.mrch,
  }));

/**
 * Bad captures. The source that already knows both ends — the merchandiser to
 * assign to, and the supervisor who would be raising it.
 */
const PHOTO_SUGGESTIONS: Suggestion[] = photo.worst
  .filter((row) => row.stores.length > 0)
  .slice(0, 3)
  .map((row, i) => ({
    id: `sug-pq-${i}`,
    /* Named, because two merchandisers can both have three bad stores and
       "Re-shoot 3 stores" twice tells the reader nothing. */
    title:
      row.stores.length > 1
        ? `Re-shoot ${row.stores.length} stores · ${nameOf(row.mrch)}`
        : `Re-shoot ${row.stores[0].store}`,
    detail: `${row.rate}% of ${row.captures} captures rejected — top reason ${row.reason.toLowerCase()}.`,
    source: "photo-quality",
    priority: row.tier === "danger" ? "high" : "medium",
    figure: `${row.rate}% rejected`,
    subject: row.stores[0].store,
    assigneeId: row.mrch,
  }));

/** Executive-level prose about a brand or a region. Ownerless by nature. */
const INSIGHT_SUGGESTIONS: Suggestion[] = INSIGHTS.slice(0, 2).map((insight, i) => ({
  id: `sug-ins-${i}`,
  title: insight.link.replace(/^(Open|Scope to)\s+/, "Investigate "),
  detail: insight.text,
  source: "availability",
  priority: "high",
  subject: insight.link.replace(/^(Open|Scope to)\s+/, ""),
}));

/** Must-stock gaps — a SKU absent across many ranged stores. */
const MSL_SUGGESTIONS: Suggestion[] = view.mslGap.slice(0, 2).map((gap, i) => ({
  id: `sug-msl-${i}`,
  title: `Chase ${gap.name}`,
  detail: `Absent in ${gap.stores} ranged stores · ${gap.brand}.`,
  source: "must-stock",
  priority: gap.stores > 300 ? "high" : "medium",
  figure: `${gap.stores} stores`,
  subject: gap.name,
}));

export const SUGGESTIONS: Suggestion[] = [
  ...PHOTO_SUGGESTIONS,
  ...COVERAGE_SUGGESTIONS,
  ...INSIGHT_SUGGESTIONS,
  ...MSL_SUGGESTIONS,
  ...FIX_SUGGESTIONS,
];

/* ---------------------------------------------------------------- */
/* tickets already in flight                                         */
/* ---------------------------------------------------------------- */

const sup = (region: string) =>
  SUPERVISORS.find((entry) => entry.region === region) ?? SUPERVISORS[0];

const TICKET_FACTS: [
  key: string,
  title: string,
  detail: string,
  status: TicketStatus,
  priority: Priority,
  reporter: Person,
  assignee: string,
  subject: string,
  created: number,
  due: number,
  labels: string[],
  source?: SourceId,
][] = [
  [
    "TIC-101",
    "Re-shoot blurred captures at Co.opmart Quy Nhơn",
    "Three visits in a row came back blurred. Re-shoot the toothpaste bay and confirm focus before leaving the store.",
    "in-progress",
    "high",
    sup("Central"),
    "huy_le",
    "Co.opmart Quy Nhơn",
    4,
    12,
    ["photo-quality", "re-shoot"],
    "photo-quality",
  ],
  [
    "TIC-102",
    "Optic White absent across 576 ranged stores",
    "Worst brand nationally at 8.6% availability. Break the chase down by region and assign per supervisor.",
    "in-progress",
    "high",
    EXEC,
    LEADS[0].id,
    "Optic White",
    2,
    20,
    ["must-stock", "availability"],
    "must-stock",
  ],
  [
    "TIC-103",
    "Aeon Hà Đông overdue by 73 days",
    "Longest-overdue store in Red River Delta. Confirm the store is still trading before rescheduling the journey plan.",
    "todo",
    "high",
    sup("Red River Delta"),
    "duc_ngo",
    "Aeon Hà Đông",
    6,
    14,
    ["coverage"],
    "coverage",
  ],
  [
    "TIC-104",
    "North Highlands below 55% availability for a third month",
    "Third consecutive month under target. Regional review with the supervisor, then a corrective plan.",
    "in-progress",
    "high",
    EXEC,
    sup("North Highlands").id,
    "North Highlands",
    1,
    25,
    ["availability", "region"],
    "availability",
  ],
  [
    "TIC-105",
    "Fix planogram sequence at MM Mega Market An Phú",
    "Shelf was rebuilt by the retailer and the sequence no longer matches the planogram.",
    "todo",
    "medium",
    sup("South East"),
    "linh_pham",
    "MM Mega Market An Phú",
    5,
    16,
    ["planogram"],
  ],
  [
    "TIC-106",
    "Check in with Bảo Vũ — not seen in 9 days",
    "No captures logged for nine days. Confirm availability and reassign the route if needed.",
    "todo",
    "medium",
    sup("Central"),
    "bao_vu",
    "Bảo Vũ",
    7,
    11,
    ["attendance"],
    "coverage",
  ],
  [
    "TIC-107",
    "Price tags missing at Winmart Q7",
    "Four SKUs on the toothpaste bay have no price tag. Photograph the shelf edge after the fix.",
    "todo",
    "low",
    sup("Ho Chi Minh City"),
    "minh_tran",
    "Winmart Q7 Trần",
    8,
    18,
    ["pricing"],
  ],
  [
    "TIC-108",
    "Rebuild Colgate block at Emart Gò Vấp",
    "Brand block compliance fell to 61%. Rebuild to planogram and capture before and after.",
    "done",
    "medium",
    sup("Ho Chi Minh City"),
    "quan_do",
    "Emart Gò Vấp",
    2,
    9,
    ["planogram", "shelving"],
  ],
  [
    "TIC-109",
    "Recapture Lotte Mart Cần Thơ — not a shelf",
    "Session rejected as not a shelf. Recapture the full bay in sequence.",
    "done",
    "high",
    sup("Mekong Delta"),
    "thao_vo",
    "Lotte Mart Cần Thơ",
    3,
    10,
    ["photo-quality", "re-shoot"],
    "photo-quality",
  ],
  [
    "TIC-110",
    "Confirm must-stock list for Kids oral care",
    "Category lead to confirm the ranged list before the next audit cycle.",
    "done",
    "low",
    EXEC,
    LEADS[1].id,
    "Kids oral care",
    1,
    8,
    ["must-stock"],
  ],
  [
    "TIC-111",
    "Winmart Hà Giang — two rejected visits",
    "Both captures slanted. Coach on framing, then re-shoot.",
    "todo",
    "medium",
    sup("North Highlands"),
    "nam_hoang",
    "Winmart Hà Giang",
    6,
    15,
    ["photo-quality"],
    "photo-quality",
  ],
  [
    "TIC-112",
    "Coverage plan for Mekong Delta",
    "Region is 12 points below the 90% coverage target. Rework the journey plan with the supervisor.",
    "in-progress",
    "medium",
    LEADS[0],
    sup("Mekong Delta").id,
    "Mekong Delta",
    3,
    22,
    ["coverage", "region"],
    "coverage",
  ],
];

export const TICKETS: Ticket[] = TICKET_FACTS.map(
  ([
    key,
    title,
    detail,
    status,
    priority,
    reporter,
    assignee,
    subject,
    created,
    due,
    labels,
    source,
  ]) => ({
    key,
    title,
    detail,
    status,
    priority,
    reporterId: reporter.id,
    assigneeId: assignee,
    subject,
    source,
    created: dayLabel(created),
    due: dayLabel(due),
    labels,
  }),
);

/* ---------------------------------------------------------------- */
/* persona scoping                                                   */
/* ---------------------------------------------------------------- */

/**
 * What a persona sees. An executive sees everything; a lead sees the national
 * work plus their supervisors'; a field supervisor sees only their own region's
 * merchandisers. Scoping by *who the assignee reports to* rather than by an
 * authored field means adding a ticket never means updating a second list.
 */
export function ticketsForPersona(persona: string): Ticket[] {
  if (persona === "exec") return TICKETS;

  if (persona === "field") {
    const supervisor = SUPERVISORS[0];
    const team = MERCHANDISERS.filter((m) => m.region === supervisor.region).map(
      (m) => m.id,
    );
    return TICKETS.filter(
      (ticket) =>
        team.includes(ticket.assigneeId) || ticket.reporterId === supervisor.id,
    );
  }

  /* Leads see anything not already delegated down to a single merchandiser,
     plus everything they raised themselves. */
  return TICKETS.filter((ticket) => {
    const assignee = merchandiserByHandle(ticket.assigneeId);
    if (!assignee) return true;
    return assignee.rank !== "merchandiser" || ticket.reporterId.startsWith("lead");
  });
}

/** Display name for an assignee id, whether it is a handle or a person id. */
export function nameFor(id: string): string {
  return merchandiserByHandle(id)?.name ?? personByName(id)?.name ?? id;
}

export { supervisorOf };
