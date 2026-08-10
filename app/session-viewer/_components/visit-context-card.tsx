import { AskInfiChatButton } from "@/app/_components/chat/ask-infichat-button";
import chatStyles from "@/app/_components/chat/chat.module.css";
import { ExcelDownloadButton } from "@/app/_export/excel-download-button";
import type { Visit } from "@/app/store-explorer/_data/store-explorer";
import { photoQualityFor, visitTimeline } from "../_data/session-viewer";
import styles from "./session-viewer.module.css";

/**
 * In-store capture time, a derived photo-quality tier, and a capture timeline
 * — all keyed off the `Visit` a session was resolved from, so the no-`Visit`
 * default session simply doesn't render this card (nothing to derive it
 * from) rather than showing invented figures.
 */
export function VisitContextCard({ visit }: { visit: Visit }) {
  const timeline = visitTimeline(visit);
  const quality = photoQualityFor(visit);

  return (
    <div className={`${styles.card} ${styles.metricsCard}`}>
      <div className={styles.shelfHead}>
        <span className={styles.sectionLabel}>Visit context</span>
        <span className={chatStyles.askGroup}>
          <AskInfiChatButton label="Visit context" compact />
          <ExcelDownloadButton label="Visit context" compact />
        </span>
      </div>

      <div className={styles.visitContextStats}>
        <div>
          <div className={styles.visitContextLabel}>In-store capture time</div>
          <div className={styles.visitContextValue}>{visit.time}</div>
        </div>
        <div>
          <div className={styles.visitContextLabel}>Photo quality</div>
          <span className={styles.photoQualityBadge} data-tier={quality.tier}>
            {quality.label}
          </span>
        </div>
      </div>

      <div className={styles.timeline}>
        {timeline.map((event, i) => (
          <div key={`${event.time}-${i}`} className={styles.timelineRow}>
            <span className={styles.timelineDot} aria-hidden="true" />
            <span className={styles.timelineTime}>{event.time}</span>
            <span className={styles.timelineLabel}>{event.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
