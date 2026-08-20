import { AskInfiChatButton } from "@/app/_components/chat/ask-infichat-button";
import { Icon } from "@/app/_components/icon";
import { ReorderableGrid } from "@/app/_components/reorderable-grid";
import { ExcelDownloadButton } from "@/app/_export/excel-download-button";
import { MonthMatrix } from "@/app/_charts/month-matrix";
import { INSIGHTS, type AnalyticsView, type DimKey } from "../_data/analytics";
import { movementMatrix } from "../_data/movement-matrix";
import { CategoryPanels } from "./category-panels";
import { RankedList, StatStrip } from "./shared";
import styles from "./analytics.module.css";
import { CardActions } from "@/app/_components/card-actions";

export function ExecBody({
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
  const line = view.line;
  const matrix = movementMatrix(view.period);

  return (
    <div className={styles.body}>
      {/* `:v2` because a stored order wins over the authored one and unknown
          ids append at the end — so a reader who ever dragged a card would
          otherwise keep the old sequence, with the priorities band pinned last.
          A new key reads as "no save" and hands everyone the new default. */}
      <ReorderableGrid
        pageKey="analytics:exec:v2"
        gap={0}
        items={[
          {
            id: "band-e",
            node: (
      /* The day's work, first. This band used to close the page, four bands
         below the fold — the one thing a reader could act on, last. */
      <div className={styles.band}>
        <h2 className={styles.bandTitle} data-gap="4">
          Today&apos;s priorities
        </h2>
        <div className={styles.bandCaption}>Where to push — this month&apos;s actions</div>
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
            ),
          },
          { id: "stat-strip", node: <StatStrip items={view.bandA} /> },
          {
            id: "sos-panels",
            node: (
              <CategoryPanels metric="sos" period={view.period} compare={compare} />
            ),
          },
          {
            id: "osa-panels",
            node: (
              <CategoryPanels metric="osa" period={view.period} compare={compare} />
            ),
          },
          {
            id: "band-c",
            node: (
      /* Band C — the one dimension picker */
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

        <div className={styles.dimSingle}>
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <span className={styles.panelTitle}>
                OSA by {dim.toLowerCase()}
              </span>
              <CardActions>
                <span className={styles.targetLegend}>
                  <span className={styles.targetLegendMark} aria-hidden="true" />
                  Target 85%
                </span>
                <AskInfiChatButton label={`OSA by ${dim.toLowerCase()}`} compact />
                <ExcelDownloadButton label={`OSA by ${dim.toLowerCase()}`} compact />
              </CardActions>
            </div>
            <RankedList
              rows={view.ranked[dim]}
              variant="exec"
              compare={compare}
              emptyLabel={`No ${dim.toLowerCase()} matches the filters.`}
            />
          </div>

        </div>
      </div>
            ),
          },
          {
            id: "band-movement",
            node: (
      /* The scatter that used to sit in band C is gone: it plotted OSA against
         share of shelf as a cloud of same-sized dots and left the reader to
         work out what it was for. This answers the question it was reaching
         for — where did the shelf actually move — by making the whole surface
         scannable and colouring only what shifted. */
      <div className={styles.band}>
        <div className={styles.bandHead}>
          <div>
            <h2 className={styles.bandTitle}>Where it moved</h2>
            <div className={styles.bandSubtitle}>
              Share of shelf by store and brand · colour marks the biggest
              movement, not the biggest number
            </div>
          </div>
          <CardActions>
            <AskInfiChatButton label="Share of shelf by store and brand" compact />
            <ExcelDownloadButton label="Share of shelf by store and brand" compact />
          </CardActions>
        </div>

        <div className={styles.panel}>
          <MonthMatrix
            columns={matrix.columns}
            groups={matrix.groups}
            rowHeader="Retailer / store"
            ariaLabel="Share of shelf by store and brand, coloured by movement"
          />
          <div className={styles.matrixLegend}>
            <span className={styles.matrixLegendLabel}>Movement</span>
            {[0, 1, 2, 3, 4].map((level) => (
              <span
                key={level}
                className={styles.matrixLegendSwatch}
                data-level={level}
                aria-hidden="true"
              />
            ))}
            <span className={styles.matrixLegendLabel}>
              flat → 6+ pts · click a cell to open that store and brand
            </span>
          </div>
        </div>
      </div>
            ),
          },
          {
            id: "band-d",
            node: (
      /* Band D — movement */
      <div className={styles.band}>
        <h2 className={styles.bandTitle} data-gap="14">
          What moved
        </h2>
        <div className={styles.twoCol}>
          <div className={styles.panel}>
            <span className={styles.panelTitle} data-gap="14">
              Biggest moves vs last month
              <CardActions>
                <AskInfiChatButton label="Biggest moves vs last month" compact />
                <ExcelDownloadButton label="Biggest moves vs last month" compact />
              </CardActions>
            </span>
            {view.dumbbell.map((d) => (
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
              <CardActions>
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
                <AskInfiChatButton label="Six-month trend" compact />
                <ExcelDownloadButton label="Six-month trend" compact />
              </CardActions>
            </div>

            <svg
              viewBox="0 0 360 200"
              className={styles.chart}
              role="img"
              aria-label="Availability and visibility over the last six months"
            >
              {line.grid.map((g) => (
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
                y1={line.t85}
                y2={line.t85}
                stroke="var(--neutral-500)"
                strokeWidth="1.2"
                strokeDasharray="5 4"
              />
              <line
                x1="30"
                x2="352"
                y1={line.t45}
                y2={line.t45}
                stroke="var(--neutral-400)"
                strokeWidth="1.2"
                strokeDasharray="5 4"
              />
              {/* The window is fixed at Feb–Jul, so when you step back through it
                  the chart says where you are standing rather than redrawing. */}
              {line.markX ? (
                <line
                  x1={line.markX}
                  x2={line.markX}
                  y1="12"
                  y2="178"
                  stroke="var(--indigo-600)"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                  opacity="0.7"
                />
              ) : null}
              <polyline
                points={line.avail}
                fill="none"
                stroke="var(--indigo-600)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <polyline
                points={line.vis}
                fill="none"
                stroke="var(--indigo-300)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {line.xl.map((x) => (
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
            ),
          },
        ]}
      />
    </div>
  );
}
