import { AskInfiChatButton } from "@/app/_components/chat/ask-infichat-button";
import chatStyles from "@/app/_components/chat/chat.module.css";
import { TabbedTable } from "@/app/_charts/tabbed-table";
import { ExcelDownloadButton } from "@/app/_export/excel-download-button";
import { SESSION_TABLE_VIEWS, TABLES_CAPTION } from "../_data/session-tables";
import styles from "./session-viewer.module.css";

/**
 * The five session tables, in the platform's existing `TabbedTable` card.
 *
 * `wide` is a per-card flag rather than per-view, but `overflow-x: auto` is
 * inert on the four narrow tables, so the one flag covers the SKU table's
 * eighteen columns without affecting the others.
 */
export function SessionTables() {
  return (
    <div className={styles.tablesBlock}>
      <TabbedTable
        views={SESSION_TABLE_VIEWS}
        title="Session tables"
        wide
        maxHeight={380}
        action={
          <span className={chatStyles.askGroup}>
            <span className={styles.tablesCaption}>{TABLES_CAPTION}</span>
            <AskInfiChatButton label="Session tables" compact />
            <ExcelDownloadButton label="Session tables" compact />
          </span>
        }
      />
    </div>
  );
}
