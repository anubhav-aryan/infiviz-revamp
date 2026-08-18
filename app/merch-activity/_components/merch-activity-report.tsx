"use client";

import { CoverageMap } from "@/app/_components/coverage-map";
import Link from "next/link";
import { AskInfiChatButton } from "@/app/_components/chat/ask-infichat-button";
import { Icon } from "@/app/_components/icon";
import type { CsvTable } from "@/app/_export/csv";
import { ExcelDownloadButton } from "@/app/_export/excel-download-button";
import { Bar, TargetHero, TargetRule } from "@/app/_reports/marks";
import { ReportHeader } from "@/app/_reports/report-header";
import { UnfilteredMark } from "@/app/_filters/unfiltered-mark";
import { useNarrowed } from "@/app/_filters/use-narrowed";
import {
  ACTIVITY_ACCESSORS,
  COVERAGE_REGION_ACCESSORS,
  OVERDUE_ACCESSORS,
} from "../_data/accessors";
import type { MonthKey } from "@/app/_time/periods";
import {
  COVERAGE_TARGET_FRACTION,
  MERCH_ACTIVITY,
  type ActivityRow,
} from "../_data/merch-activity";
import shared from "@/app/_reports/reports.module.css";
import styles from "./merch-activity.module.css";
import { CardActions } from "@/app/_components/card-actions";

const MAP_LEGEND = [
  { status: "covered", label: "Covered" },
  { status: "overdue", label: "Overdue" },
  { status: "notyet", label: "Not visited" },
] as const;

/** Serialized here, from the same rows the table renders below. */
function activityCsv(rows: ActivityRow[]): CsvTable {
  return {
    headers: [
      "Merchandiser",
      "Region",
      "Stores",
      "Visits",
      "Adherence %",
      "Photos",
      "Pass rate %",
      "Last active",
    ],
    rows: rows.map((r) => [
      r.mrch,
      r.region,
      r.stores,
      r.visits,
      r.adherence,
      r.photos,
      r.pass,
      r.lastActive,
    ]),
  };
}

/** Coverage-by-X cards differ only in heading and rows. */
function BreakdownCard({
  title,
  rows,
}: {
  title: string;
  rows: { name: string; pct: number }[];
}) {
  return (
    <div className={`${shared.card} ${shared.cardPad}`}>
      <div className={styles.breakdownTitle}>{title}</div>
      {rows.map((row) => (
        <div key={row.name} className={styles.breakdownRow}>
          <span className={shared.barRowName}>{row.name}</span>
          <Bar pct={row.pct} height={10} fill="indigo-400" />
          <span className={shared.barRowValue}>{row.pct}%</span>
        </div>
      ))}
    </div>
  );
}

