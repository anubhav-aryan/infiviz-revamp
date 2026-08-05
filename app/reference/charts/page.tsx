import type { Metadata } from "next";
import { ActionsBlock } from "@/app/_charts/actions-block";
import { DetailTable } from "@/app/_charts/detail-table";
import { GapCards } from "@/app/_charts/gap-cards";
import { ChartLegend, GroupedColumns } from "@/app/_charts/grouped-columns";
import { HBarList } from "@/app/_charts/h-bar-list";
import { Donut, Pie } from "@/app/_charts/radial";
import { RawTable } from "@/app/_charts/raw-table";
import { SortableTable } from "@/app/_charts/sortable-table";
import { StatCard } from "@/app/_charts/stat-card";
import { TabbedTable } from "@/app/_charts/tabbed-table";
import { TrendChart } from "@/app/_charts/trend-chart";
import charts from "@/app/_charts/charts.module.css";
import {
  ACTIONS_SAMPLE,
  BRAND_COLUMNS,
  BRAND_ROWS,
  CATEGORY_BARS,
  COLUMNS_SAMPLE,
  DETAIL_COLUMNS,
  DETAIL_ROWS,
  DONUT_SAMPLE,
  GAP_SAMPLE,
  PIE_SAMPLE,
  RAW_COLUMNS,
  RAW_CSV,
  RAW_ROWS,
  REASON_BARS,
  STORE_COLUMNS,
  STORE_ROWS,
  TREND_SAMPLE,
} from "./_data/samples";
import styles from "./charts-poster.module.css";

export const metadata: Metadata = {
  title: "Chart primitives",
  description:
    "Every shared chart primitive rendered from sample geometry, for reviewing them together.",
};

/**
 * A reference poster, not a product screen. It exists so the thirteen chart
 * primitives can be reviewed side by side before nine modules are built on
 * them, and so `geom.ts` is exercised by something that renders — arc maths and
 * stacking are much easier to check by eye than by reading.
 *
 * Sample figures come from the PowerBI dashboard these replace, so each panel
 * can be compared against the screenshot it is derived from.
 */

function Panel({
  title,
  note,
  wide = false,
  children,
}: {
  title: string;
  note: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className={styles.panel} data-wide={wide || undefined}>
      <header className={styles.panelHead}>
        <h2 className={styles.panelTitle}>{title}</h2>
        <p className={styles.panelNote}>{note}</p>
      </header>
      {children}
    </section>
  );
}

export default function ChartsPosterPage() {
  return (
    <main className={styles.page}>
      <header className={styles.head}>
        <h1 className={styles.title}>Chart primitives</h1>
        <p className={styles.subtitle}>
          The shared shapes behind the Analytics modules, drawn from the figures
          in the PowerBI dashboard they replace. Reference only — no route in
          the product links here.
        </p>
      </header>

      <div className={styles.grid}>
        <Panel title="Stat card" note="Number of actions · actions per visit · completion">
          <div className={styles.statRow}>
            {ACTIONS_SAMPLE.stats.map((stat) => (
              <StatCard key={stat.label} {...stat} size="sm" />
            ))}
          </div>
        </Panel>

        <Panel title="Gap cards" note="Gap headline, actual and target. Ahead of target reads green.">
          <GapCards cards={GAP_SAMPLE} />
        </Panel>

        <Panel
          title="Trend — area, line, data labels, trendline"
          note="Share of shelf by month. Dotted overlay is a least-squares fit."
          wide
        >
          <div className={`${charts.card} ${charts.cardPad}`}>
            <TrendChart data={TREND_SAMPLE} />
          </div>
        </Panel>

        <Panel
          title="Grouped columns — actual vs target"
          note="Every Gap Analysis tab pairs the measure with its target this way."
          wide
        >
          <div className={`${charts.card} ${charts.cardPad}`}>
            <GroupedColumns data={COLUMNS_SAMPLE} />
            <ChartLegend items={COLUMNS_SAMPLE.legend} shape="swatch" />
          </div>
        </Panel>

        <Panel title="Donut" note="Own vs competition, as dasharrays on one stroked circle.">
          <div className={`${charts.card} ${charts.cardPad}`}>
            <Donut data={DONUT_SAMPLE} />
          </div>
        </Panel>

        <Panel title="Pie" note="Open vs closed tasks, with leader labels outside the arc.">
          <div className={`${charts.card} ${charts.cardPad}`}>
            <Pie data={PIE_SAMPLE} />
          </div>
        </Panel>

        <Panel title="Horizontal bar list" note="Reason codes and per-brand action counts.">
          <div className={`${charts.card} ${charts.cardPad}`}>
            <HBarList rows={REASON_BARS} nameWidth="180px" />
            <div className={charts.axisCaption}>Number of actions</div>
          </div>
        </Panel>

        <Panel title="Bar list — ranked" note="Same primitive, longest bar first.">
          <div className={`${charts.card} ${charts.cardPad}`}>
            <HBarList rows={CATEGORY_BARS} nameWidth="120px" />
            <div className={charts.axisCaption}>Number of actions</div>
          </div>
        </Panel>

        <Panel
          title="Sortable table with a total row"
          note="Perfect Store score. Click a header to sort; the total stays pinned."
          wide
        >
          <div className={`${charts.card} ${charts.tableCard}`}>
            <SortableTable
              columns={STORE_COLUMNS}
              rows={STORE_ROWS}
              emptyLabel="No stores match."
              defaultSort={{ index: 5, dir: "desc" }}
            />
          </div>
        </Panel>

        <Panel
          title="Tabbed table"
          note="Several views of one subject, switched in place."
          wide
        >
          <TabbedTable
            title="Share of shelf views"
            views={[
              {
                id: "brand",
                label: "Brand-wise",
                columns: BRAND_COLUMNS,
                rows: BRAND_ROWS,
                emptyLabel: "No brands match.",
              },
              {
                id: "store",
                label: "Store-wise",
                columns: STORE_COLUMNS,
                rows: STORE_ROWS.filter((row) => !row.total),
                emptyLabel: "No stores match.",
              },
            ]}
          />
        </Panel>

        <Panel
          title="Detail table with session links"
          note="Rows without captured evidence show the glyph inert rather than linking to a 404."
          wide
        >
          <DetailTable
            title="Share of shelf — actual vs target"
            caption="Two of these four rows have session evidence."
            columns={DETAIL_COLUMNS}
            rows={DETAIL_ROWS}
            emptyLabel="No visits match."
            seLink={false}
          />
        </Panel>

        <Panel
          title="Actions block"
          note="One composite covering six visuals — repeated across five modules."
          wide
        >
          <ActionsBlock data={ACTIONS_SAMPLE} />
        </Panel>

        <Panel
          title="Raw table"
          note="Capped window with the complete extract behind Export. 60 rows, cap 50."
          wide
        >
          <RawTable
            title="Share of shelf — raw data"
            columns={RAW_COLUMNS}
            rows={RAW_ROWS}
            csv={RAW_CSV}
            filename="reference-raw-sample"
          />
        </Panel>
      </div>
    </main>
  );
}
