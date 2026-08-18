import { Icon } from "@/app/_components/icon";
import { ExportButton } from "@/app/_export/export-button";
import {
  OWNERSHIP_FILTERS,
  PACKSHOT_FILTERS,
  TOOTHPASTE,
  skuCsv,
  TRAINED_FILTERS,
  type Ownership,
  type Sku,
  type TriState,
} from "../_data/catalog";
import { AccuracyTable } from "./accuracy-table";
import { BrandFilter } from "./brand-filter";
import { SkuGrid, SkuTable } from "./sku-views";
import styles from "./catalog.module.css";

type ViewMode = "grid" | "table" | "accuracy";

type ToothpasteDetailProps = {
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
  packshot: TriState;
  onPackshotChange: (value: TriState) => void;
  trained: TriState;
  onTrainedChange: (value: TriState) => void;
  ownership: "all" | Ownership;
  onOwnershipChange: (value: "all" | Ownership) => void;
  brands: string[];
  onBrandsChange: (brands: string[]) => void;
  query: string;
  onQueryChange: (query: string) => void;
  skus: Sku[];
  onBack: () => void;
  onOpenSku: (index: number) => void;
};

type FilterGroupProps<T extends string> = {
  label: string;
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
};

function FilterGroup<T extends string>({ label, options, value, onChange }: FilterGroupProps<T>) {
  return (
    <div className={styles.filterGroup}>
      <span className={styles.filterLabel}>{label}</span>
      <div className={styles.segmented} role="group" aria-label={label}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={styles.filterButton}
            data-active={option.value === value}
            aria-pressed={option.value === value}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ToothpasteDetail({
  mode,
  onModeChange,
  packshot,
  onPackshotChange,
  trained,
  onTrainedChange,
  ownership,
  onOwnershipChange,
  brands,
  onBrandsChange,
  query,
  onQueryChange,
  skus,
  onBack,
  onOpenSku,
}: ToothpasteDetailProps) {
  return (
    <div className={styles.detail}>
      <div className={styles.breadcrumb}>
        <button
          type="button"
          className={`${styles.reset} ${styles.crumbLink}`}
          onClick={onBack}
        >
          Catalog
        </button>
        <span className={styles.crumbSeparator} aria-hidden="true">
          <Icon name="chevron-right" size={15} />
        </span>
        <span className={styles.crumbCurrent}>{TOOTHPASTE.title}</span>
      </div>

      <div className={styles.detailHead}>
        <div>
          <h1 className={styles.detailTitle}>{TOOTHPASTE.title}</h1>
          <div className={styles.detailSubtitle}>{TOOTHPASTE.subtitle}</div>
        </div>

        <div className={styles.detailTools}>
          {/* Exports the filtered rows the table is showing, not the whole
              fixture — the same rule every other export on the platform
              follows. */}
          <ExportButton
            table={skuCsv(skus)}
            filename="catalog-toothpaste"
            className={styles.exportButton}
          />

          <div className={styles.search}>
            <Icon name="search" aria-hidden="true" />
            {/* Matches name and brand, so "optic" and "colgate" both find
                something without the reader knowing which field they typed at. */}
            <input
              type="search"
              className={styles.searchInput}
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Search SKUs…"
              aria-label="Search SKUs"
            />
          </div>

          <div className={styles.segmented} role="group" aria-label="View mode">
            <button
              type="button"
              className={styles.modeButton}
              data-active={mode === "grid"}
              aria-pressed={mode === "grid"}
              onClick={() => onModeChange("grid")}
            >
              <Icon name="layout-grid" />
              Grid
            </button>
            <button
              type="button"
              className={styles.modeButton}
              data-active={mode === "table"}
              aria-pressed={mode === "table"}
              onClick={() => onModeChange("table")}
            >
              <Icon name="list" />
              Table
            </button>
            <button
              type="button"
              className={styles.modeButton}
              data-active={mode === "accuracy"}
              aria-pressed={mode === "accuracy"}
              onClick={() => onModeChange("accuracy")}
            >
              <Icon name="target" />
              Accuracy
            </button>
          </div>
        </div>
      </div>

      <div className={styles.filterRow}>
        {/* Where the brand chips used to sit. They looked like a filter,
            filtered nothing, and counted SKUs that were not there. */}
        <BrandFilter selected={brands} onChange={onBrandsChange} />
        <FilterGroup
          label="Pack shot"
          options={PACKSHOT_FILTERS}
          value={packshot}
          onChange={onPackshotChange}
        />
        <FilterGroup
          label="SKU trained"
          options={TRAINED_FILTERS}
          value={trained}
          onChange={onTrainedChange}
        />
        <FilterGroup
          label="Ownership"
          options={OWNERSHIP_FILTERS}
          value={ownership}
          onChange={onOwnershipChange}
        />
        <span className={styles.skuCount}>{skus.length} SKUs</span>
      </div>

      {mode === "grid" ? (
        <SkuGrid skus={skus} onOpen={onOpenSku} />
      ) : mode === "table" ? (
        <SkuTable skus={skus} onOpen={onOpenSku} />
      ) : (
        <AccuracyTable skus={skus} onOpen={onOpenSku} />
      )}
    </div>
  );
}
