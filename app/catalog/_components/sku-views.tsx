import { Icon } from "@/app/_components/icon";
import type { Sku } from "../_data/catalog";
import styles from "./catalog.module.css";

type SkuViewProps = {
  skus: Sku[];
  onOpen: (index: number) => void;
};

export function SkuGrid({ skus, onOpen }: SkuViewProps) {
  return (
    <div className={styles.skuGrid}>
      {skus.map((sku) => (
        <button
          key={sku.code}
          type="button"
          className={`${styles.reset} ${styles.skuCard}`}
          onClick={() => onOpen(sku.index)}
          aria-label={`Open SKU detail for ${sku.name}`}
        >
          <span
            className={`${styles.productImage} ${styles.productImageCard}`}
            aria-hidden="true"
          >
            <Icon name="package" size={34} />
          </span>

          <span className={styles.skuBody}>
            <span className={styles.skuName}>{sku.name}</span>
            <span className={styles.skuTags}>
              <span className={styles.skuBrandTag}>{sku.brand}</span>
              <span className={styles.skuSubTag}>{sku.subCategory}</span>
            </span>
            <span className={styles.skuVariant}>{sku.variant}</span>
            <span className={styles.skuCode}>
              {sku.code} · {sku.hw}
            </span>
          </span>
        </button>
      ))}
    </div>
  );
}

export function SkuTable({ skus, onOpen }: SkuViewProps) {
  return (
    <div className={styles.table}>
      <div className={styles.tableHead}>
        <span />
        <span>SKU name</span>
        <span>Category</span>
        <span>Sub-category</span>
        <span>Brand</span>
        <span>Variant</span>
        <span>SKU</span>
        <span className={styles.alignRight}>H</span>
        <span className={styles.alignRight}>W</span>
      </div>

      {skus.map((sku) => (
        <button
          key={sku.code}
          type="button"
          className={styles.tableRow}
          onClick={() => onOpen(sku.index)}
          aria-label={`Open SKU detail for ${sku.name}`}
        >
          <span
            className={`${styles.productImage} ${styles.productImageCell}`}
            aria-hidden="true"
          >
            <Icon name="package" size={16} />
          </span>
          <span className={styles.tableName}>{sku.name}</span>
          <span className={styles.tableCell}>{sku.category}</span>
          <span className={styles.tableCell}>{sku.subCategory}</span>
          <span className={styles.tableCell}>{sku.brand}</span>
          <span className={styles.tableTruncate}>{sku.variant}</span>
          <span className={styles.tableMono}>{sku.code}</span>
          <span className={`${styles.tableMono} ${styles.alignRight}`}>
            {sku.height}
          </span>
          <span className={`${styles.tableMono} ${styles.alignRight}`}>
            {sku.width}
          </span>
        </button>
      ))}
    </div>
  );
}
