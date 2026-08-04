"use client";

import { useState } from "react";
import { Icon } from "@/app/_components/icon";
import { REJECTED, type RejectedSession } from "../_data/photo-quality";
import shared from "@/app/_reports/reports.module.css";
import styles from "./photo-quality.module.css";

/** The only genuine client state on either report. */
type RejectedView = "gallery" | "table";

function ViewImages({ store, className }: { store: string; className?: string }) {
  return (
    <button
      type="button"
      className={`${styles.viewImages} ${className ?? ""}`}
      aria-label={`View images for ${store}`}
    >
      View images
      <Icon name="arrow-up-right" size={14} />
    </button>
  );
}

function Gallery({ sessions }: { sessions: RejectedSession[] }) {
  return (
    <div className={styles.gallery}>
      {sessions.map((session) => (
        <div key={session.code} className={styles.galleryItem}>
          <div className={styles.thumb}>
            <span className={styles.scoreBadge}>
              <span className={styles.scoreBadgeLabel}>Score</span>
              <span className={styles.scoreValue} data-tier={session.tier}>
                {session.score}
              </span>
            </span>
            <span className={styles.rejectBadge} aria-hidden="true">
              <Icon name="x" />
            </span>
            <span className={styles.reasonTag}>{session.reason}</span>
          </div>

          <div className={styles.galleryStore}>{session.store}</div>
          <div className={styles.galleryCode}>{session.code}</div>
          <ViewImages store={session.store} className={styles.galleryView} />
        </div>
      ))}
    </div>
  );
}

function Table({ sessions }: { sessions: RejectedSession[] }) {
  return (
    <div className={styles.rejectedTable}>
      <div className={`${styles.rejectedGrid} ${styles.rejectedHeadRow}`}>
        <span />
        <span>Store</span>
        <span>Store code</span>
        <span>Reason</span>
        <span className={shared.numRight}>Score</span>
        <span />
      </div>

      {sessions.map((session) => (
        <div
          key={session.code}
          className={`${styles.rejectedGrid} ${styles.rejectedRow}`}
        >
          <span className={styles.thumbSmall}>
            <span className={styles.rejectBadgeSmall} aria-hidden="true">
              <Icon name="x" size={8} />
            </span>
          </span>
          <span className={styles.rejectedStore}>{session.store}</span>
          <span className={styles.rejectedCode}>{session.code}</span>
          <span className={styles.rejectedReason}>{session.reason}</span>
          <span
            className={`${styles.scoreValue} ${styles.rejectedScore}`}
            data-tier={session.tier}
          >
            {session.score}
          </span>
          <ViewImages store={session.store} className={styles.rejectedView} />
        </div>
      ))}
    </div>
  );
}

export function RecentRejected() {
  const [view, setView] = useState<RejectedView>("gallery");

  return (
    <div className={`${shared.card} ${shared.cardPad}`}>
      <div className={styles.rejectedHead}>
        <div className={shared.cardTitle}>Recent rejected sessions</div>

        <div className={styles.segmented}>
          <button
            type="button"
            className={styles.segmentedOption}
            data-active={view === "gallery"}
            aria-pressed={view === "gallery"}
            onClick={() => setView("gallery")}
          >
            <Icon name="layout-grid" />
            Gallery
          </button>
          <button
            type="button"
            className={styles.segmentedOption}
            data-active={view === "table"}
            aria-pressed={view === "table"}
            onClick={() => setView("table")}
          >
            <Icon name="list" />
            Table
          </button>
        </div>
      </div>

      {view === "gallery" ? (
        <Gallery sessions={REJECTED} />
      ) : (
        <Table sessions={REJECTED} />
      )}
    </div>
  );
}
