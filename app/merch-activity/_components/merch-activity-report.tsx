import { CoverageMap } from "@/app/_components/coverage-map";
import { Icon } from "@/app/_components/icon";
import { Bar, TargetHero, TargetRule } from "@/app/_reports/marks";
import { ReportHeader } from "@/app/_reports/report-header";
import {
  ACTIVITY_ROWS,
  ACTIVITY_TILES,
  COVERAGE_HERO,
  COVERAGE_REGIONS,
  COVERAGE_RETAILERS,
  COVERAGE_TARGET_FRACTION,
  COVERAGE_TYPES,
  NOT_SEEN,
  OVERDUE,
} from "../_data/merch-activity";
import { VisitHeatmap } from "./visit-heatmap";
import shared from "@/app/_reports/reports.module.css";
import styles from "./merch-activity.module.css";

const MAP_LEGEND = [
  { status: "covered", label: "Covered" },
  { status: "overdue", label: "Overdue" },
  { status: "notyet", label: "Not visited" },
] as const;

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

export function MerchActivityReport() {
  return (
    <>
      <ReportHeader
        title="Merchandiser activity & store coverage"
        active="merch-activity"
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
          {ACTIVITY_TILES.map((tile) => (
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
          {NOT_SEEN.map((person) => (
            <span key={person.name} className={styles.notSeenChip}>
              <span className={styles.notSeenName}>{person.name}</span>
              <span className={styles.notSeenMeta}>
                {person.region} · {person.days}d
              </span>
            </span>
          ))}
        </div>

        <VisitHeatmap />

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

          {ACTIVITY_ROWS.map((row) => (
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
              label={COVERAGE_HERO.label}
              value={COVERAGE_HERO.value}
              delta={COVERAGE_HERO.delta}
              caption={COVERAGE_HERO.caption}
              pct={COVERAGE_HERO.pct}
              targetPct={COVERAGE_HERO.targetPct}
              statusLabel={COVERAGE_HERO.statusLabel}
              targetLabel={COVERAGE_HERO.targetLabel}
              size="md"
            />
          </div>

          <div className={`${shared.card} ${shared.cardPad}`}>
            <div className={styles.coverageHead}>
              <div className={shared.cardTitle}>Coverage by region</div>
              <span className={shared.legendNote}>
                <span className={shared.dashSwatch} />
                Target 90%
              </span>
            </div>

            <div className={shared.barListStack}>
              <TargetRule fraction={COVERAGE_TARGET_FRACTION} />
              {COVERAGE_REGIONS.map((region) => (
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
            rows={COVERAGE_RETAILERS}
          />
          <BreakdownCard title="Coverage by store type" rows={COVERAGE_TYPES} />
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

            {OVERDUE.map((row) => (
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
