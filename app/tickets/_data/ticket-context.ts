/**
 * The query-string shape a "Create ticket" entry point elsewhere in the app
 * uses to hand off what it was looking at — region, metric, period — into a
 * pre-filled `ComposePanel`. Plain query params, matching the convention
 * every other view-state carry-over in this app already uses (Analytics'
 * `?scope=&month=&measure=`, saved views, etc.) rather than one opaque
 * encoded blob.
 */

export type TicketContext = {
  region?: string;
  metric?: string;
  period?: string;
};

const PARAM_KEYS = ["region", "metric", "period"] as const;

/** Where a "Create ticket" button on another screen should link to. */
export function ticketContextHref(context: TicketContext): string {
  const params = new URLSearchParams({ compose: "1" });
  for (const key of PARAM_KEYS) {
    const value = context[key];
    if (value) params.set(key, value);
  }
  return `/tickets?${params.toString()}`;
}

/** Read back on the Tickets screen to auto-open `ComposePanel` pre-filled. */
export function ticketContextFromParams(params: URLSearchParams): TicketContext | null {
  if (params.get("compose") !== "1") return null;
  const context: TicketContext = {};
  for (const key of PARAM_KEYS) {
    const value = params.get(key);
    if (value) context[key] = value;
  }
  return context;
}
