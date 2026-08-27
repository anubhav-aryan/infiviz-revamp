"use client";

import { Icon } from "@/app/_components/icon";
import type { Exception } from "../_data/session-compliance";
import type { ExtraKind, RecognitionBox, Scope } from "../_data/session-viewer";
import { AccuracyTab } from "./rail/accuracy-tab";
import { AvailabilityTab } from "./rail/availability-tab";
import { BrandsTab } from "./rail/brands-tab";
import { ComplianceTab } from "./rail/compliance-tab";
import { PinnedDetection } from "./rail/pinned-detection";
import { SummaryTab } from "./rail/summary-tab";
import styles from "./session-viewer.module.css";

export type RailTab = "summary" | "availability" | "brands" | "compliance" | "accuracy";

export const RAIL_TABS: { id: RailTab; label: string }[] = [
  { id: "summary", label: "Summary" },
  { id: "availability", label: "Availability" },
  { id: "brands", label: "Brands" },
  { id: "compliance", label: "POG compliance" },
  { id: "accuracy", label: "Accuracy" },
];

/**
 * The numbers behind the capture, beside the capture.
 *
 * This used to be a modal drawer, which meant the evidence and the figure it
 * explains could never be on screen together. Inline, pinning a box on the
 * stitch can move what the rail shows, and vice versa.
 *
 * `Summary` opens first and carries every headline figure, so a reader who
 * wants the session's answer never has to guess which of four tabs holds it.
 * The others are the working-out.
 */
export function InsightsRail({
  tab,
  onTab,
  onClose,
  selectedBox,
  onClearPin,
  retailer,
  focusAbsent,
  onPickException,
  onHoverBox,
  brandScope,
  onBrandScope,
  brandAsc,
  onBrandSort,
  accBrandScope,
  onAccBrandScope,
  accBrandAsc,
  onAccBrandSort,
  accSkuScope,
  onAccSkuScope,
  accSkuAsc,
  onAccSkuSort,
  shown,
  photos,
  onViewGaps,
}: {
  tab: RailTab;
  onTab: (tab: RailTab) => void;
  /** The pane's own way out — the header toggle stays the other one. */
  onClose: () => void;
  selectedBox: RecognitionBox | null;
  onClearPin: () => void;
  retailer: string;
  focusAbsent: boolean;
  onPickException: (exception: Exception) => void;
  onHoverBox: (boxId: string | null) => void;
  brandScope: Scope;
  onBrandScope: (scope: Scope) => void;
  brandAsc: boolean;
  onBrandSort: () => void;
  accBrandScope: Scope;
  onAccBrandScope: (scope: Scope) => void;
  accBrandAsc: boolean;
  onAccBrandSort: () => void;
  accSkuScope: Scope;
  onAccSkuScope: (scope: Scope) => void;
  accSkuAsc: boolean;
  onAccSkuSort: () => void;
  /** Which overlay toggles are on — the facings figure says what they added. */
  shown: Set<ExtraKind>;
  photos: number;
  /** Jumps to the must-stock list with the absent SKUs flagged. */
  onViewGaps: () => void;
}) {
  return (
    <div className={styles.railPanel}>
      <div className={styles.railTabs} role="tablist" aria-label="Session insights">
        {RAIL_TABS.map((entry) => (
          <button
            key={entry.id}
            type="button"
            role="tab"
            className={styles.railTab}
            data-active={entry.id === tab}
            aria-selected={entry.id === tab}
            onClick={() => onTab(entry.id)}
          >
            {entry.label}
          </button>
        ))}
        <button
          type="button"
          className={styles.railClose}
          onClick={onClose}
          aria-label="Close insights"
        >
          <Icon name="x" size={14} />
        </button>
      </div>

      <div className={styles.railBody}>
        {selectedBox ? (
          <PinnedDetection box={selectedBox} onClear={onClearPin} />
        ) : null}

        {tab === "summary" ? (
          <SummaryTab shown={shown} photos={photos} onViewGaps={onViewGaps} />
        ) : null}

        {tab === "availability" ? (
          <AvailabilityTab
            retailer={retailer}
            focusAbsent={focusAbsent}
            pinnedBrand={selectedBox?.brand ?? null}
          />
        ) : null}

        {tab === "brands" ? (
          <BrandsTab
            scope={brandScope}
            onScope={onBrandScope}
            ascending={brandAsc}
            onSort={onBrandSort}
            pinnedBrand={selectedBox?.brand ?? null}
          />
        ) : null}

        {tab === "compliance" ? (
          <ComplianceTab
            selectedBoxId={selectedBox?.id ?? null}
            onPick={onPickException}
            onHover={onHoverBox}
          />
        ) : null}

        {tab === "accuracy" ? (
          <AccuracyTab
            brandScope={accBrandScope}
            onBrandScope={onAccBrandScope}
            brandAsc={accBrandAsc}
            onBrandSort={onAccBrandSort}
            skuScope={accSkuScope}
            onSkuScope={onAccSkuScope}
            skuAsc={accSkuAsc}
            onSkuSort={onAccSkuSort}
          />
        ) : null}
      </div>
    </div>
  );
}
