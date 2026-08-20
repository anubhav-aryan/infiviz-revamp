"use client";

import { useState } from "react";
import { Icon } from "@/app/_components/icon";
import { DimensionMenu } from "./dimension-menu";
import { dateLabel, isDefaultDate, type DateToken } from "./date-token";
import { useGlobalFilters } from "./global-filter-context";
import { filterKey, type ActiveFilter, type FilterDimension } from "./model";
import { describeFilter, REGISTRY, valueLabel, type DimId } from "./registry";
import { useFilterMenu } from "./use-filter-menu";
import {
  CUSTOM_RANGE_MAX,
  CUSTOM_RANGE_MIN,
  DATE_PRESETS,
  presetToMonth,
  type CustomRange,
} from "@/app/_time/presets";
import { MONTH_BY_KEY } from "@/app/_time/periods";
import styles from "./global-filter-bar.module.css";

/**
 * The global filter bar: one row, on every session-scoped screen.
 *
 * **How the row stays one line.** The defaults are a fixed priority list, so
 * they can never overflow — they stay visible as dropdowns showing their
 * current value, which is where most applied state lives. Only ad-hoc filters
 * are unbounded, and they are the minority case: those collapse past
 * `CHIP_BUDGET` into a "+N more" popover that lists all of them, each
 * removable. The count is always visible, so nothing is ever silently applied.
 *
 * That is the answer to the applied-state-vs-single-row tension: a scrolling
 * row keeps every chip but hides *which* ones, and a single "Filters (7)"
 * button hides all of them. This keeps the majority visible and puts a counted,
 * one-click affordance on the rest.
 *
 * **The budget is a pure slice, not a measurement.** `adhoc.slice(0, 3)` is
 * deterministic from props, so the server and client render the same row and
 * there is no ResizeObserver, no layout flash and no hydration mismatch.
 */

const CHIP_BUDGET = 3;

/**
 * The session-defining defaults, in priority order — bounded by design, so the
 * row cannot overflow.
 *
 * Brand joins them because brands and accounts are what the commercial
 * conversation is about, and burying brand in the Add-filter menu made it the
 * hardest cut to reach on the screen that most needs it.
 *
 * A scope that cannot answer one of these simply draws fewer dropdowns — see
 * `defaultsFor`. Activity has no brand dimension, so it keeps three.
 */
export const DEFAULT_DIMS: DimId[] = ["photoType", "category", "retailer", "brand"];

/**
 * The defaults this scope can actually answer, in priority order.
 *
 * Intersected with the live catalogue rather than listed per scope: the bar
 * does not know its scope, but the catalogue it is handed was built from one,
 * and a dropdown for a dimension the screen abstains from would be a control
 * that does nothing. Deterministic from props, so server and client agree.
 */
function defaultsFor(catalogue: FilterDimension[]): DimId[] {
  const known = new Set(catalogue.map((entry) => entry.key));
  return DEFAULT_DIMS.filter((dim) => known.has(dim));
}

/* ---------- one default dropdown ---------- */

