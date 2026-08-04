"use client";

import { useEffect, useRef } from "react";
import { Icon } from "@/app/_components/icon";
import { PHOTOS, photoMetadata } from "../_data/store-explorer";
import styles from "./store-explorer.module.css";

type PhotoLightboxProps = {
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
};

export function PhotoLightbox({
  index,
  onClose,
  onPrev,
  onNext,
}: PhotoLightboxProps) {
  const photo = PHOTOS[index];
  const closeRef = useRef<HTMLButtonElement>(null);

  // Keyboard control and focus handling are additions to the design, which was
  // pointer-only. The visual result is unchanged.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") onPrev();
      if (event.key === "ArrowRight") onNext();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      opener?.focus?.();
    };
  }, [onClose, onPrev, onNext]);

  return (
    <div
      className={styles.lightboxBackdrop}
      onClick={onClose}
      role="presentation"
    >
      <div
        className={styles.lightboxPanel}
        role="dialog"
        aria-modal="true"
        aria-label={`Photo ${photo.seq}, ${photo.category}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={`${styles.lightboxStage} ${styles.photoPlaceholderLarge}`}>
          {/* Disabled at the ends rather than silently clamping, so the control
              never looks available when it cannot move. */}
          <button
            type="button"
            className={`${styles.lightboxNav} ${styles.lightboxPrev}`}
            onClick={onPrev}
            disabled={index === 0}
            aria-label="Previous photo"
          >
            <Icon name="chevron-left" />
          </button>
          <button
            type="button"
            className={`${styles.lightboxNav} ${styles.lightboxNext}`}
            onClick={onNext}
            disabled={index === PHOTOS.length - 1}
            aria-label="Next photo"
          >
            <Icon name="chevron-right" />
          </button>
        </div>

        <div className={styles.lightboxSide}>
          <div className={styles.lightboxSideHead}>
            <span className={styles.lightboxSeq}>Photo #{photo.seq}</span>
            <button
              ref={closeRef}
              type="button"
              className={styles.lightboxClose}
              onClick={onClose}
              aria-label="Close photo"
            >
              <Icon name="x" />
            </button>
          </div>

          <div className={styles.lightboxMeta}>
            {photoMetadata(photo).map((row) => (
              <div key={row.key} className={styles.lightboxMetaRow}>
                <span className={styles.lightboxMetaKey}>{row.key}</span>
                <span className={styles.lightboxMetaValue}>{row.value}</span>
              </div>
            ))}
          </div>

          <div className={styles.lightboxNote}>
            Raw capture — no recognition output on this path.
          </div>
        </div>
      </div>
    </div>
  );
}
