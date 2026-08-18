"use client";

import { useState } from "react";
import { Icon } from "@/app/_components/icon";
import { Avatar, PRIORITY_LABEL, Pill } from "./bits";
import { nameFor, type Ticket, type TicketStatus } from "../_data/tickets";
import styles from "./tickets.module.css";

/**
 * The board view — two columns, and dragging a card between them is what
 * closes or reopens a ticket.
 *
 * This board was removed once, because it drew To do / In progress / Done
 * columns while nothing in the model could move a card between them: it
 * advertised an interaction that did not exist. It comes back now for the
 * reason it went away — closing is a real manual action, so dragging Raised →
 * Closed performs something, and dragging back reopens.
 *
 * Two columns, not three. There is no middle state: a ticket is raised, or it
 * is closed. A stage nobody updates is a field everybody learns to distrust.
 *
 * **The column is the drop target, not the card.** The move being expressed is
 * "into this state" — order within a column carries no meaning here, so there
 * is nothing to drop *next to*.
 *
 * Native HTML5 drag-and-drop, following `_components/reorderable-grid.tsx`,
 * which is the only other drag in this app and states the reason: a library
 * would be a lot of new surface for what a mockup needs. Dragging is
 * pointer-only by nature, so the detail panel's Close/Reopen button is the
 * keyboard path to the same thing.
 */

const COLUMNS: { id: TicketStatus; label: string }[] = [
  { id: "raised", label: "Raised" },
  { id: "closed", label: "Closed" },
];

export function TicketBoard({
  tickets,
  onOpen,
  onMove,
}: {
  tickets: Ticket[];
  onOpen: (key: string) => void;
  onMove: (key: string, status: TicketStatus) => void;
}) {
  const [dragKey, setDragKey] = useState<string | null>(null);
  const [overColumn, setOverColumn] = useState<TicketStatus | null>(null);

  const endDrag = () => {
    setDragKey(null);
    setOverColumn(null);
  };

  return (
    <div className={styles.board}>
      {COLUMNS.map((column) => {
        const columnTickets = tickets.filter((ticket) => ticket.status === column.id);
        return (
          <section
            key={column.id}
            className={styles.column}
            data-drag-over={overColumn === column.id || undefined}
            onDragOver={(event) => {
              // Without preventDefault the drop never fires — the element is
              // not a drop target until the dragover is cancelled.
              event.preventDefault();
              event.dataTransfer.dropEffect = "move";
              if (overColumn !== column.id) setOverColumn(column.id);
            }}
            onDragLeave={() =>
              setOverColumn((current) => (current === column.id ? null : current))
            }
            onDrop={(event) => {
              event.preventDefault();
              if (dragKey) onMove(dragKey, column.id);
              endDrag();
            }}
          >
            <header className={styles.columnHead}>
              <span className={styles.columnName}>
                {column.id === "closed" ? <Icon name="check" size={13} /> : null}
                {column.label}
              </span>
              <span className={styles.columnCount}>{columnTickets.length}</span>
            </header>

            <div className={styles.cards}>
              {columnTickets.map((ticket) => (
                <div
                  key={ticket.key}
                  className={styles.card}
                  data-clickable="true"
                  data-dragging={dragKey === ticket.key || undefined}
                  draggable
                  role="button"
                  tabIndex={0}
                  aria-label={`Open ${ticket.key} — ${ticket.title}`}
                  onClick={() => onOpen(ticket.key)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onOpen(ticket.key);
                    }
                  }}
                  onDragStart={(event) => {
                    event.dataTransfer.effectAllowed = "move";
                    // Firefox will not start a drag without payload set.
                    event.dataTransfer.setData("text/plain", ticket.key);
                    setDragKey(ticket.key);
                  }}
                  onDragEnd={endDrag}
                >
                  <div className={styles.cardTop}>
                    <span className={styles.ticketKey}>{ticket.key}</span>
                    <Pill
                      label={PRIORITY_LABEL[ticket.priority]}
                      tone={ticket.priority}
                    />
                  </div>

                  <h3 className={styles.cardTitle}>{ticket.title}</h3>
                  <p className={styles.cardSubject}>{ticket.subject}</p>

                  {ticket.closedOn ? (
                    <p className={styles.cardClosed}>
                      <Icon name="check" size={11} />
                      Closed {ticket.closedOn}
                    </p>
                  ) : null}

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
                </div>
              ))}

              {columnTickets.length === 0 ? (
                <p className={styles.columnEmpty}>
                  {column.id === "closed"
                    ? "Nothing closed yet — drag a card here to close it."
                    : "Nothing raised for this persona."}
                </p>
              ) : null}
            </div>
          </section>
        );
      })}
    </div>
  );
}
