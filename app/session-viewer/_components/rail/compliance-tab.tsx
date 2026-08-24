"use client";

import { COMPLIANCE_CAPTION, EXCEPTIONS, type Exception } from "../../_data/session-compliance";
import styles from "../session-viewer.module.css";

/**
 * Where the bay departs from its planogram.
 *
 * Selecting a row pins the box it names on the capture — the point of the
 * screen is that "position 7" is somewhere you can look, not a coordinate you
 * take on faith.
 */
export function ComplianceTab({
  selectedBoxId,
  onPick,
  onHover,
}: {
  selectedBoxId: string | null;
  onPick: (exception: Exception) => void;
  onHover: (boxId: string | null) => void;
}) {
  return (
    <>
      <div className={styles.scopeRow} style={{ marginTop: 0 }}>
        <span className={styles.blockTitle}>Planogram exceptions</span>
        <span className={styles.countCaption} style={{ marginBottom: 0 }}>
          {COMPLIANCE_CAPTION}
        </span>
      </div>

      <div className={styles.countCaption}>
        Expected position comes from the bay&apos;s planogram; found position is what
        recognition read. Select a row to pin it on the capture.
      </div>

      {EXCEPTIONS.map((exception) => (
        <button
          key={`${exception.kind}-${exception.boxId}`}
          type="button"
          className={styles.exceptionRow}
          data-selected={selectedBoxId === exception.boxId}
          onClick={() => onPick(exception)}
          onMouseEnter={() => onHover(exception.boxId)}
          onMouseLeave={() => onHover(null)}
        >
          <span className={styles.exceptionTop}>
            <span className={styles.exceptionBrand}>{exception.brand}</span>
            <span
              className={styles.chip}
              data-tone={exception.kind === "absent" ? "warning" : "neutral"}
            >
              {exception.kind === "absent" ? "Missing" : "Misplaced"}
            </span>
          </span>

          <span className={styles.exceptionPair}>
            <span>
              <span className={styles.metaLabel}>Expected</span>
              <span className={styles.metaValue}>{exception.expected}</span>
            </span>
            <span>
              <span className={styles.metaLabel}>Found</span>
              <span className={styles.metaValue}>{exception.found}</span>
            </span>
          </span>

          <span className={styles.exceptionNote}>{exception.note}</span>
        </button>
      ))}
    </>
  );
}
