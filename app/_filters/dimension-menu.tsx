"use client";

import { Icon } from "@/app/_components/icon";
import { hasFilter, type ActiveFilter, type FilterDimension } from "./model";
import { isDimId, SEARCH_THRESHOLD, valueLabel } from "./registry";
import { useFilterMenu } from "./use-filter-menu";
import styles from "./global-filter-bar.module.css";

/**
 * The "Add filter" popover: pick a dimension, then a value.
 *
 * Replaces the two near-identical copies that lived in Store Explorer's
 * `filter-menu.tsx` and inline in `analytics-header.tsx`. Both now come through
 * the global bar, so there is one of these instead of two that had already
 * drifted apart.
 */

/** Long dimensions render at most this many rows at once. 1,847 stores in one
 *  DOM list is both slow and useless; the search box is the way through. */
const RENDER_CAP = 50;

type DimensionMenuProps = {
  catalogue: FilterDimension[];
  filters: ActiveFilter[];
  onAdd: (filter: ActiveFilter) => void;
};

export function DimensionMenu({ catalogue, filters, onAdd }: DimensionMenuProps) {
  // Destructured rather than kept as one object: the ref inside it makes every
  // property read look like a ref read during render to the linter.
  const { open, toggle, close, setDim, dimension, rootRef, query, setQuery, matches } =
    useFilterMenu(catalogue);

  function choose(filter: ActiveFilter) {
    onAdd(filter);
    close();
  }

  const label = (dim: FilterDimension, value: string) =>
    isDimId(dim.key) ? valueLabel(dim.key, value) : value;

  const searchable = dimension ? dimension.values.length > SEARCH_THRESHOLD : false;
  const allMatching = dimension
    ? dimension.values.filter((value) => matches(label(dimension, value)))
    : [];
  const shown = allMatching.slice(0, RENDER_CAP);
  const hidden = allMatching.length - shown.length;

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
        <div className={styles.menu}>
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

              {/* Search appears past SEARCH_THRESHOLD values — the point the
                  list stops fitting the menu without scrolling. */}
              {searchable ? (
                <div className={styles.menuSearch}>
                  <Icon name="search" size={14} />
                  <input
                    className={styles.menuSearchInput}
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={`Search ${dimension.label.toLowerCase()}…`}
                    aria-label={`Search ${dimension.label}`}
                    autoFocus
                  />
                </div>
              ) : null}

              <div className={styles.menuScroll}>
                {shown.map((value) => {
                  const applied = hasFilter(filters, dimension.key, value);
                  return (
                    <button
                      key={value}
                      type="button"
                      className={styles.menuItem}
                      disabled={applied}
                      onClick={() => choose({ dim: dimension.key, value })}
                    >
                      <span className={styles.menuItemLabel}>
                        {label(dimension, value)}
                      </span>
                      {applied ? (
                        <span className={styles.menuCount}>applied</span>
                      ) : null}
                    </button>
                  );
                })}

                {allMatching.length === 0 ? (
                  <div className={styles.menuEmpty}>No match</div>
                ) : null}
                {hidden > 0 ? (
                  <div className={styles.menuEmpty}>
                    {hidden} more — keep typing to narrow
                  </div>
                ) : null}
              </div>
            </>
          ) : (
            <>
              <div className={styles.menuHead}>Filter by</div>
              <div className={styles.menuScroll}>
                {catalogue
                  .filter((entry) => entry.values.length > 0)
                  .map((entry) => (
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
              </div>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
