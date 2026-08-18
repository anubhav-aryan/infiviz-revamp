import { AskInfiChatButton } from "@/app/_components/chat/ask-infichat-button";
import chatStyles from "@/app/_components/chat/chat.module.css";
import { ExcelDownloadButton } from "@/app/_export/excel-download-button";
import { Icon } from "@/app/_components/icon";
import {
  REGION_MINI,
  RETAILER_MINI,
  STORES_TABLE,
  STORE_COLUMNS,
  STORE_ROWS,
  STORE_TOTALS,
  TYPE_MINI,
} from "../_data/stores";
import { BreakdownTile } from "./breakdown-tile";
import { GridRow, ResizableGrid } from "./resizable-grid";
import styles from "./master-data.module.css";

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
          <span className={chatStyles.askGroup}>
            <span className={styles.tableCount}>{STORES_TABLE.showing}</span>
            <AskInfiChatButton label={STORES_TABLE.count} compact />
            <ExcelDownloadButton label={STORES_TABLE.count} compact />
          </span>
        </div>

        <ResizableGrid tableKey="stores" columns={STORE_COLUMNS}>
          {STORE_ROWS.map((store) => (
            <GridRow key={store.code}>
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
            </GridRow>
          ))}
        </ResizableGrid>
      </div>
    </div>
  );
}
