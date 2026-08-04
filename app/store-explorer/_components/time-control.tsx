"use client";

import { useState } from "react";
import { Icon } from "@/app/_components/icon";
import type { FilterDimension } from "@/app/_filters/model";
import { useFilterMenu } from "@/app/_filters/use-filter-menu";
import type { MonthKey } from "@/app/_time/periods";
import {
  type DayRef,
  type Period,
  PICKER_INITIAL_MONTH,
  PICKER_WEEKDAYS,
  PRESETS,
  calendarFor,
  dayIndex,
  formatDay,
  monthLabel,
  rangeLabel,
  sameDay,
  stepPickerMonth,
} from "../_data/period";
import styles from "./store-explorer.module.css";

/**
 * `useFilterMenu` is the popover state machine — open, close, outside pointer,
 * Escape — with its second step optional. This popover has no dimension list,
 * so it passes an empty catalogue and ignores the step state.
 */
const NO_STEPS: FilterDimension[] = [];

type Draft = { from: DayRef | null; to: DayRef | null };

type TimeControlProps = {
  period: Period;
  onChange: (period: Period) => void;
};

export function TimeControl({ period, onChange }: TimeControlProps) {
  const { open, toggle, close, rootRef } = useFilterMenu(NO_STEPS);
  const custom = period.kind === "custom" ? period : null;

  const [draft, setDraft] = useState<Draft>(
    custom ? { from: custom.from, to: custom.to } : { from: null, to: null },
  );
  const [month, setMonth] = useState<MonthKey>(
    custom ? custom.from.month : PICKER_INITIAL_MONTH,
  );

  function openPicker() {
    // Reopening should offer the range that is actually applied, not whatever
    // half-finished selection was abandoned last time.
    if (!open) {
      setDraft(custom ? { from: custom.from, to: custom.to } : { from: null, to: null });
      setMonth(custom ? custom.from.month : PICKER_INITIAL_MONTH);
    }
    toggle();
  }

  function pickDay(day: DayRef) {
    setDraft((current) => {
      // A complete range restarts; an earlier second click moves the start.
      if (!current.from || current.to) return { from: day, to: null };
      if (dayIndex(day) < dayIndex(current.from)) return { from: day, to: null };
      return { from: current.from, to: day };
    });
  }

  function apply() {
    if (!draft.from || !draft.to) return;
    onChange({ kind: "custom", from: draft.from, to: draft.to });
    close();
  }

  const prev = stepPickerMonth(month, -1);
  const next = stepPickerMonth(month, 1);
  const customLabel = custom ? rangeLabel(custom.from, custom.to) : "Custom";

  return (
    <div className={styles.popoverWrap} ref={rootRef}>
      <div className={styles.segmented}>
        {PRESETS.map((preset) => (
          <button
            key={preset.kind}
            type="button"
            className={styles.dateOption}
            data-active={period.kind === preset.kind}
            aria-pressed={period.kind === preset.kind}
            onClick={() => onChange({ kind: preset.kind })}
          >
            {preset.label}
          </button>
        ))}
        <button
          type="button"
          className={styles.dateOption}
          data-active={period.kind === "custom"}
          aria-pressed={period.kind === "custom"}
          aria-expanded={open}
          aria-label="Custom date range"
          onClick={openPicker}
        >
          <Icon name="calendar-days" size={14} />
          {customLabel}
        </button>
      </div>

      {open ? (
        <div className={`${styles.popover} ${styles.pickerPanel}`}>
          <div className={styles.pickerHead}>
            <button
              type="button"
              className={styles.pickerNav}
              onClick={() => prev && setMonth(prev)}
              disabled={!prev}
              aria-label="Previous month"
            >
              <Icon name="chevron-left" size={15} />
            </button>
            <span className={styles.pickerMonth}>{monthLabel(month)}</span>
            <button
              type="button"
              className={styles.pickerNav}
              onClick={() => next && setMonth(next)}
              disabled={!next}
              aria-label="Next month"
            >
              <Icon name="chevron-right" size={15} />
            </button>
          </div>

          <div className={styles.pickerGrid}>
            {PICKER_WEEKDAYS.map((day, i) => (
              <span key={i} className={styles.pickerDow}>
                {day}
              </span>
            ))}
            {calendarFor(month).map((cell, i) => {
              if (cell.day === null) return <span key={i} />;
              const ref: DayRef = { month, day: cell.day };
              const index = dayIndex(ref);
              const isStart = draft.from ? sameDay(ref, draft.from) : false;
              const isEnd = draft.to ? sameDay(ref, draft.to) : false;
              const inRange =
                draft.from && draft.to
                  ? index > dayIndex(draft.from) && index < dayIndex(draft.to)
                  : false;
              return (
                <button
                  key={i}
                  type="button"
                  className={styles.pickerDay}
                  data-edge={isStart || isEnd}
                  data-range={inRange}
                  aria-label={formatDay(ref)}
                  onClick={() => pickDay(ref)}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

          <div className={styles.pickerFoot}>
            <span className={styles.pickerHint}>
              {draft.from && draft.to
                ? rangeLabel(draft.from, draft.to)
                : draft.from
                  ? `${formatDay(draft.from)} — pick an end date`
                  : "Pick a start date"}
            </span>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={apply}
              disabled={!draft.from || !draft.to}
            >
              Apply
            </button>
          </div>

          <p className={styles.pickerNote}>
            Fixtures cover Feb–Jul 2026.
          </p>
        </div>
      ) : null}
    </div>
  );
}
