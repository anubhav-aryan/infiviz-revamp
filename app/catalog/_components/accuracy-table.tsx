import { Icon } from "@/app/_components/icon";
import type { Sku } from "../_data/catalog";
import styles from "./catalog.module.css";

type AccuracyTableProps = {
  skus: Sku[];
  onOpen: (index: number) => void;
};

function accuracyTone(sku: Sku): "good" | "fair" | "low" | undefined {
  if (!sku.trained) return undefined;
  if (sku.accuracy >= 90) return "good";
  if (sku.accuracy >= 75) return "fair";
  return "low";
}

/**
 * SKU / brand / accuracy / sample count / trained / untrained reason — the
 * detail #8 asks for, as its own subtab rather than only inside `SkuPanel`.
 * Worst-accuracy-first by default, since that's the list someone opening this
 * tab actually wants: what needs retraining.
 *
 * A plain button-per-row table like `SkuTable`, not the shared `SortableTable`
 * — that component has no row-click hook, only per-cell links and column
 * sort, and retrofitting it for one screen wasn't worth forking its API.
 */
export function AccuracyTable({ skus, onOpen }: AccuracyTableProps) {
  const rows = [...skus].sort((a, b) => a.accuracy - b.accuracy);

  return (
    <div className={styles.table}>
      <div className={styles.accuracyTableHead}>
        <span>SKU name</span>
        <span>Brand</span>
        <span className={styles.alignRight}>Accuracy</span>
        <span className={styles.alignRight}>Sample count</span>
        <span>Trained</span>
        <span>Untrained reason</span>
      </div>

      {rows.map((sku) => (
        <button
          key={sku.code}
          type="button"
          className={styles.accuracyTableRow}
          onClick={() => onOpen(sku.index)}
          aria-label={`Open SKU detail for ${sku.name}`}
        >
          <span className={styles.tableName}>{sku.name}</span>
          <span className={styles.tableCell}>{sku.brand}</span>
          <span className={`${styles.accuracyValue} ${styles.alignRight}`} data-tone={accuracyTone(sku)}>
            {sku.trained ? `${sku.accuracy}%` : "—"}
          </span>
          <span className={`${styles.tableMono} ${styles.alignRight}`}>
            {sku.trained ? sku.sampleCount : "—"}
          </span>
          <span className={styles.tableCell}>
            {sku.trained ? (
              <Icon name="check" size={14} className={styles.trainedYes} />
            ) : (
              <Icon name="x" size={14} className={styles.trainedNo} />
            )}
          </span>
          <span className={styles.tableTruncate}>{sku.untrainedReason ?? "—"}</span>
        </button>
      ))}
    </div>
  );
}
