"use client";

import { useCallback, useState } from "react";
import { PHOTOS } from "../_data/store-explorer";
import { AppImagesView } from "./app-images-view";
import { ExplorerView } from "./explorer-view";
import { PhotoLightbox } from "./photo-lightbox";

/**
 * Mirrors the design doc's component state: which of the two views is showing,
 * whether the map panel is open, list vs gallery, and the open photo index.
 */
export function StoreExplorer() {
  const [view, setView] = useState<"explorer" | "images">("explorer");
  const [mapOpen, setMapOpen] = useState(true);
  const [listView, setListView] = useState<"list" | "gallery">("list");
  const [lightbox, setLightbox] = useState<number | null>(null);

  const openImages = useCallback(() => {
    setView("images");
    setLightbox(null);
  }, []);

  const backToExplorer = useCallback(() => {
    setView("explorer");
    setLightbox(null);
  }, []);

  const closeLightbox = useCallback(() => setLightbox(null), []);
  const prevPhoto = useCallback(
    () => setLightbox((i) => Math.max(0, (i ?? 0) - 1)),
    [],
  );
  const nextPhoto = useCallback(
    () => setLightbox((i) => Math.min(PHOTOS.length - 1, (i ?? 0) + 1)),
    [],
  );

  return (
    <>
      {view === "explorer" ? (
        <ExplorerView
          mapOpen={mapOpen}
          onToggleMap={() => setMapOpen((open) => !open)}
          listView={listView}
          onListViewChange={setListView}
          onOpenVisit={openImages}
        />
      ) : (
        <AppImagesView onBack={backToExplorer} onOpenPhoto={setLightbox} />
      )}

      {lightbox !== null ? (
        <PhotoLightbox
          index={lightbox}
          onClose={closeLightbox}
          onPrev={prevPhoto}
          onNext={nextPhoto}
        />
      ) : null}
    </>
  );
}
