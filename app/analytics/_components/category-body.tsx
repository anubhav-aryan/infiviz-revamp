import { Icon } from "@/app/_components/icon";
import {
  BAND_A,
  CATEGORY_OSA,
  CATEGORY_SOS,
  CATEGORY_SUMMARY_RIBBON,
  MSL_GAP,
  RIBBON_BROKEN_OUT,
  RIBBON_COLLAPSED,
  WHATS_MISSING,
  WHO_SHELF,
} from "../_data/analytics";
import { Ribbon, RibbonLegend, Sparkline, StatStrip } from "./shared";
import styles from "./analytics.module.css";

export function CategoryBody({
  breakout,
  onToggleBreakout,
  dimPicker,
}: {
  breakout: boolean;
  onToggleBreakout: () => void;
  dimPicker: React.ReactNode;
}) {
  const segments = breakout ? RIBBON_BROKEN_OUT : RIBBON_COLLAPSED;

  return (
    <div className={styles.body}>
      <StatStrip items={BAND_A} />

      {/* Band B — the category's two numbers, visibility shown as a ribbon */}
      <div className={`${styles.heroGrid} ${styles.heroGridStart}`}>
        <div className={styles.heroCard}>
          <span className={styles.heroName}>{CATEGORY_OSA.name}</span>
          <div className={styles.heroValueRow}>
            <span className={styles.bigNumber} data-size="category">
              {CATEGORY_OSA.val}
              <span className={styles.bigUnit}>%</span>
            </span>
            <span className={styles.delta} data-tone={CATEGORY_OSA.tone}>
              <Icon name={CATEGORY_OSA.deltaIcon} />
              {CATEGORY_OSA.delta} pts
            </span>
          </div>
          <div className={styles.heroTrack}>
            <div
              className={styles.heroFill}
              style={{ width: `${CATEGORY_OSA.val}%` }}
            />
            <div
              className={styles.heroTarget}
              style={{ left: `${CATEGORY_OSA.target}%` }}
            />
          </div>
          <div className={styles.heroScale}>
            <span>Below target</span>
            <span className={styles.mono}>Target {CATEGORY_OSA.target}%</span>
          </div>
        </div>

        <div className={styles.heroCard}>
          <span className={styles.heroName}>{CATEGORY_SOS.name}</span>
          <div className={styles.heroValueRow}>
            <span className={styles.bigNumber} data-size="category">
              {CATEGORY_SOS.val}
              <span className={styles.bigUnit}>%</span>
            </span>
            <span className={styles.delta} data-tone={CATEGORY_SOS.tone}>
              <Icon name={CATEGORY_SOS.deltaIcon} />
              {CATEGORY_SOS.delta} pts
            </span>
          </div>
          <div className={styles.ribbonCaption}>Share-of-shelf ribbon</div>
          <Ribbon
            segments={CATEGORY_SUMMARY_RIBBON}
            variant="summary"
            titled={false}
          />
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
            {WHO_SHELF.map((brand) => (
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
            {WHATS_MISSING.map((row) => (
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
            ))}
          </div>
        </div>
      </div>

      {/* Band E */}
      <div className={styles.bandEnd}>
        <h2 className={styles.bandTitle} data-gap="14">
          Where to push · MSL gaps to chase
        </h2>
        <div className={styles.insightGrid}>
          {MSL_GAP.map((gap) => (
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
      </div>
    </div>
  );
}
