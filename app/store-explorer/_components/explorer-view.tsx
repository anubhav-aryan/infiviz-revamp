import { AskInfiChatButton } from "@/app/_components/chat/ask-infichat-button";
import chatStyles from "@/app/_components/chat/chat.module.css";
import { Icon } from "@/app/_components/icon";
import { ExcelDownloadButton } from "@/app/_export/excel-download-button";
import type { ActiveFilter } from "@/app/_filters/model";
import type { Period } from "../_data/period";
import type { View, Visit } from "../_data/store-explorer";
import { SavedViewsMenu } from "./saved-views-menu";
import { VietnamMap } from "./vietnam-map";
import { VisitGallery, VisitList } from "./visit-list";
import styles from "./store-explorer.module.css";

type ExplorerViewProps = {
  view: View;
  period: Period;
  filters: ActiveFilter[];
  /** Only for the empty list's "clear filters" affordance — the bar owns the
   *  real control. */
  onClearFilters: () => void;
  onApplySavedView: (period: Period, filters: ActiveFilter[]) => void;
  mapOpen: boolean;
  onToggleMap: () => void;
  listView: "list" | "gallery";
  onListViewChange: (view: "list" | "gallery") => void;
  onOpenVisit: (visit: Visit) => void;
};

export function ExplorerView({
  view,
  period,
  filters,
  onClearFilters,
  onApplySavedView,
  mapOpen,
  onToggleMap,
  listView,
  onListViewChange,
  onOpenVisit,
}: ExplorerViewProps) {
  return (
    <div className={styles.explorer}>
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Store Explorer</h1>
          <div className={styles.pageSubtitle}>
            Colgate-Palmolive Vietnam · which stores were visited
          </div>
        </div>
      </div>

      {/* Period, chips and "Add filter" all moved to the global filter bar —
          one bar, one place. Only saved views remain, because they are this
          screen's own concept rather than part of the shared filter set. */}
      <div className={styles.filterRow}>
        <div className={styles.filterRowEnd}>
          <SavedViewsMenu
            period={period}
            filters={filters}
            onApply={onApplySavedView}
          />
        </div>
      </div>

      {/* summary strip */}
      <div className={styles.summaryGrid}>
        {view.summary.map((tile) => (
          <div key={tile.label} className={styles.summaryTile}>
            <span className={styles.summaryIcon} aria-hidden="true">
              <Icon name={tile.icon} />
            </span>
            <div>
              <div className={styles.summaryValue}>{tile.value}</div>
              <div className={styles.summaryLabel}>{tile.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* stores visited + retailer breakdown */}
      <div className={`${styles.card} ${styles.visitedCard}`}>
        <div className={styles.visitedLeft}>
          <div className={styles.visitedCount}>
            <span className={styles.visitedNumber}>
              {view.storesVisited.count}
            </span>
            <span className={styles.visitedTarget}>
              / {view.storesVisited.target} configured
            </span>
          </div>
          <div className={styles.visitedLabel}>{view.storesVisitedLabel}</div>
          <div className={styles.visitedAwaiting}>
            <Icon name="clock" size={14} />
            {view.storesVisited.awaiting} sessions awaiting processing
          </div>
        </div>

        <div>
          <div className={styles.retailerHeading}>{view.retailerHeading}</div>
          {view.retailers.length > 0 ? (
            <div className={styles.retailerGrid}>
              {view.retailers.map((retailer) => (
                <div key={retailer.name} className={styles.retailerRow}>
                  <span className={styles.retailerName}>{retailer.name}</span>
                  <span className={styles.retailerTrack}>
                    <span
                      className={styles.retailerBar}
                      style={{ width: `${retailer.width}%` }}
                    />
                  </span>
                  <span className={styles.retailerValue}>
                    {retailer.visits} · {retailer.pct}%
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.inlineEmpty}>
              No retailer in this cut recorded a visit.
            </p>
          )}
        </div>
      </div>

      {/* controls */}
      <div className={styles.controls}>
        <button type="button" className={styles.ghostButton} onClick={onToggleMap}>
          <Icon name={mapOpen ? "eye-off" : "map"} />
          {mapOpen ? "Hide map" : "Show map"}
        </button>

        <div className={`${styles.segmented} ${styles.viewToggle}`}>
          <button
            type="button"
            className={styles.viewOption}
            data-active={listView === "list"}
            aria-pressed={listView === "list"}
            onClick={() => onListViewChange("list")}
          >
            <Icon name="list" />
            List
          </button>
          <button
            type="button"
            className={styles.viewOption}
            data-active={listView === "gallery"}
            aria-pressed={listView === "gallery"}
            onClick={() => onListViewChange("gallery")}
          >
            <Icon name="layout-grid" />
            Gallery
          </button>
        </div>
      </div>

      {/* split: map + list */}
      <div
        className={styles.split}
        style={{ "--split-cols": mapOpen ? "60% 1fr" : "1fr" } as React.CSSProperties}
      >
        {mapOpen ? (
          <div className={`${styles.card} ${styles.mapPanel}`}>
            <div className={styles.mapHead}>
              <span className={styles.panelTitle}>
                Visited stores · {view.periodLabel}
              </span>
              <span className={chatStyles.askGroup}>
                <div className={styles.legend}>
                  <span className={styles.legendItem}>
                    <span
                      className={styles.legendDot}
                      style={{ background: "var(--indigo-600)" }}
                    />
                    Visited today
                  </span>
                  <span className={styles.legendItem}>
                    <span
                      className={styles.legendDot}
                      style={{ background: "var(--indigo-300)" }}
                    />
                    In range
                  </span>
                  <span className={styles.legendItem}>
                    <span
                      className={styles.legendDot}
                      style={{ background: "var(--neutral-300)" }}
                    />
                    Not visited
                  </span>
                </div>
                <AskInfiChatButton label="Visited stores" compact />
                <ExcelDownloadButton label="Visited stores" compact />
              </span>
            </div>
            <VietnamMap pins={view.pins} />
          </div>
        ) : null}

        <div className={`${styles.card} ${styles.listPanel}`}>
          <div className={styles.listHead}>
            <span className={styles.panelTitle}>{view.visitsLabel}</span>
            <span className={chatStyles.askGroup}>
              <span className={styles.listHint}>Tap a row to open App Images</span>
              <AskInfiChatButton label={view.visitsLabel} compact />
              <ExcelDownloadButton label={view.visitsLabel} compact />
            </span>
          </div>

          {listView === "list" ? (
            <VisitList
              visits={view.visits}
              onOpen={onOpenVisit}
              onClearFilters={filters.length > 0 ? onClearFilters : undefined}
            />
          ) : (
            <VisitGallery
              visits={view.visits}
              onOpen={onOpenVisit}
              onClearFilters={filters.length > 0 ? onClearFilters : undefined}
            />
          )}
        </div>
      </div>
    </div>
  );
}
