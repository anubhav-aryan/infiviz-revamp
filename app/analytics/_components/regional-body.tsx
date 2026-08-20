import Link from "next/link";
import { Fragment } from "react";
import { AskInfiChatButton } from "@/app/_components/chat/ask-infichat-button";
import { GroupedColumns } from "@/app/_charts/grouped-columns";
import { Icon } from "@/app/_components/icon";
import { ExcelDownloadButton } from "@/app/_export/excel-download-button";
import {
  HEAT_COLS,
  REGIONAL_HERO_SUB,
  type AnalyticsView,
  type DimKey,
} from "../_data/analytics";
import { EmptyState, RankedList, Sparkline, StatStrip } from "./shared";
import styles from "./analytics.module.css";
import { CardActions } from "@/app/_components/card-actions";

export function RegionalBody({
  view,
  dim,
  dimPicker,
  compare,
}: {
  view: AnalyticsView;
  dim: DimKey;
  dimPicker: React.ReactNode;
  compare: boolean;
}) {
  return (
    <div className={styles.body}>
      {/* The stores to visit, first — this closed the page before, which put
          the one actionable table below four bands of diagnosis. */}
      <div className={styles.band}>
        <div className={styles.bandHead}>
          <div>
            <h2 className={styles.bandTitle}>Today&apos;s priorities</h2>
            <div className={styles.bandCaption}>
              Where to push · bottom 20 stores — start here
            </div>
          </div>
          <span className={styles.chip}>Bottom 20</span>
        </div>

        <div className={styles.tableCard}>
          <div className={`${styles.leagueGrid} ${styles.leagueHead}`}>
            <span>Store</span>
            <span>Retailer</span>
            <span>Type</span>
            <span className={styles.right}>OSA</span>
            <span className={styles.right}>SOS</span>
            <span className={styles.right}>Sessions</span>
            <span>Last visit</span>
            <span>Trend</span>
          </div>

          {view.league.length === 0 ? (
            <EmptyState>No store matches the filters.</EmptyState>
          ) : (
            view.league.map((row) => (
              <Link
                key={row.store}
                href="/session-viewer"
                className={`${styles.reset} ${styles.leagueGrid} ${styles.leagueRow}`}
                aria-label={`${row.store} — OSA ${row.osa}%`}
              >
                <span className={styles.leagueStore}>{row.store}</span>
                <span className={styles.leagueCell}>{row.retailer}</span>
                <span className={styles.leagueCell}>{row.type}</span>
                <span className={styles.leagueMono}>{row.osa}</span>
                <span className={styles.leagueMonoDim}>{row.sos}</span>
                <span className={styles.leagueMonoDim}>{row.sessions}</span>
                <span className={styles.leagueVisit}>{row.lastVisit}</span>
                <Sparkline
                  points={row.spark}
                  viewBox="0 0 60 20"
                  className={styles.leagueSpark}
                  strokeWidth={1.6}
                />
              </Link>
            ))
          )}
        </div>
      </div>
      <StatStrip items={view.bandA} />

      {/* Band B — the region measured against the national ghost */}
      <div className={styles.heroGrid}>
        {view.regionalHeroes.map((hero) => (
          <div key={hero.name} className={styles.heroCard}>
            <div className={styles.heroTop}>
              <span className={styles.heroName}>{hero.name}</span>
              <span className={styles.rankBadge}>{hero.rank}</span>
            </div>

            <div className={styles.heroValueRow}>
              <span className={styles.bigNumber} data-size="regional">
                {hero.val}
                <span className={styles.bigUnit}>%</span>
              </span>
              <span className={styles.delta} data-tone={hero.tone}>
                <Icon name={hero.deltaIcon} />
                {hero.delta} pts
              </span>
            </div>
            <div className={styles.heroDeltaLabel}>{REGIONAL_HERO_SUB}</div>

            {/* This track's dashed mark is already spoken for by the national
                figure, so the compare toggle leaves it alone and settles for
                the ranked list below. */}
            <div className={styles.ghostTrack}>
              <div className={styles.ghostBase} />
              <div
                className={styles.ghostMark}
                style={{ width: `${hero.national}%` }}
              />
              <div className={styles.ghostFill} style={{ width: `${hero.val}%` }} />
              <div
                className={styles.ghostTarget}
                style={{ left: `${hero.target}%` }}
              />
            </div>
            <div className={styles.heroScale}>
              <span>National {hero.national}% (ghost)</span>
              <span className={styles.mono}>Target {hero.target}%</span>
            </div>
          </div>
        ))}
      </div>

      {/* Band C */}
      <div className={styles.band}>
        <div className={styles.bandHead}>
          <h2 className={styles.bandTitle}>Where it&apos;s worst</h2>
          {dimPicker}
        </div>
        <div className={styles.panel}>
          <span className={styles.panelTitle} data-gap="12">
            OSA by {dim.toLowerCase()}
            <CardActions>
              <AskInfiChatButton label={`OSA by ${dim.toLowerCase()}`} compact />
              <ExcelDownloadButton label={`OSA by ${dim.toLowerCase()}`} compact />
            </CardActions>
          </span>
          <RankedList
            rows={view.ranked[dim]}
            variant="regional"
            compare={compare}
            emptyLabel={`No ${dim.toLowerCase()} matches the filters.`}
          />
        </div>
      </div>

      {/* Band D — is a weak cell under-audited or genuinely bad? Closes the
          page now that the league table opens it. */}
      <div className={styles.bandEnd}>
        <h2 className={styles.bandTitle} data-gap="6">
          What moved
        </h2>
        <div className={styles.bandCaption}>
          Under-audited or genuinely underperforming?
        </div>

        <div className={styles.covGrid}>
          <div className={styles.panel}>
            <span className={styles.panelTitle} data-gap="14">
              OSA · city × retailer
              <CardActions>
                <AskInfiChatButton label="OSA · city × retailer" compact />
                <ExcelDownloadButton label="OSA · city × retailer" compact />
              </CardActions>
            </span>
            <div className={styles.heatGrid}>
              <span />
              {HEAT_COLS.map((col) => (
                <span key={col} className={styles.heatColLabel}>
                  {col}
                </span>
              ))}
              {view.heatRows.map((row) => (
                <Fragment key={row.name}>
                  <span className={styles.heatRowLabel}>{row.name}</span>
                  {row.cells.map((cell, i) => (
                    <span
                      key={HEAT_COLS[i]}
                      title={cell.title}
                      className={styles.heatCell}
                      style={{ background: cell.color, color: cell.fg }}
                    >
                      {cell.v}
                    </span>
                  ))}
                </Fragment>
              ))}
            </div>
          </div>

          <div className={styles.panel}>
            <span className={styles.panelTitle} data-gap="6">
              Audit coverage vs availability
              <CardActions>
                <AskInfiChatButton label="Audit coverage vs availability" compact />
                <ExcelDownloadButton label="Audit coverage vs availability" compact />
              </CardActions>
            </span>
            <GroupedColumns data={view.coverageColumns} />
          </div>
        </div>
      </div>
    </div>
  );
}
