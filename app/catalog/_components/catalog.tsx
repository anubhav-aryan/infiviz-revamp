"use client";

import { useCallback, useMemo, useState } from "react";
import {
  NO_SKU_FILTERS,
  filterCategories,
  filterSkus,
  type Ownership,
  type TriState,
} from "../_data/catalog";
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
  const [brands, setBrands] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  /** The overview's own search — categories, not SKUs. */
  const [categoryQuery, setCategoryQuery] = useState("");

  const openToothpaste = useCallback(() => setView("detail"), []);

  // Going back deliberately keeps the filters and view mode — only the
  // slide-over is dismissed, exactly as the design's `goOverview` did.
  const backToOverview = useCallback(() => {
    setView("overview");
    setSku(null);
  }, []);

  const closePanel = useCallback(() => setSku(null), []);

  const skus = useMemo(
    () => filterSkus({ ...NO_SKU_FILTERS, packshot, trained, ownership, brands, query }),
    [packshot, trained, ownership, brands, query],
  );

  const categories = useMemo(() => filterCategories(categoryQuery), [categoryQuery]);

  return (
    <>
      {view === "overview" ? (
        <CatalogOverview
          categories={categories}
          query={categoryQuery}
          onQueryChange={setCategoryQuery}
          onOpenCategory={openToothpaste}
        />
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
          brands={brands}
          onBrandsChange={setBrands}
          query={query}
          onQueryChange={setQuery}
          skus={skus}
          onBack={backToOverview}
          onOpenSku={setSku}
        />
      )}

      {sku !== null ? <SkuPanel index={sku} onClose={closePanel} /> : null}
    </>
  );
}
