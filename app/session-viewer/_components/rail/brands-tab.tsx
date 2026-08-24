"use client";

import { Hint } from "@/app/_components/hint";
import { Icon } from "@/app/_components/icon";
import {
  BRAND_SHARE_ROWS,
  OWN_VS_COMPETITION,
  SCOPE_OPTIONS,
  SHELF_METRICS,
  scoped,
  type Scope,
} from "../../_data/session-viewer";
import styles from "../session-viewer.module.css";

/** The shelf as a share: how much of it is ours, and who holds the rest. */
export function BrandsTab({
  scope,
  onScope,
  ascending,
  onSort,
  pinnedBrand,
}: {
  scope: Scope;
  onScope: (scope: Scope) => void;
  ascending: boolean;
  onSort: () => void;
  pinnedBrand: string | null;
}) {
  const ordered = ascending ? [...BRAND_SHARE_ROWS].reverse() : BRAND_SHARE_ROWS;
  const rows = scoped(ordered, scope);

  return (
    <>
      <div className={styles.metricPair}>
        {SHELF_METRICS.map((metric) => (
          <div key={metric.label}>
            <div className={styles.metricLabel}>
              <span className={styles.metricLabelText}>{metric.label}</span>
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
        <span className={styles.splitOwn} style={{ width: `${OWN_VS_COMPETITION.own}%` }} />
        <span
          className={styles.splitCompetition}
          style={{ width: `${OWN_VS_COMPETITION.competition}%` }}
        />
      </div>

      <div className={styles.scopeRow}>
        <span className={styles.blockTitle}>Brand breakdown · facings</span>
        <select
          className={styles.filterSelect}
          value={scope}
          onChange={(event) => onScope(event.target.value as Scope)}
          aria-label="Brand scope"
        >
          {SCOPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button type="button" className={styles.sortButton} onClick={onSort}>
          <Icon
            name={ascending ? "arrow-up-narrow-wide" : "arrow-down-wide-narrow"}
            size={12}
          />
          {ascending ? "Smallest" : "Largest"}
        </button>
      </div>

      <div className={styles.countCaption}>
        {rows.length} of {BRAND_SHARE_ROWS.length} brands
      </div>

      <div className={styles.scrollList}>
        {rows.map((brand) => (
          <div
            key={brand.name}
            className={styles.brandRow}
            data-highlighted={pinnedBrand === brand.name || undefined}
          >
            <span className={styles.brandDot} data-own={brand.isOwn} aria-hidden="true" />
            <span className={styles.brandName}>{brand.name}</span>
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
    </>
  );
}
