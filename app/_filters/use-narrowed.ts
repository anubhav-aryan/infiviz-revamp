"use client";

import { useMemo } from "react";
import { useGlobalFilters } from "./global-filter-context";
import { narrowFilters, type Accessors } from "./model";

/**
 * Narrows a precomputed row set by whatever the global bar currently holds.
 *
 * Always `narrowFilters`, never `applyFilters`: these reports are reached with
 * a filter set assembled on some other screen, so most of what arrives is a
 * dimension the rows cannot answer for. Abstaining on those is the difference
 * between "this table ignored a filter it has no opinion on" and "this table is
 * empty".
 */
export function useNarrowed<T>(rows: T[], accessors: Accessors<T>): T[] {
  const api = useGlobalFilters();
  const filters = api?.filters;
  return useMemo(
    () => (filters?.length ? narrowFilters(rows, filters, accessors) : rows),
    [rows, filters, accessors],
  );
}

/** True when at least one active filter is one these rows can answer for. */
export function useIsNarrowed<T>(accessors: Accessors<T>): boolean {
  const api = useGlobalFilters();
  const filters = api?.filters;
  return useMemo(
    () => Boolean(filters?.some((f) => f.dim in accessors)),
    [filters, accessors],
  );
}
