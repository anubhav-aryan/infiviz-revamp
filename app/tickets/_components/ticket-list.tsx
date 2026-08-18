"use client";

import { Icon } from "@/app/_components/icon";
import { Avatar, PRIORITY_LABEL, Pill, STATUS_LABEL } from "./bits";
import { nameFor, type Ticket } from "../_data/tickets";
import styles from "./tickets.module.css";

/**
 * Every raised ticket, flat.
 *
 * A hand-rolled table rather than `SortableTable`, for one reason: rows have to
 * open the detail panel, and that component's `Cell` model is deliberately
 * plain serialisable data with no row-click affordance. Sorting matters less
 * here than being able to click a row — without that the list shows you a
 * ticket exists but not what it says, which is the failure this view was added
 * to fix.
 */
export function TicketList({
  tickets,
  onOpen,
}: {
  tickets: Ticket[];
  onOpen: (key: string) => void;
}) {
  if (tickets.length === 0) {
    return <div className={styles.listEmpty}>No tickets match these filters.</div>;
  }

  return (
    <div className={styles.listScroll}>
      <table className={styles.list}>
        <thead>
          <tr>
            <th scope="col">Key</th>
            <th scope="col">Summary</th>
            <th scope="col">Subject</th>
            <th scope="col">Assignee</th>
            <th scope="col">Priority</th>
            <th scope="col">Status</th>
            <th scope="col" className={styles.listRight}>Due</th>
            <th scope="col" className={styles.listRight}>Closed</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr
              key={ticket.key}
              className={styles.listRow}
              tabIndex={0}
              role="button"
              aria-label={`Open ${ticket.key} — ${ticket.title}`}
              onClick={() => onOpen(ticket.key)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onOpen(ticket.key);
                }
              }}
            >
              <td className={styles.listKey}>{ticket.key}</td>
              <td className={styles.listTitle}>{ticket.title}</td>
              <td className={styles.listSubject}>{ticket.subject}</td>
              <td>
                <span className={styles.listAssignee}>
                  <Avatar name={nameFor(ticket.assigneeId)} />
                  {nameFor(ticket.assigneeId)}
                </span>
              </td>
              <td>
                <Pill label={PRIORITY_LABEL[ticket.priority]} tone={ticket.priority} />
              </td>
              <td>
                <Pill label={STATUS_LABEL[ticket.status]} tone={ticket.status} />
              </td>
              <td className={`${styles.listRight} ${styles.listDue}`}>
                {ticket.due}
              </td>
              <td className={`${styles.listRight} ${styles.listDue}`}>
                {/* An em dash rather than a blank: a raised ticket has no
                    closing date, which is different from one we failed to record. */}
                {ticket.closedOn ?? "—"}
                <Icon name="chevron-right" size={14} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
