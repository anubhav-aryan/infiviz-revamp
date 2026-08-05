"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { Icon } from "@/app/_components/icon";
import type { CsvTable } from "@/app/_export/csv";
import { ExportButton } from "@/app/_export/export-button";
import {
  filterKey,
  filterLabel,
  hasFilter,
  type ActiveFilter,
  type FilterDimension,
} from "@/app/_filters/model";
import { useFilterMenu } from "@/app/_filters/use-filter-menu";
import { useSavedViews } from "@/app/_filters/use-saved-views";
import {
  MONTHS,
  MONTH_BY_KEY,
  isMonthKey,
  type MonthKey,
} from "@/app/_time/periods";
import {
  FILTER_DIMENSIONS,
  PERSONAS,
  SCOPE,
  SUGGESTED_FILTERS,
  type Persona,
} from "../_data/analytics";
import {
  PERSONA_IDS,
  modulePath,
  railGroupsFor,
} from "../_data/module-matrix";
import styles from "./analytics.module.css";

/**
 * The month and saved-views popovers are one step deep, so they borrow
 * `useFilterMenu` purely for its open / close-on-outside-pointerdown / Escape
 * machine and never touch its dimension cursor. Duplicating that machine three
 * times to avoid one unused field would be the worse trade.
 */
const NO_DIMENSIONS: FilterDimension[] = [];

type AnalyticsHeaderProps = {
  persona: Persona;
  onPersonaChange: (persona: Persona) => void;
  period: MonthKey;
  onPeriodChange: (period: MonthKey) => void;
  compare: boolean;
  onCompareChange: (compare: boolean) => void;
  /** February has no earlier month inside the authored window. */
  comparable: boolean;
  coverage: number;
  filters: ActiveFilter[];
  onAddFilter: (filter: ActiveFilter) => void;
  onRemoveFilter: (filter: ActiveFilter) => void;
  onApplyView: (period: MonthKey, filters: ActiveFilter[]) => void;
  exportTable: CsvTable;
  exportFilename: string;
};

/**
 * Where each persona's "all modules" link lands — the first module in that
 * persona's rail. Derived from the same matrix the rail and the route list use,
 * so it cannot point at a module the persona does not have.
 */
const MODULE_ENTRY: Record<Persona, string> = Object.fromEntries(
  PERSONA_IDS.map((id) => {
    const first = railGroupsFor(id)
      .flatMap((group) => group.items)
      .find((entry) => entry.built);
    return [id, first ? modulePath(id, first.id, first.tabs[0]) : "/analytics"];
  }),
) as Record<Persona, string>;

