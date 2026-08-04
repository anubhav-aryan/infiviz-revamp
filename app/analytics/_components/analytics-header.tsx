import { Fragment } from "react";
import { Icon } from "@/app/_components/icon";
import {
  ACTIVE_FILTERS,
  PERSONAS,
  SCOPE,
  type Persona,
} from "../_data/analytics";
import styles from "./analytics.module.css";

type AnalyticsHeaderProps = {
  persona: Persona;
  onPersonaChange: (persona: Persona) => void;
};

/** The three header rows are identical across all four personas. */
export function AnalyticsHeader({
  persona,
  onPersonaChange,
}: AnalyticsHeaderProps) {
  return (
    <>
      <div className={`${styles.headRow} ${styles.headRow1}`}>
        <div className={styles.titleGroup}>
          <div>
            <h1 className={styles.pageTitle}>Analytics</h1>
            <div className={styles.pageSubtitle}>Colgate-Palmolive Vietnam</div>
          </div>

          <div className={styles.segmented} role="group" aria-label="Persona">
            {PERSONAS.map((p) => (
              <button
                key={p.key}
                type="button"
                className={styles.segButton}
                data-active={p.key === persona}
                aria-pressed={p.key === persona}
                onClick={() => onPersonaChange(p.key)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.headActions}>
          <span className={styles.pill}>
            <span className={styles.pillDot} aria-hidden="true" />
            Synced 12 min ago
          </span>
          <span className={styles.pill}>
            <Icon name="store" />
            76% coverage
          </span>
        </div>
      </div>

      <div className={`${styles.headRow} ${styles.headRow2}`}>
        <div className={styles.breadcrumb}>
          {SCOPE.map((crumb, i) => (
            <Fragment key={crumb.label}>
              {i > 0 ? (
                <span className={styles.crumbSep} aria-hidden="true">
                  <Icon name="chevron-right" size={15} />
                </span>
              ) : null}
              <span className={styles.crumb} data-current={crumb.current}>
                {crumb.label}
              </span>
            </Fragment>
          ))}
        </div>

        <div className={styles.headActions}>
          <button type="button" className={styles.ghostButton}>
            <Icon name="calendar" />
            July 2026
            <Icon name="chevron-down" />
          </button>
          <button type="button" className={styles.ghostButton}>
            <Icon name="git-compare" />
            Compare to previous month
            <Icon name="chevron-down" />
          </button>
        </div>
      </div>

      <div className={`${styles.headRow} ${styles.headRow3}`}>
        <div className={styles.chips}>
          {ACTIVE_FILTERS.map((label) => (
            <span key={label} className={styles.chip}>
              {label}
              <button
                type="button"
                className={styles.chipRemove}
                aria-label={`Remove filter ${label}`}
              >
                <Icon name="x" size={13} />
              </button>
            </span>
          ))}
          <button type="button" className={styles.addFilter}>
            <Icon name="plus" size={14} />
            Add filter
          </button>
        </div>

        <div className={styles.headActions}>
          <button type="button" className={styles.ghostButton}>
            <Icon name="bookmark" />
            Saved views
          </button>
          <button type="button" className={styles.primaryButton}>
            <Icon name="download" />
            Export
          </button>
        </div>
      </div>
    </>
  );
}
