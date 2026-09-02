"use client";

import Link from "next/link";
import { Icon, type IconName } from "@/app/_components/icon";
import {
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
 * The `<h1>` is the store — code and name, the way the estate lists it — and
 * the processing status sits beside it, because "is this capture done" is the
 * first question about the page, not a fact among facts. Everything that
 * qualifies the capture rather than naming it sits in the second row, under a
 * hairline: the quality toggle, the six facts, and which session of how many
 * this is.
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

  /* Category leads and leads loudly: it is what the capture is *of*, and the
     first thing a reader scanning many sessions tells them apart by. */
  const facts: { icon: IconName; value: string; mono?: boolean; strong?: boolean }[] = [
    { icon: "list", value: current.category, strong: true },
    { icon: "store", value: session.retailer },
    { icon: "map-pin", value: session.place },
    { icon: "calendar-days", value: `${current.dayLabel} · ${current.startedAt}` },
    { icon: "user", value: session.merchandiser, mono: true },
    { icon: "image", value: `${session.photos} photos` },
  ];

  return (
    <header className={styles.pageHeader}>
      <div className={styles.headTop}>
        <div className={styles.headTitleWrap}>
          {/* The way back: this page is only ever entered from the estate
              index, and the eyebrow is where the eye already goes to ask
              "where am I". */}
          <nav className={styles.eyebrow} aria-label="Breadcrumb">
            <Link href="/session-viewer" className={styles.crumbLink}>
              Session Viewer
            </Link>
            <span className={styles.crumbSep} aria-hidden="true">
              /
            </span>
            <span className={styles.crumbHere}>{session.store}</span>
          </nav>
          <div className={styles.headTitleRow}>
            <h1 className={styles.headTitle}>{session.title}</h1>
            <span className={styles.chip} data-tone={status.tone}>
              <Icon name="check" size={12} />
              {status.label}
            </span>
          </div>
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
                    {entry.dayLabel} · {entry.startedAt}
                  </option>
                ))}
              </select>
            </label>
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
          <span
            key={fact.icon}
            className={styles.headFact}
            data-mono={fact.mono}
            data-strong={fact.strong}
          >
            <Icon name={fact.icon} size={14} />
            {fact.value}
          </span>
        ))}

        <span className={styles.sessionCaption}>
          Session {flatIndex + 1} of {sessions.length}
        </span>
      </div>

      {qualityOpen ? <QualityPanel photos={session.photos} /> : null}
    </header>
  );
}

/**
 * The four checks behind the quality label, opened from the toggle above.
 *
 * Binary on purpose: the pipeline grades a capture pass/fail per factor, so a
 * percentage or a bar here would be inventing precision the product does not
 * have. Each factor says Good or Bad, the way the must-stock list says Found
 * or Absent.
 *
 * Inside the sticky header, not a band below it: the header is on screen
 * wherever the reader has scrolled, and a toggle whose panel opened below the
 * fold would appear to do nothing.
 */
function QualityPanel({ photos }: { photos: number }) {
  return (
    <div className={styles.qualityPanel}>
      <span className={styles.qualityCaption}>
        {photos} of {photos} photos passed
      </span>
      {QUALITY_FACTORS.map(([name, good]) => (
        <span key={name} className={styles.factor}>
          {name}
          <span className={styles.factorVerdict} data-good={good}>
            <Icon name={good ? "check" : "x"} size={13} />
            {good ? "Good" : "Bad"}
          </span>
        </span>
      ))}
    </div>
  );
}
