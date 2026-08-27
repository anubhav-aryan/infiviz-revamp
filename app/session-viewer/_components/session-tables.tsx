import { AskInfiChatButton } from "@/app/_components/chat/ask-infichat-button";
import { TabbedTable } from "@/app/_charts/tabbed-table";
import { ExcelDownloadButton } from "@/app/_export/excel-download-button";
import { sessionTableViews, TABLES_CAPTION } from "../_data/session-tables";
import { Icon } from "@/app/_components/icon";
import styles from "./session-viewer.module.css";
import { CardActions } from "@/app/_components/card-actions";

/**
 * The five session tables, in the platform's existing `TabbedTable` card.
 *
 * Pinning a detection narrows the SKU tab to that brand and shows a chip
 * saying so — the tables are the third view of the same selection the stage
 * and the rail share.
 *
 * `wide` is a per-card flag rather than per-view, but `overflow-x: auto` is
 * inert on the four narrow tables, so the one flag covers the SKU table's
 * eighteen columns without affecting the others.
 */
export function SessionTables({
  brandFilter,
  onClearFilter,
}: {
  /** Set when a detection is pinned — the SKU tab narrows to its brand. */
  brandFilter: string | null;
  onClearFilter: () => void;
}) {
  return (
    <div className={styles.tablesBlock}>
      <TabbedTable
        views={sessionTableViews(brandFilter)}
        variant="underline"
        title="Session tables"
        wide
        maxHeight={420}
        action={
          <CardActions>
            {brandFilter ? (
              <button
                type="button"
                className={styles.tablesFilterChip}
                onClick={onClearFilter}
              >
                Filtered to {brandFilter}
                <Icon name="x" size={11} />
              </button>
            ) : null}
            <span className={styles.tablesCaption}>{TABLES_CAPTION}</span>
            <AskInfiChatButton label="Session tables" compact />
            <ExcelDownloadButton label="Session tables" compact />
          </CardActions>
        }
      />
    </div>
  );
}
