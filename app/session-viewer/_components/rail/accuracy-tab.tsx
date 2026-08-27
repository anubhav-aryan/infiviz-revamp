"use client";

import { Icon } from "@/app/_components/icon";
import {
  BRAND_ACCURACY_ROWS,
  SKU_ACCURACY_ROWS,
  type AccuracyRow,
} from "../../_data/session-accuracy";
import { SCOPE_OPTIONS, scoped, type Scope } from "../../_data/session-viewer";
import styles from "../session-viewer.module.css";

/**
 * How close recognition got, brand by brand and SKU by SKU.
 *
 * The headline pair — predicted against the auditor's recount — leads the
 * Summary tab instead, beside the availability figure it qualifies. What is
 * left here is the breakdown, which is what somebody opening a tab called
 * Accuracy came for.
 */
function AccuracyList({
  title,
  rows,
  scope,
  onScope,
  ascending,
  onSort,
  noun,
  first,
}: {
  title: string;
  rows: AccuracyRow[];
  scope: Scope;
  onScope: (scope: Scope) => void;
  ascending: boolean;
  onSort: () => void;
  noun: string;
  /** The first list opens the tab, so it carries no rule above it. */
  first?: boolean;
}) {
  const ordered = ascending ? rows : [...rows].reverse();
  const shown = scoped(ordered, scope);

  return (
    <>
      <div className={styles.scopeRow} data-first={first || undefined}>
        <span className={styles.blockTitle}>{title}</span>
        <select
          className={styles.filterSelect}
          value={scope}
          onChange={(event) => onScope(event.target.value as Scope)}
          aria-label={`${title} scope`}
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
          {ascending ? "Worst first" : "Best first"}
        </button>
      </div>

      <div className={styles.countCaption}>
        {shown.length} of {rows.length} {noun}
      </div>

      <div className={styles.scrollList}>
        {shown.map((row) => (
          <div key={row.name} className={styles.accRow}>
            <span className={styles.accRowName} title={row.name}>
              {row.name}
            </span>
            {/* The bar is what makes a column of near-identical percentages
                scannable — 74% and 98% read the same as text. */}
            <span className={styles.accRowTrack}>
              <span className={styles.accRowBar} style={{ width: `${row.accuracy}%` }} />
            </span>
            <span className={styles.accValue}>{row.accuracy.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </>
  );
}

export function AccuracyTab({
  brandScope,
  onBrandScope,
  brandAsc,
  onBrandSort,
  skuScope,
  onSkuScope,
  skuAsc,
  onSkuSort,
}: {
  brandScope: Scope;
  onBrandScope: (scope: Scope) => void;
  brandAsc: boolean;
  onBrandSort: () => void;
  skuScope: Scope;
  onSkuScope: (scope: Scope) => void;
  skuAsc: boolean;
  onSkuSort: () => void;
}) {
  return (
    <>
      <AccuracyList
        title="Brand-level accuracy"
        first
        rows={BRAND_ACCURACY_ROWS}
        scope={brandScope}
        onScope={onBrandScope}
        ascending={brandAsc}
        onSort={onBrandSort}
        noun="brands"
      />
      <AccuracyList
        title="SKU-level accuracy"
        rows={SKU_ACCURACY_ROWS}
        scope={skuScope}
        onScope={onSkuScope}
        ascending={skuAsc}
        onSort={onSkuSort}
        noun="SKUs"
      />
    </>
  );
}
