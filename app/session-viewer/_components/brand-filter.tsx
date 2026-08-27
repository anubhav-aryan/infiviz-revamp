"use client";

import { Icon } from "@/app/_components/icon";
import type { FilterDimension } from "@/app/_filters/model";
import { useFilterMenu } from "@/app/_filters/use-filter-menu";
import { DETECTED_BRANDS } from "../_data/session-viewer";
import styles from "./session-viewer.module.css";

/** No dimension step — this popover is only ever about brands. */
const NO_STEPS: FilterDimension[] = [];

/**
 * The Brand filter: a searchable multi-select over the brands recognition
 * actually found on this shelf.
 *
 * A popover of checkboxes rather than a `<select>`, because "P/S against
 * Closeup" is a real question and a single-value control cannot ask it. The
 * behaviour — outside-click, Escape, the search box — comes from
 * `useFilterMenu` used as a plain popover, the same way the saved-views menu
 * and the date picker use it. The checkbox rows reuse the classes the POSM /
 * Overlap / Exclusions toggles beside it are built from, so the row of
 * controls reads as one family.
 *
 * An empty selection means unfiltered. "All brands" is the absence of a
 * filter, not an entry that has to be kept mutually exclusive with the rest.
 */
export function BrandFilter({
  selected,
  onChange,
}: {
  selected: ReadonlySet<string>;
  onChange: (brands: ReadonlySet<string>) => void;
}) {
  const { open, toggle, close, rootRef, query, setQuery, matches } =
    useFilterMenu(NO_STEPS);

  const shown = DETECTED_BRANDS.filter((brand) => matches(brand));

  const summary =
    selected.size === 0
      ? "All brands"
      : selected.size === 1
        ? [...selected][0]
        : `${selected.size} brands`;

  const toggleBrand = (brand: string) => {
    const next = new Set(selected);
    if (next.has(brand)) next.delete(brand);
    else next.add(brand);
    onChange(next);
  };

  return (
    <div className={styles.brandMenuWrap} ref={rootRef}>
      <button
        type="button"
        className={styles.filterSelect}
        onClick={toggle}
        aria-expanded={open}
        aria-haspopup="true"
      >
        {summary}
        <Icon name={open ? "chevron-up" : "chevron-down"} size={12} />
      </button>

      {open ? (
        <div className={styles.brandMenu} role="group" aria-label="Filter by brand">
          <div className={styles.brandSearch}>
            <Icon name="search" size={13} />
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

          <div className={styles.brandMenuScroll}>
            {shown.map((brand) => {
              const on = selected.has(brand);
              return (
                <button
                  key={brand}
                  type="button"
                  role="checkbox"
                  aria-checked={on}
                  className={`${styles.checkbox} ${styles.brandOption}`}
                  onClick={() => toggleBrand(brand)}
                >
                  <span className={styles.checkboxBox} data-on={on} aria-hidden="true">
                    {on ? <Icon name="check" size={12} /> : null}
                  </span>
                  {brand}
                </button>
              );
            })}
            {shown.length === 0 ? (
              <div className={styles.brandMenuEmpty}>No brand matches</div>
            ) : null}
          </div>

          {selected.size > 0 ? (
            <div className={styles.brandMenuFoot}>
              <span>
                {selected.size} of {DETECTED_BRANDS.length} selected
              </span>
              <button
                type="button"
                className={styles.brandMenuClear}
                onClick={() => {
                  onChange(new Set());
                  close();
                }}
              >
                Clear
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
