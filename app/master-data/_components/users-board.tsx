import { AskInfiChatButton } from "@/app/_components/chat/ask-infichat-button";
import chatStyles from "@/app/_components/chat/chat.module.css";
import { ExcelDownloadButton } from "@/app/_export/excel-download-button";
import { ExportButton } from "@/app/_export/export-button";
import type { CsvTable } from "@/app/_export/csv";
import { Icon } from "@/app/_components/icon";
import {
  ROLE_MINI,
  USERS_TABLE,
  USER_COLUMNS,
  USER_REGION_MINI,
  USER_ROWS,
  USER_TILES,
  type UserRow,
} from "../_data/users";
import { BreakdownTile } from "./breakdown-tile";
import { GridRow, ResizableGrid } from "./resizable-grid";
import styles from "./master-data.module.css";

/** Serialized here, from the same rows the table renders below. */
function userCsv(rows: UserRow[]): CsvTable {
  return {
    headers: USER_COLUMNS.map((column) => column.label),
    rows: rows.map((user) => [
      user.id,
      user.name,
      user.role,
      user.region,
      user.stores ?? "—",
      user.version,
      user.active,
      user.status,
    ]),
  };
}

export function UsersBoard() {
  return (
    <div className={styles.board}>
      <div className={styles.pageHead}>
        <div>
          <div className={styles.eyebrow}>Master data</div>
          <h1 className={styles.pageTitle}>Users</h1>
        </div>

        <div className={styles.headActions}>
          {/* Inert, like the Stores search — the design draws the field but
              never a result state behind it. */}
          <div className={styles.search}>
            <Icon name="search" className={styles.searchIcon} aria-hidden="true" />
            <span className={styles.searchPlaceholder}>Search users…</span>
          </div>
          <button type="button" className={styles.ghostButton}>
            <Icon name="sliders-horizontal" />
            Filters
          </button>
          <ExportButton
            table={userCsv(USER_ROWS)}
            filename="master-data-users"
            className={styles.primaryButton}
          />
        </div>
      </div>

      <div className={styles.summaryGrid}>
        {USER_TILES.map((tile) => (
          <div key={tile.label} className={styles.tile}>
            <div className={styles.tileLabel}>{tile.label}</div>
            <div className={styles.tileValue}>{tile.val}</div>
            {tile.note ? <div className={styles.tileNote}>{tile.note}</div> : null}
          </div>
        ))}

        <BreakdownTile label="By role" bars={ROLE_MINI} tone="light" />
        <BreakdownTile label="By region" bars={USER_REGION_MINI} />
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableHead}>
          <span className={styles.tableTitle}>{USERS_TABLE.count}</span>
          <span className={chatStyles.askGroup}>
            <span className={styles.tableCount}>{USERS_TABLE.showing}</span>
            <AskInfiChatButton label={USERS_TABLE.count} compact />
            <ExcelDownloadButton label={USERS_TABLE.count} compact />
          </span>
        </div>

        <ResizableGrid tableKey="users" columns={USER_COLUMNS}>
          {USER_ROWS.map((user) => (
            <GridRow key={user.id}>
              <span className={styles.cellMono}>{user.id}</span>
              <span className={styles.cellName}>{user.name}</span>
              <span className={styles.cell}>{user.role}</span>
              <span className={styles.cell}>{user.region}</span>
              {/* Desk roles carry no store book; an em dash says so without
                  implying zero stores. */}
              <span className={styles.cellNum} data-align="right">
                {user.stores ?? "—"}
              </span>
              <span className={styles.cellMono}>{user.version}</span>
              <span className={styles.cellMuted}>{user.active}</span>
              <span className={styles.status} data-status={user.status}>
                <span className={styles.statusDot} aria-hidden="true" />
                {user.status}
              </span>
            </GridRow>
          ))}
        </ResizableGrid>
      </div>
    </div>
  );
}
