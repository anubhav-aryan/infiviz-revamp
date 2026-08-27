"use client";

import { Icon } from "@/app/_components/icon";
import {
  BRAND_FACING_DELTAS,
  formatDelta,
  PREVIOUS_VISIT,
} from "../../_data/session-previous";
import {
  BRAND_SHARE_ROWS,
  SCOPE_OPTIONS,
  scoped,
  type Scope,
} from "../../_data/session-viewer";
import styles from "../session-viewer.module.css";

/**
 * Who holds the shelf, brand by brand.
 *
 * The two share metrics and the own-versus-competition split used to open this
 * tab; they lead the Summary tab now, where they sit beside the other four
 * headline figures instead of one tab away from them. What is left here is the
 * full list they summarise, which a category of two dozen brands needs scoped
 * and sorted rather than truncated silently.
 */
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
      <div className={styles.scopeRow} data-first="true">
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
        {rows.length} of {BRAND_SHARE_ROWS.length} brands · deltas vs {PREVIOUS_VISIT.label}
      </div>

      <div className={styles.scrollList}>
        {rows.map((brand) => (
          <div
            key={brand.name}
            className={styles.brandRow}
            data-highlighted={pinnedBrand === brand.name || undefined}
          >
            {/* Inside the name cell, not beside it: the grid has three columns
                and a fourth child wrapped the value onto its own row. */}
            <span className={styles.brandName}>
              <span className={styles.brandDot} data-own={brand.isOwn} aria-hidden="true" />
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
              {(() => {
                /* Facings moved, or the chip stays away — a column of ±0
                   would bury the three rows that actually changed. */
                const delta = formatDelta(BRAND_FACING_DELTAS.get(brand.name) ?? 0);
                return delta ? (
                  <span
                    className={styles.deltaChip}
                    data-size="sm"
                    data-good={(BRAND_FACING_DELTAS.get(brand.name) ?? 0) > 0}
                    title={`Facings vs ${PREVIOUS_VISIT.label}`}
                  >
                    {delta}
                  </span>
                ) : null;
              })()}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
