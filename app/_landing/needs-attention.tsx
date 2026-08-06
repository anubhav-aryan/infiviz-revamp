import Link from "next/link";
import { Icon } from "@/app/_components/icon";
import { TICKETS } from "@/app/tickets/_data/tickets";
import styles from "./landing.module.css";

/**
 * The live screen's "what should I do next" panel. Reads straight off the
 * ticket board's own data rather than a separate landing fixture, so a ticket
 * closed on `/tickets` drops off here too instead of needing a second edit.
 */

const PRIORITY_RANK: Record<string, number> = { high: 0, medium: 1, low: 2 };
const PRIORITY_TONE: Record<string, "danger" | "warning" | undefined> = {
  high: "danger",
  medium: "warning",
  low: undefined,
};
const PRIORITY_LABEL: Record<string, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

const OPEN_TICKETS = TICKETS.filter((ticket) => ticket.status !== "done");
const TOP_TICKETS = [...OPEN_TICKETS]
  .sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority])
  .slice(0, 5);

export const OPEN_TICKET_COUNT = OPEN_TICKETS.length;
export const HIGH_PRIORITY_COUNT = OPEN_TICKETS.filter(
  (ticket) => ticket.priority === "high",
).length;

export function NeedsAttention() {
  return (
    <div className={`${styles.card} ${styles.feedCard}`}>
      <div className={styles.feedHead}>
        <span className={styles.feedTitle}>Needs attention</span>
        <Link href="/tickets" className={styles.viewAllLink}>
          View all
          <Icon name="arrow-right" size={14} />
        </Link>
      </div>

      {TOP_TICKETS.map((ticket) => (
        <div key={ticket.key} className={styles.feedRow}>
          <span className={styles.feedIcon} aria-hidden="true">
            <Icon name="alert-triangle" />
          </span>
          <span className={styles.feedText}>
            {ticket.title}
            <span className={styles.attentionSubject}> · {ticket.subject}</span>
          </span>
          {PRIORITY_TONE[ticket.priority] ? (
            <span
              className={styles.feedPill}
              data-tone={PRIORITY_TONE[ticket.priority]}
            >
              {PRIORITY_LABEL[ticket.priority]}
            </span>
          ) : null}
          <span className={styles.feedFigure}>{ticket.due}</span>
        </div>
      ))}
    </div>
  );
}
