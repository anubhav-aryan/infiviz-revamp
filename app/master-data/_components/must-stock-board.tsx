import { AskInfiChatButton } from "@/app/_components/chat/ask-infichat-button";
import chatStyles from "@/app/_components/chat/chat.module.css";
import { ExcelDownloadButton } from "@/app/_export/excel-download-button";
import { ExportButton } from "@/app/_export/export-button";
import type { CsvTable } from "@/app/_export/csv";
import { Icon } from "@/app/_components/icon";
import {
  MSL_BRAND_MINI,
  MSL_GROUP_MINI,
  MUST_STOCK_COLUMNS,
  MUST_STOCK_ROWS,
  MUST_STOCK_TABLE,
  MUST_STOCK_TILES,
  type MustStockRow,
} from "../_data/must-stock";
import { BreakdownTile } from "./breakdown-tile";
import { GridRow, ResizableGrid } from "./resizable-grid";
import styles from "./master-data.module.css";

/** Serialized here, from the same rows the table renders below. */
function mustStockCsv(rows: MustStockRow[]): CsvTable {
  return {
    headers: MUST_STOCK_COLUMNS.map((column) => column.label),
    rows: rows.map((row) => [
      row.code,
      row.name,
      row.brand,
      row.group,
      row.ranged,
      row.priority,
      row.since,
      row.status,
    ]),
  };
}

export function MustStockBoard() {
  return (
    <div className={styles.board}>
      <div className={styles.pageHead}>
        <div>
          <div className={styles.eyebrow}>Master data</div>
          <h1 className={styles.pageTitle}>Must-stock list</h1>
        </div>

        <div className={styles.headActions}>
          <div className={styles.search}>
            <Icon name="search" className={styles.searchIcon} aria-hidden="true" />
            <span className={styles.searchPlaceholder}>Search SKUs…</span>
          </div>
          <button type="button" className={styles.ghostButton}>
            <Icon name="sliders-horizontal" />
            Filters
          </button>
          <ExportButton
            table={mustStockCsv(MUST_STOCK_ROWS)}
            filename="master-data-must-stock"
            className={styles.primaryButton}
          />
        </div>
      </div>

      <div className={styles.summaryGrid}>
        {MUST_STOCK_TILES.map((tile) => (
          <div key={tile.label} className={styles.tile}>
            <div className={styles.tileLabel}>{tile.label}</div>
            <div className={styles.tileValue}>{tile.val}</div>
            {tile.note ? <div className={styles.tileNote}>{tile.note}</div> : null}
          </div>
        ))}

        <BreakdownTile label="By brand" bars={MSL_BRAND_MINI} />
        <BreakdownTile label="By store group" bars={MSL_GROUP_MINI} tone="light" />
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableHead}>
          <span className={styles.tableTitle}>{MUST_STOCK_TABLE.count}</span>
          <span className={chatStyles.askGroup}>
            <span className={styles.tableCount}>{MUST_STOCK_TABLE.showing}</span>
            <AskInfiChatButton label={MUST_STOCK_TABLE.count} compact />
            <ExcelDownloadButton label={MUST_STOCK_TABLE.count} compact />
          </span>
        </div>

        <ResizableGrid tableKey="must-stock" columns={MUST_STOCK_COLUMNS}>
          {MUST_STOCK_ROWS.map((row) => (
            <GridRow key={row.code}>
              <span className={styles.cellMono}>{row.code}</span>
              <span className={styles.cellName}>{row.name}</span>
              <span className={styles.cell}>{row.brand}</span>
              <span className={styles.cell}>{row.group}</span>
              <span className={styles.cellNum} data-align="right">{row.ranged}</span>
              <span className={styles.priority} data-priority={row.priority}>
                {row.priority}
              </span>
              <span className={styles.cellMuted}>{row.since}</span>
              <span className={styles.status} data-status={row.status}>
                <span className={styles.statusDot} aria-hidden="true" />
                {row.status}
              </span>
            </GridRow>
          ))}
        </ResizableGrid>
      </div>
    </div>
  );
}
