"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AskInfiChatButton } from "@/app/_components/chat/ask-infichat-button";
import { Icon } from "@/app/_components/icon";
import { ExcelDownloadButton } from "@/app/_export/excel-download-button";
import { Avatar, PRIORITY_LABEL, Pill, STATUS_LABEL } from "./bits";
import { SOURCES, nameFor, type Ticket, type TicketStatus } from "../_data/tickets";
import { originHref } from "../_data/ticket-context";
import { markerByKey } from "../_data/issue-instances";
import { merchandiserByHandle, personById } from "../_data/people";
import styles from "./tickets.module.css";
import { CardActions } from "@/app/_components/card-actions";

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
  onDelete,
  onSetStatus,
}: {
  ticket: Ticket;
  onClose: () => void;
  onDelete: (key: string) => void;
  onSetStatus: (key: string, status: TicketStatus) => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const marker = markerByKey(ticket.key);
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
    ...(ticket.closedOn
      ? ([["Closed", ticket.closedOn]] as [string, React.ReactNode][])
      : []),
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
          {/* The title is the header here, not a member of the action group —
              inside it the buttons hugged the heading instead of sitting at
              the panel's edge. */}
          <div className={styles.panelTitleRow}>
            <h2 className={styles.panelTitle}>{ticket.title}</h2>
            <CardActions>
              <AskInfiChatButton label={ticket.title} compact />
              <ExcelDownloadButton label={ticket.title} compact />
            </CardActions>
          </div>
          <p className={styles.panelDetail}>{ticket.detail}</p>

          {/* Replays the filter scope the ticket was raised under, so this
              lands on the numbers it is actually about rather than a default
              dashboard showing different ones.

              Gated on either half: the authored fixtures carry a `source` and
              no origin, while anything raised through the UI carries an origin
              and no source. Gating on `source` alone — as this did — made the
              round-trip unreachable for exactly the tickets that had a real
              one to offer. */}
          {ticket.origin?.from || ticket.source ? (
            <Link
              href={originHref(
                ticket.origin ?? {},
                ticket.source ? SOURCES[ticket.source].href : "/tickets",
              )}
              className={styles.sourceLink}
            >
              <Icon name="star" size={13} />
              Raised from {ticket.source ? SOURCES[ticket.source].label : "this view"}
              <Icon name="arrow-up-right" size={13} />
            </Link>
          ) : null}

          {/* Whether anything actually happened. Bound to the issue instance
              this ticket was raised against, so it compares like with like
              rather than reporting the store's overall drift. */}
          {marker ? (
            <div className={styles.beforeAfterCard} data-resolved={marker.resolved}>
              <div className={styles.beforeAfterLabel}>
                {marker.movement === null
                  ? "Raised — awaiting the next visit"
                  : marker.resolved
                    ? "Resolved on the next visit"
                    : "Measured on the next visit"}
              </div>
              {marker.movement === null ? (
                <p className={styles.beforeAfterNote}>
                  {marker.metric} on {marker.subject} was {marker.before}
                  {marker.unit} when this was raised on {marker.raisedOn}. Nothing
                  to compare against until the store is visited again.
                </p>
              ) : (
                <>
                  <div className={styles.beforeAfterRow}>
                    <span>
                      <span className={styles.beforeAfterKey}>
                        {marker.raisedOn}
                      </span>
                      <span className={styles.beforeAfterValue}>
                        {marker.before}
                        {marker.unit}
                      </span>
                    </span>
                    <Icon
                      name={marker.movement > 0 ? "arrow-up-right" : "arrow-down-right"}
                      size={16}
                    />
                    <span>
                      <span className={styles.beforeAfterKey}>
                        {marker.measuredOn}
                      </span>
                      <span
                        className={styles.beforeAfterValue}
                        data-tone={marker.movement > 0 ? "up" : "down"}
                      >
                        {marker.after}
                        {marker.unit}
                      </span>
                    </span>
                    <span className={styles.beforeAfterDelta} data-tone={marker.movement > 0 ? "up" : "down"}>
                      {marker.movement > 0 ? "+" : ""}
                      {marker.movement} pts
                    </span>
                  </div>
                  {marker.skus.length > 0 ? (
                    <p className={styles.beforeAfterNote}>
                      Measured across {marker.skus.length} SKU
                      {marker.skus.length === 1 ? "" : "s"} — {marker.skus.join(", ")}
                    </p>
                  ) : null}
                </>
              )}
            </div>
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

          {/* Close is reversible, so it does not ask; delete is not, so it
              does. Closing by hand sits alongside the derived route — the next
              visit's IR output closing it — rather than replacing it. */}
          <div className={styles.panelFoot}>
            <button
              type="button"
              className={styles.statusButton}
              data-status={ticket.status}
              onClick={() =>
                onSetStatus(
                  ticket.key,
                  ticket.status === "closed" ? "raised" : "closed",
                )
              }
            >
              <Icon name={ticket.status === "closed" ? "arrow-left" : "check"} size={13} />
              {ticket.status === "closed" ? "Reopen ticket" : "Close ticket"}
            </button>

            {confirming ? (
              <div className={styles.confirmRow}>
                <span className={styles.confirmText}>
                  Delete {ticket.key}? This cannot be undone.
                </span>
                <button
                  type="button"
                  className={styles.dangerButton}
                  onClick={() => onDelete(ticket.key)}
                >
                  Delete
                </button>
                <button
                  type="button"
                  className={styles.ghostButton}
                  onClick={() => setConfirming(false)}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                className={styles.deleteButton}
                onClick={() => setConfirming(true)}
              >
                <Icon name="x" size={13} />
                Delete ticket
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
