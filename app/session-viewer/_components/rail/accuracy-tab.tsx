"use client";

import { Hint } from "@/app/_components/hint";
import { Icon } from "@/app/_components/icon";
import {
  ACCURACY_AUTHOR,
  ACCURACY_OVERALL,
  ACCURACY_PAIRS,
  BRAND_ACCURACY_ROWS,
  SKU_ACCURACY_ROWS,
  type AccuracyRow,
} from "../../_data/session-accuracy";
import { SCOPE_OPTIONS, scoped, type Scope } from "../../_data/session-viewer";
import styles from "../session-viewer.module.css";

/**
 * How close recognition got, against a human recount of the same bay.
 *
 * This is where the screen's two availability figures stop contradicting each
 * other: 72% is what the model predicted, 75% is what the auditor counted, and
 * the three-point gap is the finding rather than a bug in either.
 */
function AccuracyList({
  title,
  rows,
  scope,
  onScope,
  ascending,
  onSort,
  noun,
}: {
  title: string;
  rows: AccuracyRow[];
  scope: Scope;
  onScope: (scope: Scope) => void;
  ascending: boolean;
  onSort: () => void;
  noun: string;
}) {
  const ordered = ascending ? rows : [...rows].reverse();
  const shown = scoped(ordered, scope);

  return (
    <>
      <div className={styles.scopeRow}>
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
      <div className={styles.scopeRow} style={{ marginTop: 0 }}>
        <span className={styles.blockTitle}>Predicted vs actual</span>
        <span className={styles.countCaption} style={{ marginBottom: 0 }}>
          {ACCURACY_OVERALL}% overall
        </span>
      </div>
      <div className={styles.countCaption}>{ACCURACY_AUTHOR}</div>

      {ACCURACY_PAIRS.map((pair) => (
        <div key={pair.label} className={styles.accPair}>
          <div className={styles.accHead}>
            <span className={styles.metricLabelText}>{pair.label}</span>
            <Hint text={pair.definition} className={styles.infoIcon}>
              <Icon name="info" size={13} />
            </Hint>
          </div>

          <div className={styles.accGrid}>
            <div>
              <div className={styles.metaLabel}>Predicted</div>
              <div className={styles.accBig}>{pair.predicted.toFixed(1)}%</div>
            </div>
            <div>
              <div className={styles.metaLabel}>Actual</div>
              <div className={styles.accBig}>{pair.actual.toFixed(1)}%</div>
            </div>
            <div>
              <div className={styles.metaLabel}>Error</div>
              <div className={styles.accError} data-tone={pair.errorTone}>
                {pair.error}
              </div>
            </div>
          </div>

          <div className={styles.accTrackRow}>
            <span className={styles.accTrack}>
              <span className={styles.accBar} style={{ width: `${pair.accuracy}%` }} />
            </span>
            <span className={styles.accValue}>{pair.accuracy.toFixed(1)}%</span>
          </div>
        </div>
      ))}

      <AccuracyList
        title="Brand-level accuracy"
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
