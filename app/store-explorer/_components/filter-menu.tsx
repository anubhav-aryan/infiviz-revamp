"use client";

import { Icon } from "@/app/_components/icon";
import {
  type ActiveFilter,
  filterLabel,
  hasFilter,
} from "@/app/_filters/model";
import { useFilterMenu } from "@/app/_filters/use-filter-menu";
import { group } from "@/app/_format/num";
import {
  CATALOGUE,
  type Facts,
  SUGGESTED_FILTERS,
  facetCount,
} from "../_data/store-explorer";
import styles from "./store-explorer.module.css";

type FilterMenuProps = {
  facts: Facts;
  filters: ActiveFilter[];
  onAdd: (filter: ActiveFilter) => void;
};

export function FilterMenu({ facts, filters, onAdd }: FilterMenuProps) {
  // Destructured rather than kept as one `menu` object: the ref inside it makes
  // every property read look like a ref read during render to the linter.
  const { open, toggle, close, setDim, dimension, rootRef } =
    useFilterMenu(CATALOGUE);

  function choose(filter: ActiveFilter) {
    onAdd(filter);
    close();
  }

  const suggestions = SUGGESTED_FILTERS.filter(
    (filter) => !hasFilter(filters, filter.dim, filter.value),
  );

  return (
    <div className={styles.popoverWrap} ref={rootRef}>
      <button
        type="button"
        className={styles.addFilter}
        onClick={toggle}
        aria-expanded={open}
      >
        <Icon name="plus" size={14} />
        Add filter
      </button>

      {open ? (
        <div className={`${styles.popover} ${styles.menu}`}>
          {dimension ? (
            <>
              <div className={styles.menuHead}>
                <button
                  type="button"
                  className={styles.menuBack}
                  onClick={() => setDim(null)}
                  aria-label="Back to filter dimensions"
                >
                  <Icon name="chevron-left" size={14} />
                </button>
                {dimension.label}
              </div>
              {dimension.values.map((value) => {
                const applied = hasFilter(filters, dimension.key, value);
                return (
                  <button
                    key={value}
                    type="button"
                    className={styles.menuItem}
                    disabled={applied}
                    onClick={() => choose({ dim: dimension.key, value })}
                  >
                    <span className={styles.menuItemLabel}>{value}</span>
                    <span className={styles.menuCount}>
                      {applied
                        ? "applied"
                        : group(facetCount(facts, dimension.key, value))}
                    </span>
                  </button>
                );
              })}
            </>
          ) : (
            <>
              {suggestions.length > 0 ? (
                <>
                  <div className={styles.menuHead}>Suggested</div>
                  {suggestions.map((filter) => (
                    <button
                      key={filterLabel(filter)}
                      type="button"
                      className={styles.menuItem}
                      onClick={() => choose(filter)}
                    >
                      <span className={styles.menuItemLabel}>
                        {filterLabel(filter)}
                      </span>
                      <span className={styles.menuCount}>
                        {group(facetCount(facts, filter.dim, filter.value))}
                      </span>
                    </button>
                  ))}
                </>
              ) : null}

              <div className={styles.menuHead}>Filter by</div>
              {CATALOGUE.map((entry) => (
                <button
                  key={entry.key}
                  type="button"
                  className={styles.menuItem}
                  onClick={() => setDim(entry.key)}
                >
                  <span className={styles.menuItemLabel}>{entry.label}</span>
                  <Icon name="chevron-right" size={14} />
                </button>
              ))}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
