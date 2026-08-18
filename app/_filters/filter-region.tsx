"use client";

import { Suspense, type ReactNode } from "react";
import {
  BARLESS_SCOPES,
  DATE_IN_PATH,
  FILTER_SCOPES,
  SCOPE_SEEDS,
  type FilterScopeId,
} from "./filter-scopes";
import { GlobalFilterBar } from "./global-filter-bar";
import { GlobalFilterProvider } from "./global-filter-context";
import styles from "./global-filter-bar.module.css";

/**
 * Mounts the global filter bar and its provider around a screen's content.
 *
 * `useSearchParams` opts a route into client-side rendering unless it sits
 * under a Suspense boundary, and three of these screens are prerendered per
 * month. The fallback renders nothing rather than a skeleton bar: the bar's
 * default state still depends on the query string, so a placeholder would only
 * be right for the unfiltered case and would flash on every filtered arrival.
 * The content below it is unaffected either way.
 */
/**
 * The provider alone, no bar.
 *
 * Split out because the two-rail shell needs the filter state to reach its
 * *rail* — Analytics' scope picker is a filter control that lives beside the
 * content rather than above it — while the bar still belongs inside `<main>`.
 * A provider that wrapped only the content could not serve both.
 */
export function FilterProvider({
  scope,
  children,
}: {
  scope: FilterScopeId;
  children: ReactNode;
}) {
  return (
    <Suspense fallback={children}>
      <GlobalFilterProvider
        dims={FILTER_SCOPES[scope]}
        dateInPath={DATE_IN_PATH.has(scope)}
        seed={SCOPE_SEEDS[scope]}
      >
        {children}
      </GlobalFilterProvider>
    </Suspense>
  );
}

/**
 * The bar itself, for a screen already inside a `FilterProvider`. Scopes in
 * `BARLESS_SCOPES` render their content and no bar — Store Explorer has its own
 * chip row, and a bar above it would be a second copy of the same control.
 */
export function FilterBar({
  scope,
  children,
}: {
  scope: FilterScopeId;
  children: ReactNode;
}) {
  if (BARLESS_SCOPES.has(scope)) return <>{children}</>;

  return (
    /* `display: contents` — this element exists only to publish the bar's
       height to the screens below it, not to add a box. */
    <div className={styles.region}>
      <GlobalFilterBar />
      {children}
    </div>
  );
}

/** Provider and bar together, for the single-column shell. */
export function FilterRegion({
  scope,
  children,
}: {
  scope: FilterScopeId;
  children: ReactNode;
}) {
  return (
    <FilterProvider scope={scope}>
      <FilterBar scope={scope}>{children}</FilterBar>
    </FilterProvider>
  );
}
