"use client";

import { GapCards } from "@/app/_charts/gap-cards";
import { MeasureTable } from "@/app/_charts/measure-table";
import { Donut } from "@/app/_charts/radial";
import { StatCard } from "@/app/_charts/stat-card";
import { TrendChart } from "@/app/_charts/trend-chart";
import charts from "@/app/_charts/charts.module.css";
import type { MonthKey } from "@/app/_time/periods";
import { metricViewFor } from "../_data/module-registry";
import { NATIONAL } from "../_data/scope";
import type { BoardWidget } from "../_data/board-widgets";
import styles from "./boards.module.css";

/**
 * One widget on a board.
 *
 * The data comes from `metricViewFor` — the same call the real module screens
 * make, with the same per-module cache — so a board card shows the figure its
 * module shows, and nothing here holds a number of its own. Scope is always
 * national: a board is the reader's own page, not a persona's, and there is no
 * scope picker on it to say otherwise.
 *
 * A widget whose module the factory does not drive resolves to `undefined`,
 * which is drawn as a stated gap rather than an empty card — the catalogue and
 * the registry could drift, and silence would hide it.
 */
export function BoardWidgetCard({
  widget,
  period,
}: {
  widget: BoardWidget;
  period: MonthKey;
}) {
  const view = metricViewFor(widget.module, NATIONAL, widget.measure, period);

  /* No remove control. A saved board is read-only and a widget leaves it by
     being unticked in the editor — one place that decides what is on a board,
     rather than a per-card action that would have to write immediately and
     undercut the editor's Save. */
  return (
    <div className={`${charts.card} ${charts.cardPad}`}>
      <div className={charts.cardHead}>
        <div className={charts.cardTitle}>{widget.label}</div>
      </div>

      {view ? (
        <Body widget={widget} view={view} />
      ) : (
        <p className={styles.widgetGap}>
          {widget.module} does not publish {widget.measure} yet.
        </p>
      )}
    </div>
  );
}

function Body({
  widget,
  view,
}: {
  widget: BoardWidget;
  view: NonNullable<ReturnType<typeof metricViewFor>>;
}) {
  switch (widget.kind) {
    case "headline":
      return (
        <StatCard
          label={view.measureLabel}
          value={view.headline}
          caption={`${view.monthLabel} · ${view.scopeCaption}`}
          secondary={view.headlineDelta}
        />
      );

    case "trend":
      return <TrendChart data={view.trend} />;

    case "groupCards":
      return (
        <div className={styles.widgetGroupCards}>
          {view.groupCards.map((card) => (
            <div key={card.name} className={styles.widgetGroupCard}>
              <div className={styles.widgetGroupName}>{card.name}</div>
              <div className={styles.widgetGroupValue}>{card.value}</div>
              <div className={styles.widgetGroupDelta} data-tone={card.tone}>
                {card.changeLabel}
              </div>
            </div>
          ))}
        </div>
      );

    case "brandTable":
      return (
        <MeasureTable
          columns={view.brandTable.columns}
          rows={view.brandTable.rows}
          emptyLabel="No brands in this scope."
          maxHeight={300}
        />
      );

    case "gapCards":
      return <GapCards cards={view.gapCards} />;

    case "donut":
      /* Not every measure publishes one — `donut` is optional on the view — so
         this says so rather than rendering an empty box. */
      return view.donut ? (
        <Donut data={view.donut} />
      ) : (
        <p className={styles.widgetGap}>No split published for {view.measureLabel}.</p>
      );
  }
}
