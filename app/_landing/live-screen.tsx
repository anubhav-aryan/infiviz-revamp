import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/app/_components/icon";
import { ActivityFeed } from "./activity-feed";
import {
  ACTIONS,
  HEADER_C,
  OSA,
  OSA_STATS,
  SECONDARY,
  SECONDARY_TITLE,
  SOS,
  SOS_SPLIT,
  type HeroTile as HeroTileData,
} from "./_data/landing";
import styles from "./landing.module.css";

/**
 * The two hero tiles are identical down to the target track; only the block
 * below the hairline differs, so it comes in as `footer`.
 */
function HeroTile({ tile, footer }: { tile: HeroTileData; footer: ReactNode }) {
  return (
    <div className={styles.heroTile}>
      <div className={styles.cardHead}>
        <span className={styles.cardTitle}>{tile.title}</span>
        <svg viewBox="0 0 100 30" className={styles.spark} aria-hidden="true">
          <polyline
            points={tile.spark}
            fill="none"
            stroke="var(--neutral-400)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className={styles.heroValueRow}>
        <span className={styles.heroValue}>
          {tile.value}
          <span className={styles.heroUnit}>{tile.unit}</span>
        </span>
        <span className={styles.heroDelta} data-tone={tile.deltaTone}>
          <Icon
            name={tile.deltaDirection === "up" ? "arrow-up-right" : "arrow-down-right"}
          />
          {tile.delta}
        </span>
      </div>
      <div className={styles.heroCaption}>{tile.deltaCaption}</div>

      <div className={`${styles.track} ${styles.heroTrack}`}>
        <div className={styles.trackFill} style={{ width: `${tile.fill}%` }} />
        <div className={styles.trackTick} style={{ left: `${tile.target}%` }} />
      </div>
      <div className={`${styles.trackFoot} ${styles.heroTrackFoot}`}>
        <span>{tile.note}</span>
        <span className={styles.trackTarget}>{tile.targetLabel}</span>
      </div>

      <div className={styles.heroFooter}>{footer}</div>
    </div>
  );
}

/** Live — every surface is unlocked and shelf metrics lead the page. */
export function LiveScreen() {
  return (
    <div className={styles.liveScreen}>
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>{HEADER_C.title}</h1>
          <div className={styles.pageSubtitle}>{HEADER_C.subtitle}</div>
        </div>
        <span className={styles.syncPill}>
          <Icon name="refresh-cw" />
          {HEADER_C.synced}
        </span>
      </div>

      <div className={styles.body}>
        <div className={styles.bodyMain}>
          <div className={styles.pair}>
            <HeroTile
              tile={OSA}
              footer={
                <div className={styles.heroStats}>
                  {OSA_STATS.map((stat) => (
                    <div key={stat.label}>
                      <div className={styles.heroStatLabel}>{stat.label}</div>
                      <div className={styles.heroStatValue}>{stat.value}</div>
                    </div>
                  ))}
                </div>
              }
            />
            <HeroTile
              tile={SOS}
              footer={
                <>
                  <div className={styles.splitHead}>
                    <span className={styles.splitLabel}>{SOS_SPLIT.label}</span>
                    <span className={styles.splitRatio}>{SOS_SPLIT.ratio}</span>
                  </div>
                  <div className={styles.splitBar}>
                    <span
                      className={styles.splitOwn}
                      style={{ width: `${SOS_SPLIT.own}%` }}
                    />
                    <span
                      className={styles.splitCompetition}
                      style={{ width: `${SOS_SPLIT.competition}%` }}
                    />
                  </div>
                  <div className={styles.splitLegend}>
                    <span className={styles.splitLegendItem}>
                      <span
                        className={styles.splitSwatch}
                        style={{ background: "var(--indigo-600)" }}
                      />
                      {SOS_SPLIT.ownLabel}
                    </span>
                    <span className={styles.splitLegendItem}>
                      <span
                        className={styles.splitSwatch}
                        style={{ background: "var(--neutral-300)" }}
                      />
                      {SOS_SPLIT.competitionLabel}
                    </span>
                  </div>
                </>
              }
            />
          </div>

          {/* secondary KPIs */}
          <div>
            <div className={styles.secondaryTitle}>{SECONDARY_TITLE}</div>
            <div className={styles.kpiGrid}>
              {SECONDARY.map((kpi) => (
                <div key={kpi.name} className={styles.kpiTile}>
                  <div className={styles.kpiName}>{kpi.name}</div>
                  <div className={styles.kpiRow}>
                    <span className={styles.kpiValue}>{kpi.value}</span>
                    <span className={styles.kpiDelta} data-tone={kpi.tone}>
                      <Icon
                        name={
                          kpi.direction === "up"
                            ? "arrow-up-right"
                            : "arrow-down-right"
                        }
                      />
                      {kpi.delta}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* primary actions */}
          <div className={styles.pair}>
            <Link
              href={ACTIONS.analytics.href}
              className={`${styles.actionCard} ${styles.actionPrimary}`}
            >
              <span className={styles.actionHead}>
                <Icon name={ACTIONS.analytics.icon} />
                <Icon name="arrow-right" />
              </span>
              <span className={styles.actionTitle}>{ACTIONS.analytics.title}</span>
              <span className={styles.actionDesc}>{ACTIONS.analytics.desc}</span>
            </Link>
            <Link
              href={ACTIONS.explorer.href}
              className={`${styles.actionCard} ${styles.actionSecondary}`}
            >
              <span className={styles.actionHead}>
                <Icon name={ACTIONS.explorer.icon} />
                <Icon name="arrow-right" />
              </span>
              <span className={styles.actionTitle}>{ACTIONS.explorer.title}</span>
              <span className={styles.actionDesc}>{ACTIONS.explorer.desc}</span>
            </Link>
          </div>
        </div>

        <ActivityFeed />
      </div>
    </div>
  );
}
