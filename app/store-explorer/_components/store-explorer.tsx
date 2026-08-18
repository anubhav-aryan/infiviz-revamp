"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import {
  parseFilters,
  serializeFilters,
  type ActiveFilter,
} from "@/app/_filters/model";
import { useFilters } from "@/app/_filters/use-filters";
import { parsePeriod, serializePeriod, type Period } from "../_data/period";
import {
  CATALOGUE,
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
 * Store Explorer owns its own filters again.
 *
 * The global bar covers the two dashboards, where the question is "what slice
 * of the business am I looking at". This screen is asking a different one —
 * which stores were visited, over what period — so it carries its own row
 * rather than borrowing a bar scoped to somebody else's question.
 *
 * The catalogue is still the canonical one from `_filters/registry.ts`, so a
 * filter set means the same thing here as it does on a dashboard.
 */
export function StoreExplorer() {
  return (
    <Suspense fallback={<ExplorerSkeleton />}>
      <StoreExplorerInner />
    </Suspense>
  );
}

const PATH = "/store-explorer";

function StoreExplorerInner() {
  const router = useRouter();
  const params = useSearchParams();

  const [period, setPeriod] = useState<Period>(() =>
    parsePeriod(params.get("period")),
  );
  const [initialFilters] = useState(() => parseFilters(params.get("f"), CATALOGUE));
  const { filters, add, remove, clear, replace } = useFilters(initialFilters);

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

  /* State is upstream of the URL here, which is the right way round for a
     screen that owns its own filters: the row is the source of truth and the
     query string is how it is shared. */
  useEffect(() => {
    const query = new URLSearchParams();
    const encodedPeriod = serializePeriod(period);
    if (encodedPeriod) query.set("period", encodedPeriod);
    const encodedFilters = serializeFilters(filters);
    if (encodedFilters) query.set("f", encodedFilters);

    const next = query.toString();
    if (next === current) return;
    // `replace`, not `push`: removing a chip is not a place to go back to.
    router.replace(next ? `${PATH}?${next}` : PATH, { scroll: false });
  }, [period, filters, current, router]);

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
      replace(savedFilters);
    },
    [replace],
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
          onAddFilter={add}
          onRemoveFilter={remove}
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
