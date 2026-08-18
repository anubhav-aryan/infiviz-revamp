/**
 * What a "Create ticket" entry point hands off from the screen it was raised on.
 *
 * This used to be `{region, metric, period}` — three human-readable *labels*.
 * They read fine in the compose panel, but they cannot reconstruct a view, so
 * the link back from a ticket landed on a default dashboard showing different
 * numbers than the ones the ticket was about. That was the broken redirect.
 *
 * So the context now carries two kinds of thing: the labels, which are for the
 * reader, and the **origin** — the path it was raised from plus the global
 * filter bar's own `f`/`d` parameters — which is for the machine. Opening a
 * ticket replays the origin and lands on exactly the numbers that motivated it.
 *
 * Plain query params, matching the convention every other view-state carry-over
 * in this app already uses, rather than one opaque encoded blob.
 */

export type TicketContext = {
  region?: string;
  metric?: string;
  period?: string;
  /** Pathname the ticket was raised from, e.g. `/analytics/exec/availability/analytics`. */
  from?: string;
  /** The global filter bar's serialized dimensions at the moment of raising. */
  f?: string;
  /** The global filter bar's date token at the moment of raising. */
  d?: string;
};

const PARAM_KEYS = ["region", "metric", "period", "from", "f", "d"] as const;

/**
 * Read back on the Tickets screen to auto-open `ComposePanel` pre-filled.
 *
 * Nothing in the app links here any more — a "Create ticket" button composes in
 * place rather than navigating — but a pasted or bookmarked `?compose=1` URL
 * still works, and it is the same context shape either way.
 */
export function ticketContextFromParams(params: URLSearchParams): TicketContext | null {
  if (params.get("compose") !== "1") return null;
  const context: TicketContext = {};
  for (const key of PARAM_KEYS) {
    const value = params.get(key);
    if (value) context[key] = value;
  }
  return context;
}

/**
 * The link back to the view a ticket was raised from.
 *
 * Falls back to the source screen's static href when a ticket has no origin —
 * the authored fixtures predate this and carry none — but anything raised
 * through the UI from now on round-trips to its own filter scope.
 */
export function originHref(
  context: Pick<TicketContext, "from" | "f" | "d">,
  fallback: string,
): string {
  if (!context.from) return fallback;
  const params = new URLSearchParams();
  if (context.f) params.set("f", context.f);
  if (context.d) params.set("d", context.d);
  const query = params.toString();
  return query ? `${context.from}?${query}` : context.from;
}
