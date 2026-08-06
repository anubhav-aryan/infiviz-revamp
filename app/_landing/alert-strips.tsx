import Link from "next/link";
import { Icon } from "@/app/_components/icon";
import { MERCH_ACTIVITY } from "@/app/merch-activity/_data/merch-activity";
import { PHOTO_QUALITY } from "@/app/photo-quality/_data/photo-quality";
import { CURRENT_MONTH } from "@/app/_time/periods";
import styles from "./landing.module.css";

/**
 * Two compact previews of the worst rows on their full screens — same
 * icon/text/pill/figure row shape the activity feed already uses.
 */

const OVERDUE = MERCH_ACTIVITY[CURRENT_MONTH].overdue.slice(0, 4);

export function OverdueStoresCard() {
  return (
    <div className={`${styles.card} ${styles.feedCard}`}>
      <div className={styles.feedHead}>
        <span className={styles.feedTitle}>Stores needing a visit</span>
        <Link href="/merch-activity" className={styles.viewAllLink}>
          View all
          <Icon name="arrow-right" size={14} />
        </Link>
      </div>

      {OVERDUE.map((row) => (
        <div key={row.store} className={styles.feedRow}>
          <span className={styles.feedIcon} aria-hidden="true">
            <Icon name="map-pin" />
          </span>
          <span className={styles.feedText}>
            {row.store}
            <span className={styles.attentionSubject}>
              {" "}
              · {row.retailer} · {row.region}
            </span>
          </span>
          {row.status === "notyet" ? (
            <span className={styles.feedPill} data-tone="danger">
              Never visited
            </span>
          ) : (
            <span className={styles.feedFigure}>{row.days}d</span>
          )}
        </div>
      ))}
    </div>
  );
}

const WORST = PHOTO_QUALITY[CURRENT_MONTH].worst
  .filter((row) => row.stores.length > 0)
  .slice(0, 4);

export function QualityAlertsCard() {
  return (
    <div className={`${styles.card} ${styles.feedCard}`}>
      <div className={styles.feedHead}>
        <span className={styles.feedTitle}>Quality alerts</span>
        <Link href="/photo-quality" className={styles.viewAllLink}>
          View all
          <Icon name="arrow-right" size={14} />
        </Link>
      </div>

      {WORST.map((row) => (
        <div key={row.mrch} className={styles.feedRow}>
          <span className={styles.feedIcon} aria-hidden="true">
            <Icon name="camera" />
          </span>
          <span className={styles.feedText}>
            {row.stores[0].store}
            <span className={styles.attentionSubject}>
              {" "}
              · {row.reason.toLowerCase()}
            </span>
          </span>
          {row.tier === "danger" ? (
            <span className={styles.feedPill} data-tone="danger">
              Critical
            </span>
          ) : null}
          <span className={styles.feedFigure}>{row.rate}%</span>
        </div>
      ))}
    </div>
  );
}
