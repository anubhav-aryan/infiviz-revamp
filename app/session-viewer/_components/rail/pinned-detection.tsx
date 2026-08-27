"use client";

import { Icon } from "@/app/_components/icon";
import { EXCEPTION_BY_BOX } from "../../_data/session-compliance";
import type { RecognitionBox } from "../../_data/session-viewer";
import { positionLabel } from "../../_data/session-viewer";
import styles from "../session-viewer.module.css";

const COMPLIANCE_LABEL: Record<RecognitionBox["compliance"], string> = {
  compliant: "Compliant",
  misplaced: "Misplaced",
};

/** The box the reader has pinned, and what the rest of the screen is showing because of it. */
export function PinnedDetection({
  box,
  onClear,
}: {
  box: RecognitionBox;
  onClear: () => void;
}) {
  const exception = EXCEPTION_BY_BOX.get(box.id);

  return (
    <div className={styles.pinCard} aria-live="polite">
      <div className={styles.pinHead}>
        <span className={styles.pinEyebrow}>Pinned detection</span>
        <button type="button" className={styles.pinClear} onClick={onClear}>
          Clear
        </button>
      </div>

      <div className={styles.pinBrand}>{box.brand}</div>

      <div className={styles.pinGrid}>
        <div>
          <div className={styles.metaLabel}>Position</div>
          <div className={styles.metaValue}>{positionLabel(box.id)}</div>
        </div>
        <div>
          <div className={styles.metaLabel}>Confidence</div>
          <div className={styles.metaValue}>{Math.round(box.confidence * 100)}%</div>
        </div>
        <div>
          <div className={styles.metaLabel}>Planogram</div>
          <div className={styles.metaValue}>{COMPLIANCE_LABEL[box.compliance]}</div>
        </div>
        {exception ? (
          <div>
            <div className={styles.metaLabel}>Expected</div>
            <div className={styles.metaValue}>{exception.expected}</div>
          </div>
        ) : null}
      </div>

      {exception ? <div className={styles.pinNote}>{exception.note}</div> : null}

      <div className={styles.pinNote}>
        <Icon name="list" size={12} /> The SKU table below is filtered to {box.brand}.
      </div>
    </div>
  );
}
