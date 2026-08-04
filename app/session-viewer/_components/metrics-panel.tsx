import { Hint } from "@/app/_components/hint";
import { Icon } from "@/app/_components/icon";
import {
  AVAILABILITY,
  BRAND_ROWS,
  MSL,
  OWN_VS_COMPETITION,
  SHELF_METRICS,
  type SessionIdentity,
} from "../_data/session-viewer";
import styles from "./session-viewer.module.css";

type MetricsPanelProps = {
  session: SessionIdentity;
};

/**
 * The right column: every number Analytics rolled up, next to the evidence it
 * was computed from. Only the session header varies by store — the metrics
 * below it are one authored session's figures. Entirely static; nothing here
 * reacts to the box toggle.
 */
export function MetricsPanel({ session }: MetricsPanelProps) {
  return (
    <div className={styles.column}>
      {/* session header */}
      <div className={`${styles.card} ${styles.metricsCard}`}>
        <h1 className={styles.sessionTitle}>{session.title}</h1>
        <div className={styles.sessionMeta}>
          {session.header.map((row) => (
            <div key={row.key} className={styles.sessionMetaRow}>
              <span className={styles.sessionMetaKey}>{row.key}</span>
              <span className={styles.sessionMetaValue}>{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* shelf metrics */}
      <div className={`${styles.card} ${styles.metricsCard}`}>
        <div className={`${styles.sectionLabel} ${styles.sectionLabelBlock}`}>
          Shelf metrics
        </div>

        <div className={styles.metricPair}>
          {SHELF_METRICS.map((metric) => (
            <div key={metric.label}>
              <div className={styles.metricLabel}>
                <span className={styles.metricLabelText}>{metric.label}</span>
                {/* The definition is the point of the icon, so it goes in a
                    focusable Hint rather than a mouse-only `title`. */}
                <Hint text={metric.definition} className={styles.infoIcon}>
                  <Icon name="info" size={13} />
                </Hint>
              </div>
              <div className={styles.metricValue}>{metric.value}</div>
              <div className={styles.metricDetail}>{metric.detail}</div>
            </div>
          ))}
        </div>

        <div className={styles.splitHead}>
          <span className={styles.splitLabel}>Own vs competition</span>
          <span className={styles.splitValue}>{OWN_VS_COMPETITION.label}</span>
        </div>
        <div className={styles.splitBar}>
          <span
            className={styles.splitOwn}
            style={{ width: `${OWN_VS_COMPETITION.own}%` }}
          />
          <span
            className={styles.splitCompetition}
            style={{ width: `${OWN_VS_COMPETITION.competition}%` }}
          />
        </div>
      </div>

      {/* availability + must-stock list */}
      <div className={`${styles.card} ${styles.metricsCard}`}>
        <div className={styles.availabilityHead}>
          <span className={styles.sectionLabel}>Availability</span>
          <div className={styles.availabilityMetric}>
            <span className={styles.availabilityLabel}>{AVAILABILITY.label}</span>
            <Hint text={AVAILABILITY.definition} className={styles.infoIcon}>
              <Icon name="info" size={13} />
            </Hint>
            <span className={styles.availabilityValue}>{AVAILABILITY.value}</span>
          </div>
        </div>

        <div className={styles.mslNote}>{AVAILABILITY.note}</div>

        <div className={styles.mslList}>
          {MSL.map((sku) => (
            <div key={sku.name} className={styles.mslRow} data-status={sku.status}>
              <span className={styles.mslThumb} aria-hidden="true">
                <Icon name="package" size={15} />
              </span>
              <div className={styles.mslText}>
                <div className={styles.mslName}>{sku.name}</div>
                <div className={styles.mslBrand}>{sku.brand}</div>
              </div>
              {sku.mustHave ? (
                <span className={styles.mustHave}>
                  <Icon name="star" size={9} />
                  Must-have
                </span>
              ) : null}
              <span className={styles.mslStatus} data-status={sku.status}>
                {sku.statusLabel}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* brand breakdown */}
      <div className={`${styles.card} ${styles.metricsCard}`}>
        <div className={`${styles.sectionLabel} ${styles.sectionLabelBlock}`}>
          Brand breakdown · facings
        </div>
        {BRAND_ROWS.map((brand) => (
          <div key={brand.name} className={styles.brandRow}>
            <span className={styles.brandName}>
              <span
                className={styles.brandDot}
                data-own={brand.isOwn}
                aria-hidden="true"
              />
              {brand.name}
            </span>
            <span className={styles.brandTrack}>
              <span
                className={styles.brandBar}
                data-own={brand.isOwn}
                style={{ width: `${brand.width}%` }}
              />
            </span>
            <span className={styles.brandValue}>
              {brand.facings} · {brand.share}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
