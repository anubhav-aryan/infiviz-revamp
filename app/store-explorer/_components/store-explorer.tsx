"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useGlobalFilters } from "@/app/_filters/global-filter-context";
import type { ActiveFilter } from "@/app/_filters/model";
import { parsePeriod, serializePeriod, type Period } from "../_data/period";
import {
  build,
  factsFor,
  photosFor,
  unfilteredView,
  type Visit,
} from "../_data/store-explorer";
import { AppImagesView } from "./app-images-view";
import { ExplorerView } from "./explorer-view";
import { PhotoLightbox } from "./photo-lightbox";
import styles from "./store-explorer.module.css";

/**
 * Store Explorer keeps its own filter row and shares the state behind it.
 *
 * The row stays because this screen asks a different question — which stores
 * were visited, over what period — and a bar scoped to a dashboard's question
 * sitting above it would be a second copy of the same control. But the *set* is
 * now the global one: the catalogue was always the canonical registry and the
 * serialization was always the bar's own `?f=`, so the two were the same data
 * behind two providers, free to disagree the moment you navigated between them.
 * A slice chosen here is the slice the dashboards open on, and the reverse.
 *
 * The period does not join it. This screen's is day-grained (`DayRef`) and the
 * global date resolves to a month; folding one into the other would throw the
 * day away.
 */
export function StoreExplorer() {
  return (
    <Suspense fallback={<ExplorerSkeleton />}>
      <StoreExplorerInner />
    </Suspense>
  );
}

const PATH = "/store-explorer";

/** Stable identity for the no-provider case, so the memos below don't churn. */
const EMPTY_FILTERS: ActiveFilter[] = [];

function StoreExplorerInner() {
  const router = useRouter();
  const params = useSearchParams();

  const [period, setPeriod] = useState<Period>(() =>
    parsePeriod(params.get("period")),
  );
  /* `?f=` is read and written by the provider now, not here. Outside one there
     is nothing to filter with, which is the same contract every other consumer
     of this hook follows. */
  const api = useGlobalFilters();
  const filters = api?.filters ?? EMPTY_FILTERS;

  // Carries the visit the "images" screen is drilled into, so Open shows the
  // row that was actually clicked instead of a fixed fixture regardless of
  // which one it was.
  const [screen, setScreen] = useState<
    { name: "explorer" } | { name: "images"; visit: Visit }
  >({ name: "explorer" });
  const [mapOpen, setMapOpen] = useState(true);
  const [listView, setListView] = useState<"list" | "gallery">("list");
  const [lightbox, setLightbox] = useState<number | null>(null);


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

  const openImages = useCallback((visit: Visit) => {
    setScreen({ name: "images", visit });
    setLightbox(null);
  }, []);

  const backToExplorer = useCallback(() => {
    setScreen({ name: "explorer" });
    setLightbox(null);
  }, []);

  const openPhotos = screen.name === "images" ? photosFor(screen.visit) : [];

  const closeLightbox = useCallback(() => setLightbox(null), []);
  const prevPhoto = useCallback(
    () => setLightbox((i) => Math.max(0, (i ?? 0) - 1)),
    [],
  );
  const nextPhoto = useCallback(
    () => setLightbox((i) => Math.min(openPhotos.length - 1, (i ?? 0) + 1)),
    [openPhotos.length],
  );

  return (
    <>
      {screen.name === "explorer" ? (
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
          onOpenVisit={openImages}
        />
      ) : (
        <AppImagesView
          visit={screen.visit}
          onBack={backToExplorer}
          onOpenPhoto={setLightbox}
        />
      )}

      {lightbox !== null ? (
        <PhotoLightbox
          photos={openPhotos}
          index={lightbox}
          onClose={closeLightbox}
          onPrev={prevPhoto}
          onNext={nextPhoto}
        />
      ) : null}
    </>
  );
}

/** What the static shell paints while the query string is being read. */
function ExplorerSkeleton() {
  return (
    <div className={styles.explorer} aria-busy="true">
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Store Explorer</h1>
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

      <div
        className={`${styles.card} ${styles.skeletonPanel}`}
        aria-hidden="true"
      />
    </div>
  );
}
