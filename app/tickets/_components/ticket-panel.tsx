"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Icon } from "@/app/_components/icon";
import { Avatar, PRIORITY_LABEL, Pill, STATUS_LABEL } from "./bits";
import { SOURCES, nameFor, type Ticket } from "../_data/tickets";
import { merchandiserByHandle, personById } from "../_data/people";
import styles from "./tickets.module.css";

/**
 * Ticket detail, as a right-hand slide-over.
 *
 * The scrim, the `role="dialog"`, the Escape handler and the focus restore are
 * lifted from `catalog/_components/sku-panel.tsx` — the app's established
 * overlay pattern. Copied rather than imported because that one is bound to the
 * catalog's own stylesheet; the behaviour is what matters and it is identical.
 */

export function TicketPanel({
  ticket,
  onClose,
}: {
  ticket: Ticket;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      opener?.focus?.();
    };
  }, [onClose]);

  const reporter = personById(ticket.reporterId);
  const assignee =
    merchandiserByHandle(ticket.assigneeId) ?? personById(ticket.assigneeId);

  const attributes: [string, React.ReactNode][] = [
    [
      "Status",
      <Pill key="s" label={STATUS_LABEL[ticket.status]} tone={ticket.status} />,
    ],
    [
      "Priority",
      <Pill key="p" label={PRIORITY_LABEL[ticket.priority]} tone={ticket.priority} />,
    ],
    [
      "Assignee",
      <span key="a" className={styles.person}>
        <Avatar name={nameFor(ticket.assigneeId)} />
        <span>
          {nameFor(ticket.assigneeId)}
          {assignee ? <span className={styles.personRole}>{assignee.role}</span> : null}
        </span>
      </span>,
    ],
    [
      "Reporter",
      <span key="r" className={styles.person}>
        <Avatar name={reporter?.name ?? ticket.reporterId} />
        <span>
          {reporter?.name ?? ticket.reporterId}
          {reporter ? <span className={styles.personRole}>{reporter.role}</span> : null}
        </span>
      </span>,
    ],
    ["Subject", ticket.subject],
    ["Created", ticket.created],
    ["Due", ticket.due],
  ];

  return (
    <div className={styles.scrim} onClick={onClose} role="presentation">
      <div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label={`${ticket.key} — ${ticket.title}`}
        onClick={(event) => event.stopPropagation()}
      >
        <header className={styles.panelHead}>
          <span className={styles.ticketKey}>{ticket.key}</span>
          <button
            ref={closeRef}
            type="button"
            className={styles.panelClose}
            onClick={onClose}
            aria-label="Close ticket"
          >
            <Icon name="x" size={16} />
          </button>
        </header>

        <div className={styles.panelBody}>
          <h2 className={styles.panelTitle}>{ticket.title}</h2>
          <p className={styles.panelDetail}>{ticket.detail}</p>

          {ticket.source ? (
            <Link href={SOURCES[ticket.source].href} className={styles.sourceLink}>
              <Icon name="star" size={13} />
              Raised from {SOURCES[ticket.source].label}
              <Icon name="arrow-up-right" size={13} />
            </Link>
          ) : null}

          <dl className={styles.attributes}>
            {attributes.map(([key, value]) => (
              <div key={key} className={styles.attributeRow}>
                <dt className={styles.attributeKey}>{key}</dt>
                <dd className={styles.attributeValue}>{value}</dd>
              </div>
            ))}
          </dl>

          <div className={styles.labelRow}>
            {ticket.labels.map((label) => (
              <span key={label} className={styles.label}>
                {label}
              </span>
            ))}
          </div>

          
        </div>
      </div>
    </div>
  );
}
