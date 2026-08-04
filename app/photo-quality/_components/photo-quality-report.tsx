import { Icon } from "@/app/_components/icon";
import { Bar, DeltaChip, TargetHero, TargetRule } from "@/app/_reports/marks";
import { ReportHeader } from "@/app/_reports/report-header";
import {
  HERO,
  REASONS_CAPTION,
  REASONS_NOTE,
  REGION_TARGET_FRACTION,
  REJECTION_REASONS,
  REJECTION_REGIONS,
  WORST,
} from "../_data/photo-quality";
import { RecentRejected } from "./recent-rejected";
import { TrendChart } from "./trend-chart";
import shared from "@/app/_reports/reports.module.css";
import styles from "./photo-quality.module.css";

export function PhotoQualityReport() {
  return (
    <>
      <ReportHeader title="Photo quality" active="photo-quality" />

      <div className={shared.body}>
        {/* hero + 30-day trend */}
        <div className={`${shared.card} ${styles.heroCard}`}>
          <TargetHero
            label={HERO.label}
            value={HERO.value}
            delta={HERO.delta}
            caption={HERO.caption}
            pct={HERO.pct}
            targetPct={HERO.targetPct}
            statusLabel={HERO.statusLabel}
            targetLabel={HERO.targetLabel}
            size="lg"
          />

          <div>
            <div className={styles.trendHead}>
              <span className={styles.trendTitle}>30-day trend</span>
              <span className={shared.legendNote}>
                <span className={styles.trendLegendMark} />
                Target 95%
              </span>
            </div>
            <TrendChart />
          </div>
        </div>

        {/* why captures were rejected + rejection rate by region */}
        <div className={styles.twoUp}>
          <div className={`${shared.card} ${shared.cardPad}`}>
            <div className={shared.cardTitle}>Why captures were rejected</div>
            <div className={styles.reasonsCaption}>{REASONS_CAPTION}</div>

            {REJECTION_REASONS.map((reason) => (
              <div key={reason.name} className={styles.reasonRow}>
                <span className={styles.reasonName}>{reason.name}</span>
                <Bar pct={reason.width} height={12} />
                <span className={styles.reasonValue}>
                  <span className={styles.reasonPct}>{reason.pct}%</span>
                  <DeltaChip {...reason.delta} size="inline" />
                </span>
              </div>
            ))}

            <div className={styles.reasonsNote}>{REASONS_NOTE}</div>
          </div>

          <div className={`${shared.card} ${shared.cardPad}`}>
            <div className={shared.cardHead}>
              <div className={shared.cardTitle}>Rejection rate by region</div>
              <span className={shared.legendNote}>
                <span className={shared.dashSwatch} />
                Target ≤5%
              </span>
            </div>

            <div className={`${shared.barListStack} ${styles.regionStack}`}>
              <TargetRule fraction={REGION_TARGET_FRACTION} inset />
              {REJECTION_REGIONS.map((region) => (
                <div key={region.name} className={shared.barRow}>
                  <span className={shared.barRowName}>{region.name}</span>
                  <Bar pct={region.width} height={11} />
                  <span className={shared.barRowValue}>{region.rate}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* merchandisers by rejection rate */}
        <div className={`${shared.card} ${shared.tableCard}`}>
          <div className={styles.worstHead}>
            <div>
              <span className={shared.cardTitle}>
                Merchandisers by rejection rate
              </span>
              <span className={styles.worstSubtitle}>
                worst 10 · min 20 captures
              </span>
            </div>
            <span className={styles.worstPill}>
              <Icon name="shield-alert" />
              Low-sample merchandisers excluded
            </span>
          </div>

          <div
            className={`${styles.worstGrid} ${shared.tableHead} ${styles.worstHeadRow}`}
          >
            <span>Merchandiser</span>
            <span>Region</span>
            <span className={shared.numRight}>Captures</span>
            <span className={shared.numRight}>Rejection rate</span>
            <span>Top reason</span>
          </div>

          {WORST.map((row) => (
            <div
              key={row.mrch}
              className={`${styles.worstGrid} ${shared.tableRow} ${styles.worstRow}`}
            >
              <span className={styles.worstMrch}>{row.mrch}</span>
              <span className={styles.worstText}>{row.region}</span>
              <span className={styles.worstCaptures}>{row.captures}</span>
              <span className={styles.worstRate}>
                <Bar pct={row.width} height={6} track="w90" />
                <span className={styles.rateValue} data-tier={row.tier}>
                  {row.rate}%
                </span>
              </span>
              <span className={styles.worstText}>{row.reason}</span>
            </div>
          ))}
        </div>

        <RecentRejected />
      </div>
    </>
  );
}
