"use client";

import { Icon } from "@/app/_components/icon";
import {
  COUNTED_FACINGS,
  EXTRA_COUNTS,
  SHELF_TOGGLES,
  type ExtraKind,
} from "../_data/session-viewer";
import styles from "./session-viewer.module.css";

/**
 * The three overlay toggles.
 *
 * There is no checkbox primitive in this codebase — the only comparable control
 * is the `role="switch"` button on Analytics' category screen — so these are
 * `role="checkbox"` buttons built the same way rather than a shared component
 * introduced for one screen.
 *
 * The caption is the point of the row: each toggle only ever *adds* marks to
 * the stitch. The counted facing total never moves, so nothing here can put the
 * overlay and the tables into disagreement.
 */

type ShelfTogglesProps = {
  shown: Set<ExtraKind>;
  onToggle: (kind: ExtraKind) => void;
};

export function ShelfToggles({ shown, onToggle }: ShelfTogglesProps) {
  return (
    <div className={styles.toggleRow}>
      {SHELF_TOGGLES.map((toggle) => {
        const on = shown.has(toggle.kind);
        return (
          <button
            key={toggle.kind}
            type="button"
            role="checkbox"
            aria-checked={on}
            className={styles.checkbox}
            onClick={() => onToggle(toggle.kind)}
          >
            <span className={styles.checkboxBox} data-on={on} aria-hidden="true">
              {on ? <Icon name="check" size={12} /> : null}
            </span>
            {toggle.label}
          </button>
        );
      })}

      <span className={styles.toggleCaption}>
        {COUNTED_FACINGS} counted facings
        {EXTRA_COUNTS.map((entry) => (
          <span key={entry.kind} data-on={shown.has(entry.kind)}>
            {" · +"}
            {entry.count} {entry.short}
          </span>
        ))}
      </span>
    </div>
  );
}
