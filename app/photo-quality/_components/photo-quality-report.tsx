"use client";

import { AskInfiChatButton } from "@/app/_components/chat/ask-infichat-button";
import chatStyles from "@/app/_components/chat/chat.module.css";
import { Icon } from "@/app/_components/icon";
import type { CsvTable } from "@/app/_export/csv";
import { ExcelDownloadButton } from "@/app/_export/excel-download-button";
import { Bar, DeltaChip, TargetHero, TargetRule } from "@/app/_reports/marks";
import { ReportHeader } from "@/app/_reports/report-header";
import { UnfilteredMark } from "@/app/_filters/unfiltered-mark";
import { useNarrowed } from "@/app/_filters/use-narrowed";
import {
  REGION_ACCESSORS,
  REJECTED_ACCESSORS,
  WORST_ACCESSORS,
} from "../_data/accessors";
import type { MonthKey } from "@/app/_time/periods";
import {
  PHOTO_QUALITY,
  REASONS_NOTE,
  type WorstRow,
} from "../_data/photo-quality";
import { RecentRejected } from "./recent-rejected";
import { ReviewQueue } from "./review-queue";
import { WorstTable } from "./worst-table";
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

  /* The row-level tables carry region and merchandiser, so they genuinely
     narrow. The hero, trend and rejection-reason split are authored monthly
     totals with no per-row basis to recompute from, so they carry an
     "unfiltered" mark instead of a number that only looks filtered. */
  const worst = useNarrowed(view.worst, WORST_ACCESSORS);
  const rejected = useNarrowed(view.rejected, REJECTED_ACCESSORS);
  const regions = useNarrowed(view.regions, REGION_ACCESSORS);

  return (
    <>
      <ReportHeader
        title="Photo quality"
        active="photo-quality"
        month={month}
        basePath="/photo-quality"
        csv={worstCsv(worst)}
        detailHref="/analytics/field/merchandiser/photo-quality"
      />

      <div className={shared.body}>
        {/* hero + 30-day trend — both authored monthly totals, hence the mark */}
        <div className={`${shared.card} ${styles.heroCard}`}>
          <div className={styles.heroMark}>
            <UnfilteredMark what="Pass rate" />
          </div>
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
            <div className={shared.cardHead}>
              <div className={shared.cardTitle}>Why captures were rejected</div>
              <AskInfiChatButton label="Why captures were rejected" compact />
              <ExcelDownloadButton label="Why captures were rejected" compact />
            </div>
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
              <span className={chatStyles.askGroup}>
                <span className={shared.legendNote}>
                  <span className={shared.dashSwatch} />
                  Target ≤5%
                </span>
                <AskInfiChatButton label="Rejection rate by region" compact />
                <ExcelDownloadButton label="Rejection rate by region" compact />
              </span>
            </div>

            <div className={`${shared.barListStack} ${styles.regionStack}`}>
              <TargetRule fraction={view.regionTargetFraction} inset />
              {regions.map((region) => (
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
            <span className={chatStyles.askGroup}>
              <span className={styles.worstPill}>
                <Icon name="shield-alert" />
                Low-sample merchandisers excluded
              </span>
              <AskInfiChatButton label="Merchandisers by rejection rate" compact />
              <ExcelDownloadButton label="Merchandisers by rejection rate" compact />
            </span>
          </div>

          <WorstTable rows={worst} />
        </div>

        <RecentRejected sessions={rejected} />

        {/* Everything the validity rules flagged rather than auto-disabled.
            It belongs here because the evidence a reviewer needs — the images,
            the store's history, the effect on the month — is already on this
            screen. */}
        <ReviewQueue month={month} />
      </div>
    </>
  );
}
