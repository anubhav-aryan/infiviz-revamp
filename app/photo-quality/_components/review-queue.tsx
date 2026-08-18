"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/app/_components/icon";
import { sessionImageHref } from "@/app/session-images/_data/session-images";
import type { MonthKey } from "@/app/_time/periods";
import {
  FLAG_LABEL,
  queueSummary,
  reviewQueueFor,
  type ReviewItem,
} from "../_data/review-queue";
import shared from "@/app/_reports/reports.module.css";
import styles from "./photo-quality.module.css";

/**
 * The review queue — where everything the validity rules flagged rather than
 * auto-disabled waits for a decision.
 *
 * It lives on Photo quality rather than on a surface of its own because
 * everything a reviewer needs to decide is already here: the session's images,
 * the store's history, and the effect on the month's numbers. Somewhere else
 * would mean opening three screens per row.
 *
 * Two outcomes only, accept or disable, matching the two states a session can
 * be in. A decided row stays visible with its outcome rather than vanishing, so
 * a mistaken click is recoverable and the reviewer can see what they have done.
 */
export function ReviewQueue({ month }: { month: MonthKey }) {
  const items = reviewQueueFor(month);
  const [decided, setDecided] = useState<Record<string, "accepted" | "disabled">>({});

  const pending = items.filter((item) => !decided[item.id]);
  const summary = queueSummary(pending);

  return (
    <div className={`${shared.card} ${styles.queueCard}`}>
      <div className={styles.queueHead}>
        <div>
          <span className={shared.cardTitle}>Waiting for review</span>
          <div className={styles.queueSubtitle}>
            Flagged by the validity rules, not disabled automatically — each one
            needs a call.
          </div>
        </div>
        <span className={styles.queueSummary}>
          {pending.length === 0 ? (
            <>
              <Icon name="check-circle-2" size={14} />
              Queue clear
            </>
          ) : (
            <>
              <b>{summary.count}</b> waiting · up to <b>{summary.impact}</b> pts of
              movement
            </>
          )}
        </span>
      </div>

      <div className={styles.queueList}>
        {items.map((item) => (
          <ReviewRow
            key={item.id}
            item={item}
            outcome={decided[item.id]}
            onDecide={(outcome) =>
              setDecided((current) => ({ ...current, [item.id]: outcome }))
            }
            onUndo={() =>
              setDecided((current) => {
                const next = { ...current };
                delete next[item.id];
                return next;
              })
            }
          />
        ))}
      </div>
    </div>
  );
}

function ReviewRow({
  item,
  outcome,
  onDecide,
  onUndo,
}: {
  item: ReviewItem;
  outcome?: "accepted" | "disabled";
  onDecide: (outcome: "accepted" | "disabled") => void;
  onUndo: () => void;
}) {
  const href = sessionImageHref(item.store);

  return (
    <div className={styles.queueRow} data-outcome={outcome}>
      <div className={styles.queueWhy}>
        <span className={styles.queueFlag} data-reason={item.reason}>
          {FLAG_LABEL[item.reason]}
        </span>
        <span className={styles.queueFigure}>{item.figure}</span>
      </div>

      <div className={styles.queueStore}>
        <span className={styles.queueStoreName}>{item.store}</span>
        <span className={styles.queueMeta}>
          {item.retailer} · {item.merchandiser} · captured {item.captured}
        </span>
      </div>

      {/* The comparison is what makes the row decidable without leaving. */}
      <div className={styles.queueBaseline}>{item.baseline}</div>

      <div className={styles.queueActions}>
        {href ? (
          <Link href={href} className={styles.queueLink}>
            <Icon name="image" size={13} />
            Images
          </Link>
        ) : null}

        {outcome ? (
          <>
            <span className={styles.queueOutcome} data-outcome={outcome}>
              <Icon name={outcome === "accepted" ? "check" : "x"} size={12} />
              {outcome === "accepted" ? "Accepted" : "Disabled"}
            </span>
            <button type="button" className={styles.queueUndo} onClick={onUndo}>
              Undo
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className={styles.queueAccept}
              onClick={() => onDecide("accepted")}
            >
              Accept
            </button>
            <button
              type="button"
              className={styles.queueDisable}
              onClick={() => onDecide("disabled")}
            >
              Disable
            </button>
          </>
        )}
      </div>
    </div>
  );
}
