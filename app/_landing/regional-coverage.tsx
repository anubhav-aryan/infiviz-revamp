import { MERCH_ACTIVITY } from "@/app/merch-activity/_data/merch-activity";
import { CURRENT_MONTH } from "@/app/_time/periods";
import styles from "./landing.module.css";

/** Same bar-list treatment as the onboarding screen's "Visits by retailer". */

const REGIONS = MERCH_ACTIVITY[CURRENT_MONTH].coverageRegions;
const MAX_PCT = Math.max(...REGIONS.map((region) => region.pct));

export function RegionalCoverage() {
  return (
    <div className={`${styles.card} ${styles.retailerCard}`}>
      <div className={`${styles.cardHead} ${styles.retailerHead}`}>
        <div className={styles.cardTitle}>Coverage by region</div>
        <div className={styles.cardCaption}>% of estate audited</div>
      </div>
      {REGIONS.map((region) => (
        <div key={region.name} className={styles.retailerRow}>
          <span className={styles.retailerName}>{region.name}</span>
          <span className={styles.retailerTrack}>
            <span
              className={styles.retailerBar}
              style={{ width: `${(region.pct / MAX_PCT) * 100}%` }}
            />
          </span>
          <span className={styles.retailerValue}>{region.pct}%</span>
        </div>
      ))}
    </div>
  );
}
