"use client";

import { Suspense, useCallback, useMemo, useState } from "react";
import type { ActiveFilter } from "@/app/_filters/model";
import { useGlobalFilters } from "@/app/_filters/global-filter-context";
import { periodForDate, type Period } from "../_data/period";
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
 * The filter set and the period now come from the global bar, which owns the
 * query string. This screen used to seed `useState` from `?f=` once and write
 * the URL downstream — the inversion that made filters vanish the moment you
 * navigated away and back. It reads, it does not own.
 */
export function StoreExplorer() {
  return (
    <Suspense fallback={<ExplorerSkeleton />}>
      <StoreExplorerInner />
    </Suspense>
  );
}

function StoreExplorerInner() {
  const globalFilters = useGlobalFilters();
  const filters = useMemo(() => globalFilters?.filters ?? [], [globalFilters]);

  /* The bar carries one date token; this screen resolves it to the `Period` its
     fixtures are keyed by, the same way the month screens resolve it to a
     `MonthKey`. One token, one resolver per screen. */
  const period = useMemo<Period>(
    () => periodForDate(globalFilters?.date),
    [globalFilters?.date],
  );

  const clear = useCallback(() => globalFilters?.clear(), [globalFilters]);

  // Carries the visit the "images" screen is drilled into, so Open shows the
  // row that was actually clicked instead of a fixed fixture regardless of
  // which one it was.
  const [screen, setScreen] = useState<
    { name: "explorer" } | { name: "images"; visit: Visit }
  >({ name: "explorer" });
  const [mapOpen, setMapOpen] = useState(true);
  const [listView, setListView] = useState<"list" | "gallery">("list");
  const [lightbox, setLightbox] = useState<number | null>(null);


  // The unfiltered path reads a value built at module scope, so the first
  // client render is identical to the one the server produced.
  const view = useMemo(
    () => (filters.length ? build(factsFor(period), filters) : unfilteredView(period)),
    [period, filters],
  );

  /* Saved views predate the global bar and still restore a filter set; the
     period they carry is now the bar's to set, so it is replayed as filters
     only. */
  const applySavedView = useCallback(
    (_savedPeriod: Period, savedFilters: ActiveFilter[]) => {
      if (!globalFilters) return;
      globalFilters.clear();
      for (const filter of savedFilters) globalFilters.add(filter);
    },
    [globalFilters],
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
          period={period}
          filters={filters}
          onClearFilters={clear}
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