export function MerchActivityReport({ month }: { month: MonthKey }) {
  const view = MERCH_ACTIVITY[month];

  /* Row-level tables carry region and merchandiser and genuinely narrow; the
     coverage hero and the four activity tiles are authored monthly totals with
     no per-row basis to recompute from, so they say so instead. */
  const activityRows = useNarrowed(view.activityRows, ACTIVITY_ACCESSORS);
  const overdue = useNarrowed(view.overdue, OVERDUE_ACCESSORS);
  const coverageRegions = useNarrowed(view.coverageRegions, COVERAGE_REGION_ACCESSORS);

  return (
    <>
      <ReportHeader
        title="Merchandiser activity & store coverage"
        active="merch-activity"
        month={month}
        basePath="/merch-activity"
        csv={activityCsv(activityRows)}
        detailHref="/analytics/field/merchandiser/attendance"
      />

      <div className={shared.body}>
        {/* ---- Field activity ---- */}
        <div className={styles.sectionHead}>
          <span className={styles.sectionMark} aria-hidden="true">
            <Icon name="users" />
          </span>
          <h2 className={styles.sectionTitle}>Field activity</h2>
          <span className={styles.sectionCaption}>
            Is the field team working?
          </span>
          <UnfilteredMark what="These four tiles" />
        </div>

        <div className={styles.tileGrid}>
          {view.tiles.map((tile) => (
            <div key={tile.label} className={styles.tile}>
              <div className={styles.tileLabel}>{tile.label}</div>
              <div className={styles.tileValue}>{tile.value}</div>
              <div className={styles.tileSub}>{tile.sub}</div>
            </div>
          ))}
        </div>

        <div className={styles.notSeen}>
          <span className={styles.notSeenLabel}>
            <Icon name="alert-triangle" />
            Not seen in 7+ days
          </span>
          {view.notSeen.map((person) => (
            <span key={person.name} className={styles.notSeenChip}>
              <span className={styles.notSeenName}>{person.name}</span>
              <span className={styles.notSeenMeta}>
                {person.region} · {person.days}d
              </span>
            </span>
          ))}
        </div>

  
        <div className={`${shared.card} ${shared.tableCard}`}>
          <div className={shared.tableTitle}>
            Merchandiser activity
            <CardActions>
              <AskInfiChatButton label="Merchandiser activity" compact />
              <ExcelDownloadButton label="Merchandiser activity" compact />
            </CardActions>
          </div>

          <div
            className={`${styles.activityGrid} ${shared.tableHead} ${styles.activityHeadRow}`}
          >
            <span>Merchandiser</span>
            <span>Region</span>
            <span className={shared.numRight}>Stores</span>
            <span className={shared.numRight}>Visits</span>
            <span className={shared.numRight}>Adherence</span>
            <span className={shared.numRight}>Photos</span>
            <span className={shared.numRight}>Pass rate</span>
            <span className={shared.numRight}>Last active</span>
          </div>

          {activityRows.map((row) => (
            <div
              key={row.mrch}
              className={`${styles.activityGrid} ${shared.tableRow} ${styles.activityRow}`}
            >
              <span className={styles.activityMrch}>{row.mrch}</span>
              <span className={styles.activityText}>{row.region}</span>
              <span className={styles.activityNum}>{row.stores}</span>
              <span className={styles.activityNum}>{row.visits}</span>
              <span className={styles.activityMeter}>
                <Bar pct={row.adherence} height={6} track="w56" />
                <span
                  className={styles.adherenceValue}
                  data-tier={row.adherenceTier}
                >
                  {row.adherence}%
                </span>
              </span>
              <span className={styles.activityNum}>{row.photos}</span>
              <span className={styles.activityMeter}>
                <Bar
                  pct={row.pass}
                  height={6}
                  fill="indigo-300"
                  track="w56"
                />
                <span className={styles.passValue}>{row.pass}%</span>
              </span>
              <span className={styles.activityActive}>{row.lastActive}</span>
            </div>
          ))}
        </div>

        {/* ---- Audit state ---- */}
        <div className={styles.sectionHead} data-spaced="true">
          <span className={styles.sectionMark} aria-hidden="true">
            <Icon name="map-pin" />
          </span>
          <h2 className={styles.sectionTitle}>Audit State</h2>
          <UnfilteredMark what="Stores audited" />

          {/* Coverage lives in a different Analytics module than attendance,
              so this half of the screen gets its own way through. */}
          <Link
            href="/analytics/field/store-management/store-coverage"
            className={styles.sectionLink}
          >
            View detailed analytics
            <Icon name="arrow-up-right" size={14} />
          </Link>
        </div>

        <div className={styles.coverageTop}>
          <div className={`${shared.card} ${shared.cardPad}`}>
            <TargetHero
              label={view.coverageHero.label}
              value={view.coverageHero.value}
              delta={view.coverageHero.delta}
              caption={view.coverageHero.caption}
              pct={view.coverageHero.pct}
              targetPct={view.coverageHero.targetPct}
              statusLabel={view.coverageHero.statusLabel}
              targetLabel={view.coverageHero.targetLabel}
              size="md"
            />
          </div>

          <div className={`${shared.card} ${shared.cardPad}`}>
            <div className={styles.coverageHead}>
              <div className={shared.cardTitle}>Coverage by region</div>
              <CardActions>
                <span className={shared.legendNote}>
                  <span className={shared.dashSwatch} />
                  {view.coverageHero.targetLabel}
                </span>
                <AskInfiChatButton label="Coverage by region" compact />
                <ExcelDownloadButton label="Coverage by region" compact />
              </CardActions>
            </div>

            <div className={shared.barListStack}>
              <TargetRule fraction={COVERAGE_TARGET_FRACTION} />
              {coverageRegions.map((region) => (
                <div key={region.name} className={shared.barRow}>
                  <span className={shared.barRowName}>{region.name}</span>
                  <Bar pct={region.pct} height={11} />
                  <span className={shared.barRowValue}>{region.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.splitPair}>
          <BreakdownCard
            title="Coverage by retailer"
            rows={view.coverageRetailers}
          />
          <BreakdownCard
            title="Coverage by store type"
            rows={view.coverageTypes}
          />
        </div>

        <div className={styles.mapSplit}>
          <div className={`${shared.card} ${styles.mapCard}`}>
            <div className={styles.mapTitle}>Coverage map</div>
            <div className={styles.mapLegend}>
              {MAP_LEGEND.map((entry) => (
                <span key={entry.status} className={styles.mapLegendItem}>
                  <span
                    className={styles.legendDot}
                    data-status={entry.status}
                  />
                  {entry.label}
                </span>
              ))}
            </div>
            <CoverageMap />
          </div>

          <div className={`${shared.card} ${shared.tableCard}`}>
            <div className={shared.tableTitle}>
              Never-visited &amp; overdue stores
              <CardActions>
                <AskInfiChatButton label="Never-visited & overdue stores" compact />
                <ExcelDownloadButton label="Never-visited & overdue stores" compact />
              </CardActions>
            </div>

            <div
              className={`${styles.overdueGrid} ${shared.tableHead} ${styles.overdueHeadRow}`}
            >
              <span>Store</span>
              <span>Retailer</span>
              <span>Region</span>
              <span className={shared.numRight}>Days</span>
              <span>Merchandiser</span>
            </div>

            {overdue.map((row) => (
              <div
                key={row.store}
                className={`${styles.overdueGrid} ${shared.tableRow} ${styles.overdueRow}`}
              >
                <span className={styles.overdueStore}>
                  <span
                    className={styles.overdueDot}
                    data-status={row.status}
                    aria-hidden="true"
                  />
                  {row.store}
                </span>
                <span className={styles.overdueText}>{row.retailer}</span>
                <span className={styles.overdueText}>{row.region}</span>
                <span className={styles.overdueDays}>{row.days}</span>
                <span className={styles.overdueMrch}>{row.mrch}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
