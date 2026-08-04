"use client";

import { useCallback, useState } from "react";
import { type ActiveFilter, filterKey } from "./model";

/**
 * Active filters, defaulting to none.
 *
 * The design draws two chips on load, but making those live would mean the
 * screen opens already filtered and the designer's headline figures never
 * appear. They are offered as suggestions in the Add-filter menu instead.
 */
export function useFilters(initial: ActiveFilter[] = []) {
  const [filters, setFilters] = useState<ActiveFilter[]>(initial);

  const add = useCallback((filter: ActiveFilter) => {
    setFilters((current) =>
      current.some((f) => filterKey(f) === filterKey(filter))
        ? current
        : [...current, filter],
    );
  }, []);

  const remove = useCallback((filter: ActiveFilter) => {
    setFilters((current) =>
      current.filter((f) => filterKey(f) !== filterKey(filter)),
    );
  }, []);

  const clear = useCallback(() => setFilters([]), []);

  return { filters, add, remove, clear, replace: setFilters };
}
