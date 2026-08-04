import { Icon } from "@/app/_components/icon";
import type { AnalyticsView } from "../_data/analytics";
import { EmptyState, Ribbon, RibbonLegend, Sparkline, StatStrip } from "./shared";
import styles from "./analytics.module.css";

export function CategoryBody({
  view,
  breakout,
  onToggleBreakout,
  dimPicker,
  compare,
}: {
  view: AnalyticsView;
  breakout: boolean;
  onToggleBreakout: () => void;
  dimPicker: React.ReactNode;
  compare: boolean;
}) {
  const segments = breakout ? view.ribbonBrokenOut : view.ribbonCollapsed;
  const osa = view.categoryOsa;
  const sos = view.categorySos;

  return (
    <div className={styles.body}>
      <StatStrip items={view.bandA} />

      {/* Band B — the category's two numbers, visibility shown as a ribbon */}
      <div className={`${styles.heroGrid} ${styles.heroGridStart}`}>
        <div className={styles.heroCard}>
          <span className={styles.heroName}>{osa.name}</span>
          <div className={styles.heroValueRow}>
            <span className={styles.bigNumber} data-size="category">
              {osa.val}
              <span className={styles.bigUnit}>%</span>
            </span>
            <span className={styles.delta} data-tone={osa.tone}>
              <Icon name={osa.deltaIcon} />
              {osa.delta} pts
            </span>
          </div>
          <div className={styles.heroTrack}>
            <div className={styles.heroFill} style={{ width: `${osa.val}%` }} />
            {compare ? (
              <div className={styles.heroGhost} style={{ left: `${osa.prev}%` }} />
            ) : null}
            <div
              className={styles.heroTarget}
              style={{ left: `${osa.target}%` }}
            />
          </div>
          <div className={styles.heroScale}>
            <span>{compare ? `Last month ${osa.prev}%` : "Below target"}</span>
            <span className={styles.mono}>Target {osa.target}%</span>
          </div>
        </div>

        <div className={styles.heroCard}>
          <span className={styles.heroName}>{sos.name}</span>
          <div className={styles.heroValueRow}>
            <span className={styles.bigNumber} data-size="category">
              {sos.val}
              <span className={styles.bigUnit}>%</span>
            </span>
            <span className={styles.delta} data-tone={sos.tone}>
              <Icon name={sos.deltaIcon} />
              {sos.delta} pts
            </span>
          </div>
          <div className={styles.ribbonCaption}>Share-of-shelf ribbon</div>
          <Ribbon segments={view.summaryRibbon} variant="summary" titled={false} />
        </div>
      </div>

      {/* Band C — the full 100% shelf, optionally split by competitor */}
      <div className={styles.band}>
        <div className={styles.bandHead}>
          <h2 className={styles.bandTitle}>Where it&apos;s worst</h2>
          <div className={styles.bandHeadActions}>
            <button
              type="button"
              role="switch"
              aria-checked={breakout}
              className={styles.switchLabel}
              data-on={breakout}
              onClick={onToggleBreakout}
            >
              <span className={styles.switchTrack} aria-hidden="true">
                <span className={styles.switchKnob} />
              </span>
              Competitor breakout
            </button>
            {/* Flagged for the designer: this persona renders a dimension picker
                that nothing on the page reads. Left exactly as designed. */}
            {dimPicker}
          </div>
        </div>

        <div className={styles.ribbonCard}>
          <span className={styles.panelTitle} data-gap="14">
            All toothpaste facings · 100% share
          </span>
          <Ribbon segments={segments} variant="brands" />
          <RibbonLegend segments={segments} showShare />
        </div>
      </div>

      {/* Band D — who holds the shelf, and which SKUs are simply not there */}
      <div className={styles.band}>
        <h2 className={styles.bandTitle} data-gap="14">
          What moved
        </h2>
        <div className={styles.whoGrid}>
          <div className={styles.panel}>
            <span className={styles.panelTitle} data-gap="14">
              Who has the shelf
            </span>
            {view.whoShelf.map((brand) => (
              <div key={brand.name} className={styles.whoRow}>
                <span className={styles.whoName}>
                  <span
                    className={styles.whoDot}
                    style={{ background: brand.dot }}
                  />
                  {brand.name}
                </span>
                <span className={styles.whoTrack}>
                  <span
                    className={styles.whoBar}
                    style={{ width: `${brand.w}%`, background: brand.dot }}
                  />
                </span>
                <span className={styles.whoValue}>
                  <span className={styles.whoShare}>{brand.share}%</span>
                  <span className={styles.smallDelta} data-tone={brand.tone}>
                    {brand.delta}
                  </span>
                </span>
              </div>
            ))}
          </div>

          <div className={styles.tableCard}>
            <div className={styles.missingTitle}>What&apos;s missing</div>
            <div className={`${styles.missingGrid} ${styles.missingHead}`}>
              <span>SKU</span>
              <span className={styles.right}>Ranged</span>
              <span className={styles.right}>Present</span>
              <span className={styles.right}>Absent</span>
              <span className={styles.right}>OSA</span>
              <span>Trend</span>
            </div>
            {view.whatsMissing.length === 0 ? (
              <EmptyState>No SKU matches the filters.</EmptyState>
            ) : (
              view.whatsMissing.map((row) => (
                <div
                  key={row.name}
                  className={`${styles.missingGrid} ${styles.missingRow}`}
                >
                  <span className={styles.missingName}>{row.name}</span>
                  <span className={styles.missingMono}>{row.ranged}</span>
                  <span className={styles.missingMono}>{row.present}</span>
                  <span className={styles.missingAbsent}>{row.absent}</span>
                  <span className={styles.missingOsa} data-tier={row.tier}>
                    {row.osa}%
                  </span>
                  <Sparkline
                    points={row.spark}
                    viewBox="0 0 50 18"
                    className={styles.missingSpark}
                    strokeWidth={1.6}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Band E */}
      <div className={styles.bandEnd}>
        <h2 className={styles.bandTitle} data-gap="14">
          Where to push · MSL gaps to chase
        </h2>
        {view.mslGap.length === 0 ? (
          <div className={styles.tableCard}>
            <EmptyState>No MSL gap matches the filters.</EmptyState>
          </div>
        ) : (
          <div className={styles.insightGrid}>
            {view.mslGap.map((gap) => (
              <div key={gap.name} className={styles.mslGapCard}>
                <span className={styles.mslGapIcon} aria-hidden="true">
                  <Icon name="package-x" />
                </span>
                <div className={styles.insightBody}>
                  <div className={styles.mslGapName}>{gap.name}</div>
                  <div className={styles.mslGapSub}>
                    Absent in <b className={styles.inlineMono}>{gap.stores}</b>{" "}
                    ranged stores · {gap.brand}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
