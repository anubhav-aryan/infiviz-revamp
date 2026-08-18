"use client";

import { Suspense, type ReactNode } from "react";
import {
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
export function FilterRegion({
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
        {/* `display: contents` — this element exists only to publish the bar's
            height to the screens below it, not to add a box. */}
        <div className={styles.region}>
          <GlobalFilterBar />
          {children}
        </div>
      </GlobalFilterProvider>
    </Suspense>
  );
}
