"use client";

import { AskInfiChatButton } from "@/app/_components/chat/ask-infichat-button";
import chatStyles from "@/app/_components/chat/chat.module.css";
import { Hint } from "@/app/_components/hint";
import { Icon } from "@/app/_components/icon";
import { useGlobalFilters } from "@/app/_filters/global-filter-context";
import { valueLabel } from "@/app/_filters/registry";
import { MONTH_INDEX, visLevel } from "../_data/spine";
import {
  CATEGORY_SOS,
  NATIONAL_SOS,
  SOS_RANGE,
  categorySosAt,
} from "../_data/category-sos";
import type { MonthKey } from "@/app/_time/periods";
import styles from "./analytics.module.css";

/**
 * Share of shelf, one panel per category — never a blended average.
 *
 * **Why there is no single number here.** Averaging share of shelf across a
 * client's categories produces a figure that describes no shelf anyone can
 * point at. In this account the spread runs from 19.6% on mouthwash to 59.7%
 * on whitening; the blend of 38.7% is arithmetically true and operationally
 * meaningless, and it is worse elsewhere — a client whose range runs 1% to 80%
 * gets a number that moves when the category mix changes and not when any shelf
 * does.
 *
 * So this card refuses to render a cross-category mean. It shows small
 * multiples: with one category selected in the filter bar it is a single panel,
 * with several it is a row of them, and with none it shows them all rather than
 * collapsing to an average. The national figure appears only as a footnote,
 * labelled as what it is.
 *
 * Panels weight-average back to that national figure by construction — see the
 * assertion in `category-sos.ts` — so this card and the rest of the dashboard
 * are the same measurement at two levels, not two unrelated numbers.
 */

const TARGET = 45;

export function SosPanels({
  period,
  compare,
}: {
  period: MonthKey;
  compare: boolean;
}) {
  const api = useGlobalFilters();
  const monthIndex = MONTH_INDEX[period] ?? 0;
  const level = visLevel(monthIndex);

  /* The filter bar speaks canonical ids; this table is keyed by label. Only
     categories the bar actually offers can be selected, so an unmatched
     selection simply leaves the full set — it never empties the card. */
  const selectedLabels = (api?.filters ?? [])
    .filter((filter) => filter.dim === "category")
    .map((filter) => valueLabel("category", filter.value));

  const shown = selectedLabels.length
    ? CATEGORY_SOS.filter((row) => selectedLabels.includes(row.label))
    : CATEGORY_SOS;

  const panels = shown.length ? shown : CATEGORY_SOS;

  return (
    <div className={styles.sosCard}>
      <div className={styles.sosHead}>
        <div>
          <span className={styles.panelTitle}>Share of shelf by category</span>
          <div className={styles.sosSubtitle}>
            {panels.length === 1
              ? `${panels[0].label} · ${period === "2026-07" ? "this month" : "selected month"}`
              : `${panels.length} categories · shown separately, never averaged`}
          </div>
        </div>
        <span className={chatStyles.askGroup}>
          <AskInfiChatButton label="Share of shelf by category" compact />
        </span>
      </div>

      <div className={styles.sosGrid} data-count={Math.min(panels.length, 5)}>
        {panels.map((row) => {
          const value = categorySosAt(row, level);
          const previous = +(value - row.delta).toFixed(1);
          return (
            <div key={row.id} className={styles.sosPanel}>
              <div className={styles.sosName}>{row.label}</div>
              <div className={styles.sosValueRow}>
                <span className={styles.sosValue}>
                  {value}
                  <span className={styles.sosUnit}>%</span>
                </span>
                <span
                  className={styles.delta}
                  data-tone={row.delta >= 0 ? "up" : "down"}
                >
                  <Icon
                    name={row.delta >= 0 ? "arrow-up-right" : "arrow-down-right"}
                    size={13}
                  />
                  {Math.abs(row.delta)}
                </span>
              </div>

              <div className={styles.sosTrack}>
                <div className={styles.sosFill} style={{ width: `${value}%` }} />
                {compare ? (
                  <div className={styles.sosGhost} style={{ left: `${previous}%` }} />
                ) : null}
                <div className={styles.sosTarget} style={{ left: `${TARGET}%` }} />
              </div>
              <div className={styles.sosScale}>
                <span>{value >= TARGET ? "On target" : "Below target"}</span>
                <span className={styles.mono}>{TARGET}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* The blend, stated as a footnote and never as the headline. */}
      <div className={styles.sosFoot}>
        <Icon name="info" size={12} />
        Blended across all categories this is {NATIONAL_SOS}% — a figure between{" "}
        {SOS_RANGE.low.label} at {SOS_RANGE.low.sos}% and {SOS_RANGE.high.label} at{" "}
        {SOS_RANGE.high.sos}%, describing no shelf in particular.
        <Hint
          text="Category mix moves this number even when no shelf changes, which is why it is not the headline here."
          className={styles.healthInfo}
        >
          <Icon name="info" size={12} />
        </Hint>
      </div>
    </div>
  );
}
