import { Icon } from "@/app/_components/icon";
import type { CsvTable } from "@/app/_export/csv";
import { Bar, DeltaChip, TargetHero, TargetRule } from "@/app/_reports/marks";
import { ReportHeader } from "@/app/_reports/report-header";
import type { MonthKey } from "@/app/_time/periods";
import {
  PHOTO_QUALITY,
  REASONS_NOTE,
  type WorstRow,
} from "../_data/photo-quality";
import { RecentRejected } from "./recent-rejected";
import { TrendChart } from "./trend-chart";
import shared from "@/app/_reports/reports.module.css";
import styles from "./photo-quality.module.css";

/** Serialized here, from the same rows the table renders below. */
function worstCsv(rows: WorstRow[]): CsvTable {
  return {
    headers: [
      "Merchandiser",
      "Region",
      "Captures",
      "Rejection rate %",
      "Top reason",
    ],
    rows: rows.map((r) => [r.mrch, r.region, r.captures, r.rate, r.reason]),
  };
}

export function PhotoQualityReport({ month }: { month: MonthKey }) {
  const view = PHOTO_QUALITY[month];

  return (
    <>
      <ReportHeader
        title="Photo quality"
        active="photo-quality"
        month={month}
        basePath="/photo-quality"
        csv={worstCsv(view.worst)}
      />

      <div className={shared.body}>
        {/* hero + 30-day trend */}
        <div className={`${shared.card} ${styles.heroCard}`}>
          <TargetHero
            label={view.hero.label}
            value={view.hero.value}
            delta={view.hero.delta}
            caption={view.hero.caption}
            pct={view.hero.pct}
            targetPct={view.hero.targetPct}
            statusLabel={view.hero.statusLabel}
            targetLabel={view.hero.targetLabel}
            size="lg"
          />

          <div>
            <div className={styles.trendHead}>
              <span className={styles.trendTitle}>30-day trend</span>
              <span className={shared.legendNote}>
                <span className={styles.trendLegendMark} />
                {view.hero.targetLabel}
              </span>
            </div>
            <TrendChart trend={view.trend} />
          </div>
        </div>

        {/* why captures were rejected + rejection rate by region */}
        <div className={styles.twoUp}>
          <div className={`${shared.card} ${shared.cardPad}`}>
            <div className={shared.cardTitle}>Why captures were rejected</div>
            <div className={styles.reasonsCaption}>{view.reasonsCaption}</div>

            {view.reasons.map((reason) => (
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
              <TargetRule fraction={view.regionTargetFraction} inset />
              {view.regions.map((region) => (
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

          {view.worst.map((row) => (
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

        <RecentRejected sessions={view.rejected} />
      </div>
    </>
  );
}
