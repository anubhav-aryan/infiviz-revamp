"use client";

import { Hint } from "@/app/_components/hint";
import { Icon } from "@/app/_components/icon";
import { useGlobalFilters } from "./global-filter-context";
import styles from "./global-filter-bar.module.css";

/**
 * Marks a figure the active filters could not narrow.
 *
 * Most of this app's reports are precomputed monthly fixtures: their row-level
 * tables carry the dimensions the bar filters by, but their headline figures
 * were authored as single numbers and cannot be re-derived from a filtered
 * subset without inventing the arithmetic. Rather than let a filtered screen
 * imply that every number on it responded, the ones that didn't say so.
 *
 * Renders nothing when no filter is applied, which is the overwhelmingly common
 * case — the mark is a response to filtering, not permanent chrome.
 */
export function UnfilteredMark({ what = "This figure" }: { what?: string }) {
  const api = useGlobalFilters();
  if (!api || api.filters.length === 0) return null;

  return (
    <Hint
      text={`${what} is the month's authored total and does not respond to the current filters.`}
      className={styles.unfilteredMark}
    >
      <Icon name="info" size={12} />
      Unfiltered
    </Hint>
  );
}
