"use client";

import { Icon, type IconName } from "@/app/_components/icon";
import {
  CAPTURE_SCORE,
  QUALITY_FACTORS,
  QUALITY_LABEL,
  STATUS_CHIP,
  type FlatSession,
} from "../_data/session-history";
import type { SessionIdentity } from "../_data/session-viewer";
import styles from "./session-viewer.module.css";

/**
 * Who and what you are looking at: the store, the state of its capture, and the
 * one control that chooses which of its sessions the page is about.
 *
 * The `<h1>` is the store — code and name, the way the estate lists it — because
 * a reader arriving from a deep link needs to know where they are before they
 * know which capture they got. Everything that qualifies the capture rather
 * than naming it sits in the second row, under a hairline: the two status
 * pills, then the six facts, then which session of how many this is.
 *
 * There is one Session control, not a visit picker plus a session picker.
 * "The capture before this one" is not a thought about day boundaries.
 */
export function SessionHeader({
  session,
  sessions,
  flatIndex,
  onSession,
  qualityOpen,
  onToggleQuality,
  railOpen,
  onToggleRail,
}: {
  session: SessionIdentity;
  /** Every session across every visit, newest first. */
  sessions: FlatSession[];
  flatIndex: number;
  onSession: (flatIndex: number) => void;
  qualityOpen: boolean;
  onToggleQuality: () => void;
  railOpen: boolean;
  onToggleRail: () => void;
}) {
  const current = sessions[flatIndex];
  const status = STATUS_CHIP[session.status];

  const facts: { icon: IconName; value: string; mono?: boolean }[] = [
    { icon: "store", value: session.retailer },
    { icon: "map-pin", value: session.place },
    { icon: "list", value: current.category },
    { icon: "calendar-days", value: `${current.dayLabel} · ${current.startedAt}` },
    { icon: "user", value: session.merchandiser, mono: true },
    { icon: "image", value: `${session.photos} photos` },
  ];

  return (
    <header className={styles.pageHeader}>
      <div className={styles.headTop}>
        <div className={styles.headTitleWrap}>
          <div className={styles.eyebrow}>Session viewer</div>
          <h1 className={styles.headTitle}>{session.title}</h1>
        </div>

        <div className={styles.headControls}>
          <div className={styles.controlShell}>
            <label className={styles.controlField}>
              <span className={styles.controlLabel}>Session</span>
              <select
                className={styles.bareSelect}
                value={current.id}
                onChange={(event) =>
                  onSession(sessions.findIndex((entry) => entry.id === event.target.value))
                }
              >
                {sessions.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.dayLabel} · {entry.startedAt} · {entry.category}
                  </option>
                ))}
              </select>
            </label>
            <span className={styles.stepper}>
              <button
                type="button"
                className={styles.iconButton}
                onClick={() => onSession(flatIndex - 1)}
                disabled={flatIndex === 0}
                aria-label="Previous session"
              >
                <Icon name="chevron-left" size={16} />
              </button>
              <button
                type="button"
                className={styles.iconButton}
                onClick={() => onSession(flatIndex + 1)}
                disabled={flatIndex === sessions.length - 1}
                aria-label="Next session"
              >
                <Icon name="chevron-right" size={16} />
              </button>
            </span>
          </div>

          <button
            type="button"
            className={styles.railToggle}
            data-active={railOpen}
            aria-pressed={railOpen}
            onClick={onToggleRail}
          >
            <Icon name="panel-right" size={14} />
            {railOpen ? "Hide insights" : "Insights"}
          </button>
        </div>
      </div>

      <div className={styles.headMeta}>
        <span className={styles.chip} data-tone={status.tone}>
          <Icon name="check" size={12} />
          {status.label}
        </span>
        <button
          type="button"
          className={styles.qualityChip}
          onClick={onToggleQuality}
          aria-expanded={qualityOpen}
        >
          <Icon name="camera" size={12} />
          {QUALITY_LABEL}
          <Icon name={qualityOpen ? "chevron-up" : "chevron-down"} size={12} />
        </button>

        <span className={styles.divider} aria-hidden="true" />

        {facts.map((fact) => (
          <span key={fact.icon} className={styles.headFact} data-mono={fact.mono}>
            <Icon name={fact.icon} size={14} />
            {fact.value}
          </span>
        ))}

        <span className={styles.sessionCaption}>
          Session {flatIndex + 1} of {sessions.length}
        </span>
      </div>
    </header>
  );
}

/**
 * The four factors behind the capture score, opened from the pill above.
 *
 * Its own full-bleed band rather than a panel inside the header: it pushes the
 * whole page down when it opens, and a sticky header that changes height as you
 * scroll under it is a header that fights the reader.
 */
export function QualityPanel({ photos }: { photos: number }) {
  return (
    <div className={styles.qualityPanel}>
      <div className={styles.qualityTop}>
        <span className={styles.qualityScore}>{CAPTURE_SCORE}</span>
        <span className={styles.qualityCaption}>
          mean capture score · {photos} of {photos} photos passed
        </span>
      </div>
      {QUALITY_FACTORS.map(([name, score]) => (
        <div key={name} className={styles.factor}>
          <div className={styles.factorName}>
            {name}
            <span className={styles.factorValue}>{score}%</span>
          </div>
          <div className={styles.factorTrack}>
            <span className={styles.factorBar} style={{ width: `${score}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
