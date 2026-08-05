"use client";

import styles from "./charts.module.css";

/**
 * Promoted out of `analytics/_components/shared.tsx` so the metric toggles
 * (SOF/SOS/LSOS/ASOS, Pricing/Promotion, Category/Brand) and the tabbed tables
 * all share one control. Geometry is copied from the original exactly, so the
 * Analytics screen looks unchanged when it switches to this.
 *
 * `dark` is the near-black pill PowerBI puts the measure toggle on.
 */

type SegmentedProps<T extends string> = {
  options: readonly { id: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  tone?: "dark";
};

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  tone,
}: SegmentedProps<T>) {
  return (
    <div className={styles.segmented} role="group" aria-label={label} data-tone={tone}>
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          className={styles.segButton}
          data-active={option.id === value}
          aria-pressed={option.id === value}
          onClick={() => onChange(option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
