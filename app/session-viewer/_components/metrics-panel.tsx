import { CreateTicketButton } from "@/app/_components/create-ticket-button";
import { Hint } from "@/app/_components/hint";
import { Icon } from "@/app/_components/icon";
import type { Visit } from "@/app/store-explorer/_data/store-explorer";
import {
  AVAILABILITY,
  BRAND_ROWS,
  MSL,
  OWN_VS_COMPETITION,
  SHELF_METRICS,
  mslFor,
  type SessionIdentity,
} from "../_data/session-viewer";
import styles from "./session-viewer.module.css";
import { CardActions } from "@/app/_components/card-actions";

type MetricsPanelProps = {
  session: SessionIdentity;
  visit?: Visit;
};

/**
 * Every number Analytics rolled up, next to the evidence it was computed from.
 * The body of the session metrics drawer.
 *
 * These are one authored session's figures — only the must-stock checklist
 * varies by store. The session's own identity is not repeated here: it is the
 * page header, and the drawer's own head names the session.
 */
export function MetricsPanel({ session, visit }: MetricsPanelProps) {
  const retailer = session.header.find((row) => row.key === "Retailer")?.value;
  /* Per-store found/absent when a `Visit` is available; the no-store default
     session keeps the static `MSL` fixture (see `mslFor`'s own doc comment). */
  const checklist = visit
    ? mslFor(visit)
    : MSL.map((sku) => ({ ...sku, detected: sku.status === "found", detail: sku.statusLabel }));

  return (
    <div className={styles.column}>
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
          {/* A sibling of the metric rather than part of it — the button acts on
              the card, and nested in that row it hugged the figure. */}
          <CardActions>
            <CreateTicketButton
              context={{ region: retailer, metric: AVAILABILITY.label }}
              compact
            />
          </CardActions>
        </div>

        <div className={styles.mslNote}>{AVAILABILITY.note}</div>

        {/* An explicit expected-vs-detected checklist, not just a stat plus a
            list — "Expected" is every row by definition of being on the MSL;
            "Detected" is its own icon column so the two concepts read as
            distinct checks, not one status word. */}
        <div className={styles.mslChecklistHead}>
          <span />
          <span>Expected</span>
          <span>Detected</span>
        </div>

        <div className={styles.mslList}>
          {checklist.map((sku) => (
            <div
              key={sku.name}
              className={styles.mslRow}
              data-status={sku.detected ? "found" : "absent"}
            >
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
              <span className={styles.mslExpected} aria-label="Expected on shelf">
                <Icon name="check" size={13} />
              </span>
              <span
                className={styles.mslDetected}
                data-detected={sku.detected}
                aria-label={sku.detected ? "Detected on shelf" : "Not detected"}
              >
                <Icon name={sku.detected ? "check" : "x"} size={13} />
                {sku.detail}
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
