"use client";

import { Icon } from "@/app/_components/icon";
import { timelineFor } from "../_data/session-history";
import styles from "./session-viewer.module.css";

/**
 * How the capture went, end to end — the store visit through analytics being
 * ready.
 *
 * A full-bleed strip rather than a card, because it belongs to the header: it
 * says when this session happened, which is the same kind of fact as who
 * captured it. The cards below are about what was on the shelf.
 *
 * Every step is timed from the session's own start rather than a fixed clock,
 * so switching session moves the whole timeline instead of showing eight times
 * that only make sense for one of them.
 */
export function CaptureTimeline({
  startedAt,
  open,
  onToggle,
}: {
  startedAt: string;
  open: boolean;
  onToggle: () => void;
}) {
  const { steps, span } = timelineFor(startedAt);

  return (
    <div className={styles.timelineStrip}>
      <div className={styles.timelineHead}>
        <span className={styles.stripLabel}>Capture timeline</span>
        <span className={styles.timelineSpan}>{span}</span>
        <button
          type="button"
          className={styles.blockToggle}
          onClick={onToggle}
          aria-expanded={open}
        >
          {open ? "Hide" : "Show"}
          <Icon name={open ? "chevron-up" : "chevron-down"} size={13} />
        </button>
      </div>

      {open ? (
        <div className={styles.timelineRow}>
          {steps.map((step, index) => (
            <span key={step.name} className={styles.step}>
              <span className={styles.stepDot} aria-hidden="true">
                <Icon name="check" size={11} />
              </span>
              <span className={styles.stepText}>
                <span className={styles.stepName}>{step.name}</span>
                <span className={styles.stepTime}>{step.time}</span>
              </span>
              {index < steps.length - 1 ? (
                <>
                  <span className={styles.stepBar} aria-hidden="true" />
                  <span className={styles.gapChip}>{steps[index + 1].gap}</span>
                </>
              ) : null}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
