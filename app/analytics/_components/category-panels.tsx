"use client";

import { AskInfiChatButton } from "@/app/_components/chat/ask-infichat-button";
import { Hint } from "@/app/_components/hint";
import { Icon } from "@/app/_components/icon";
import { useState } from "react";
import { useGlobalFilters } from "@/app/_filters/global-filter-context";
import { valueLabel } from "@/app/_filters/registry";
import { MONTH_INDEX, availLevel, visLevel } from "../_data/spine";
import {
  CATEGORY_METRICS,
  NATIONAL_OSA,
  NATIONAL_SOS,
  OSA_RANGE,
  SOS_RANGE,
  SUBCATEGORY_METRICS,
  SUB_OSA_RANGE,
  SUB_SOS_RANGE,
  TOOTHPASTE,
  categoryOsaAt,
  categorySosAt,
  type CategoryMetrics,
} from "../_data/category-metrics";
import type { MonthKey } from "@/app/_time/periods";
import { Segmented } from "./shared";
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
    title: "Share of shelf",
    noun: "share of shelf",
    target: 45,
    value: categorySosAt,
    level: visLevel,
    delta: (row: CategoryMetrics) => row.delta,
    national: NATIONAL_SOS,
    range: SOS_RANGE,
    subRange: SUB_SOS_RANGE,
    of: (row: CategoryMetrics) => row.sos,
  },
  osa: {
    title: "On-shelf availability",
    noun: "availability",
    target: 85,
    value: categoryOsaAt,
    level: availLevel,
    delta: (row: CategoryMetrics) => row.osaDelta,
    national: NATIONAL_OSA,
    range: OSA_RANGE,
    subRange: SUB_OSA_RANGE,
    of: (row: CategoryMetrics) => row.osa,
  },
} as const;

export type CategoryMetricId = keyof typeof METRICS;

/**
 * The level being shown. A category manager asked for the cut one level down —
 * toothpaste is not one shelf conversation, it is cavity protection versus
 * whitening versus herbal versus kids, and those move independently.
 *
 * Only toothpaste has sub-category fixtures, so the mode says so rather than
 * pretending the other four are missing data. Sub-category rows weight back to
 * toothpaste's own figures exactly as the category rows weight to the national
 * one — see the assertions in `category-metrics.ts`.
 */
const MODES = {
  categories: {
    label: "Categories",
    rows: CATEGORY_METRICS,
    /** The filter dimension this level answers for. */
    filterDim: "category" as const,
    blendLabel: "All categories",
    blendHint:
      "Every category, weighted by how many audited stores carry each. Category mix moves it even when no shelf changes, so the panels beside it are what you act on.",
    /** Null means compute the blend across the rows. */
    blendRow: null as CategoryMetrics | null,
    subtitle: (n: number) => `${n} categories · shown separately, never averaged`,
    spread:
      "no single shelf looks like it, which is why the categories are shown separately beside it",
  },
  subcategories: {
    label: "Sub-categories",
    rows: SUBCATEGORY_METRICS,
    filterDim: "subCategory" as const,
    blendLabel: "Toothpaste · blended",
    blendHint:
      "Toothpaste's own figure. The sub-category panels weight back to it by construction, so this tile is the category they add up to rather than a separate measurement.",
    blendRow: TOOTHPASTE,
    subtitle: () =>
      "Toothpaste sub-categories — the one category broken down this far",
    spread:
      "toothpaste is not one shelf conversation, which is why its sub-categories are shown separately",
  },
} as const;

type PanelMode = keyof typeof MODES;

/* `Segmented` labels its buttons with the option itself, so the options are
   the labels and this maps back to the mode. */
type ModeLabel = (typeof MODES)[PanelMode]["label"];

const MODE_LABELS = (Object.keys(MODES) as PanelMode[]).map(
  (id) => MODES[id].label,
) as ModeLabel[];

const MODE_BY_LABEL = Object.fromEntries(
  (Object.keys(MODES) as PanelMode[]).map((id) => [MODES[id].label, id]),
) as Record<ModeLabel, PanelMode>;

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
  /* Local, and per card: the level is a way of reading one panel rather than a
     scope the rest of the screen shares, so it stays out of the URL — the same
     call the competitor-breakout toggle makes. Each card owns its own, so the
     two can be compared at different levels. */
  const [mode, setMode] = useState<PanelMode>("categories");
  const modeSpec = MODES[mode];
  const rows = modeSpec.rows;

  const api = useGlobalFilters();
  const monthIndex = MONTH_INDEX[period] ?? 0;
  const level = spec.level(monthIndex);

  /* The filter bar speaks canonical ids; these tables are keyed by label. Only
     values the bar actually offers can be selected, so an unmatched selection
     simply leaves the full set — it never empties the card. Each level honours
     its own dimension: a category filter narrows the category panels, a
     sub-category filter narrows the sub-category ones. */
  const selectedLabels = (api?.filters ?? [])
    .filter((filter) => filter.dim === modeSpec.filterDim)
    .map((filter) => valueLabel(modeSpec.filterDim, filter.value));

  const shown = selectedLabels.length
    ? rows.filter((row) => selectedLabels.includes(row.label))
    : rows;

  const panels: readonly CategoryMetrics[] = shown.length ? shown : rows;

  /* The blend, promoted from footnote to a leading tile.
     Always across *all* categories, never just the filtered ones: the tile's
     job is the context the panels beside it lack, and a blend of one selected
     category would simply restate that panel. It is `NATIONAL_SOS`/
     `NATIONAL_OSA` by construction — the same weighting `category-metrics.ts`
     asserts against the national series. */
  const blend = (pick: (row: CategoryMetrics) => number) =>
    +rows.reduce((total, row) => total + pick(row) * row.countShare, 0).toFixed(1);

  /* Sub-category mode has a real parent row, so it shows toothpaste's own
     figure rather than a recomputation of it — they are equal by construction,
     and quoting the canonical row means they cannot drift apart. */
  const overall = modeSpec.blendRow
    ? {
        value: spec.value(modeSpec.blendRow, level),
        delta: spec.delta(modeSpec.blendRow),
      }
    : {
        value: blend((row) => spec.value(row, level)),
        delta: blend(spec.delta),
      };

  const range = mode === "subcategories" ? spec.subRange : spec.range;

  return (
    <div className={styles.sosCard}>
      <div className={styles.sosHead}>
        <div>
          <span className={styles.panelTitle}>{spec.title}</span>
          <div className={styles.sosSubtitle}>
            {panels.length === 1
              ? `${panels[0].label} · ${period === "2026-07" ? "this month" : "selected month"}`
              : modeSpec.subtitle(panels.length)}
          </div>
        </div>
        <CardActions>
          <Segmented
            options={MODE_LABELS}
            value={modeSpec.label}
            onChange={(label) => setMode(MODE_BY_LABEL[label])}
            label="Breakdown level"
          />
          <AskInfiChatButton label={`${spec.title} · ${modeSpec.label}`} compact />
        </CardActions>
      </div>

      <div className={styles.sosGrid} data-count={Math.min(panels.length + 1, 6)}>
        {/* Leads the row: it is the number the headline card used to carry, and
            it reads as a summary of the tiles after it rather than a sixth
            category. The caveat travels with it. */}
        <div className={styles.sosPanel} data-overall="true">
          <div className={styles.sosName}>
            {modeSpec.blendLabel}
            <Hint text={modeSpec.blendHint} className={styles.healthInfo}>
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
        That blend spans {range.low.label} at {spec.of(range.low)}% to{" "}
        {range.high.label} at {spec.of(range.high)}% — {modeSpec.spread}.
      </div>
    </div>
  );
}
