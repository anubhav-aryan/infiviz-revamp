"use client";

import { COMPLIANCE_CAPTION, EXCEPTIONS, type Exception } from "../../_data/session-compliance";
import styles from "../session-viewer.module.css";

/**
 * Where the bay departs from its planogram.
 *
 * Selecting a misplaced row pins the box it names on the capture — the point of
 * the screen is that "position 7" is somewhere you can look, not a coordinate
 * you take on faith. An absent row has no box to pin, so it opens the
 * must-stock list, which is where a gap is answerable.
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
      <div className={styles.scopeRow} data-first="true">
        <span className={styles.blockTitle}>Planogram exceptions</span>
        <span className={styles.countCaption} style={{ marginBottom: 0 }}>
          {COMPLIANCE_CAPTION}
        </span>
      </div>

      <p className={styles.blockNote}>
        Expected position comes from the bay&apos;s planogram; found position is what
        recognition read. Selecting a misplaced row pins it on the capture; an absent
        SKU has no box to pin, so it opens the must-stock list instead.
      </p>

      {EXCEPTIONS.map((exception) => (
        <button
          key={`${exception.kind}-${exception.brand}-${exception.expected}`}
          type="button"
          className={styles.exceptionRow}
          data-selected={exception.boxId !== undefined && selectedBoxId === exception.boxId}
          onClick={() => onPick(exception)}
          onMouseEnter={() => onHover(exception.boxId ?? null)}
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
