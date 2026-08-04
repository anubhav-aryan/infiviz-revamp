import { Icon } from "@/app/_components/icon";
import {
  REGION_MINI,
  RETAILER_MINI,
  STORES_TABLE,
  STORE_ROWS,
  STORE_TOTALS,
  TYPE_MINI,
  type MiniBar,
} from "../_data/stores";
import styles from "./master-data.module.css";

/** The three breakdown tiles differ only in their label, data and bar tint. */
function BreakdownTile({
  label,
  bars,
  tone,
}: {
  label: string;
  bars: MiniBar[];
  tone?: "light";
}) {
  return (
    <div className={styles.tile}>
      <div className={`${styles.tileLabel} ${styles.tileLabelBars}`}>{label}</div>
      {bars.map((bar) => (
        <div key={bar.name} className={styles.miniRow}>
          <span className={styles.miniName}>{bar.name}</span>
          <span className={styles.miniTrack}>
            <span
              className={styles.miniFill}
              data-tone={tone}
              style={{ width: `${bar.w}%` }}
            />
          </span>
        </div>
      ))}
    </div>
  );
}

export function StoresBoard() {
  return (
    <div className={styles.board}>
      <div className={styles.pageHead}>
        <div>
          <div className={styles.eyebrow}>Master data</div>
          <h1 className={styles.pageTitle}>Stores</h1>
        </div>

        <div className={styles.headActions}>
          <div className={styles.search}>
            <Icon name="search" className={styles.searchIcon} aria-hidden="true" />
            <span className={styles.searchPlaceholder}>Search stores…</span>
          </div>
          <button type="button" className={styles.ghostButton}>
            <Icon name="sliders-horizontal" />
            Filters
          </button>
          <button type="button" className={styles.primaryButton}>
            <Icon name="download" />
            Export CSV
          </button>
        </div>
      </div>

      <div className={styles.summaryGrid}>
        <div className={styles.tile}>
          <div className={styles.tileLabel}>Total stores</div>
          <div className={styles.tileValue}>{STORE_TOTALS.total}</div>
        </div>

        <div className={styles.tile}>
          <div className={styles.tileLabel}>Active</div>
          <div className={styles.tileValue}>{STORE_TOTALS.active}</div>
          <div className={styles.tileNote}>{STORE_TOTALS.inactive}</div>
        </div>

        <BreakdownTile label="By store brand" bars={RETAILER_MINI} />
        <BreakdownTile label="By store type" bars={TYPE_MINI} tone="light" />
        <BreakdownTile label="By region" bars={REGION_MINI} />
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableHead}>
          <span className={styles.tableTitle}>{STORES_TABLE.count}</span>
          <span className={styles.tableCount}>{STORES_TABLE.showing}</span>
        </div>

        <div className={`${styles.storesGrid} ${styles.columnHead}`}>
          <span>Store code</span>
          <span>Store name</span>
          <span>Retailer</span>
          <span>Type</span>
          <span>Region</span>
          <span>Merchandiser</span>
          <span>Status</span>
          <span>Added</span>
        </div>

        {STORE_ROWS.map((store) => (
          <div key={store.code} className={`${styles.storesGrid} ${styles.row}`}>
            <span className={styles.cellMono}>{store.code}</span>
            <span className={styles.cellName}>{store.name}</span>
            <span className={styles.cell}>{store.retailer}</span>
            <span className={styles.cell}>{store.type}</span>
            <span className={styles.cell}>{store.region}</span>
            <span className={styles.cellMono}>{store.mrch}</span>
            <span className={styles.status} data-status={store.status}>
              <span className={styles.statusDot} aria-hidden="true" />
              {store.status}
            </span>
            <span className={styles.cellMuted}>{store.added}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
