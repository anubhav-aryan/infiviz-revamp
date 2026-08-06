"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/app/_components/icon";
import type { RejectedSession } from "../_data/photo-quality";
import shared from "@/app/_reports/reports.module.css";
import { sessionImageHref } from "@/app/session-images/_data/session-images";
import { PHOTOS } from "@/app/store-explorer/_data/store-explorer";
import styles from "./photo-quality.module.css";

/** Cycles through the platform's one mock capture set — there's no per-session photo. */
function rejectedThumb(index: number): string {
  return PHOTOS[index % PHOTOS.length].src;
}

/** The only genuine client state on either report. */
type RejectedView = "gallery" | "table";

/**
 * Opens the store's captures on `/session-images`. Previously this pointed at
 * `/store-explorer` with no store at all, which dropped the reader on a landing
 * screen and made them find the visit again.
 *
 * A store with no capture set renders inert rather than linking to a page that
 * would 404 — `sessionImageHref` returns null for anything outside the
 * canonical list.
 */
function ViewImages({ store, className }: { store: string; className?: string }) {
  const href = sessionImageHref(store);

  if (!href) {
    return (
      <span
        className={`${styles.viewImages} ${className ?? ""}`}
        data-inert="true"
        title="No captures stored for this visit"
      >
        View images
      </span>
    );
  }

  return (
    <Link
      href={href}
      className={`${styles.viewImages} ${className ?? ""}`}
      aria-label={`View images for ${store}`}
    >
      View images
      <Icon name="arrow-up-right" size={14} />
    </Link>
  );
}

function Gallery({ sessions }: { sessions: RejectedSession[] }) {
  return (
    <div className={styles.gallery}>
      {sessions.map((session, i) => (
        <div key={session.code} className={styles.galleryItem}>
          <div className={styles.thumb}>
            <img
              className={styles.thumbImage}
              src={rejectedThumb(i)}
              alt={`Rejected capture from ${session.store}`}
            />
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

      {sessions.map((session, i) => (
        <div
          key={session.code}
          className={`${styles.rejectedGrid} ${styles.rejectedRow}`}
        >
          <span className={styles.thumbSmall}>
            <img
              className={styles.thumbImage}
              src={rejectedThumb(i)}
              alt={`Rejected capture from ${session.store}`}
            />
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

export function RecentRejected({
  sessions,
}: {
  sessions: RejectedSession[];
}) {
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
        <Gallery sessions={sessions} />
      ) : (
        <Table sessions={sessions} />
      )}
    </div>
  );
}
