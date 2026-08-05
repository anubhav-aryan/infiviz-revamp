"use client";

import { useState } from "react";
import { ChartLegend, GroupedColumns } from "@/app/_charts/grouped-columns";
import { Gauge } from "@/app/_charts/gauge";
import { HBarList } from "@/app/_charts/h-bar-list";
import { MeasureTable } from "@/app/_charts/measure-table";
import { MonthMatrix } from "@/app/_charts/month-matrix";
import { Pie } from "@/app/_charts/radial";
import { SortableTable } from "@/app/_charts/sortable-table";
import { StackedArea } from "@/app/_charts/stacked-area";
import { StatCard } from "@/app/_charts/stat-card";
import { TrendChart } from "@/app/_charts/trend-chart";
import charts from "@/app/_charts/charts.module.css";
import { GAUGE_LABEL } from "../_data/bespoke-shared";
import type { MerchandiserView } from "../_data/merchandiser";
import type { PerfectStoreView } from "../_data/perfect-store";
import type { RoiView } from "../_data/roi";
import type { ShelvingView } from "../_data/shelving";
import type { StoreManagementView } from "../_data/store-management";
import styles from "./module.module.css";

/**
 * The five modules the metric factory does not drive. Each has a genuinely
 * different shape — a score table, a money view, four dials over category tabs,
 * field attendance, coverage — so they are components rather than configs.
 *
 * The pieces they draw with are the same shared primitives, so nothing here
 * knows about geometry or colour; it is all layout.
 */

function Card({
  title,
  caption,
  children,
  pad = true,
}: {
  title?: string;
  caption?: string;
  children: React.ReactNode;
  pad?: boolean;
}) {
  return (
    <div className={`${charts.card} ${pad ? charts.cardPad : charts.tableCard}`}>
      {title ? (
        pad ? (
          <>
            <div className={charts.cardTitle}>{title}</div>
            {caption ? <div className={charts.cardCaption}>{caption}</div> : null}
          </>
        ) : (
          <div className={charts.tabbedHead}>
            <div>
              <div className={charts.cardTitle}>{title}</div>
              {caption ? <div className={charts.cardCaption}>{caption}</div> : null}
            </div>
          </div>
        )
      ) : null}
      {children}
    </div>
  );
}

