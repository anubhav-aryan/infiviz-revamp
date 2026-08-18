"use client";

import { AskInfiChatButton } from "@/app/_components/chat/ask-infichat-button";
import { ExcelDownloadButton } from "@/app/_export/excel-download-button";
import { COVERAGE_REGION_ACCESSORS } from "@/app/merch-activity/_data/accessors";
import { MERCH_ACTIVITY } from "@/app/merch-activity/_data/merch-activity";
import { useNarrowed } from "@/app/_filters/use-narrowed";
import { CURRENT_MONTH } from "@/app/_time/periods";
import styles from "./landing.module.css";
import { CardActions } from "@/app/_components/card-actions";

/** Same bar-list treatment as the onboarding screen's "Visits by retailer". */

const REGIONS = MERCH_ACTIVITY[CURRENT_MONTH].coverageRegions;
const MAX_PCT = Math.max(...REGIONS.map((region) => region.pct));

export function RegionalCoverage() {
  // The one card on this screen whose rows carry a filterable dimension.
  const regions = useNarrowed(REGIONS, COVERAGE_REGION_ACCESSORS);

  return (
    <div className={`${styles.card} ${styles.retailerCard}`}>
      <div className={`${styles.cardHead} ${styles.retailerHead}`}>
        <div className={styles.cardTitle}>Coverage by region</div>
        <CardActions>
          <div className={styles.cardCaption}>% of estate audited</div>
          <AskInfiChatButton label="Coverage by region" compact />
          <ExcelDownloadButton label="Coverage by region" compact />
        </CardActions>
      </div>
      {regions.map((region) => (
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
