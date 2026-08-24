"use client";

import { Icon } from "@/app/_components/icon";
import { timelineFor } from "../_data/session-history";
import styles from "./session-viewer.module.css";

/**
 * How the capture went, end to end.
 *
 * Every step is timed from the session's own start rather than a fixed clock,
 * so switching session moves the whole timeline instead of showing four times
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
    <div className={styles.card}>
      <div className={styles.timelineHead}>
        <span className={styles.blockTitle}>Capture timeline</span>
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
        <div className={styles.timelineBody}>
          <div className={styles.timelineRow}>
            {steps.map((step, index) => (
              <div
                key={step.name}
                className={styles.step}
                style={index === steps.length - 1 ? { flex: "none" } : { flex: 1 }}
              >
                <div className={styles.stepTop}>
                  <span className={styles.stepDot} aria-hidden="true">
                    <Icon name="check" size={12} />
                  </span>
                  {index < steps.length - 1 ? (
                    <>
                      <span className={styles.stepBar} aria-hidden="true" />
                      <span className={styles.gapChip}>{steps[index + 1].gap}</span>
                    </>
                  ) : null}
                </div>
                <div className={styles.stepName}>{step.name}</div>
                <div className={styles.stepTime}>{step.time}</div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
