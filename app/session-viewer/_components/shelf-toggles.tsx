"use client";

import { Icon } from "@/app/_components/icon";
import {
  BOX_LEGEND,
  BOX_PAINT,
  COMPLIANCE_LEGEND,
  COMPLIANCE_PAINT,
  COUNTED_FACINGS,
  DETECTED_BRANDS,
  EXTRA_COUNTS,
  MSL_FILTER_OPTIONS,
  SHELF_TOGGLES,
  type ExtraKind,
  type MslFilter,
  type ShelfView,
} from "../_data/session-viewer";
import styles from "./session-viewer.module.css";

/**
 * The three overlay toggles.
 *
 * There is no checkbox primitive in this codebase — the only comparable control
 * is the `role="switch"` button on Analytics' category screen — so these are
 * `role="checkbox"` buttons built the same way rather than a shared component
 * introduced for one screen.
 *
 * The caption is the point of the row: each toggle only ever *adds* marks to
 * the stitch. The counted facing total never moves, so nothing here can put the
 * overlay and the tables into disagreement.
 */

type ShelfTogglesProps = {
  shown: Set<ExtraKind>;
  onToggle: (kind: ExtraKind) => void;
  view: ShelfView;
  brandFilter: string;
  onBrandFilter: (brand: string) => void;
  mslFilter: MslFilter;
  onMslFilter: (filter: MslFilter) => void;
};

export function ShelfToggles({
  shown,
  onToggle,
  view,
  brandFilter,
  onBrandFilter,
  mslFilter,
  onMslFilter,
}: ShelfTogglesProps) {
  const legend =
    view === "store"
      ? BOX_LEGEND.map((entry) => ({ label: entry.label, paint: BOX_PAINT[entry.kind] }))
      : COMPLIANCE_LEGEND.map((entry) => ({
          label: entry.label,
          paint: COMPLIANCE_PAINT[entry.kind],
        }));

  return (
    <div className={styles.filterRow}>
      <label className={styles.headField}>
        Brand
        <select
          className={styles.filterSelect}
          value={brandFilter}
          onChange={(event) => onBrandFilter(event.target.value)}
        >
          <option value="all">All</option>
          {DETECTED_BRANDS.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
      </label>

      <label className={styles.headField}>
        MSL
        <select
          className={styles.filterSelect}
          value={mslFilter}
          onChange={(event) => onMslFilter(event.target.value as MslFilter)}
        >
          {MSL_FILTER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <span className={styles.divider} aria-hidden="true" />

      {SHELF_TOGGLES.map((toggle) => {
        const on = shown.has(toggle.kind);
        return (
          <button
            key={toggle.kind}
            type="button"
            role="checkbox"
            aria-checked={on}
            className={styles.checkbox}
            onClick={() => onToggle(toggle.kind)}
          >
            <span className={styles.checkboxBox} data-on={on} aria-hidden="true">
              {on ? <Icon name="check" size={12} /> : null}
            </span>
            {toggle.label}
          </button>
        );
      })}

      <span className={styles.divider} aria-hidden="true" />

      <span className={styles.legend}>
        {legend.map((entry) => (
          <span key={entry.label} className={styles.legendItem}>
            <span
              className={styles.legendSwatch}
              style={{ background: entry.paint.fill, borderColor: entry.paint.stroke }}
            />
            {entry.label}
          </span>
        ))}
      </span>

      <span className={styles.toggleCaption}>
        {COUNTED_FACINGS} counted facings
        {EXTRA_COUNTS.map((entry) => (
          <span key={entry.kind} data-on={shown.has(entry.kind)}>
            {" · +"}
            {entry.count} {entry.short}
          </span>
        ))}
      </span>
    </div>
  );
}
