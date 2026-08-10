"use client";

import { useCallback, useMemo, useState } from "react";
import { filterSkus, type Ownership, type TriState } from "../_data/catalog";
import { CatalogOverview } from "./catalog-overview";
import { SkuPanel } from "./sku-panel";
import { ToothpasteDetail } from "./toothpaste-detail";

/**
 * Mirrors the design doc's component state: which of the two views is showing,
 * grid vs table, the open SKU index, and the SKU filters.
 *
 * Mode defaults to `"table"` — a list of every SKU with accuracy at a glance
 * is the more useful landing state than a grid of product-image placeholders
 * this app has no real photography for.
 */
export function Catalog() {
  const [view, setView] = useState<"overview" | "detail">("overview");
  const [mode, setMode] = useState<"grid" | "table" | "accuracy">("table");
  const [sku, setSku] = useState<number | null>(null);
  const [packshot, setPackshot] = useState<TriState>("all");
  const [trained, setTrained] = useState<TriState>("all");
  const [ownership, setOwnership] = useState<"all" | Ownership>("all");

  const openToothpaste = useCallback(() => setView("detail"), []);

  // Going back deliberately keeps the filters and view mode — only the
  // slide-over is dismissed, exactly as the design's `goOverview` did.
  const backToOverview = useCallback(() => {
    setView("overview");
    setSku(null);
  }, []);

  const closePanel = useCallback(() => setSku(null), []);

  const skus = useMemo(
    () => filterSkus(packshot, trained, ownership),
    [packshot, trained, ownership],
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
          ownership={ownership}
          onOwnershipChange={setOwnership}
          skus={skus}
          onBack={backToOverview}
          onOpenSku={setSku}
        />
      )}

      {sku !== null ? <SkuPanel index={sku} onClose={closePanel} /> : null}
    </>
  );
}
