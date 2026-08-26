"use client";

import { Icon, type IconName } from "@/app/_components/icon";
import {
  CAPTURE_SCORE,
  QUALITY_FACTORS,
  QUALITY_LABEL,
  STATUS_CHIP,
  type SessionRef,
  type VisitDay,
} from "../_data/session-history";
import type { SessionIdentity } from "../_data/session-viewer";
import styles from "./session-viewer.module.css";

/**
 * Who and what you are looking at: the store, the state of its capture, and
 * the two controls that choose which of its sessions the page is about.
 *
 * The `<h1>` is the store, not the session — the session id is a fact about
 * the store, and a reader arriving from a deep link needs to know where they
 * are before they know which capture they got.
 */
export function SessionHeader({
  session,
  days,
  visitIdx,
  sessionIdx,
  onVisit,
  onSession,
  qualityOpen,
  onToggleQuality,
  railOpen,
  onToggleRail,
}: {
  session: SessionIdentity;
  days: VisitDay[];
  visitIdx: number;
  sessionIdx: number;
  onVisit: (index: number) => void;
  onSession: (index: number) => void;
  qualityOpen: boolean;
  onToggleQuality: () => void;
  railOpen: boolean;
  onToggleRail: () => void;
}) {
  const day = days[visitIdx];
  const current: SessionRef = day.sessions[sessionIdx];
  const status = STATUS_CHIP[session.status];

  const facts: { icon: IconName; value: string; mono?: boolean }[] = [
    { icon: "store", value: session.retailer },
    { icon: "map-pin", value: session.place },
    { icon: "list", value: session.category },
    { icon: "boxes", value: session.placement },
    { icon: "camera", value: `${session.photos} photos` },
    { icon: "user", value: session.merchandiser, mono: true },
    { icon: "hash", value: current.id.slice(0, 8), mono: true },
  ];

  return (
    <div className={styles.pageHeader}>
      <div className={styles.crumbs}>
        Sessions
        <span className={styles.crumbSep} aria-hidden="true">
          /
        </span>
        Session Viewer
      </div>

      <div className={styles.headTop}>
        <div className={styles.headTitleRow}>
          <h1 className={styles.headTitle}>{session.store}</h1>
          <span className={styles.chip} data-tone={status.tone}>
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
        </div>

        <div className={styles.headControls}>
          <label className={styles.headField}>
            Visit date
            <select
              className={styles.headSelect}
              value={day.date}
              onChange={(event) =>
                onVisit(days.findIndex((entry) => entry.date === event.target.value))
              }
            >
              {days.map((entry) => (
                <option key={entry.date} value={entry.date}>
                  {entry.label}
                  {entry.sessions.length > 1 ? ` · ${entry.sessions.length} sessions` : ""}
                </option>
              ))}
            </select>
          </label>

          <span className={styles.stepper}>
            <button
              type="button"
              className={styles.iconButton}
              onClick={() => onSession(sessionIdx - 1)}
              disabled={sessionIdx === 0}
              aria-label="Previous session in this visit"
            >
              <Icon name="chevron-left" size={16} />
            </button>
            <label className={styles.headField}>
              Session
              <select
                className={styles.headSelect}
                value={current.id}
                onChange={(event) =>
                  onSession(day.sessions.findIndex((entry) => entry.id === event.target.value))
                }
              >
                {day.sessions.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.startedAt} · {entry.label}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              className={styles.iconButton}
              onClick={() => onSession(sessionIdx + 1)}
              disabled={sessionIdx === day.sessions.length - 1}
              aria-label="Next session in this visit"
            >
              <Icon name="chevron-right" size={16} />
            </button>
          </span>

          <span className={styles.sessionCaption}>
            {day.sessions.length === 1
              ? "only session"
              : `${sessionIdx + 1} of ${day.sessions.length} in visit`}
          </span>

          <span className={styles.divider} aria-hidden="true" />

          <button
            type="button"
            className={styles.toolButton}
            data-active={railOpen}
            aria-pressed={railOpen}
            onClick={onToggleRail}
          >
            <Icon name="panel-right" size={14} />
            Insights
          </button>
        </div>
      </div>

      {qualityOpen ? (
        <div className={styles.qualityPanel}>
          <div className={styles.qualityTop}>
            <span className={styles.qualityScore}>{CAPTURE_SCORE}</span>
            <span className={styles.qualityCaption}>
              mean capture score · {session.photos} of {session.photos} photos passed
            </span>
          </div>
          <div className={styles.qualityGrid}>
            {QUALITY_FACTORS.map(([name, score]) => (
              <div key={name}>
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
        </div>
      ) : null}

      <div className={styles.sessionHeadMeta}>
        {facts.map((fact) => (
          <span key={fact.icon} className={styles.sessionHeadItem} data-mono={fact.mono}>
            <Icon name={fact.icon} size={15} />
            {fact.value}
          </span>
        ))}
      </div>
    </div>
  );
}
