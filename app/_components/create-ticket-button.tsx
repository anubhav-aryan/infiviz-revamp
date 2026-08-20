"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { isDefaultDate, serializeDate } from "@/app/_filters/date-token";
import { useGlobalFilters } from "@/app/_filters/global-filter-context";
import { serializeFilters } from "@/app/_filters/model";
import { useRole } from "@/app/_identity/use-role";
import { ComposePanel } from "@/app/tickets/_components/compose-panel";
import type { TicketContext } from "@/app/tickets/_data/ticket-context";
import { createTicket } from "@/app/tickets/_data/use-created-tickets";
import { Icon } from "./icon";
import { useToast } from "./toast/toast-context";
import actions from "./card-actions.module.css";
import styles from "./create-ticket-button.module.css";

/**
 * Sits beside AskInfiChatButton/ExcelDownloadButton in a card header, and
 * raises a ticket **without leaving the screen**.
 *
 * It used to be a link to `/tickets?compose=1&…`, which meant that raising a
 * ticket about a chart began by taking the chart away. The compose panel is the
 * same one the Tickets screen uses; it just opens here instead. What confirms
 * the ticket, and offers the navigation the user is no longer forced into, is a
 * toast carrying the new key.
 *
 * The caller passes the *labels* — which metric, which region, which period —
 * because only the card knows those. This component adds the **origin**: the
 * path it was raised from and the global filter bar's current state. That pair
 * is stored on the ticket, so the link back lands on the same numbers; a ticket
 * carrying only labels can be read but not returned to.
 *
 * Reading the filter bar's parsed state rather than `useSearchParams` keeps
 * this out of a Suspense boundary — and outside a provider `useGlobalFilters`
 * returns null, so the button still works on screens with no bar. `useToast`
 * follows the same contract.
 */
export function CreateTicketButton({
  context,
  persona,
  compact = false,
}: {
  context: TicketContext;
  /** Who is raising it, which decides who can be assigned. Analytics passes its
   *  route persona; everywhere else falls back to the reader's role. */
  persona?: string;
  compact?: boolean;
}) {
  const pathname = usePathname();
  /* Screens outside Analytics used to raise everything as the compose panel's
     hardcoded executive, whoever was reading. The role is the honest answer. */
  const { role } = useRole();
  const api = useGlobalFilters();
  const toast = useToast();
  const [composing, setComposing] = useState(false);

  const scoped: TicketContext = {
    ...context,
    from: pathname,
    f: api?.filters.length ? serializeFilters(api.filters) : undefined,
    d: api && !isDefaultDate(api.date) ? serializeDate(api.date) : undefined,
  };

  return (
    <>
      <button
        type="button"
        className={`${styles.ticketButton} ${actions.tip}`}
        data-compact={compact}
        onClick={(event) => {
          event.stopPropagation();
          setComposing(true);
        }}
        aria-label="Create ticket from this"
        data-tip="Raise a ticket from this"
      >
        <Icon name="ticket-plus" size={12} />
        {compact ? null : "Create ticket"}
      </button>

      {composing ? (
        <ComposePanel
          persona={persona ?? role}
          context={scoped}
          onCreate={(draft) => {
            const ticket = createTicket(draft);
            toast?.show({
              message: `${ticket.key} raised · ${ticket.title}`,
              action: { label: "Show ticket", href: `/tickets?ticket=${ticket.key}` },
            });
          }}
          onClose={() => setComposing(false)}
        />
      ) : null}
    </>
  );
}
