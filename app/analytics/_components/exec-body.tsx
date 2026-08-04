import { Icon } from "@/app/_components/icon";
import {
  BAND_A,
  DUMBBELL,
  HEROES,
  INSIGHTS,
  LINE,
  OWN_COMP,
  RANK_ROWS,
  SCATTER_BY_DIM,
  SCATTER_GUIDES,
  type DimKey,
} from "../_data/analytics";
import { RankedList, Sparkline, StatStrip } from "./shared";
import styles from "./analytics.module.css";

export function ExecBody({
  dim,
  dimPicker,
}: {
  dim: DimKey;
  dimPicker: React.ReactNode;
}) {
  const points = SCATTER_BY_DIM[dim];

  return (
    <div className={styles.body}>
      <StatStrip items={BAND_A} />

      {/* Band B — the two headline metrics */}
      <div className={styles.heroGrid}>
        {HEROES.map((hero) => (
          <div key={hero.name} className={styles.heroCard}>
            <div className={styles.heroTop}>
              <span className={styles.heroName}>{hero.name}</span>
              <Sparkline
                points={hero.spark}
                viewBox="0 0 100 30"
                className={styles.heroSpark}
                strokeWidth={2}
                round
              />
            </div>

            <div className={styles.heroValueRow}>
              <span className={styles.bigNumber} data-size="exec">
                {hero.val}
                <span className={styles.bigUnit}>%</span>
              </span>
              <span className={styles.delta} data-tone={hero.tone}>
                <Icon name={hero.deltaIcon} />
                {hero.delta} pts
              </span>
            </div>
            <div className={styles.heroDeltaLabel}>{hero.deltaLabel}</div>

            <div className={styles.heroTrack}>
              <div className={styles.heroFill} style={{ width: `${hero.val}%` }} />
              <div
                className={styles.heroTarget}
                style={{ left: `${hero.target}%` }}
              />
            </div>
            <div className={`${styles.heroScale} ${styles.heroScaleGap}`}>
              <span>Below target</span>
              <span className={styles.mono}>Target {hero.target}%</span>
            </div>

            <div className={styles.heroSubs}>
              <div>
                <div className={styles.subKey}>{hero.sub1k}</div>
                <div className={styles.subVal}>{hero.sub1v}</div>
              </div>
              <div>
                <div className={styles.subKey}>{hero.sub2k}</div>
                {hero.sub2Kind === "ownComp" ? (
                  <>
                    <div className={styles.ownCompBar}>
                      <span
                        className={styles.ownCompOwn}
                        style={{ width: `${OWN_COMP.own}%` }}
                      />
                      <span
                        className={styles.ownCompRest}
                        style={{ width: `${OWN_COMP.comp}%` }}
                      />
                    </div>
                    <div className={styles.ownCompLabel}>{OWN_COMP.label}</div>
                  </>
                ) : (
                  <div className={styles.subVal}>{hero.sub2v}</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Band C — the one dimension picker */}
      <div className={styles.band}>
        <div className={styles.bandHead}>
          <div>
            <h2 className={styles.bandTitle}>Where it&apos;s worst</h2>
            <div className={styles.bandSubtitle}>
              Slice by one dimension — this band re-renders only
            </div>
          </div>
          {dimPicker}
        </div>

        <div className={styles.dimGrid}>
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <span className={styles.panelTitle}>
                OSA by {dim.toLowerCase()}
              </span>
              <span className={styles.targetLegend}>
                <span className={styles.targetLegendMark} aria-hidden="true" />
                Target 85%
              </span>
            </div>
            <RankedList rows={RANK_ROWS[dim]} variant="exec" />
          </div>

          <div className={styles.panel}>
            <span className={styles.panelTitle} data-gap="6">
              OSA vs Share of Shelf
            </span>
            <svg
              viewBox="0 0 300 210"
              className={styles.chart}
              role="img"
              aria-label={`OSA against share of shelf, by ${dim.toLowerCase()}`}
            >
              <line
                x1={SCATTER_GUIDES.tx}
                x2={SCATTER_GUIDES.tx}
                y1="14"
                y2="180"
                stroke="var(--neutral-400)"
                strokeWidth="1"
                strokeDasharray="4 3"
              />
              <line
                x1="36"
                x2="286"
                y1={SCATTER_GUIDES.ty}
                y2={SCATTER_GUIDES.ty}
                stroke="var(--neutral-400)"
                strokeWidth="1"
                strokeDasharray="4 3"
              />
              <text
                x="288"
                y={SCATTER_GUIDES.tyLabel}
                fontFamily="var(--font-mono)"
                fontSize="8"
                fill="var(--text-caption)"
              >
                OSA 85
              </text>
              <text
                x={SCATTER_GUIDES.tx}
                y="192"
                textAnchor="middle"
                fontFamily="var(--font-mono)"
                fontSize="8"
                fill="var(--text-caption)"
              >
                SOS 45
              </text>
              <text
                x="34"
                y="196"
                textAnchor="end"
                fontFamily="var(--font-ui)"
                fontSize="9"
                fill="var(--text-caption)"
              >
                SOS →
              </text>
              {points.map((p, i) => (
                <circle
                  key={i}
                  cx={p.cx}
                  cy={p.cy}
                  r="4.5"
                  fill="var(--indigo-600)"
                  opacity="0.85"
                />
              ))}
            </svg>
          </div>
        </div>
      </div>

      {/* Band D — movement */}
      <div className={styles.band}>
        <h2 className={styles.bandTitle} data-gap="14">
          What moved
        </h2>
        <div className={styles.twoCol}>
          <div className={styles.panel}>
            <span className={styles.panelTitle} data-gap="14">
              Biggest moves vs last month
            </span>
            {DUMBBELL.map((d) => (
              <div key={d.name} className={styles.dumbbellRow} data-tone={d.tone}>
                <span className={styles.dumbbellName}>{d.name}</span>
                <span className={styles.dumbbellTrack}>
                  <span
                    className={styles.dumbbellBar}
                    style={{ left: `${d.left}%`, width: `${d.width}%` }}
                  />
                  <span
                    className={styles.dumbbellFrom}
                    style={{ left: `calc(${d.from}% - 4px)` }}
                  />
                  <span
                    className={styles.dumbbellTo}
                    style={{ left: `calc(${d.to}% - 5px)` }}
                  />
                </span>
                <span className={styles.dumbbellDelta}>{d.delta}</span>
              </div>
            ))}
          </div>

          <div className={styles.panel}>
            <div className={styles.lineHead}>
              <span className={styles.panelTitle}>Six-month trend</span>
              <div className={styles.legendRow}>
                <span className={styles.legendItem}>
                  <span
                    className={styles.legendLine}
                    style={{ background: "var(--indigo-600)" }}
                  />
                  Availability
                </span>
                <span className={styles.legendItem}>
                  <span
                    className={styles.legendLine}
                    style={{ background: "var(--indigo-300)" }}
                  />
                  Visibility
                </span>
              </div>
            </div>

            <svg
              viewBox="0 0 360 200"
              className={styles.chart}
              role="img"
              aria-label="Availability and visibility over the last six months"
            >
              {LINE.grid.map((g) => (
                <g key={g.v}>
                  <line
                    x1="30"
                    x2="352"
                    y1={g.y}
                    y2={g.y}
                    stroke="var(--hairline)"
                    strokeWidth="1"
                  />
                  <text
                    x="24"
                    y={g.y}
                    textAnchor="end"
                    dominantBaseline="middle"
                    fontFamily="var(--font-mono)"
                    fontSize="9"
                    fill="var(--text-caption)"
                  >
                    {g.v}
                  </text>
                </g>
              ))}
              <line
                x1="30"
                x2="352"
                y1={LINE.t85}
                y2={LINE.t85}
                stroke="var(--neutral-500)"
                strokeWidth="1.2"
                strokeDasharray="5 4"
              />
              <line
                x1="30"
                x2="352"
                y1={LINE.t45}
                y2={LINE.t45}
                stroke="var(--neutral-400)"
                strokeWidth="1.2"
                strokeDasharray="5 4"
              />
              <polyline
                points={LINE.avail}
                fill="none"
                stroke="var(--indigo-600)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <polyline
                points={LINE.vis}
                fill="none"
                stroke="var(--indigo-300)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {LINE.xl.map((x) => (
                <text
                  key={x.label}
                  x={x.x}
                  y="196"
                  textAnchor="middle"
                  fontFamily="var(--font-ui)"
                  fontSize="9"
                  fill="var(--text-caption)"
                >
                  {x.label}
                </text>
              ))}
            </svg>
          </div>
        </div>
      </div>

      {/* Band E — what to do about it */}
      <div className={styles.bandEnd}>
        <h2 className={styles.bandTitle} data-gap="14">
          Where to push
        </h2>
        <div className={styles.insightGrid}>
          {INSIGHTS.map((insight) => (
            <div key={insight.link} className={styles.insightCard}>
              <span className={styles.insightIcon} aria-hidden="true">
                <Icon name={insight.icon} />
              </span>
              <div className={styles.insightBody}>
                <div className={styles.insightText}>{insight.text}</div>
                <button
                  type="button"
                  className={`${styles.inlineLink} ${styles.insightLink}`}
                >
                  {insight.link}
                  <Icon name="arrow-right" size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
