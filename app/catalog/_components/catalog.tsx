"use client";

import { useCallback, useMemo, useState } from "react";
import { filterSkus, type TriState } from "../_data/catalog";
import { CatalogOverview } from "./catalog-overview";
import { SkuPanel } from "./sku-panel";
import { ToothpasteDetail } from "./toothpaste-detail";

/**
 * Mirrors the design doc's component state: which of the two views is showing,
 * grid vs table, the open SKU index, and the two SKU filters.
 */
export function Catalog() {
  const [view, setView] = useState<"overview" | "detail">("overview");
  const [mode, setMode] = useState<"grid" | "table">("grid");
  const [sku, setSku] = useState<number | null>(null);
  const [packshot, setPackshot] = useState<TriState>("all");
  const [trained, setTrained] = useState<TriState>("all");

  const openToothpaste = useCallback(() => setView("detail"), []);

  // Going back deliberately keeps the filters and view mode — only the
  // slide-over is dismissed, exactly as the design's `goOverview` did.
  const backToOverview = useCallback(() => {
    setView("overview");
    setSku(null);
  }, []);

  const closePanel = useCallback(() => setSku(null), []);

  const skus = useMemo(
    () => filterSkus(packshot, trained),
    [packshot, trained],
  );

  return (
    <>
      {view === "overview" ? (
        <CatalogOverview onOpenCategory={openToothpaste} />
      ) : (
        <ToothpasteDetail
          mode={mode}
          onModeChange={setMode}
          packshot={packshot}
          onPackshotChange={setPackshot}
          trained={trained}
          onTrainedChange={setTrained}
          skus={skus}
          onBack={backToOverview}
          onOpenSku={setSku}
        />
      )}

      {sku !== null ? <SkuPanel index={sku} onClose={closePanel} /> : null}
    </>
  );
}