/** The three header rows are identical across all four personas. */
export function AnalyticsHeader({
  persona,
  onPersonaChange,
  period,
  onPeriodChange,
  compare,
  onCompareChange,
  comparable,
  coverage,
  filters,
  onAddFilter,
  onRemoveFilter,
  onApplyView,
  exportTable,
  exportFilename,
}: AnalyticsHeaderProps) {
  // Destructured on purpose: the linter treats the whole returned object as
  // ref-tainted while a plain field read is fine.
  const {
    open: monthOpen,
    toggle: toggleMonth,
    close: closeMonth,
    rootRef: monthRef,
  } = useFilterMenu(NO_DIMENSIONS);
  const {
    open: filterOpen,
    toggle: toggleFilterMenu,
    close: closeFilterMenu,
    setDim: setFilterDim,
    dimension: openDimension,
    rootRef: filterRef,
  } = useFilterMenu(FILTER_DIMENSIONS);
  const {
    open: viewsOpen,
    toggle: toggleViews,
    close: closeViews,
    rootRef: viewsRef,
  } = useFilterMenu(NO_DIMENSIONS);

  const savedViews = useSavedViews("analytics");
  const [viewName, setViewName] = useState("");

  const suggestions = SUGGESTED_FILTERS.filter(
    (f) => !hasFilter(filters, f.dim, f.value),
  );

  const addFilter = (filter: ActiveFilter) => {
    onAddFilter(filter);
    closeFilterMenu();
  };

  const saveView = () => {
    const name = viewName.trim();
    if (!name) return;
    savedViews.save(name, period, filters);
    setViewName("");
  };

  return (
    <>
      <div className={`${styles.headRow} ${styles.headRow1}`}>
        <div className={styles.titleGroup}>
          <div>
            <h1 className={styles.pageTitle}>Analytics</h1>
            <div className={styles.pageSubtitle}>Colgate-Palmolive Vietnam</div>
          </div>

          <div className={styles.segmented} role="group" aria-label="Persona">
            {PERSONAS.map((p) => (
              <button
                key={p.key}
                type="button"
                className={styles.segButton}
                data-active={p.key === persona}
                aria-pressed={p.key === persona}
                onClick={() => onPersonaChange(p.key)}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* The way down from the curated overview into the full modules.
              Lands on the module that persona's rail opens on, so the role you
              are reading as carries across. */}
          <Link href={MODULE_ENTRY[persona]} className={styles.detailLink}>
            All {PERSONAS.find((p) => p.key === persona)?.label.toLowerCase()} modules
            <Icon name="arrow-right" size={14} />
          </Link>
        </div>

        <div className={styles.headActions}>
          <span className={styles.pill}>
            <span className={styles.pillDot} aria-hidden="true" />
            Synced 12 min ago
          </span>
          <span className={styles.pill}>
            <Icon name="store" />
            {coverage}% coverage
          </span>
        </div>
      </div>

      <div className={`${styles.headRow} ${styles.headRow2}`}>
        {/* A caption, not a control. Nothing in these fixtures is scoped by
            region, so linking the crumbs would promise a scope change the data
            cannot deliver — they read as a path instead. */}
        <div className={styles.breadcrumb}>
          {SCOPE.map((crumb, i) => (
            <Fragment key={crumb.label}>
              {i > 0 ? (
                <span className={styles.crumbSep} aria-hidden="true">
                  <Icon name="chevron-right" size={15} />
                </span>
              ) : null}
              <span className={styles.crumb} data-current={crumb.current}>
                {crumb.label}
              </span>
            </Fragment>
          ))}
        </div>

        <div className={styles.headActions}>
          <div className={styles.menuAnchor} ref={monthRef}>
            <button
              type="button"
              className={styles.ghostButton}
              aria-haspopup="menu"
              aria-expanded={monthOpen}
              onClick={toggleMonth}
            >
              <Icon name="calendar" />
              {MONTH_BY_KEY[period].label}
              <Icon name="chevron-down" />
            </button>

            {monthOpen ? (
              <div className={styles.menu} role="menu" aria-label="Reporting month">
                {MONTHS.map((month) => (
                  <button
                    key={month.key}
                    type="button"
                    role="menuitemradio"
                    aria-checked={month.key === period}
                    className={styles.menuItem}
                    data-active={month.key === period}
                    onClick={() => {
                      onPeriodChange(month.key);
                      closeMonth();
                    }}
                  >
                    {month.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <button
            type="button"
            className={styles.ghostButton}
            data-active={compare}
            aria-pressed={compare}
            disabled={!comparable}
            onClick={() => onCompareChange(!compare)}
          >
            <Icon name="git-compare" />
            Compare to previous month
          </button>
        </div>
      </div>

      <div className={`${styles.headRow} ${styles.headRow3}`}>
        <div className={styles.chips}>
          {filters.map((filter) => (
            <span key={filterKey(filter)} className={styles.chip}>
              {filterLabel(filter)}
              <button
                type="button"
                className={styles.chipRemove}
                aria-label={`Remove filter ${filterLabel(filter)}`}
                onClick={() => onRemoveFilter(filter)}
              >
                <Icon name="x" size={13} />
              </button>
            </span>
          ))}

          <div className={styles.menuAnchor} ref={filterRef}>
            <button
              type="button"
              className={styles.addFilter}
              aria-expanded={filterOpen}
              onClick={toggleFilterMenu}
            >
              <Icon name="plus" size={14} />
              Add filter
            </button>

            {filterOpen ? (
              <div className={styles.menu} data-wide="true">
                {openDimension ? (
                  <>
                    <button
                      type="button"
                      className={styles.menuBack}
                      onClick={() => setFilterDim(null)}
                    >
                      <Icon name="chevron-left" size={14} />
                      {openDimension.label}
                    </button>
                    <div className={styles.menuScroll}>
                      {openDimension.values.map((value) => {
                        const on = hasFilter(filters, openDimension.key, value);
                        return (
                          <button
                            key={value}
                            type="button"
                            className={styles.menuItem}
                            data-active={on}
                            disabled={on}
                            onClick={() =>
                              addFilter({ dim: openDimension.key, value })
                            }
                          >
                            {value}
                          </button>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <>
                    {suggestions.length ? (
                      <>
                        <div className={styles.menuLabel}>Suggested</div>
                        {suggestions.map((filter) => (
                          <button
                            key={filterKey(filter)}
                            type="button"
                            className={styles.menuItem}
                            onClick={() => addFilter(filter)}
                          >
                            {filterLabel(filter)}
                          </button>
                        ))}
                      </>
                    ) : null}

                    <div className={styles.menuLabel}>Filter by</div>
                    <div className={styles.menuScroll}>
                      {FILTER_DIMENSIONS.map((dimension) => (
                        <button
                          key={dimension.key}
                          type="button"
                          className={styles.menuItem}
                          onClick={() => setFilterDim(dimension.key)}
                        >
                          {dimension.label}
                          <span className={styles.menuCount}>
                            {dimension.values.length}
                          </span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : null}
          </div>
        </div>

        <div className={styles.headActions}>
          <div className={styles.menuAnchor} ref={viewsRef}>
            <button
              type="button"
              className={styles.ghostButton}
              aria-expanded={viewsOpen}
              onClick={toggleViews}
            >
              <Icon name="bookmark" />
              Saved views
            </button>

            {viewsOpen ? (
              <div className={`${styles.menu} ${styles.menuRight}`} data-wide="true">
                <div className={styles.menuLabel}>Saved views</div>

                {savedViews.views.length === 0 ? (
                  <div className={styles.menuEmpty}>
                    {savedViews.ready
                      ? "Nothing saved yet. Name the current month and filters below to keep them."
                      : "Loading…"}
                  </div>
                ) : (
                  <div className={styles.menuScroll}>
                    {savedViews.views.map((view) => (
                      <div key={view.id} className={styles.savedRow}>
                        <button
                          type="button"
                          className={styles.savedApply}
                          // A view saved before the window changed still names a
                          // month; fall back rather than restore a period that
                          // has no data behind it.
                          onClick={() => {
                            onApplyView(
                              isMonthKey(view.period) ? view.period : period,
                              view.filters,
                            );
                            closeViews();
                          }}
                        >
                          <span className={styles.savedName}>{view.name}</span>
                          <span className={styles.savedMeta}>
                            {isMonthKey(view.period)
                              ? MONTH_BY_KEY[view.period].label
                              : view.period}
                            {view.filters.length
                              ? ` · ${view.filters.length} filter${view.filters.length > 1 ? "s" : ""}`
                              : " · no filters"}
                          </span>
                        </button>
                        <button
                          type="button"
                          className={styles.savedDelete}
                          aria-label={`Delete saved view ${view.name}`}
                          onClick={() => savedViews.remove(view.id)}
                        >
                          <Icon name="x" size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <form
                  className={styles.saveForm}
                  onSubmit={(event) => {
                    event.preventDefault();
                    saveView();
                  }}
                >
                  <input
                    className={styles.saveInput}
                    value={viewName}
                    onChange={(event) => setViewName(event.target.value)}
                    placeholder="Name this view"
                    aria-label="Name this view"
                  />
                  <button
                    type="submit"
                    className={styles.saveButton}
                    disabled={viewName.trim() === ""}
                  >
                    Save
                  </button>
                </form>
              </div>
            ) : null}
          </div>

          <ExportButton
            table={exportTable}
            filename={exportFilename}
            label="Export"
            className={styles.primaryButton}
          />
        </div>
      </div>
    </>
  );
}
