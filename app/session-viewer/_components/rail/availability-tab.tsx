"use client";

import { CardActions } from "@/app/_components/card-actions";
import { CreateTicketButton } from "@/app/_components/create-ticket-button";
import { Hint } from "@/app/_components/hint";
import { Icon } from "@/app/_components/icon";
import { AVAILABILITY, MSL, MUST_HAVE_BRANDS } from "../../_data/session-viewer";
import styles from "../session-viewer.module.css";

/**
 * What was meant to be on the shelf, and what recognition found.
 *
 * Columns read **Expected / Found**: "detected" describes what the model did,
 * and this list is about the shelf, not the model. How well the model read it
 * is the Accuracy tab's question.
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
      <div className={styles.availabilityHead}>
        <div className={styles.availabilityMetric}>
          <span className={styles.availabilityLabel}>{AVAILABILITY.label}</span>
          <Hint text={AVAILABILITY.definition} className={styles.infoIcon}>
            <Icon name="info" size={13} />
          </Hint>
          <span className={styles.availabilityValue}>{AVAILABILITY.value}</span>
        </div>
        <CardActions>
          <CreateTicketButton
            context={{ region: retailer, metric: AVAILABILITY.label }}
          />
        </CardActions>
      </div>

      <div className={styles.countCaption}>{AVAILABILITY.detail}</div>
      <div className={styles.countCaption}>{AVAILABILITY.note}</div>

      <div className={styles.mslChecklistHead}>
        <span />
        <span>Expected</span>
        <span>Found</span>
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
              <span className={styles.mslExpected} aria-label="Expected on shelf">
                <Icon name="check" size={13} />
              </span>
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