function DefaultPicker({
  dim,
  filters,
  onAdd,
  onRemove,
}: {
  dim: DimId;
  filters: ActiveFilter[];
  onAdd: (f: ActiveFilter) => void;
  onRemove: (f: ActiveFilter) => void;
}) {
  const registry = REGISTRY[dim];
  const applied = filters.filter((f) => f.dim === dim);

  /* A native <select> can express one value; these dimensions are multi-select
     (OR within a dimension), so the trigger reports the count and the popover
     holds the checkable list. */
  const { open, toggle, rootRef, query, setQuery, matches } = useFilterMenu([]);

  const searchable = registry.values.length > 10;
  const shown = registry.values
    .filter((value) => (searchable ? matches(value.label) : true))
    .slice(0, 50);

  const summary =
    applied.length === 0
      ? "All"
      : applied.length === 1
        ? valueLabel(dim, applied[0].value)
        : `${applied.length} selected`;

  return (
    <div className={styles.popoverWrap} ref={rootRef}>
      <button
        type="button"
        className={styles.default}
        onClick={toggle}
        aria-expanded={open}
        data-set={applied.length > 0}
        title={`${registry.label}: ${summary}`}
      >
        <span className={styles.defaultLabel}>{registry.label}</span>
        <span className={styles.defaultValue}>{summary}</span>
        <Icon name="chevron-down" size={13} />
      </button>

      {open ? (
        <div className={styles.menu}>
          {searchable ? (
            <div className={styles.menuSearch}>
              <Icon name="search" size={14} />
              <input
                className={styles.menuSearchInput}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={`Search ${registry.label.toLowerCase()}…`}
                aria-label={`Search ${registry.label}`}
                autoFocus
              />
            </div>
          ) : null}

          <div className={styles.menuScroll}>
            {shown.map((value) => {
              const on = applied.some((f) => f.value === value.id);
              return (
                <button
                  key={value.id}
                  type="button"
                  role="checkbox"
                  aria-checked={on}
                  className={styles.menuItem}
                  onClick={() =>
                    on
                      ? onRemove({ dim, value: value.id })
                      : onAdd({ dim, value: value.id })
                  }
                >
                  <span className={styles.checkbox} data-on={on} aria-hidden="true">
                    {on ? <Icon name="check" size={11} /> : null}
                  </span>
                  <span className={styles.menuItemLabel}>{value.label}</span>
                </button>
              );
            })}
            {shown.length === 0 ? <div className={styles.menuEmpty}>No match</div> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* ---------- the date group ---------- */

/**
 * The date control: five presets, plus a custom range.
 *
 * The range is bounded to the authored Feb–Jul 2026 window and each input caps
 * the other, so it cannot be inverted. The caption underneath states which
 * month the range resolves to, because there is no day-level data behind any of
 * this — `presetToMonth` collapses a range to the month containing its end, and
 * a control that silently turned "3–17 March" into all of March would look
 * broken rather than coarse. `_time/date-preset-picker.tsx` makes the same
 * admission for the same reason.
 */
function DatePicker({
  date,
  onChange,
}: {
  date: DateToken;
  onChange: (token: DateToken) => void;
}) {
  const { open, toggle, close, rootRef } = useFilterMenu([]);

  /* Seeded from the applied range so reopening shows what is in force, and
     from the window's edges when no range has been picked yet. */
  const [range, setRange] = useState<CustomRange>(
    () => date.custom ?? { start: CUSTOM_RANGE_MIN, end: CUSTOM_RANGE_MAX },
  );

  const resolved = MONTH_BY_KEY[presetToMonth("custom", range)];

  return (
    <div className={styles.popoverWrap} ref={rootRef}>
      <button
        type="button"
        className={styles.default}
        onClick={toggle}
        aria-expanded={open}
        data-set={!isDefaultDate(date)}
      >
        <Icon name="calendar-days" size={14} />
        <span className={styles.defaultValue}>{dateLabel(date)}</span>
        <Icon name="chevron-down" size={13} />
      </button>

      {open ? (
        <div className={styles.menu}>
          <div className={styles.menuScroll}>
            {DATE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className={styles.menuItem}
                aria-current={date.preset === preset.id}
                onClick={() => {
                  onChange({ preset: preset.id });
                  close();
                }}
              >
                <span className={styles.menuItemLabel}>{preset.label}</span>
                {date.preset === preset.id ? <Icon name="check" size={13} /> : null}
              </button>
            ))}
          </div>

          {/* Authored by hand rather than mapped: `custom` is in the
              `DatePreset` union but deliberately absent from `DATE_PRESETS`,
              which other screens iterate. */}
          <div className={styles.customRow} data-active={date.preset === "custom"}>
            <div className={styles.customLabel}>Custom range</div>

            <div className={styles.customInputs}>
              <input
                type="date"
                className={styles.dateInput}
                aria-label="Range start"
                value={range.start}
                min={CUSTOM_RANGE_MIN}
                max={range.end}
                onChange={(event) =>
                  setRange((current) => ({ ...current, start: event.target.value }))
                }
              />
              <span className={styles.customSep} aria-hidden="true">
                –
              </span>
              <input
                type="date"
                className={styles.dateInput}
                aria-label="Range end"
                value={range.end}
                min={range.start}
                max={CUSTOM_RANGE_MAX}
                onChange={(event) =>
                  setRange((current) => ({ ...current, end: event.target.value }))
                }
              />
            </div>

            <button
              type="button"
              className={styles.applyButton}
              onClick={() => {
                onChange({ preset: "custom", custom: range });
                close();
              }}
            >
              Apply range
            </button>

            <div className={styles.resolvedCaption}>
              → showing {resolved.label}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* ---------- overflow popover ---------- */

function MoreChips({
  hidden,
  onRemove,
}: {
  hidden: ActiveFilter[];
  onRemove: (f: ActiveFilter) => void;
}) {
  const { open, toggle, rootRef } = useFilterMenu([]);

  return (
    <div className={styles.popoverWrap} ref={rootRef}>
      <button
        type="button"
        className={styles.moreChip}
        onClick={toggle}
        aria-expanded={open}
      >
        +{hidden.length} more
        <Icon name="chevron-down" size={12} />
      </button>

      {open ? (
        <div className={styles.menu}>
          <div className={styles.menuHead}>Also applied</div>
          <div className={styles.menuScroll}>
            {hidden.map((filter) => {
              const { dimLabel, valueLabel: value } = describeFilter(filter);
              return (
                <div key={filterKey(filter)} className={styles.menuRow}>
                  <span className={styles.menuItemLabel}>
                    <span className={styles.menuRowDim}>{dimLabel}</span>
                    {value}
                  </span>
                  <button
                    type="button"
                    className={styles.chipRemove}
                    onClick={() => onRemove(filter)}
                    aria-label={`Remove ${dimLabel}: ${value}`}
                  >
                    <Icon name="x" size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* ---------- the bar ---------- */

export function GlobalFilterBar() {
  const api = useGlobalFilters();
  if (!api) return null;

  const { filters, date, catalogue, add, remove, clear, setDate } = api;

  // Defaults render as their own controls, so they never appear as chips.
  const defaults = defaultsFor(catalogue);
  const defaultSet = new Set<string>(defaults);
  /* A filter on a dimension this scope draws no dropdown for still has to be
     visible and removable, so it falls through to the chips. */
  const adhoc = filters.filter((f) => !defaultSet.has(f.dim));
  const shown = adhoc.slice(0, CHIP_BUDGET);
  const hidden = adhoc.slice(CHIP_BUDGET);
  const anything = filters.length > 0 || !isDefaultDate(date);

  return (
    <div className={styles.bar}>
      <DatePicker date={date} onChange={setDate} />

      <span className={styles.divider} aria-hidden="true" />

      {defaults.map((dim) => (
        <DefaultPicker
          key={dim}
          dim={dim}
          filters={filters}
          onAdd={add}
          onRemove={remove}
        />
      ))}

      <span className={styles.divider} aria-hidden="true" />

      {shown.map((filter) => {
        const { dimLabel, valueLabel: value } = describeFilter(filter);
        return (
          <span
            key={filterKey(filter)}
            className={styles.chip}
            title={`${dimLabel}: ${value}`}
          >
            <span className={styles.chipDim}>{dimLabel}</span>
            <span className={styles.chipValue}>{value}</span>
            <button
              type="button"
              className={styles.chipRemove}
              onClick={() => remove(filter)}
              aria-label={`Remove ${dimLabel}: ${value}`}
            >
              <Icon name="x" size={12} />
            </button>
          </span>
        );
      })}

      {hidden.length > 0 ? <MoreChips hidden={hidden} onRemove={remove} /> : null}

      <div className={styles.barEnd}>
        <DimensionMenu catalogue={catalogue} filters={filters} onAdd={add} />
        {anything ? (
          <button type="button" className={styles.clearAll} onClick={clear}>
            Clear all
          </button>
        ) : null}
      </div>
    </div>
  );
}
