"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { Icon } from "@/app/_components/icon";
import { ActionsBlock } from "@/app/_charts/actions-block";
import { DetailTable } from "@/app/_charts/detail-table";
import { GapCards } from "@/app/_charts/gap-cards";
import { ChartLegend, GroupedColumns } from "@/app/_charts/grouped-columns";
import { HBarList } from "@/app/_charts/h-bar-list";
import { Donut } from "@/app/_charts/radial";
import { RawTable } from "@/app/_charts/raw-table";
import { Segmented } from "@/app/_charts/segmented";
import { SortableTable } from "@/app/_charts/sortable-table";
import { TabStrip } from "@/app/_charts/tab-strip";
import { TabbedTable } from "@/app/_charts/tabbed-table";
import { MonthMatrix } from "@/app/_charts/month-matrix";
import { TrendChart } from "@/app/_charts/trend-chart";
import charts from "@/app/_charts/charts.module.css";
import { CURRENT_MONTH, MONTHS, MONTH_KEYS, type MonthKey } from "@/app/_time/periods";
import { METRIC_MODULES } from "../_data/module-registry";
import { MERCHANDISER_VIEWS } from "../_data/merchandiser";
import { PERFECT_STORE_VIEWS } from "../_data/perfect-store";
import { ROI_VIEWS } from "../_data/roi";
import { SHELVING_VIEWS } from "../_data/shelving";
import { STORE_MANAGEMENT_VIEWS } from "../_data/store-management";
import {
  MerchandiserBody,
  PerfectStoreBody,
  RoiBody,
  ShelvingBody,
  StoreManagementBody,
} from "./bespoke-bodies";
import { defaultMeasureId, type MetricModuleView } from "../_data/metric-module";
import {
  MODULES,
  TAB_LABELS,
  modulePath,
  type ModuleId,
  type PersonaId,
  type TabId,
} from "../_data/module-matrix";
import styles from "./module.module.css";

/**
 * The screen inside the rail: header, tab strip, measure toggles, then the tab
 * body.
 *
 * Path carries identity — persona, module, tab — because those are locations
 * worth linking to and prerendering. Query carries view state — month and
 * measure — because they are how you are looking at one place, and users flip
 * them constantly. That split is why this component reads `useSearchParams` and
 * needs a Suspense boundary, exactly as `analytics.tsx` already documents.
 */

type Props = { persona: PersonaId; module: ModuleId; tab: TabId };

const MONTH_OPTIONS = MONTH_KEYS.map((key, i) => ({ id: key, label: MONTHS[i].label }));

