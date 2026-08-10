"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/app/_components/icon";
import type { FilterDimension } from "@/app/_filters/model";
import { useFilterMenu } from "@/app/_filters/use-filter-menu";
import { MONTH_BY_KEY, type MonthKey } from "./periods";
import {
  CUSTOM_RANGE_MAX,
  CUSTOM_RANGE_MIN,
  DATE_PRESETS,
  presetToMonth,
  type CustomRange,
  type DatePreset,
} from "./presets";
import styles from "./date-preset-picker.module.css";

const NO_DIMENSIONS: FilterDimension[] = [];

type DatePreatPickerBase = {
  /** The month currently in effect — drives the trigger label and the
   *  resolved-month caption inside the popover. */
  period: MonthKey;
};

type DatePresetPickerProps =
  | (DatePreatPickerBase & {
      /** Query-param-driven pages: the picker just reports the resolved month. */
      mode: "callback";
      onChange: (month: MonthKey) => void;
    })
  | (DatePreatPickerBase & {
      /**
       * Path-segment-driven pages: the picker navigates itself, to
       * `${basePath}/${month}`. A plain string, not a `(month) => string`
       * callback — several of this mode's callers (`ReportHeader`,
       * `JourneyPlansBoard`) are Server Components, and a closure can't cross
       * into a Client Component prop; only serialisable data can.
       */
      mode: "link";
      basePath: string;
    });

/**
 * One shared "quick date" popover for every analytics-adjacent page: preset
 * buttons plus a custom range, always resolving to a `MonthKey` (see
 * `presets.ts` for why) and always showing which month that resolved to, so
 * the control is never claiming day/week precision the data doesn't have.
 */
export function DatePresetPicker(props: DatePresetPickerProps) {
  const { period } = props;
  const router = useRouter();
  const { open, toggle, close, rootRef } = useFilterMenu(NO_DIMENSIONS);
  const [range, setRange] = useState<CustomRange>({
    start: CUSTOM_RANGE_MIN,
    end: CUSTOM_RANGE_MAX,
  });

  const resolve = (month: MonthKey) => {
    if (props.mode === "callback") props.onChange(month);
    else router.push(`${props.basePath}/${month}`);
    close();
  };

  const applyPreset = (preset: DatePreset) => resolve(presetToMonth(preset));
  const applyCustom = () => resolve(presetToMonth("custom", range));

  return (
    <div className={styles.anchor} ref={rootRef}>
      <button
        type="button"
        className={styles.trigger}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={toggle}
      >
        <Icon name="calendar" size={14} />
        {MONTH_BY_KEY[period].label}
        <Icon name="chevron-down" size={14} />
      </button>

      {open ? (
        <div className={styles.menu} role="menu" aria-label="Quick date range">
          <div className={styles.presetList}>
            {DATE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                role="menuitem"
                className={styles.presetItem}
                onClick={() => applyPreset(preset.id)}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className={styles.customRow}>
            <span className={styles.customLabel}>Custom range</span>
            <div className={styles.customInputs}>
              <input
                type="date"
                className={styles.dateInput}
                value={range.start}
                min={CUSTOM_RANGE_MIN}
                max={range.end}
                onChange={(event) =>
                  setRange((prev) => ({ ...prev, start: event.target.value }))
                }
                aria-label="Range start"
              />
              <span className={styles.customSep} aria-hidden="true">
                –
              </span>
              <input
                type="date"
                className={styles.dateInput}
                value={range.end}
                min={range.start}
                max={CUSTOM_RANGE_MAX}
                onChange={(event) =>
                  setRange((prev) => ({ ...prev, end: event.target.value }))
                }
                aria-label="Range end"
              />
            </div>
            <button type="button" className={styles.applyButton} onClick={applyCustom}>
              Apply
            </button>
          </div>

          {/* No daily/weekly fixtures exist behind any of the presets above —
              every one of them resolves to one of the six authored months, so
              this caption is the honest read of what picking one actually
              does. */}
          <div className={styles.resolvedCaption}>
            → showing {MONTH_BY_KEY[period].label}
          </div>
        </div>
      ) : null}
    </div>
  );
}
