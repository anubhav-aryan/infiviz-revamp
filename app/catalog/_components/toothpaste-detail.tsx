import { Icon } from "@/app/_components/icon";
import { ExportButton } from "@/app/_export/export-button";
import {
  BRAND_CHIPS,
  PACKSHOT_FILTERS,
  TOOTHPASTE,
  skuCsv,
  TRAINED_FILTERS,
  type Sku,
  type TriState,
} from "../_data/catalog";
import { SkuGrid, SkuTable } from "./sku-views";
import styles from "./catalog.module.css";

type ToothpasteDetailProps = {
  mode: "grid" | "table";
  onModeChange: (mode: "grid" | "table") => void;
  packshot: TriState;
  onPackshotChange: (value: TriState) => void;
  trained: TriState;
  onTrainedChange: (value: TriState) => void;
  skus: Sku[];
  onBack: () => void;
  onOpenSku: (index: number) => void;
};

type FilterGroupProps = {
  label: string;
  options: { label: string; value: TriState }[];
  value: TriState;
  onChange: (value: TriState) => void;
};

function FilterGroup({ label, options, value, onChange }: FilterGroupProps) {
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
            {/* Search has no backend behind it yet — the design drew a static
                field, so this one is present but disabled. */}
            <input
              type="search"
              className={styles.searchInput}
              placeholder="Search SKUs…"
              aria-label="Search SKUs"
              disabled
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
          </div>
        </div>
      </div>

      {/* Brand chips are presentational in the design — one is pre-selected
          and none of them filter anything. */}
      <div className={styles.brandChips}>
        {BRAND_CHIPS.map((chip) => (
          <button
            key={chip.name}
            type="button"
            className={styles.brandChip}
            data-active={chip.active}
            aria-pressed={chip.active}
          >
            {chip.name}
            <span className={styles.brandChipCount}>{chip.count}</span>
          </button>
        ))}
      </div>

      <div className={styles.filterRow}>
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
        <span className={styles.skuCount}>{skus.length} SKUs</span>
      </div>

      {mode === "grid" ? (
        <SkuGrid skus={skus} onOpen={onOpenSku} />
      ) : (
        <SkuTable skus={skus} onOpen={onOpenSku} />
      )}
    </div>
  );
}
