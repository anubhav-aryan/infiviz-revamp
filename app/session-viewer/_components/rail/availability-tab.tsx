"use client";

import { CreateTicketButton } from "@/app/_components/create-ticket-button";
import { Icon } from "@/app/_components/icon";
import { AVAILABILITY, MSL, MUST_HAVE_BRANDS } from "../../_data/session-viewer";
import styles from "../session-viewer.module.css";

/**
 * What was meant to be on the shelf, and what recognition found.
 *
 * The list leads rather than the percentage: `72%` is already the Summary tab's
 * headline, and a reader who has opened Availability has moved past the figure
 * to the eight rows behind it. Absent SKUs sort first and sit on amber, because
 * they are the only rows anyone acts on.
 *
 * One status column, not an expected/found pair. Every row here is ranged by
 * definition — that is what a must-stock list is — so a column of identical
 * ticks under "Expected" was restating the heading.
 */
export function AvailabilityTab({
  retailer,
  focusAbsent,
  pinnedBrand,
}: {
  retailer: string;
  /** Set when the reader arrived from an absent planogram exception. */
  focusAbsent: boolean;
  pinnedBrand: string | null;
}) {
  return (
    <>
      <div className={styles.mslHead}>
        <span className={styles.blockTitle}>Must-stock list</span>
        <span className={styles.countCaption} style={{ marginBottom: 0 }}>
          {AVAILABILITY.note}
        </span>
        <CreateTicketButton
          className={styles.toolButton}
          label="Raise ticket"
          context={{ region: retailer, metric: AVAILABILITY.label }}
        />
      </div>

      <div className={styles.mslList}>
        {MSL.map((sku) => {
          const found = sku.status === "found";
          const highlighted = focusAbsent ? !found : pinnedBrand === sku.brand;
          return (
            <div
              key={sku.name}
              className={styles.mslRow}
              data-status={found ? "found" : "absent"}
              data-highlighted={highlighted || undefined}
            >
              <span className={styles.mslThumb} aria-hidden="true">
                <Icon name="package" size={15} />
              </span>
              <div className={styles.mslText}>
                <div className={styles.mslName}>{sku.name}</div>
                <div className={styles.mslBrand}>{sku.brand}</div>
              </div>
              {MUST_HAVE_BRANDS.has(sku.brand) && sku.mustHave ? (
                <span className={styles.mustHave}>
                  <Icon name="star" size={9} />
                  Must-have
                </span>
              ) : null}
              <span
                className={styles.mslDetected}
                data-detected={found}
                aria-label={found ? "Found on shelf" : "Not found"}
              >
                <Icon name={found ? "check" : "x"} size={13} />
                {sku.statusLabel}
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
}
