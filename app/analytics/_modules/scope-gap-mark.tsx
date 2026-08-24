"use client";

import { Hint } from "@/app/_components/hint";
import { Icon } from "@/app/_components/icon";
import { useGlobalFilters } from "@/app/_filters/global-filter-context";
import { filterLabel } from "@/app/_filters/model";
import filterStyles from "@/app/_filters/global-filter-bar.module.css";
import { unscopedFilters } from "../_data/scope";

/**
 * Names the filters this screen carried but could not act on.
 *
 * A module reads at one scope — a region or a category — so every other chip in
 * the bar travels here and then does nothing. That was survivable while the
 * rail was the only way in; a drill link from a card makes a stronger promise
 * ("this is the detail behind *that* figure"), and landing on numbers that
 * quietly ignore half the reader's chips breaks it.
 *
 * Not `UnfilteredMark`: that one fires on *any* filter and says the figure does
 * not respond to the current filters, which would be a lie on a screen where a
 * Region filter genuinely narrowed everything. This says which ones didn't.
 *
 * Renders nothing when every active filter is a scope filter — the common case.
 */
export function ScopeGapMark() {
  const api = useGlobalFilters();
  if (!api) return null;

  const unscoped = unscopedFilters(api.filters);
  if (unscoped.length === 0) return null;

  const names = unscoped.map(filterLabel);
  const list =
    names.length === 1
      ? names[0]
      : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;

  return (
    <Hint
      text={
        `This module reads at one region or category, so ${list} ` +
        `${names.length === 1 ? "is" : "are"} carried in the filter bar but not applied to these figures.`
      }
      className={filterStyles.unfilteredMark}
    >
      <Icon name="info" size={12} />
      {names.length === 1 ? "1 filter not applied" : `${names.length} filters not applied`}
    </Hint>
  );
}
