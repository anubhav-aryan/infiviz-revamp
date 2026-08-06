"use client";

import { useState } from "react";
import { Segmented } from "@/app/_charts/segmented";
import { MONTHS, SESSIONS_CARD, WEEKS, type SessionsMode } from "./_data/landing";
import styles from "./landing.module.css";

/**
 * Sessions by month or by week.
 *
 * Split out of `onboarding-screen.tsx` — which is a Server Component — because
 * the toggle needs state. Only this card becomes client; the rest of the screen
 * stays server-rendered, the same split `activity-feed.tsx` already uses.
 *
 * The bar treatment is unchanged: `.month:last-child` draws the most recent
 * bucket at full strength, which reads correctly for weeks as well as months.
 */

const MODES: { id: SessionsMode; label: string }[] = [
  { id: "month", label: "Month" },
  { id: "week", label: "Week" },
];

export function SessionsCard() {
  const [mode, setMode] = useState<SessionsMode>("month");
  const bars = mode === "month" ? MONTHS : WEEKS;
  const card = SESSIONS_CARD[mode];

  return (
    <div className={`${styles.card} ${styles.monthsCard}`}>
      <div className={`${styles.cardHead} ${styles.monthsHead}`}>
        <div className={styles.cardTitle}>{card.title}</div>
        <div className={styles.monthsTools}>
          <span className={styles.cardCaption}>{card.caption}</span>
          <Segmented
            options={MODES}
            value={mode}
            onChange={setMode}
            label="Sessions grouping"
          />
        </div>
      </div>

      <div className={styles.monthsChart}>
        {bars.map((bar) => (
          <div key={bar.label} className={styles.month}>
            <span className={styles.monthValue}>{bar.value}</span>
            <div className={styles.monthBar} style={{ height: `${bar.height}%` }} />
            <span className={styles.monthLabel}>{bar.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
