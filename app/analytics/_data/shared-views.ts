import { EXEC, LEADS, SUPERVISORS, type Person } from "@/app/tickets/_data/people";

/**
 * Analytics views other people have sent to this reader.
 *
 * **What is real and what is not.** The `query` on each of these is a genuine
 * filter string — the same `?f=`/`?d=` the global bar writes and
 * `parseFilters` reads — so opening one really does narrow the screen to what
 * it names. Who sent it, and when, is authored: the platform has no messaging,
 * no inbox and no second user, so there is nothing to derive that from.
 *
 * They are seeded rather than starting empty because an inbox with nothing in
 * it demonstrates nothing. Anything the reader shares themselves is prepended
 * to this list at runtime — see `use-shared-views.ts`, which follows the same
 * frozen-fixture-plus-local-additions shape `use-created-tickets.ts` uses.
 */

export type SharedView = {
  id: string;
  /** What the sender called it. */
  name: string;
  /** Why they sent it — shown under the name. */
  note: string;
  /** Person id, resolved through `people.ts` rather than copied. */
  fromId: string;
  /** Relative, because a prototype has no clock to be wrong against. */
  when: string;
  /**
   * The path plus query to open, filters included. Authored to match the
   * canonical vocabulary in `app/_filters/registry.ts` — a dim or value this
   * app does not know is silently dropped by `parseFilters`, so a typo here
   * shows up as a filter that never arrives rather than an error.
   */
  query: string;
  /** Dimension/value pairs to draw as chips, in the order they read best. */
  chips: { dim: string; value: string }[];
};

const SHARER: Record<string, Person> = {
  avail_lead: LEADS[0],
  category_lead: LEADS[1],
  revenue_lead: LEADS[2],
  hcmc_sup: SUPERVISORS[0],
  mekong_sup: SUPERVISORS[2],
  exec: EXEC,
};

export const SHARED_VIEWS: SharedView[] = [
  {
    id: "mekong-oos-spike",
    name: "Mekong OOS spike",
    note: "Third week running. Need a view on whether it is one retailer or all of them.",
    fromId: SHARER.mekong_sup.id,
    when: "2 days ago",
    query: "/analytics?f=region~mekong-delta|category~toothpaste",
    chips: [
      { dim: "Region", value: "Mekong Delta" },
      { dim: "Category", value: "Toothpaste" },
    ],
  },
  {
    id: "q3-planogram-gaps",
    name: "Q3 planogram gaps",
    note: "The stores I want walked before the quarter closes.",
    fromId: SHARER.hcmc_sup.id,
    when: "5 days ago",
    query: "/analytics?f=region~ho-chi-minh-city|placementType~shelf",
    chips: [
      { dim: "Region", value: "Ho Chi Minh City" },
      { dim: "Placement Type", value: "Shelf" },
    ],
  },
  {
    id: "whitening-vs-kids",
    name: "Whitening against Kids oral care",
    note: "Whitening is holding shelf that Kids is growing into. Worth a look.",
    fromId: SHARER.category_lead.id,
    when: "1 week ago",
    query: "/analytics?f=category~whitening",
    chips: [{ dim: "Category", value: "Whitening" }],
  },
  {
    id: "minimart-availability",
    name: "Minimart availability",
    note: "Availability in minimarts is behind every other format. Not sure why yet.",
    fromId: SHARER.avail_lead.id,
    when: "1 week ago",
    query: "/analytics?f=storeType~mini-mart",
    chips: [{ dim: "Store type", value: "Mini Mart" }],
  },
  {
    id: "national-quarter-close",
    name: "National, quarter close",
    note: "The unfiltered picture I am taking into the board review.",
    fromId: SHARER.exec.id,
    when: "2 weeks ago",
    query: "/analytics",
    chips: [],
  },
  {
    id: "freezer-placement-audit",
    name: "Freezer placement audit",
    note: "Freezer captures only. Checking the new placement type is being used.",
    fromId: SHARER.revenue_lead.id,
    when: "3 weeks ago",
    query: "/analytics?f=placementType~freezer",
    chips: [{ dim: "Placement Type", value: "Freezer" }],
  },
];
