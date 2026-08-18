import { TICKETS, type Ticket } from "./tickets";

/**
 * Tickets bound to the specific thing they were raised about, so the next
 * visit's output can be compared against them.
 *
 * **Why a ticket alone is not enough.** "A ticket exists on this store" cannot
 * tell you whether the problem went away. Showing before-and-after needs the
 * ticket pinned to an *issue instance*: this store, this metric, this set of
 * SKUs, as of this visit. Then the next visit's recognition output is compared
 * against that instance rather than against the store in general.
 *
 * That binding is what makes the marker on a chart mean something. The example
 * that drove it: three of ten SKUs flagged missing, a ticket raised, and the
 * next visit shows them on shelf — the marker should say a ticket was raised
 * here *and* that the number moved.
 *
 * Closure follows from the same comparison. Nobody sets a ticket to done; the
 * next visit does, which is why there are only two states.
 */

export type IssueInstance = {
  ticketKey: string;
  /** The store the issue is on. */
  subject: string;
  /** Which metric the ticket is about, matched against a card's own label. */
  metric: string;
  /** SKUs the issue covers, where it is SKU-level. */
  skus: string[];
  /** The reading when the ticket was raised. */
  before: number;
  /** The reading on the most recent visit — null until that visit lands. */
  after: number | null;
  raisedOn: string;
  measuredOn: string | null;
  unit: string;
};

/**
 * Authored against the in-flight tickets. In a live system these come from the
 * IR output of the visit that followed each ticket; here they are the fixture
 * that lets the marker and the before/after be designed against real shapes.
 */
const INSTANCES: IssueInstance[] = [
  {
    ticketKey: "TIC-102",
    subject: "Optic White",
    metric: "On-shelf availability",
    skus: ["COL Optic White Plus Shine 100G", "COL Optic White O2 Fresh 85G"],
    before: 8.6,
    after: 31.4,
    raisedOn: "02 Jul",
    measuredOn: "28 Jul",
    unit: "%",
  },
  {
    ticketKey: "TIC-104",
    subject: "North Highlands",
    metric: "On-shelf availability",
    skus: [],
    before: 52.4,
    after: 54.1,
    raisedOn: "01 Jul",
    measuredOn: "29 Jul",
    unit: "%",
  },
  {
    ticketKey: "TIC-108",
    subject: "Emart Gò Vấp",
    metric: "Share of shelf",
    skus: ["COL TP CDC 225G x 36"],
    before: 61,
    after: 74,
    raisedOn: "02 Jul",
    measuredOn: "26 Jul",
    unit: "%",
  },
  {
    ticketKey: "TIC-112",
    subject: "Mekong Delta",
    metric: "Store coverage",
    skus: [],
    before: 74,
    after: null,
    raisedOn: "03 Jul",
    measuredOn: null,
    unit: "%",
  },
];

const BY_KEY = new Map(INSTANCES.map((instance) => [instance.ticketKey, instance]));

export type IssueMarker = IssueInstance & {
  ticket: Ticket;
  /** Points moved since the ticket was raised; null while unmeasured. */
  movement: number | null;
  /** Whether the next visit showed the problem resolved. */
  resolved: boolean;
};

function toMarker(instance: IssueInstance): IssueMarker | null {
  const ticket = TICKETS.find((entry) => entry.key === instance.ticketKey);
  if (!ticket) return null;
  const movement =
    instance.after === null ? null : +(instance.after - instance.before).toFixed(1);
  return {
    ...instance,
    ticket,
    movement,
    // Closed *and* moved the right way. A ticket that closed while the number
    // fell is not a success, and the marker should not imply it was.
    resolved: ticket.status === "closed" && (movement ?? 0) > 0,
  };
}

/* `ISSUE_MARKERS` and `markersFor` lived here to feed a chip on the analytics
   module header, saying a ticket had already been raised against the measure.
   That chip is gone, and with it the only caller — the ticket's own panel
   reads one instance by key instead. */

export function markerByKey(key: string): IssueMarker | undefined {
  const instance = BY_KEY.get(key);
  return instance ? (toMarker(instance) ?? undefined) : undefined;
}