function GaugeRow({ gauges }: { gauges: { title: string; data: Parameters<typeof Gauge>[0]["data"] }[] }) {
  return (
    <div className={charts.gaugeRow}>
      {gauges.map((gauge) => (
        <Gauge
          key={gauge.title}
          data={gauge.data}
          title={gauge.title}
          labelX={GAUGE_LABEL.x}
          labelY={GAUGE_LABEL.y}
        />
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- */

export function PerfectStoreBody({ view }: { view: PerfectStoreView }) {
  return (
    <>
      <Card
        title="Perfect Store score"
        caption="The unweighted mean of share of shelf, availability, pricing and planogram compliance — the same way the source dashboard computes it. The total row is the national figure, not the mean of the stores shown."
        pad={false}
      >
        <SortableTable
          columns={view.columns}
          rows={view.rows}
          emptyLabel="No stores match this selection."
          defaultSort={{ index: 5, dir: "desc" }}
          maxHeight={420}
        />
      </Card>

      <Card title="Perfect Store score and its components">
        <TrendChart data={view.trend} />
        <ChartLegend
          items={[
            { label: "Perfect Store score", tone: "primary" },
            { label: "On-shelf availability", tone: "secondary" },
            { label: "Pricing compliance", tone: "tertiary" },
          ]}
        />
      </Card>
    </>
  );
}

/* ---------------------------------------------------------------- */

export function RoiBody({ view }: { view: RoiView }) {
  return (
    <>
      <div className={styles.split}>
        <div className={styles.stackCol}>
          <StatCard
            label="Total revenue impact"
            value={view.total.value}
            caption={view.total.caption}
            delta={{
              direction: view.total.delta.startsWith("+") ? "up" : "down",
              tone: view.total.delta.startsWith("+") ? "success" : "danger",
              label: view.total.delta.replace(/[+−]/, ""),
            }}
          />
          <Card title="Where the impact comes from">
            <Pie data={view.split} />
          </Card>
        </div>

        <Card
          title="Revenue impact by region"
          caption="Net of merchandising cost, shared out by each region's audited store count."
        >
          <div className={charts.chartBody}>
            <HBarList rows={view.byRegion} nameWidth="minmax(140px, 40%)" />
          </div>
        </Card>
      </div>

      <div className={styles.triple}>
        {view.cards.map((card) => (
          <div key={card.title} className={`${charts.card} ${charts.statCard}`}>
            <div className={charts.statLabel}>{card.title}</div>
            <div className={charts.statValueRow}>
              <span className={charts.statValue} data-size="sm">
                {card.current}
              </span>
            </div>
            <div className={charts.statFoot}>
              <div>
                <div className={charts.statCaption}>
                  {card.previous} last month
                </div>
                <div className={styles.roiDelta} data-tone={card.tone}>
                  {card.delta}
                </div>
              </div>
              <svg viewBox="0 0 100 30" className={charts.statSpark} aria-hidden="true">
                <polyline
                  points={card.spark}
                  fill="none"
                  stroke="var(--indigo-400)"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.split}>
        {view.kpiTables.map((table) => (
          <Card key={table.title} title={table.title} pad={false}>
            <MeasureTable
              columns={table.columns}
              rows={table.rows}
              emptyLabel="No KPIs for this month."
            />
          </Card>
        ))}
      </div>
    </>
  );
}

/* ---------------------------------------------------------------- */

export function ShelvingBody({ view }: { view: ShelvingView }) {
  const [category, setCategory] = useState(view.categories[0]);
  const active = view.byCategory[category] ?? view.byCategory[view.categories[0]];

  return (
    <>
      <div className={charts.miniTabs} role="group" aria-label="Category">
        {view.categories.map((name) => (
          <button
            key={name}
            type="button"
            className={charts.miniTab}
            data-active={name === category}
            aria-pressed={name === category}
            onClick={() => setCategory(name)}
          >
            {name}
          </button>
        ))}
      </div>

      <Card title="Block compliance" caption="Target 80 on every dial.">
        <div className={charts.chartBody}>
          <GaugeRow gauges={active.gauges} />
        </div>
      </Card>

      <div className={styles.split}>
        <Card
          title="Format block compliance trend"
          caption="Top five formats plus Other."
        >
          <StackedArea data={active.formatTrend} />
        </Card>
        <Card
          title="Flavour block compliance trend"
          caption="Top five flavours plus Other — the design system has no sixteen-colour scale, so the tail is rolled up and the per-variant detail is in the table below."
        >
          <StackedArea data={active.flavourTrend} />
        </Card>
      </div>

      <Card title={`Block compliance by store · ${category}`} pad={false}>
        <SortableTable
          columns={active.blockTable.columns}
          rows={active.blockTable.rows}
          emptyLabel="No stores match this selection."
          defaultSort={{ index: 1, dir: "desc" }}
        />
      </Card>
    </>
  );
}

/* ---------------------------------------------------------------- */

export function MerchandiserBody({
  view,
  tab,
}: {
  view: MerchandiserView;
  tab: string;
}) {
  if (tab === "photo-quality") {
    const quality = view.photoQuality;
    return (
      <>
        <div className={styles.split}>
          <StatCard
            label="Overall photo quality"
            value={quality.overall}
            caption="of captures passed automated quality checks"
            delta={{
              direction: quality.delta.startsWith("+") ? "up" : "down",
              tone: quality.delta.startsWith("+") ? "success" : "danger",
              label: quality.delta.replace(/[+−]/, ""),
            }}
          />
          <Card title="Photo quality trend — month wise">
            <TrendChart data={quality.trend} />
          </Card>
        </div>

        <Card
          title="Capture outcomes"
          caption="The nine defect classes sum to the rejected pool, so they reconcile with the pass rate rather than being independent counts."
        >
          <div className={charts.chartBody}>
            <GaugeRow gauges={quality.gauges} />
          </div>
        </Card>

        <Card title="Merchandiser-wise photo quality outliers" pad={false}>
          <SortableTable
            columns={quality.outliers.columns}
            rows={quality.outliers.rows}
            emptyLabel="No outliers this month."
            defaultSort={{ index: 2, dir: "asc" }}
          />
        </Card>
      </>
    );
  }

  if (tab === "raw-data") {
    return (
      <Card title="Merchandiser attendance — raw data" pad={false}>
        <MeasureTable
          columns={view.timeTable.columns}
          rows={view.timeTable.rows}
          emptyLabel="No attendance rows for this month."
          wide
        />
      </Card>
    );
  }

  return (
    <>
      <Card title="Merchandising compliance">
        <div className={charts.chartBody}>
          <GaugeRow gauges={view.gauges} />
        </div>
      </Card>

      <div className={styles.split}>
        <Card title="Average time in store" caption="Minutes per visit, by merchandiser.">
          <div className={charts.chartBody}>
            <HBarList rows={view.timeSpent} nameWidth="minmax(140px, 42%)" />
          </div>
        </Card>
        <Card title="Merchandising trend">
          <TrendChart data={view.trend} />
          <ChartLegend
            items={[
              { label: "Store coverage", tone: "primary" },
              { label: "PJP adherence", tone: "tertiary" },
              { label: "Geo compliance", tone: "secondary" },
            ]}
          />
        </Card>
      </div>

      <Card title="Actual vs planned visits" caption="By day of month.">
        <GroupedColumns data={view.plannedVsActual} />
        <ChartLegend items={view.plannedVsActual.legend} shape="swatch" />
      </Card>

      <div className={styles.split}>
        <Card title="Time spent by merchandiser" pad={false}>
          <SortableTable
            columns={view.timeTable.columns}
            rows={view.timeTable.rows}
            emptyLabel="No merchandiser activity this month."
            defaultSort={{ index: 3, dir: "desc" }}
          />
        </Card>
        <Card title="Outlets not covered this month" pad={false}>
          <MeasureTable
            columns={view.notCovered.columns}
            rows={view.notCovered.rows}
            emptyLabel="Every outlet was covered."
          />
        </Card>
      </div>
    </>
  );
}

/* ---------------------------------------------------------------- */

export function StoreManagementBody({
  view,
  tab,
}: {
  view: StoreManagementView;
  tab: string;
}) {
  if (tab === "category-coverage") {
    return (
      <Card
        title="Store coverage — category wise"
        caption="Which categories were captured at each store. A blank cell means the category was not shot on that visit."
        pad={false}
      >
        <MonthMatrix
          columns={view.categoryMatrix.columns}
          groups={view.categoryMatrix.groups}
          rowHeader="Retailer / store"
          ariaLabel="Category coverage by retailer and store"
        />
      </Card>
    );
  }

  if (tab === "store-standardisation") {
    return (
      <>
        <div className={styles.split}>
          <Card title="Store coverage — category wise" pad={false}>
            <SortableTable
              columns={view.standardisation.columns}
              rows={view.standardisation.rows}
              emptyLabel="No categories match."
              defaultSort={{ index: 1, dir: "desc" }}
            />
          </Card>
          <Card title="Store standardisation compliance trend">
            <TrendChart data={view.standardTrend} />
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Card title="Store coverage">
        <div className={charts.chartBody}>
          <GaugeRow gauges={view.gauges} />
        </div>
      </Card>

      <Card
        title="Store coverage trend"
        caption="Stores covered against the whole estate."
      >
        <GroupedColumns data={view.coverageTrend} />
        <ChartLegend items={view.coverageTrend.legend} shape="swatch" />
      </Card>

      <Card title="Store coverage — raw data" pad={false}>
        <SortableTable
          columns={view.coverageRaw.columns}
          rows={view.coverageRaw.rows}
          emptyLabel="No visits this month."
          defaultSort={{ index: 4, dir: "desc" }}
        />
      </Card>
    </>
  );
}
