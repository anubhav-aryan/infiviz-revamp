import Link from "next/link";
import { Fragment } from "react";
import { Icon } from "@/app/_components/icon";
import {
  HEAT_COLS,
  REGIONAL_HERO_SUB,
  type AnalyticsView,
  type DimKey,
} from "../_data/analytics";
import { EmptyState, RankedList, Sparkline, StatStrip } from "./shared";
import styles from "./analytics.module.css";

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
          </span>
          <RankedList
            rows={view.ranked[dim]}
            variant="regional"
            compare={compare}
            emptyLabel={`No ${dim.toLowerCase()} matches the filters.`}
          />
        </div>
      </div>

      {/* Band D — is a weak cell under-audited or genuinely bad? */}
      <div className={styles.band}>
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
            </span>
            <svg
              viewBox="0 0 300 200"
              className={styles.chart}
              role="img"
              aria-label="Audit coverage against availability, by city"
            >
              <text
                x="34"
                y="188"
                textAnchor="end"
                fontFamily="var(--font-ui)"
                fontSize="9"
                fill="var(--text-caption)"
              >
                cov →
              </text>
              <text
                x="20"
                y="16"
                fontFamily="var(--font-ui)"
                fontSize="9"
                fill="var(--text-caption)"
              >
                OSA
              </text>
              {view.covScatter.map((p, i) => (
                <circle
                  key={i}
                  cx={p.cx}
                  cy={p.cy}
                  r="5"
                  fill="var(--indigo-600)"
                  opacity="0.85"
                />
              ))}
            </svg>
          </div>
        </div>
      </div>

      {/* Band E — the store league table */}
      <div className={styles.bandEnd}>
        <div className={styles.bandHead}>
          <h2 className={styles.bandTitle}>Where to push</h2>
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
    </div>
  );
}
