import { Icon } from "@/app/_components/icon";
import { OWNERSHIP_LABEL, type Sku } from "../_data/catalog";
import styles from "./catalog.module.css";

type SkuViewProps = {
  skus: Sku[];
  onOpen: (index: number) => void;
};

function accuracyTone(sku: Sku): "good" | "fair" | "low" | undefined {
  if (!sku.trained) return undefined;
  if (sku.accuracy >= 90) return "good";
  if (sku.accuracy >= 75) return "fair";
  return "low";
}

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
            {!sku.packshot ? (
              <span className={styles.packshotMissingBadge}>
                <Icon name="image-off" size={11} />
                No packshot
              </span>
            ) : null}
          </span>

          <span className={styles.skuBody}>
            <span className={styles.skuName}>{sku.name}</span>
            <span className={styles.skuTags}>
              <span className={styles.skuBrandTag}>{sku.brand}</span>
              <span className={styles.skuSubTag}>{sku.subCategory}</span>
              <span className={styles.ownershipTag} data-ownership={sku.ownership}>
                {OWNERSHIP_LABEL[sku.ownership]}
              </span>
            </span>
            <span className={styles.skuVariant}>{sku.variant}</span>
            <span className={styles.skuCode}>
              {sku.code} · {sku.hw}
              {" · "}
              <span className={styles.accuracyPill} data-tone={accuracyTone(sku)}>
                {sku.trained ? `${sku.accuracy}% accuracy` : "Untrained"}
              </span>
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
      <div className={`${styles.tableHead} ${styles.tableHeadWide}`}>
        <span />
        <span>SKU name</span>
        <span>Sub-category</span>
        <span>Brand</span>
        <span>Ownership</span>
        <span>Variant</span>
        <span>SKU</span>
        <span>Packshot</span>
        <span className={styles.alignRight}>Accuracy</span>
      </div>

      {skus.map((sku) => (
        <button
          key={sku.code}
          type="button"
          className={`${styles.tableRow} ${styles.tableRowWide}`}
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
          <span className={styles.tableCell}>{sku.subCategory}</span>
          <span className={styles.tableCell}>{sku.brand}</span>
          <span className={styles.tableCell}>
            <span className={styles.ownershipTag} data-ownership={sku.ownership}>
              {OWNERSHIP_LABEL[sku.ownership]}
            </span>
          </span>
          <span className={styles.tableTruncate}>{sku.variant}</span>
          <span className={styles.tableMono}>{sku.code}</span>
          <span className={styles.tableCell}>
            {sku.packshot ? (
              <Icon name="check" size={14} className={styles.trainedYes} />
            ) : (
              <Icon name="image-off" size={14} className={styles.trainedNo} />
            )}
          </span>
          <span className={`${styles.accuracyPill} ${styles.alignRight}`} data-tone={accuracyTone(sku)}>
            {sku.trained ? `${sku.accuracy}%` : "—"}
          </span>
        </button>
      ))}
    </div>
  );
}
