import { CoverageMap } from "@/app/_components/coverage-map";
import { Icon } from "@/app/_components/icon";
import type { CsvTable } from "@/app/_export/csv";
import { Bar, TargetHero, TargetRule } from "@/app/_reports/marks";
import { ReportHeader } from "@/app/_reports/report-header";
import type { MonthKey } from "@/app/_time/periods";
import {
  COVERAGE_TARGET_FRACTION,
  MERCH_ACTIVITY,
  type ActivityRow,
} from "../_data/merch-activity";
import { VisitHeatmap } from "./visit-heatmap";
import shared from "@/app/_reports/reports.module.css";
import styles from "./merch-activity.module.css";

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

  return (
    <>
      <ReportHeader
        title="Merchandiser activity & store coverage"
        active="merch-activity"
        month={month}
        basePath="/merch-activity"
        csv={activityCsv(view.activityRows)}
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

        <VisitHeatmap
          title={view.heatTitle}
          rows={view.heatRows}
          days={view.heatDays}
        />

        <div className={`${shared.card} ${shared.tableCard}`}>
          <div className={shared.tableTitle}>Merchandiser activity</div>

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

          {view.activityRows.map((row) => (
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

        {/* ---- Estate coverage ---- */}
        <div className={styles.sectionHead} data-spaced="true">
          <span className={styles.sectionMark} aria-hidden="true">
            <Icon name="map-pin" />
          </span>
          <h2 className={styles.sectionTitle}>Estate coverage</h2>
          <span className={styles.sectionCaption}>
            Are we actually reaching the estate?
          </span>
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
              <span className={shared.legendNote}>
                <span className={shared.dashSwatch} />
                {view.coverageHero.targetLabel}
              </span>
            </div>

            <div className={shared.barListStack}>
              <TargetRule fraction={COVERAGE_TARGET_FRACTION} />
              {view.coverageRegions.map((region) => (
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

            {view.overdue.map((row) => (
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
