"use client";

import { Icon } from "@/app/_components/icon";
import {
  BOX_LEGEND,
  COMPLIANCE_LEGEND,
  MSL_FILTER_OPTIONS,
  SHELF_TOGGLES,
  type ExtraKind,
  type MslFilter,
  type ShelfView,
} from "../_data/session-viewer";
import { BrandFilter } from "./brand-filter";
import styles from "./session-viewer.module.css";

/**
 * The three overlay toggles.
 *
 * There is no checkbox primitive in this codebase — the only comparable control
 * is the `role="switch"` button on Analytics' category screen — so these are
 * `role="checkbox"` buttons built the same way rather than a shared component
 * introduced for one screen.
 *
 * Each toggle only ever *adds* marks to the stitch — none of what they reveal
 * is a facing — so the counted total never moves and nothing here can put the
 * overlay and the tables into disagreement. That total is stated once, in the
 * rail's `Facings counted` figure, rather than repeated under the shelf.
 */

type ShelfTogglesProps = {
  shown: Set<ExtraKind>;
  onToggle: (kind: ExtraKind) => void;
  view: ShelfView;
  brandFilter: ReadonlySet<string>;
  onBrandFilter: (brands: ReadonlySet<string>) => void;
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
  /* The kind is what the swatch needs — the stylesheet already carries a solid
     colour per kind. Mapping it to a `paint` handed the swatch the box-interior
     fill instead, which is a 12–14% alpha. */
  const legend: { kind: string; label: string }[] =
    view === "store" ? BOX_LEGEND : COMPLIANCE_LEGEND;

  return (
    <div className={styles.filterRow}>
      <div className={styles.inlineField}>
        <span className={styles.inlineLabel}>Brand</span>
        <BrandFilter selected={brandFilter} onChange={onBrandFilter} />
      </div>

      <label className={styles.inlineField}>
        <span className={styles.inlineLabel}>MSL</span>
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

      <span className={styles.legend}>
        {legend.map((entry) => (
          <span key={entry.label} className={styles.legendItem}>
            <span
              className={styles.legendSwatch}
              data-kind={entry.kind}
              aria-hidden="true"
            />
            {entry.label}
          </span>
        ))}
      </span>
    </div>
  );
}