export function ModuleScreen({ persona, module, tab }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const def = MODULES[module];
  const entry = METRIC_MODULES[module];

  const monthParam = params.get("month");
  const period: MonthKey = MONTH_KEYS.includes(monthParam as MonthKey)
    ? (monthParam as MonthKey)
    : CURRENT_MONTH;

  const measureParam = params.get("measure");
  const measures = entry?.config.measures ?? [];
  const defaultMeasure = entry ? defaultMeasureId(entry.config) : undefined;
  const measureId =
    measures.find((measure) => measure.id === measureParam)?.id ?? defaultMeasure;

  const view = entry && measureId ? entry.views[measureId][period] : undefined;

  /** Defaults are dropped from the URL, so the opening state is a bare path. */
  const setParam = useCallback(
    (key: string, value: string, isDefault: boolean) => {
      const next = new URLSearchParams(params.toString());
      if (isDefault) next.delete(key);
      else next.set(key, value);
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [params, pathname, router],
  );

  /** Carried across tab links so switching tab keeps month and measure. */
  const query = useMemo(() => {
    const raw = params.toString();
    return raw ? `?${raw}` : "";
  }, [params]);

  const tabs = def.tabs.map((id) => ({
    id,
    label: TAB_LABELS[id],
    href: modulePath(persona, module, id),
  }));

  const headline = view
    ? { value: view.headline, delta: view.headlineDelta }
    : headlineFor(module, period);
  const monthLabel = view?.monthLabel ?? MONTHS[MONTH_KEYS.indexOf(period)].label;

  return (
    <div className={styles.screen}>
      <header className={styles.head}>
        <div className={styles.headTop}>
          <div>
            <h1 className={styles.title}>{def.label}</h1>
            <p className={styles.subtitle}>
              Colgate-Palmolive Vietnam · {monthLabel}
              {view ? ` · ${view.measureLabel}` : ` · ${def.blurb}`}
            </p>
          </div>

          <div className={styles.headActions}>
            <span className={styles.headline}>
              {headline.value}
              {headline.delta ? (
                <span className={styles.headlineDelta}>{headline.delta} MoM</span>
              ) : null}
            </span>
            <Segmented
              options={MONTH_OPTIONS}
              value={period}
              onChange={(value) => setParam("month", value, value === CURRENT_MONTH)}
              label="Month"
            />
          </div>
        </div>

        <TabStrip
          tabs={tabs}
          active={tab}
          label={`${def.label} views`}
          query={query}
        />

        <div className={styles.controls}>
          {measures.length > 1 && measureId ? (
          <Segmented
            options={measures.map((measure) => ({
              id: measure.id,
              label: measure.short,
            }))}
            value={measureId}
            onChange={(value) => setParam("measure", value, value === defaultMeasure)}
            label="Measure"
            tone="dark"
          />
          ) : null}
          <span className={styles.scope}>
            <Icon name="info" size={14} />
            National · all retailers · all store types
          </span>
        </div>
      </header>

      <div className={styles.body}>
        {entry && view && measureId ? (
          <TabBody tab={tab} view={view} />
        ) : (
          <BespokeBody module={module} tab={tab} period={period} />
        )}
      </div>
    </div>
  );
}

/** Headline for the modules the factory does not drive. */
function headlineFor(module: ModuleId, period: MonthKey) {
  switch (module) {
    case "perfect-store": {
      const v = PERFECT_STORE_VIEWS[period];
      return { value: v.score, delta: v.scoreDelta };
    }
    case "roi": {
      const v = ROI_VIEWS[period];
      return { value: v.total.value, delta: v.total.delta };
    }
    /* No single headline: attendance and photo quality are different measures,
       and putting the photo-quality figure above the attendance tab would read
       as that tab's number. The gauges carry it instead. */
    case "merchandiser":
      return { value: "", delta: "" };
    default:
      return { value: "", delta: "" };
  }
}

function BespokeBody({
  module,
  tab,
  period,
}: {
  module: ModuleId;
  tab: TabId;
  period: MonthKey;
}) {
  switch (module) {
    case "perfect-store":
      return <PerfectStoreBody view={PERFECT_STORE_VIEWS[period]} />;
    case "roi":
      return <RoiBody view={ROI_VIEWS[period]} />;
    case "shelving":
      return <ShelvingBody view={SHELVING_VIEWS[period]} />;
    case "merchandiser":
      return <MerchandiserBody view={MERCHANDISER_VIEWS[period]} tab={tab} />;
    case "store-management":
      return <StoreManagementBody view={STORE_MANAGEMENT_VIEWS[period]} tab={tab} />;
    default:
      return null;
  }
}

function TabBody({ tab, view }: { tab: TabId; view: MetricModuleView }) {
  switch (tab) {
    case "analytics":
      return (
        <>
          <div className={styles.split}>
            <div className={`${charts.card} ${charts.tableCard}`}>
              <div className={charts.tabbedHead}>
                <div className={charts.cardTitle}>
                  {view.measureLabel} — brand wise
                </div>
              </div>
              <SortableTable
                columns={view.brandTable.columns}
                rows={view.brandTable.rows}
                emptyLabel="No brands match this selection."
                defaultSort={{ index: 2, dir: "desc" }}
                maxHeight={300}
              />
            </div>

            <div className={`${charts.card} ${charts.cardPad}`}>
              <div className={charts.cardTitle}>
                {view.measureLabel} trend — month wise
              </div>
              <TrendChart data={view.trend} />
            </div>
          </div>

          <div className={styles.split}>
            <div className={`${charts.card} ${charts.cardPad}`}>
              <div className={charts.cardTitle}>
                {view.measureLabel} — category wise
              </div>
              <div className={styles.cardGrid}>
                {view.groupCards.map((card) => (
                  <div key={card.name} className={styles.groupCard} data-tone={card.tone}>
                    <div className={styles.groupName}>{card.name}</div>
                    <div className={styles.groupValue}>{card.value}</div>
                    <div className={styles.groupDeltas}>
                      <span>{card.momLabel}</span>
                      <span>{card.changeLabel}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {view.donut ? (
              <div className={`${charts.card} ${charts.cardPad}`}>
                <div className={charts.cardTitle}>
                  {view.measureLabel} — own vs competition
                </div>
                <Donut data={view.donut} />
              </div>
            ) : null}
          </div>

          <TabbedTable views={view.detailViews} title="Outlet detail" />
        </>
      );

    case "gap-analysis":
      return (
        <>
          <div className={styles.split}>
            <div>
              <div className={styles.sectionLabel}>Category-wise gap</div>
              <GapCards cards={view.gapCards} />
            </div>
            <div className={`${charts.card} ${charts.cardPad}`}>
              <div className={charts.cardTitle}>
                {view.measureLabel} against target
              </div>
              <GroupedColumns data={view.gapColumns} />
              <ChartLegend items={view.gapColumns.legend} shape="swatch" />
            </div>
          </div>

          <DetailTable
            title={`${view.measureLabel} — actual vs target`}
            caption="Rows with captured evidence link through to the session."
            columns={view.gapDetail.columns}
            rows={view.gapDetail.rows}
            emptyLabel="No visits match this selection."
            seLink={false}
          />
        </>
      );

    case "actions":
      return <ActionsBlock data={view.actions} />;

    case "merchandising-impact":
      return view.merchImpact ? (
        <>
          <div className={styles.split}>
            <div className={`${charts.card} ${charts.cardPad}`}>
              <div className={charts.cardTitle}>
                Category-wise {view.measureLabel.toLowerCase()} — before and after
              </div>
              <div className={charts.chartBody}>
                <HBarList rows={view.merchImpact.bars} nameWidth="minmax(140px, 38%)" />
              </div>
            </div>
            <div className={`${charts.card} ${charts.cardPad}`}>
              <div className={charts.cardTitle}>
                {view.measureLabel} trend — before vs after
              </div>
              <TrendChart data={view.merchImpact.beforeAfter} />
              <ChartLegend
                items={[
                  { label: "After merchandising", tone: "tertiary" },
                  { label: "Before merchandising", tone: "secondary" },
                ]}
              />
            </div>
          </div>

          <DetailTable
            title="Outlet-wise before vs after"
            columns={view.merchImpact.table.columns}
            rows={view.merchImpact.table.rows}
            emptyLabel="No visits match this selection."
            seLink={false}
          />
        </>
      ) : null;

    case "oos":
      return view.oos ? (
        <DetailTable
          title="Out of stock — absent store-SKUs"
          caption="Ranged stores where the SKU was not on the shelf, worst first."
          columns={view.oos.columns}
          rows={view.oos.rows}
          emptyLabel="Nothing out of stock for this selection."
          seLink={false}
        />
      ) : null;

    case "trend-analysis":
      return (
        <div className={`${charts.card} ${charts.tableCard}`}>
          <div className={charts.tabbedHead}>
            <div>
              <div className={charts.cardTitle}>
                Month-wise {view.measureLabel.toLowerCase()} trend
              </div>
              <div className={charts.cardCaption}>
                Retailer opens into its stores. A blank cell is a month with no
                visit, not a zero.
              </div>
            </div>
          </div>
          <MonthMatrix
            columns={view.matrix.columns}
            groups={view.matrix.groups}
            rowHeader="Retailer / store"
            ariaLabel={`Month-wise ${view.measureLabel} by retailer and store`}
          />
        </div>
      );

    case "raw-data":
      return (
        <RawTable
          title={`${view.measureLabel} — raw data`}
          columns={view.raw.columns}
          rows={view.raw.rows}
          csv={view.raw.csv}
          filename={`${view.moduleId}-${view.measureId}-${view.period}`}
        />
      );

    default:
      return null;
  }
}
