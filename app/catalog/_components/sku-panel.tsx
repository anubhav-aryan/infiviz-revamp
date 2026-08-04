"use client";

import { useEffect, useRef } from "react";
import { Icon } from "@/app/_components/icon";
import { RANGED_EXAMPLES, SKUS, skuAttributes } from "../_data/catalog";
import styles from "./catalog.module.css";

type SkuPanelProps = {
  index: number;
  onClose: () => void;
};

export function SkuPanel({ index, onClose }: SkuPanelProps) {
  const sku = SKUS[index];
  const closeRef = useRef<HTMLButtonElement>(null);

  // Keyboard control and focus handling are additions to the design, which was
  // pointer-only. The visual result is unchanged.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      opener?.focus?.();
    };
  }, [onClose]);

  return (
    <div className={styles.panelScrim} onClick={onClose} role="presentation">
      <div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label={`SKU detail — ${sku.name}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.panelHead}>
          <span className={styles.eyebrow}>SKU detail</span>
          <button
            ref={closeRef}
            type="button"
            className={styles.panelClose}
            onClick={onClose}
            aria-label="Close SKU detail"
          >
            <Icon name="x" />
          </button>
        </div>

        <div className={styles.panelBody}>
          <div
            className={`${styles.productImage} ${styles.productImageHero}`}
            aria-hidden="true"
          >
            <Icon name="package" size={48} />
          </div>

          <div className={styles.panelTitleRow}>
            <h2 className={styles.panelTitle}>{sku.name}</h2>
          </div>

          <div className={styles.attributes}>
            {skuAttributes(sku).map((attribute) => (
              <div key={attribute.key} className={styles.attributeRow}>
                <span className={styles.attributeKey}>{attribute.key}</span>
                <span
                  className={styles.attributeValue}
                  data-kind={attribute.kind}
                >
                  {attribute.value}
                </span>
              </div>
            ))}
          </div>

          <div className={styles.onPackLabel}>On-pack text</div>
          <div className={styles.onPackTags}>
            {sku.tags.map((tag) => (
              <span key={tag} className={styles.onPackTag}>
                {tag}
              </span>
            ))}
          </div>

          <div className={styles.ranged}>
            <div className={styles.rangedTitle}>
              <Icon name="store" aria-hidden="true" />
              Ranged in {sku.ranged} stores
            </div>
            <div className={styles.rangedBody}>{RANGED_EXAMPLES}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
