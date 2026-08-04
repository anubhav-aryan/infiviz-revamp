"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import type { CsvTable } from "@/app/_export/csv";
import {
  filterKey,
  parseFilters,
  serializeFilters,
  type ActiveFilter,
} from "@/app/_filters/model";
import {
  CURRENT_MONTH,
  isMonthKey,
  previousMonth,
  type MonthKey,
} from "@/app/_time/periods";
import {
  DEFAULT_DIM,
  DIM_OPTIONS,
  FILTER_DIMENSIONS,
  PRECOMPUTED,
  buildView,
  exportFilename,
  missingCsv,
  rankedCsv,
  type DimKey,
  type Persona,
} from "../_data/analytics";
import { AnalyticsHeader } from "./analytics-header";
import { CategoryBody } from "./category-body";
import { ExecBody } from "./exec-body";
import { FieldBody } from "./field-body";
import { RegionalBody } from "./regional-body";
import { Segmented } from "./shared";

/**
 * Persona, month, dimension, compare and filters all live in the URL, so a view
 * can be linked, bookmarked and walked back through with the browser's own
 * history. Defaults are omitted from the query string, which keeps the opening
 * state a bare `/analytics`.
 */
type Scope = {
  persona: Persona;
  dim: DimKey;
  period: MonthKey;
  compare: boolean;
  filters: ActiveFilter[];
};

function isPersona(value: string | null): value is Persona {
  return (
    value === "exec" ||
    value === "regional" ||
    value === "category" ||
    value === "field"
  );
}

/** A dimension the incoming persona has no option for is not a dimension. */
function readDim(persona: Persona, raw: string | null): DimKey {
  const options: readonly string[] = DIM_OPTIONS[persona];
  return raw && options.includes(raw) ? (raw as DimKey) : DEFAULT_DIM[persona];
}

function toQuery(scope: Scope): string {
  const query = new URLSearchParams();
  if (scope.persona !== "exec") query.set("persona", scope.persona);
  if (scope.dim !== DEFAULT_DIM[scope.persona]) query.set("dim", scope.dim);
  if (scope.period !== CURRENT_MONTH) query.set("month", scope.period);
  if (scope.compare) query.set("compare", "1");
  if (scope.filters.length) query.set("f", serializeFilters(scope.filters));
  return query.toString();
}

export function Analytics() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const rawPersona = params.get("persona");
  const persona: Persona = isPersona(rawPersona) ? rawPersona : "exec";
  const dim = readDim(persona, params.get("dim"));

  const rawMonth = params.get("month");
  const period: MonthKey =
    rawMonth && isMonthKey(rawMonth) ? rawMonth : CURRENT_MONTH;

  const compare = params.get("compare") === "1";

  const rawFilters = params.get("f") ?? "";
  const filters = useMemo(
    () => parseFilters(rawFilters, FILTER_DIMENSIONS),
    [rawFilters],
  );

  // Unfiltered is the overwhelmingly common case and every month of it is
  // already built, so the first render after hydration recomputes nothing.
  const view = useMemo(
    () => (filters.length ? buildView(period, filters) : PRECOMPUTED[period]),
    [period, filters],
  );

  // The competitor breakout is a way of looking at one panel rather than a
  // scope, so it stays out of the URL alongside the rest of the state.
  const [breakout, setBreakout] = useState(false);
  const toggleBreakout = useCallback(() => setBreakout((on) => !on), []);

  const navigate = useCallback(
    (scope: Scope) => {
      const query = toQuery(scope);
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [router, pathname],
  );

  // The scope is rebuilt from the URL on every render, so memoising the
  // handlers that close over it would only ever produce a fresh closure anyway.
  const scope: Scope = { persona, dim, period, compare, filters };

  // Each persona slices by a different set of dimensions, so the picker cannot
  // carry a selection the incoming persona has no option for.
  const changePersona = (next: Persona) =>
    navigate({ ...scope, persona: next, dim: DEFAULT_DIM[next] });

  const changeDim = (next: DimKey) => navigate({ ...scope, dim: next });

  const changePeriod = (next: MonthKey) =>
    navigate({
      ...scope,
      period: next,
      // Nothing precedes February inside the authored window.
      compare: compare && previousMonth(next) !== null,
    });

  const changeCompare = (next: boolean) => navigate({ ...scope, compare: next });

  const addFilter = (filter: ActiveFilter) => {
    if (filters.some((f) => filterKey(f) === filterKey(filter))) return;
    navigate({ ...scope, filters: [...filters, filter] });
  };

  const removeFilter = (filter: ActiveFilter) =>
    navigate({
      ...scope,
      filters: filters.filter((f) => filterKey(f) !== filterKey(filter)),
    });

  const applyView = (nextPeriod: MonthKey, nextFilters: ActiveFilter[]) =>
    navigate({
      ...scope,
      period: nextPeriod,
      filters: nextFilters,
      compare: compare && previousMonth(nextPeriod) !== null,
    });

  const dimPicker = (
    <Segmented
      options={DIM_OPTIONS[persona]}
      value={dim}
      onChange={changeDim}
      label="Dimension"
    />
  );

  // The category persona draws no ranked list, so what it exports is the SKU
  // table it actually reads.
  const exportTable: CsvTable =
    persona === "category"
      ? missingCsv(view.whatsMissing)
      : rankedCsv(dim, view.ranked[dim]);

  return (
    <>
      <AnalyticsHeader
        persona={persona}
        onPersonaChange={changePersona}
        period={period}
        onPeriodChange={changePeriod}
        compare={compare}
        onCompareChange={changeCompare}
        comparable={previousMonth(period) !== null}
        coverage={view.coverage}
        filters={filters}
        onAddFilter={addFilter}
        onRemoveFilter={removeFilter}
        onApplyView={applyView}
        exportTable={exportTable}
        exportFilename={exportFilename(persona, dim, period)}
      />

      {persona === "exec" ? (
        <ExecBody view={view} dim={dim} dimPicker={dimPicker} compare={compare} />
      ) : null}
      {persona === "regional" ? (
        <RegionalBody
          view={view}
          dim={dim}
          dimPicker={dimPicker}
          compare={compare}
        />
      ) : null}
      {persona === "category" ? (
        <CategoryBody
          view={view}
          breakout={breakout}
          onToggleBreakout={toggleBreakout}
          dimPicker={dimPicker}
          compare={compare}
        />
      ) : null}
      {persona === "field" ? (
        <FieldBody view={view} dim={dim} dimPicker={dimPicker} compare={compare} />
      ) : null}
    </>
  );
}
