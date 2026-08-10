import Link from "next/link";
import { ticketContextHref, type TicketContext } from "@/app/tickets/_data/ticket-context";
import { Icon } from "./icon";
import styles from "./create-ticket-button.module.css";

/**
 * Sits beside AskInfiChatButton/ExcelDownloadButton in a card header. Unlike
 * those two it's a plain `<Link>`, not client state — it navigates to
 * Tickets with the context carried in the query string (see
 * `ticket-context.ts`) and lets `ComposePanel` there do the pre-filling.
 */
export function CreateTicketButton({
  context,
  compact = false,
}: {
  context: TicketContext;
  compact?: boolean;
}) {
  return (
    <Link
      href={ticketContextHref(context)}
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
