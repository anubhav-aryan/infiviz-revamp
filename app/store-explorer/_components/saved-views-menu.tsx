"use client";

import { useState } from "react";
import { Icon } from "@/app/_components/icon";
import {
  type ActiveFilter,
  type FilterDimension,
  parseFilters,
  serializeFilters,
} from "@/app/_filters/model";
import { useFilterMenu } from "@/app/_filters/use-filter-menu";
import { useSavedViews } from "@/app/_filters/use-saved-views";
import { type Period, parsePeriod, periodLabel, serializePeriod } from "../_data/period";
import { CATALOGUE } from "../_data/store-explorer";
import styles from "./store-explorer.module.css";

/** No second step — see the note in `time-control.tsx`. */
const NO_STEPS: FilterDimension[] = [];

type SavedViewsMenuProps = {
  period: Period;
  filters: ActiveFilter[];
  onApply: (period: Period, filters: ActiveFilter[]) => void;
};

export function SavedViewsMenu({ period, filters, onApply }: SavedViewsMenuProps) {
  const { open, toggle, close, rootRef } = useFilterMenu(NO_STEPS);
  const { views, ready, save, remove } = useSavedViews("store-explorer");
  const [name, setName] = useState("");

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    save(name, serializePeriod(period), filters);
    setName("");
  }

  return (
    <div className={styles.popoverWrap} ref={rootRef}>
      <button
        type="button"
        className={styles.ghostButton}
        onClick={toggle}
        aria-expanded={open}
      >
        <Icon name="bookmark" size={15} />
        Saved views
      </button>

      {open ? (
        <div className={`${styles.popover} ${styles.menu} ${styles.menuRight}`}>
          <div className={styles.menuHead}>Saved views</div>

          {views.length === 0 ? (
            <p className={styles.menuEmpty}>
              {ready
                ? "Nothing saved yet. Name the current period and filters below to keep them."
                : "Checking this browser…"}
            </p>
          ) : (
            views.map((view) => (
              <div key={view.id} className={styles.menuRow}>
                <button
                  type="button"
                  className={styles.menuItem}
                  onClick={() => {
                    // Storage is as untrusted as a URL, so the filters go back
                    // through the same catalogue check before they are applied.
                    onApply(
                      parsePeriod(view.period),
                      parseFilters(serializeFilters(view.filters), CATALOGUE),
                    );
                    close();
                  }}
                >
                  <span className={styles.menuItemLabel}>{view.name}</span>
                  <span className={styles.menuCount}>
                    {periodLabel(parsePeriod(view.period))}
                    {view.filters.length > 0 ? ` · ${view.filters.length}` : ""}
                  </span>
                </button>
                <button
                  type="button"
                  className={styles.menuDelete}
                  onClick={() => remove(view.id)}
                  aria-label={`Delete saved view ${view.name}`}
                >
                  <Icon name="x" size={14} />
                </button>
              </div>
            ))
          )}

          <form className={styles.menuForm} onSubmit={submit}>
            <input
              className={styles.menuInput}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Name this view"
              aria-label="Name for the saved view"
              maxLength={40}
            />
            <button
              type="submit"
              className={styles.primaryButton}
              disabled={!name.trim()}
            >
              Save
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
