import { Icon } from "@/app/_components/icon";
import {
  DATE_OPTIONS,
  FILTER_CHIPS,
  RETAILERS,
  STORES_VISITED,
  SUMMARY,
  VISIT_COUNT_LABEL,
  VISITS,
  type Visit,
} from "../_data/store-explorer";
import { VietnamMap } from "./vietnam-map";
import { VisitGallery, VisitList } from "./visit-list";
import styles from "./store-explorer.module.css";

type ExplorerViewProps = {
  mapOpen: boolean;
  onToggleMap: () => void;
  listView: "list" | "gallery";
  onListViewChange: (view: "list" | "gallery") => void;
  onOpenVisit: (visit: Visit) => void;
};

export function ExplorerView({
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

      {/* filter row */}
      <div className={styles.filterRow}>
        <div className={styles.segmented}>
          {DATE_OPTIONS.map((option) => (
            <button
              key={option.label}
              type="button"
              className={styles.dateOption}
              data-active={option.active}
              aria-pressed={option.active}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className={styles.divider} />

        {FILTER_CHIPS.map((label) => (
          <span key={label} className={styles.filterChip}>
            {label}
            <button
              type="button"
              className={styles.filterChipRemove}
              aria-label={`Remove filter ${label}`}
            >
              <Icon name="x" size={13} />
            </button>
          </span>
        ))}

        <button type="button" className={styles.addFilter}>
          <Icon name="plus" size={14} />
          Add filter
        </button>
      </div>

      {/* summary strip */}
      <div className={styles.summaryGrid}>
        {SUMMARY.map((tile) => (
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
            <span className={styles.visitedNumber}>{STORES_VISITED.count}</span>
            <span className={styles.visitedTarget}>
              / {STORES_VISITED.target} configured
            </span>
          </div>
          <div className={styles.visitedLabel}>Stores visited today</div>
          <div className={styles.visitedAwaiting}>
            <Icon name="clock" size={14} />
            {STORES_VISITED.awaiting} sessions awaiting processing
          </div>
        </div>

        <div>
          <div className={styles.retailerHeading}>Visits by retailer · today</div>
          <div className={styles.retailerGrid}>
            {RETAILERS.map((retailer) => (
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
              <span className={styles.panelTitle}>Visited stores · today</span>
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
            </div>
            <VietnamMap />
          </div>
        ) : null}

        <div className={`${styles.card} ${styles.listPanel}`}>
          <div className={styles.listHead}>
            <span className={styles.panelTitle}>{VISIT_COUNT_LABEL}</span>
            <span className={styles.listHint}>Tap a row to open App Images</span>
          </div>

          {listView === "list" ? (
            <VisitList visits={VISITS} onOpen={onOpenVisit} />
          ) : (
            <VisitGallery visits={VISITS} onOpen={onOpenVisit} />
          )}
        </div>
      </div>
    </div>
  );
}
