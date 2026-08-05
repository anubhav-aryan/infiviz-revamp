import { Icon } from "@/app/_components/icon";
import { FEED, FEED_CARD } from "./_data/landing";
import styles from "./landing.module.css";

/** The same feed, bound to the same rows, in both the onboarding and live states. */
export function ActivityFeed() {
  return (
    <div className={`${styles.card} ${styles.feedCard}`}>
      <div className={styles.feedHead}>
        <span className={styles.feedTitle}>{FEED_CARD.title}</span>
        <span className={styles.cardCaption}>{FEED_CARD.caption}</span>
      </div>

      {FEED.map((row) => (
        <div key={row.text} className={styles.feedRow}>
          <span className={styles.feedIcon} aria-hidden="true">
            <Icon name={row.icon} />
          </span>
          <span className={styles.feedText}>{row.text}</span>
          {row.pill ? (
            <span className={styles.feedPill} data-tone={row.pillTone}>
              {row.pill}
            </span>
          ) : null}
          <span className={styles.feedFigure}>{row.figure}</span>
        </div>
      ))}
    </div>
  );
}
