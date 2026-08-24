"use client";

import { useRouter } from "next/navigation";
import { SESSION_STORES } from "../_data/session-viewer";
import styles from "./session-viewer.module.css";

/**
 * What is left of the session rail once the global filter bar exists.
 *
 * Placement, Category, Store Banner and Date all moved into the bar — they are
 * shared dimensions, and having them in two places would mean two controls
 * disagreeing about the same fact. What stays is what is genuinely local to
 * this screen: **Store**, which navigates between the eight prerendered session
 * pages, and the session's own id, which identifies the capture being viewed
 * and is not a filter at all.
 */

type PickerProps = {
  id: string;
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  caption?: string;
};

function Picker({ id, label, value, options, onChange, caption }: PickerProps) {
  return (
    <div className={styles.railBlock}>
      <label className={styles.railLabel} htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        className={styles.railSelect}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {caption ? <div className={styles.railCaption}>{caption}</div> : null}
    </div>
  );
}

type SessionFilterRailProps = {
  /** Slug of the store being viewed, so the picker opens on it. Absent on the
   *  bare `/session-viewer`, which shows the authored default session. */
  activeSlug?: string;
};

export function SessionFilterRail({ activeSlug }: SessionFilterRailProps) {
  const router = useRouter();

  const storeOptions = SESSION_STORES.map(({ visit }) => visit.store);
  const activeStore =
    SESSION_STORES.find(({ slug }) => slug === activeSlug)?.visit.store ??
    storeOptions[0];

  return (
    <div className={styles.rail}>
      <Picker
        id="sv-store"
        label="Store"
        value={activeStore}
        options={storeOptions}
        onChange={(store) => {
          const match = SESSION_STORES.find(({ visit }) => visit.store === store);
          if (match) router.push(`/session-viewer/${match.slug}`);
        }}
      />
      {/* Visit date and session moved into the page header, where they are
          real controls. A read-only copy of the id here would go stale the
          moment the header's picker moved off the store's newest session. */}
      <p className={styles.railCaption}>
        Visit date and session are picked in the page header.
      </p>
    </div>
  );
}
