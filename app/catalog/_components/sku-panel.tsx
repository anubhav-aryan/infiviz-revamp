"use client";

import { useEffect, useRef } from "react";
import { AskInfiChatButton } from "@/app/_components/chat/ask-infichat-button";
import { ExcelDownloadButton } from "@/app/_export/excel-download-button";
import { Icon } from "@/app/_components/icon";
import { OWNERSHIP_LABEL, RANGED_EXAMPLES, SKUS, skuAttributes } from "../_data/catalog";
import styles from "./catalog.module.css";

function accuracyTone(accuracy: number): "good" | "fair" | "low" {
  if (accuracy >= 90) return "good";
  if (accuracy >= 75) return "fair";
  return "low";
}

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
            {!sku.packshot ? (
              <span className={styles.packshotMissingBadge}>
                <Icon name="image-off" size={11} />
                No packshot
              </span>
            ) : null}
          </div>

          <div className={styles.panelTitleRow}>
            <h2 className={styles.panelTitle}>{sku.name}</h2>
            <AskInfiChatButton label={sku.name} compact />
            <ExcelDownloadButton label={sku.name} compact />
          </div>

          <span className={styles.ownershipTag} data-ownership={sku.ownership}>
            {OWNERSHIP_LABEL[sku.ownership]}
          </span>

          <div className={styles.accuracySection}>
            <div className={styles.accuracySectionHead}>
              <Icon name="target" size={14} aria-hidden="true" />
              Recognition accuracy
            </div>
            {sku.trained ? (
              <div className={styles.accuracyStats}>
                <div>
                  <span
                    className={styles.accuracyBig}
                    data-tone={accuracyTone(sku.accuracy)}
                  >
                    {sku.accuracy}%
                  </span>
                  <span className={styles.accuracyBigLabel}>accuracy</span>
                </div>
                <div>
                  <span className={styles.accuracyBig}>{sku.sampleCount}</span>
                  <span className={styles.accuracyBigLabel}>sample count</span>
                </div>
              </div>
            ) : (
              <div className={styles.accuracyUntrained}>
                <Icon name="alert-triangle" size={14} aria-hidden="true" />
                Untrained — {sku.untrainedReason ?? "no reason on file."}
              </div>
            )}
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
              <AskInfiChatButton label={`${sku.name} — ranged stores`} compact />
              <ExcelDownloadButton label={`${sku.name} — ranged stores`} compact />
            </div>
            <div className={styles.rangedBody}>{RANGED_EXAMPLES}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
