"use client";

import Link from "next/link";
import { Icon } from "@/app/_components/icon";
import { Avatar, PRIORITY_LABEL, Pill } from "./bits";
import { SOURCES, nameFor, type Suggestion, type Ticket, type TicketStatus } from "../_data/tickets";
import styles from "./tickets.module.css";

/**
 * The board. Four columns: suggestions the platform raised, then the three
 * states a real ticket moves through.
 *
 * The suggested column is deliberately a different object — dashed, no ticket
 * key, and its action is "Create ticket" rather than a link to one. A
 * suggestion is something the platform noticed; a ticket is something a person
 * committed to, and the board should not blur that.
 */

const COLUMNS: { id: TicketStatus; label: string }[] = [
  { id: "todo", label: "To do" },
  { id: "in-progress", label: "In progress" },
  { id: "done", label: "Done" },
];

export function TicketBoard({
  tickets,
  suggestions,
  onOpen,
  onCreateFrom,
}: {
  tickets: Ticket[];
  suggestions: Suggestion[];
  onOpen: (key: string) => void;
  onCreateFrom: (suggestion: Suggestion) => void;
}) {
  return (
    <div className={styles.board}>
      <section className={styles.column} data-kind="suggested">
        <header className={styles.columnHead}>
          <span className={styles.columnName}>
            <Icon name="star" size={14} />
            Suggested
          </span>
          <span className={styles.columnCount}>{suggestions.length}</span>
        </header>

        <p className={styles.columnNote}>
          Raised by InfiViz from what the dashboards are already showing.
        </p>

        <div className={styles.cards}>
          {suggestions.map((suggestion) => (
            <article key={suggestion.id} className={styles.card} data-kind="suggested">
              <div className={styles.cardTop}>
                <Link href={SOURCES[suggestion.source].href} className={styles.source}>
                  From {SOURCES[suggestion.source].label}
                </Link>
                <Pill label={PRIORITY_LABEL[suggestion.priority]} tone={suggestion.priority} />
              </div>

              <h3 className={styles.cardTitle}>{suggestion.title}</h3>
              <p className={styles.cardDetail}>{suggestion.detail}</p>

              <div className={styles.cardFoot}>
                {suggestion.figure ? (
                  <span className={styles.figure}>{suggestion.figure}</span>
                ) : (
                  <span />
                )}
                <button
                  type="button"
                  className={styles.createButton}
                  onClick={() => onCreateFrom(suggestion)}
                >
                  <Icon name="plus" size={13} />
                  Create ticket
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {COLUMNS.map((column) => {
        const columnTickets = tickets.filter((ticket) => ticket.status === column.id);
        return (
          <section key={column.id} className={styles.column}>
            <header className={styles.columnHead}>
              <span className={styles.columnName}>{column.label}</span>
              <span className={styles.columnCount}>{columnTickets.length}</span>
            </header>

            <div className={styles.cards}>
              {columnTickets.map((ticket) => (
                <button
                  key={ticket.key}
                  type="button"
                  className={styles.card}
                  data-clickable="true"
                  onClick={() => onOpen(ticket.key)}
                >
                  <div className={styles.cardTop}>
                    <span className={styles.ticketKey}>{ticket.key}</span>
                    <Pill label={PRIORITY_LABEL[ticket.priority]} tone={ticket.priority} />
                  </div>

                  <h3 className={styles.cardTitle}>{ticket.title}</h3>
                  <p className={styles.cardSubject}>{ticket.subject}</p>

                  <div className={styles.cardFoot}>
                    <span className={styles.labels}>
                      {ticket.labels.slice(0, 2).map((label) => (
                        <span key={label} className={styles.label}>
                          {label}
                        </span>
                      ))}
                    </span>
                    <span className={styles.assignee}>
                      <Avatar name={nameFor(ticket.assigneeId)} />
                    </span>
                  </div>
                </button>
              ))}

              {columnTickets.length === 0 ? (
                <p className={styles.columnEmpty}>Nothing here for this persona.</p>
              ) : null}
            </div>
          </section>
        );
      })}
    </div>
  );
}
