import { Icon } from "@/app/_components/icon";
import {
  BOX_LEGEND,
  BOX_PAINT,
  RECOGNITION_BOXES,
  SHELF_IMAGE,
  STITCH_PHOTOS,
} from "../_data/session-viewer";
import styles from "./session-viewer.module.css";

type EvidencePanelProps = {
  boxes: boolean;
  onToggleBoxes: () => void;
};

/** The left column: the stitched shelf and the raw frames it was built from. */
export function EvidencePanel({ boxes, onToggleBoxes }: EvidencePanelProps) {
  return (
    <div className={styles.column}>
      <div className={`${styles.card} ${styles.evidenceCard}`}>
        <div className={styles.shelfHead}>
          <span className={styles.cardTitle}>Stitched shelf · recognition</span>
          <button
            type="button"
            className={styles.toggle}
            data-active={boxes}
            aria-pressed={boxes}
            onClick={onToggleBoxes}
          >
            <Icon name={boxes ? "eye" : "eye-off"} size={15} />
            {boxes ? "Boxes on" : "Boxes off"}
          </button>
        </div>

        <div className={styles.shelf}>
          <img
            className={styles.shelfImage}
            src={SHELF_IMAGE}
            alt="Stitched shelf capture"
          />
          {boxes ? (
            // `preserveAspectRatio="none"` is deliberate: the boxes were placed
            // against the stitch, so they must stretch with it rather than
            // stay square.
            <svg
              viewBox="0 0 100 56"
              preserveAspectRatio="none"
              className={styles.shelfOverlay}
              aria-label="Recognition boxes over the stitched shelf"
            >
              {RECOGNITION_BOXES.map((box) => {
                const paint = BOX_PAINT[box.kind];
                return (
                  <rect
                    key={`${box.kind}-${box.x}-${box.y}`}
                    x={box.x}
                    y={box.y}
                    width={box.w}
                    height={box.h}
                    rx="0.6"
                    fill={paint.fill}
                    stroke={paint.stroke}
                    strokeWidth="0.6"
                    strokeDasharray={paint.dash}
                  />
                );
              })}
            </svg>
          ) : null}
        </div>

        <div className={styles.legend}>
          {BOX_LEGEND.map((entry) => (
            <span key={entry.kind} className={styles.legendItem}>
              <span
                className={styles.legendSwatch}
                data-kind={entry.kind}
                aria-hidden="true"
              />
              {entry.label}
            </span>
          ))}
        </div>
      </div>

      <div className={`${styles.card} ${styles.evidenceCard}`}>
        <span className={`${styles.cardTitle} ${styles.cardTitleBlock}`}>
          Photos in this stitch · capture order
        </span>
        <div className={styles.photoGrid}>
          {STITCH_PHOTOS.map((photo) => (
            <div key={photo.label}>
              <img className={styles.photoThumb} src={photo.src} alt={photo.label} />
              <div className={styles.photoLabel}>{photo.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
