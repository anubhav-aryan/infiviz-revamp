"use client";

import { AskInfiChatButton } from "@/app/_components/chat/ask-infichat-button";
import { Hint } from "@/app/_components/hint";
import { Icon } from "@/app/_components/icon";
import { useGlobalFilters } from "@/app/_filters/global-filter-context";
import { valueLabel } from "@/app/_filters/registry";
import { MONTH_INDEX, availLevel, visLevel } from "../_data/spine";
import {
  CATEGORY_METRICS,
  NATIONAL_OSA,
  NATIONAL_SOS,
  OSA_RANGE,
  SOS_RANGE,
  categoryOsaAt,
  categorySosAt,
} from "../_data/category-metrics";
import type { MonthKey } from "@/app/_time/periods";
import styles from "./analytics.module.css";
import { CardActions } from "@/app/_components/card-actions";

/**
 * A metric, one panel per category — never a blended average.
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
 * assertion in `category-metrics.ts` — so this card and the rest of the dashboard
 * are the same measurement at two levels, not two unrelated numbers.
 */

/**
 * The two metrics this card can draw. Structurally identical — the same
 * filter-aware small multiples over the same table — so they share a component
 * rather than becoming two files that drift, which is exactly how this codebase
 * ended up with three disagreeing share-of-shelf tables.
 */
const METRICS = {
  sos: {
    title: "Share of shelf by category",
    noun: "share of shelf",
    target: 45,
    value: categorySosAt,
    level: visLevel,
    delta: (row: (typeof CATEGORY_METRICS)[number]) => row.delta,
    national: NATIONAL_SOS,
    range: SOS_RANGE,
    of: (row: (typeof CATEGORY_METRICS)[number]) => row.sos,
  },
  osa: {
    title: "On-shelf availability by category",
    noun: "availability",
    target: 85,
    value: categoryOsaAt,
    level: availLevel,
    delta: (row: (typeof CATEGORY_METRICS)[number]) => row.osaDelta,
    national: NATIONAL_OSA,
    range: OSA_RANGE,
    of: (row: (typeof CATEGORY_METRICS)[number]) => row.osa,
  },
} as const;

export type CategoryMetricId = keyof typeof METRICS;

export function CategoryPanels({
  metric,
  period,
  compare,
}: {
  metric: CategoryMetricId;
  period: MonthKey;
  compare: boolean;
}) {
  const spec = METRICS[metric];
  const api = useGlobalFilters();
  const monthIndex = MONTH_INDEX[period] ?? 0;
  const level = spec.level(monthIndex);

  /* The filter bar speaks canonical ids; this table is keyed by label. Only
     categories the bar actually offers can be selected, so an unmatched
     selection simply leaves the full set — it never empties the card. */
  const selectedLabels = (api?.filters ?? [])
    .filter((filter) => filter.dim === "category")
    .map((filter) => valueLabel("category", filter.value));

  const shown = selectedLabels.length
    ? CATEGORY_METRICS.filter((row) => selectedLabels.includes(row.label))
    : CATEGORY_METRICS;

  const panels = shown.length ? shown : CATEGORY_METRICS;

  /* The blend, promoted from footnote to a leading tile.
     Always across *all* categories, never just the filtered ones: the tile's
     job is the context the panels beside it lack, and a blend of one selected
     category would simply restate that panel. It is `NATIONAL_SOS`/
     `NATIONAL_OSA` by construction — the same weighting `category-metrics.ts`
     asserts against the national series. */
  const blend = (pick: (row: (typeof CATEGORY_METRICS)[number]) => number) =>
    +CATEGORY_METRICS.reduce(
      (total, row) => total + pick(row) * row.countShare,
      0,
    ).toFixed(1);

  const overall = {
    value: blend((row) => spec.value(row, level)),
    delta: blend(spec.delta),
  };

  return (
    <div className={styles.sosCard}>
      <div className={styles.sosHead}>
        <div>
          <span className={styles.panelTitle}>{spec.title}</span>
          <div className={styles.sosSubtitle}>
            {panels.length === 1
              ? `${panels[0].label} · ${period === "2026-07" ? "this month" : "selected month"}`
              : `${panels.length} categories · shown separately, never averaged`}
          </div>
        </div>
        <CardActions>
          <AskInfiChatButton label={spec.title} compact />
        </CardActions>
      </div>

      <div className={styles.sosGrid} data-count={Math.min(panels.length + 1, 6)}>
        {/* Leads the row: it is the number the headline card used to carry, and
            it reads as a summary of the tiles after it rather than a sixth
            category. The caveat travels with it. */}
        <div className={styles.sosPanel} data-overall="true">
          <div className={styles.sosName}>
            All categories
            <Hint
              text="Every category, weighted by how many audited stores carry each. Category mix moves it even when no shelf changes, so the panels beside it are what you act on."
              className={styles.healthInfo}
            >
              <Icon name="info" size={12} />
            </Hint>
          </div>
          <div className={styles.sosValueRow}>
            <span className={styles.sosValue}>
              {overall.value}
              <span className={styles.sosUnit}>%</span>
            </span>
            <span className={styles.delta} data-tone={overall.delta >= 0 ? "up" : "down"}>
              <Icon
                name={overall.delta >= 0 ? "arrow-up-right" : "arrow-down-right"}
                size={13}
              />
              {Math.abs(overall.delta)}
            </span>
          </div>

          <div className={styles.sosTrack}>
            <div className={styles.sosFill} style={{ width: `${overall.value}%` }} />
            {compare ? (
              <div
                className={styles.sosGhost}
                style={{ left: `${+(overall.value - overall.delta).toFixed(1)}%` }}
              />
            ) : null}
            <div className={styles.sosTarget} style={{ left: `${spec.target}%` }} />
          </div>
          <div className={styles.sosScale}>
            <span>{overall.value >= spec.target ? "On target" : "Below target"}</span>
            <span className={styles.mono}>{spec.target}%</span>
          </div>
        </div>

        {panels.map((row) => {
          const value = spec.value(row, level);
          const previous = +(value - spec.delta(row)).toFixed(1);
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
                  data-tone={spec.delta(row) >= 0 ? "up" : "down"}
                >
                  <Icon
                    name={spec.delta(row) >= 0 ? "arrow-up-right" : "arrow-down-right"}
                    size={13}
                  />
                  {Math.abs(spec.delta(row))}
                </span>
              </div>

              <div className={styles.sosTrack}>
                <div className={styles.sosFill} style={{ width: `${value}%` }} />
                {compare ? (
                  <div className={styles.sosGhost} style={{ left: `${previous}%` }} />
                ) : null}
                <div className={styles.sosTarget} style={{ left: `${spec.target}%` }} />
              </div>
              <div className={styles.sosScale}>
                <span>{value >= spec.target ? "On target" : "Below target"}</span>
                <span className={styles.mono}>{spec.target}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* The spread the blend hides. The number itself now leads the row, so
          this says what it costs rather than repeating it. */}
      <div className={styles.sosFoot}>
        <Icon name="info" size={12} />
        That blend spans {spec.range.low.label} at {spec.of(spec.range.low)}% to{" "}
        {spec.range.high.label} at {spec.of(spec.range.high)}% — no single shelf
        looks like it, which is why the categories are shown separately beside it.
      </div>
    </div>
  );
}
