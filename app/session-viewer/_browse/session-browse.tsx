"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useGlobalFilters } from "@/app/_filters/global-filter-context";
import type { ActiveFilter } from "@/app/_filters/model";
import { parsePeriod, serializePeriod, type Period } from "@/app/_data/visit-period";
import { build, factsFor, unfilteredView, type Visit } from "@/app/_data/visits";
import { slugifyStore } from "../_data/session-viewer";
import { ExplorerView } from "./explorer-view";
import styles from "./browse.module.css";

/**
 * Which visits happened, on a map and in a list — the way into a capture.
 *
 * This is the Session Viewer's index. A shelf figure is only worth reading once
 * you know whose shelf it was, so the screen opens on the estate and a row
 * takes you to that store's capture.
 *
 * It keeps its own filter row rather than the global bar, because it asks a
 * different question — which stores were visited, over what period — and a bar
 * scoped to a dashboard's question sitting above it would be a second copy of
 * the same control. But the *set* is the global one: a slice chosen here is the
 * slice the dashboards open on, and the reverse.
 *
 * The period does not join it. This screen's is day-grained and the global date
 * resolves to a month; folding one into the other would throw the day away.
 */
export function SessionBrowse() {
  return (
    <Suspense fallback={<BrowseSkeleton />}>
      <SessionBrowseInner />
    </Suspense>
  );
}

const PATH = "/session-viewer";

/** Stable identity for the no-provider case, so the memos below don't churn. */
const EMPTY_FILTERS: ActiveFilter[] = [];

function SessionBrowseInner() {
  const router = useRouter();
  const params = useSearchParams();

  const [period, setPeriod] = useState<Period>(() => parsePeriod(params.get("period")));
  /* `?f=` is read and written by the provider, not here. */
  const api = useGlobalFilters();
  const filters = api?.filters ?? EMPTY_FILTERS;

  const [mapOpen, setMapOpen] = useState(true);
  const [listView, setListView] = useState<"list" | "gallery">("list");

  const current = params.toString();

  /* Only the period is written here — the provider owns `?f=`. Merging rather
     than rebuilding the query, so this does not clobber the filters it writes. */
  useEffect(() => {
    const query = new URLSearchParams(current);
    const encodedPeriod = serializePeriod(period);
    if (encodedPeriod) query.set("period", encodedPeriod);
    else query.delete("period");

    const next = query.toString();
    if (next === current) return;
    // `replace`, not `push`: changing the period is not a place to go back to.
    router.replace(next ? `${PATH}?${next}` : PATH, { scroll: false });
  }, [period, current, router]);

  const facts = useMemo(() => factsFor(period), [period]);

  // The unfiltered path reads a value built at module scope, so the first
  // client render is identical to the one the server produced.
  const view = useMemo(
    () => (filters.length ? build(factsFor(period), filters) : unfilteredView(period)),
    [period, filters],
  );

  const applySavedView = useCallback(
    (savedPeriod: Period, savedFilters: ActiveFilter[]) => {
      setPeriod(savedPeriod);
      api?.setFilters(savedFilters);
    },
    [api],
  );

  /**
   * Opening a row is a navigation, not a screen swap.
   *
   * It used to open an in-page photo gallery. The capture is a real route now,
   * so it can be linked, shared and arrived at from Analytics — and the reader
   * lands on the stitched shelf and its numbers rather than a contact sheet.
   */
  const openVisit = useCallback(
    (visit: Visit) => router.push(`${PATH}/${slugifyStore(visit.store)}`),
    [router],
  );

  return (
    <ExplorerView
      view={view}
      facts={facts}
      period={period}
      onPeriodChange={setPeriod}
      filters={filters}
      onAddFilter={(filter) => api?.add(filter)}
      onRemoveFilter={(filter) => api?.remove(filter)}
      onClearFilters={() => api?.clear()}
      onApplySavedView={applySavedView}
      mapOpen={mapOpen}
      onToggleMap={() => setMapOpen((open) => !open)}
      listView={listView}
      onListViewChange={setListView}
      onOpenVisit={openVisit}
    />
  );
}

/** What the static shell paints while the query string is being read. */
function BrowseSkeleton() {
  return (
    <div className={styles.explorer} aria-busy="true">
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Session Viewer</h1>
          <div className={styles.pageSubtitle}>
            Colgate-Palmolive Vietnam · which stores were visited
          </div>
        </div>
      </div>

      <div className={styles.summaryGrid} aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={styles.summaryTile}>
            <span className={`${styles.summaryIcon} ${styles.skeletonBlock}`} />
            <div>
              <div className={`${styles.skeletonBlock} ${styles.skeletonValue}`} />
              <div className={`${styles.skeletonBlock} ${styles.skeletonLabel}`} />
            </div>
          </div>
        ))}
      </div>

      <div className={`${styles.card} ${styles.skeletonPanel}`} aria-hidden="true" />
    </div>
  );
}
