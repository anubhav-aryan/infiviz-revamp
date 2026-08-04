import Link from "next/link";
import { Icon } from "@/app/_components/icon";
import { ActivityFeed } from "./activity-feed";
import {
  CONFIRM_B,
  HEADER_B,
  METERS_B,
  MONTHS,
  MONTHS_CARD,
  REPORTS,
  REPORT_CTA,
  RETAILERS,
  RETAILERS_CARD,
} from "./_data/landing";
import styles from "./landing.module.css";

/** State B — master data is configured and captures have started, no analytics. */
export function StateB() {
  return (
    <div className={styles.stateB}>
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>{HEADER_B.title}</h1>
          <div className={styles.pageSubtitle}>{HEADER_B.subtitle}</div>
        </div>
        <div className={styles.headActions}>
          <span className={styles.syncPill}>
            <Icon name="refresh-cw" />
            {HEADER_B.synced}
          </span>
          <span className={styles.lockedPill}>
            <Icon name="lock" />
            {HEADER_B.locked}
          </span>
        </div>
      </div>

      {/* confirmation band — proof the account is configured */}
      <div className={styles.confirmBand}>
        {CONFIRM_B.map((tile) => (
          <div key={tile.label} className={`${styles.card} ${styles.confirmTile}`}>
            <span className={styles.confirmIcon} aria-hidden="true">
              <Icon name={tile.icon} />
            </span>
            <div>
              <div className={styles.confirmValue}>{tile.value}</div>
              <div className={styles.confirmLabel}>{tile.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.body}>
        <div className={styles.bodyMain}>
          {/* coverage + photo quality */}
          <div className={styles.pair}>
            {METERS_B.map((meter) => (
              <div
                key={meter.title}
                className={`${styles.card} ${styles.meterCard}`}
              >
                <div className={styles.cardTitle}>{meter.title}</div>
                <div className={styles.meterValueRow}>
                  <span className={styles.meterValue}>
                    {meter.value}
                    <span className={styles.meterUnit}>{meter.unit}</span>
                  </span>
                  <span className={styles.meterCaption}>{meter.caption}</span>
                </div>
                <div className={styles.track}>
                  <div
                    className={styles.trackFill}
                    style={{ width: `${meter.fill}%` }}
                  />
                  <div
                    className={styles.trackTick}
                    style={{ left: `${meter.target}%` }}
                  />
                </div>
                <div className={styles.trackFoot}>
                  <span>{meter.note}</span>
                  <span className={styles.trackTarget}>{meter.targetLabel}</span>
                </div>
              </div>
            ))}
          </div>

          {/* visits by retailer */}
          <div className={`${styles.card} ${styles.retailerCard}`}>
            <div className={`${styles.cardHead} ${styles.retailerHead}`}>
              <div className={styles.cardTitle}>{RETAILERS_CARD.title}</div>
              <div className={styles.cardCaption}>{RETAILERS_CARD.caption}</div>
            </div>
            {RETAILERS.map((retailer) => (
              <div key={retailer.name} className={styles.retailerRow}>
                <span className={styles.retailerName}>{retailer.name}</span>
                <span className={styles.retailerTrack}>
                  <span
                    className={styles.retailerBar}
                    style={{ width: `${retailer.width}%` }}
                  />
                </span>
                <span className={styles.retailerValue}>
                  {retailer.visits} · {retailer.pct}%
                </span>
              </div>
            ))}
          </div>

          {/* sessions by month */}
          <div className={`${styles.card} ${styles.monthsCard}`}>
            <div className={`${styles.cardHead} ${styles.monthsHead}`}>
              <div className={styles.cardTitle}>{MONTHS_CARD.title}</div>
              <div className={styles.cardCaption}>{MONTHS_CARD.caption}</div>
            </div>
            <div className={styles.monthsChart}>
              {MONTHS.map((month) => (
                <div key={month.label} className={styles.month}>
                  <span className={styles.monthValue}>{month.value}</span>
                  <div
                    className={styles.monthBar}
                    style={{ height: `${month.height}%` }}
                  />
                  <span className={styles.monthLabel}>{month.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* report entry points */}
          <div className={styles.pair}>
            {REPORTS.map((report) => (
              <Link
                key={report.title}
                href={report.href}
                className={`${styles.card} ${styles.reportCard}`}
              >
                <span className={styles.reportHead}>
                  <span className={styles.reportIcon} aria-hidden="true">
                    <Icon name={report.icon} />
                  </span>
                  <span className={styles.reportTitle}>{report.title}</span>
                </span>
                <span className={styles.reportStat}>{report.stat}</span>
                <span className={styles.reportCta}>
                  {REPORT_CTA}
                  <Icon name="arrow-right" />
                </span>
              </Link>
            ))}
          </div>
        </div>

        <ActivityFeed />
      </div>
    </div>
  );
}
