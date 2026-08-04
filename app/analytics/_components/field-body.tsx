import { Icon } from "@/app/_components/icon";
import {
  FIELD_BAND_A,
  FIELD_HEROES,
  FIELD_RIBBON,
  FIELD_STORE_CAPTION,
  FIX_LIST,
  RANK_ROWS,
  STORE_MSL,
  type DimKey,
} from "../_data/analytics";
import { RankedList, Ribbon, RibbonLegend, StatStrip } from "./shared";
import styles from "./analytics.module.css";

export function FieldBody({
  dim,
  dimPicker,
}: {
  dim: DimKey;
  dimPicker: React.ReactNode;
}) {
  return (
    <div className={styles.body}>
      <StatStrip items={FIELD_BAND_A} />

      {/* Band B — today's cluster, plus progress against the visit plan */}
      <div className={styles.fieldHeroGrid}>
        {FIELD_HEROES.map((hero) => (
          <div key={hero.name} className={styles.fieldHeroCard}>
            <span className={styles.fieldHeroName}>{hero.name}</span>
            <div className={styles.fieldValueRow}>
              <span className={styles.bigNumber} data-size="field">
                {hero.val}
                <span className={styles.fieldUnit}>{hero.unit}</span>
              </span>
            </div>
            <div className={styles.fieldSub}>{hero.sub}</div>
            <div className={styles.fieldTrack}>
              <div
                className={styles.fieldFill}
                style={{ width: `${hero.w}%`, background: hero.barColor }}
              />
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
          <RankedList rows={RANK_ROWS[dim]} variant="field" />
        </div>
      </div>

      {/* Band D — one store: what is ranged against what is facing out */}
      <div className={styles.band}>
        <h2 className={styles.bandTitle} data-gap="4">
          What moved · store detail
        </h2>
        <div className={styles.bandCaption}>{FIELD_STORE_CAPTION}</div>

        <div className={styles.twoCol}>
          <div className={styles.panel}>
            <span className={styles.panelTitle} data-gap="12">
              MSL checklist · absent first
            </span>
            {STORE_MSL.map((item) => (
              <div
                key={item.name}
                className={styles.mslRow}
                data-found={item.found}
              >
                <span className={styles.mslRowIcon} aria-hidden="true">
                  <Icon name={item.icon} size={13} />
                </span>
                <span className={styles.mslRowName}>{item.name}</span>
                <span className={styles.mslTag}>{item.tag}</span>
              </div>
            ))}
          </div>

          <div className={styles.panel}>
            <span className={styles.panelTitle} data-gap="14">
              Shelf ribbon · what&apos;s facing out
            </span>
            <Ribbon segments={FIELD_RIBBON} variant="store" />
            <RibbonLegend
              segments={FIELD_RIBBON}
              showShare={false}
              variant="store"
            />
          </div>
        </div>
      </div>

      {/* Band E */}
      <div className={styles.bandEnd}>
        <h2 className={styles.bandTitle} data-gap="14">
          Where to push · fix list
        </h2>
        <div className={styles.tableCard}>
          {FIX_LIST.map((fix) => (
            <div key={fix.store} className={styles.fixRow}>
              <span className={styles.fixDot} aria-hidden="true" />
              <div className={styles.fixBody}>
                <div className={styles.fixStore}>{fix.store}</div>
                <div className={styles.fixIssue}>
                  {fix.issue} ·{" "}
                  <b className={styles.inlineMono}>{fix.skus}</b> SKUs affected
                </div>
              </div>
              <button
                type="button"
                className={styles.inlineLink}
                aria-label={`Open Session Viewer for ${fix.store}`}
              >
                Open Session Viewer
                <Icon name="arrow-right" size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
