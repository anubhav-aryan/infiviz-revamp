"use client";

import { useState, useSyncExternalStore } from "react";
import { Icon } from "@/app/_components/icon";
import { STORE_TZ, timelineFor } from "../_data/session-history";
import styles from "./session-viewer.module.css";

const noSubscription = () => () => {};

/**
 * Every UTC offset the world's clocks actually use, −12:00 through +14:00 —
 * including the half- and quarter-hour zones (Newfoundland, India, Nepal,
 * Chatham and the rest). Offsets rather than named zones on purpose: the
 * timeline shifts wall-clock strings by pure minute arithmetic, and a city
 * name would promise DST handling this fixture cannot honour.
 */
const TZ_OFFSETS: number[] = [
  -720, -660, -600, -570, -540, -480, -420, -360, -300, -240, -210, -180, -120,
  -60, 0, 60, 120, 180, 210, 240, 270, 300, 330, 345, 360, 390, 420, 480, 525,
  540, 570, 600, 630, 660, 720, 765, 780, 825, 840,
];

/** `330` → `"UTC+5:30"`, `-240` → `"UTC−4"`. */
function offsetLabel(minutes: number): string {
  const sign = minutes < 0 ? "−" : "+";
  const abs = Math.abs(minutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `UTC${sign}${h}${m ? `:${String(m).padStart(2, "0")}` : ""}`;
}

/** `"store" | "utc" | "local"`, or a UTC offset in minutes as a string. */
type Tz = string;

/**
 * How the capture went, end to end — the store visit through analytics being
 * ready.
 *
 * A full-bleed strip rather than a card, because it belongs to the header: it
 * says when this session happened, which is the same kind of fact as who
 * captured it. The cards below are about what was on the shelf.
 *
 * Every step is timed from the session's own start rather than a fixed clock,
 * so switching session moves the whole timeline instead of showing six times
 * that only make sense for one of them.
 *
 * The timezone control shifts the *display*: a reviewer in another country
 * asking "was I awake when this uploaded" is asking about their clock, not the
 * store's. The store's wall clock stays the default — and the only value the
 * server renders, so the reader's own offset (read from the browser) can never
 * cause a hydration mismatch.
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
  const [tz, setTz] = useState<Tz>("store");

  /* The browser's offset, null on the server — so the first client render
     matches the prerendered store time and the Local option appears after.
     A store subscription rather than an effect: the value never changes
     within a session, it is only unknown until the client is there to ask. */
  const localOffset = useSyncExternalStore<number | null>(
    noSubscription,
    () => -new Date().getTimezoneOffset(),
    () => null,
  );

  const targetOffset =
    tz === "store"
      ? STORE_TZ.offsetMinutes
      : tz === "utc"
        ? 0
        : tz === "local"
          ? (localOffset ?? STORE_TZ.offsetMinutes)
          : Number(tz);
  const shift = targetOffset - STORE_TZ.offsetMinutes;

  const { steps, span } = timelineFor(startedAt, shift);

  return (
    <div className={styles.timelineStrip}>
      <div className={styles.timelineHead}>
        <span className={styles.stripLabel}>Capture timeline</span>
        <span className={styles.timelineSpan}>{span}</span>
        <select
          className={styles.filterSelect}
          value={tz}
          onChange={(event) => setTz(event.target.value)}
          aria-label="Timeline timezone"
        >
          <option value="store">
            Store · {STORE_TZ.label} ({offsetLabel(STORE_TZ.offsetMinutes)})
          </option>
          <option value="utc">UTC</option>
          {localOffset !== null && localOffset !== STORE_TZ.offsetMinutes ? (
            <option value="local">Local ({offsetLabel(localOffset)})</option>
          ) : null}
          <optgroup label="All UTC offsets">
            {TZ_OFFSETS.map((offset) => (
              <option key={offset} value={String(offset)}>
                {offsetLabel(offset)}
              </option>
            ))}
          </optgroup>
        </select>
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
