"use client";

import { Icon } from "@/app/_components/icon";
import { useFilterMenu } from "@/app/_filters/use-filter-menu";
import type { FilterDimension } from "@/app/_filters/model";
import { BRAND_FACETS } from "../_data/catalog";
import styles from "./catalog.module.css";

/**
 * Brand filter for the SKU list.
 *
 * Replaces a row of brand chips that looked like a filter and was not one —
 * clicking a chip did nothing, and its counts were authored rather than read
 * off the SKUs they claimed to count.
 *
 * Multi-select, OR within the dimension, matching how the global filter bar
 * treats a dimension so the two multi-selects in the app do not behave
 * differently. Search sits inside the dropdown because the catalogue carries
 * thirteen brands, past the ten at which `registry.ts` says a list stops being
 * scannable.
 *
 * The popover machinery is `useFilterMenu` — open/close, close on outside
 * pointerdown, Escape, and the query state — rather than a second
 * implementation of all that. Its result must be destructured; that file
 * explains why.
 */

/** `useFilterMenu` also serves as a plain popover when given no dimensions. */
const NO_DIMENSIONS: FilterDimension[] = [];

export function BrandFilter({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (brands: string[]) => void;
}) {
  const { open, toggle, rootRef, query, setQuery, matches } =
    useFilterMenu(NO_DIMENSIONS);

  const shown = BRAND_FACETS.filter((brand) => matches(brand.name));

  const summary =
    selected.length === 0
      ? "All"
      : selected.length === 1
        ? selected[0]
        : `${selected.length} selected`;

  const flip = (name: string) =>
    onChange(
      selected.includes(name)
        ? selected.filter((entry) => entry !== name)
        : [...selected, name],
    );

  return (
    <div className={styles.filterGroup}>
      <span className={styles.filterLabel}>Brand</span>

      <div className={styles.brandAnchor} ref={rootRef}>
        <button
          type="button"
          className={styles.brandTrigger}
          data-set={selected.length > 0}
          aria-expanded={open}
          onClick={toggle}
        >
          <span className={styles.brandTriggerValue}>{summary}</span>
          <Icon name="chevron-down" size={13} />
        </button>

        {open ? (
          <div className={styles.brandMenu}>
            <div className={styles.brandSearch}>
              <Icon name="search" size={14} />
              <input
                className={styles.brandSearchInput}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search brands…"
                aria-label="Search brands"
                autoFocus
              />
            </div>

            <div className={styles.brandScroll}>
              {shown.map((brand) => {
                const on = selected.includes(brand.name);
                return (
                  <button
                    key={brand.name}
                    type="button"
                    role="checkbox"
                    aria-checked={on}
                    className={styles.brandOption}
                    onClick={() => flip(brand.name)}
                  >
                    <span className={styles.brandCheck} data-on={on} aria-hidden="true">
                      {on ? <Icon name="check" size={11} /> : null}
                    </span>
                    <span className={styles.brandOptionName}>{brand.name}</span>
                    <span className={styles.brandOptionCount}>{brand.count}</span>
                  </button>
                );
              })}

              {shown.length === 0 ? (
                <div className={styles.brandEmpty}>No brand matches</div>
              ) : null}
            </div>

            {selected.length > 0 ? (
              <button
                type="button"
                className={styles.brandClear}
                onClick={() => onChange([])}
              >
                Clear brands
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
