import { AskInfiChatButton } from "@/app/_components/chat/ask-infichat-button";
import { ExcelDownloadButton } from "@/app/_export/excel-download-button";
import { ExportButton } from "@/app/_export/export-button";
import type { CsvTable } from "@/app/_export/csv";
import { Icon } from "@/app/_components/icon";
import {
  TASKS_TABLE,
  TASK_COLUMNS,
  TASK_GROUP_MINI,
  TASK_ROWS,
  TASK_TILES,
  TASK_TYPE_MINI,
  type TaskRow,
} from "../_data/tasks";
import { BreakdownTile } from "./breakdown-tile";
import { GridRow, ResizableGrid } from "./resizable-grid";
import styles from "./master-data.module.css";
import { CardActions } from "@/app/_components/card-actions";

/** Serialized here, from the same rows the table renders below. */
function taskCsv(rows: TaskRow[]): CsvTable {
  return {
    headers: TASK_COLUMNS.map((column) => column.label),
    rows: rows.map((task) => [
      task.id,
      task.name,
      task.type,
      task.group,
      task.freq,
      task.photos,
      task.mandatory ? "Yes" : "No",
      task.status,
    ]),
  };
}

export function TasksBoard() {
  return (
    <div className={styles.board}>
      <div className={styles.pageHead}>
        <div>
          <div className={styles.eyebrow}>Master data</div>
          <h1 className={styles.pageTitle}>Tasks</h1>
        </div>

        <div className={styles.headActions}>
          <div className={styles.search}>
            <Icon name="search" className={styles.searchIcon} aria-hidden="true" />
            <span className={styles.searchPlaceholder}>Search tasks…</span>
          </div>
          <button type="button" className={styles.ghostButton}>
            <Icon name="sliders-horizontal" />
            Filters
          </button>
          <ExportButton
            table={taskCsv(TASK_ROWS)}
            filename="master-data-tasks"
            className={styles.primaryButton}
          />
        </div>
      </div>

      <div className={styles.summaryGrid}>
        {TASK_TILES.map((tile) => (
          <div key={tile.label} className={styles.tile}>
            <div className={styles.tileLabel}>{tile.label}</div>
            <div className={styles.tileValue}>{tile.val}</div>
            {tile.note ? <div className={styles.tileNote}>{tile.note}</div> : null}
          </div>
        ))}

        <BreakdownTile label="By task type" bars={TASK_TYPE_MINI} />
        <BreakdownTile label="By store group" bars={TASK_GROUP_MINI} tone="light" />
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableHead}>
          <span className={styles.tableTitle}>{TASKS_TABLE.count}</span>
          <CardActions>
            <span className={styles.tableCount}>{TASKS_TABLE.showing}</span>
            <AskInfiChatButton label={TASKS_TABLE.count} compact />
            <ExcelDownloadButton label={TASKS_TABLE.count} compact />
          </CardActions>
        </div>

        <ResizableGrid tableKey="tasks" columns={TASK_COLUMNS}>
          {TASK_ROWS.map((task) => (
            <GridRow key={task.id}>
              <span className={styles.cellMono}>{task.id}</span>
              <span className={styles.cellName}>{task.name}</span>
              <span className={styles.cell}>{task.type}</span>
              <span className={styles.cell}>{task.group}</span>
              <span className={styles.cell}>{task.freq}</span>
              <span className={styles.cellNum} data-align="right">{task.photos}</span>
              <span className={styles.priority} data-priority={task.mandatory ? "Must-have" : "Recommended"}>
                {task.mandatory ? "Required" : "Optional"}
              </span>
              <span className={styles.status} data-status={task.status}>
                <span className={styles.statusDot} aria-hidden="true" />
                {task.status}
              </span>
            </GridRow>
          ))}
        </ResizableGrid>
      </div>
    </div>
  );
}
