"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isDefaultDate, serializeDate } from "@/app/_filters/date-token";
import { useGlobalFilters } from "@/app/_filters/global-filter-context";
import { serializeFilters } from "@/app/_filters/model";
import { ticketContextHref, type TicketContext } from "@/app/tickets/_data/ticket-context";
import { Icon } from "./icon";
import styles from "./create-ticket-button.module.css";

/**
 * Sits beside AskInfiChatButton/ExcelDownloadButton in a card header, and
 * navigates to Tickets with the context carried in the query string.
 *
 * The caller passes the *labels* — which metric, which region, which period —
 * because only the card knows those. This component adds the **origin**: the
 * path it was raised from and the global filter bar's current state. That pair
 * is what the ticket stores so the link back lands on the same numbers; a
 * ticket carrying only labels can be read but not returned to, which is exactly
 * how the redirect came to be broken.
 *
 * Reading the filter bar's parsed state rather than `useSearchParams` keeps
 * this out of a Suspense boundary — and outside a provider `useGlobalFilters`
 * returns null, so the button still works on screens with no bar.
 */
export function CreateTicketButton({
  context,
  compact = false,
}: {
  context: TicketContext;
  compact?: boolean;
}) {
  const pathname = usePathname();
  const api = useGlobalFilters();

  const scoped: TicketContext = {
    ...context,
    from: pathname,
    f: api?.filters.length ? serializeFilters(api.filters) : undefined,
    d: api && !isDefaultDate(api.date) ? serializeDate(api.date) : undefined,
  };

  return (
    <Link
      href={ticketContextHref(scoped)}
      className={styles.ticketButton}
      data-compact={compact}
      onClick={(event) => event.stopPropagation()}
      aria-label="Create ticket from this"
      title="Create ticket from this"
    >
      <Icon name="clipboard-list" size={12} />
      {compact ? null : "Create ticket"}
    </Link>
  );
}
