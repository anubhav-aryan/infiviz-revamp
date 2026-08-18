"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { ActionsBlock } from "@/app/_charts/actions-block";
import { AskInfiChatButton } from "@/app/_components/chat/ask-infichat-button";
import { CreateTicketButton } from "@/app/_components/create-ticket-button";
import { RecommendationsBlock } from "./recommendations-block";
import { TicketRaisedMarker } from "@/app/_components/ticket-raised-marker";
import { ReorderableGrid } from "@/app/_components/reorderable-grid";
import { DetailTable } from "@/app/_charts/detail-table";
import { ExcelDownloadButton } from "@/app/_export/excel-download-button";
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
import { DatePresetPicker } from "@/app/_time/date-preset-picker";
import { CURRENT_MONTH, MONTHS, MONTH_KEYS, type MonthKey } from "@/app/_time/periods";
import { METRIC_MODULES, metricViewFor } from "../_data/module-registry";
import { merchandiserView } from "../_data/merchandiser";
import { perfectStoreView } from "../_data/perfect-store";
import { roiView } from "../_data/roi";
import { shelvingView } from "../_data/shelving";
import { storeManagementView } from "../_data/store-management";
import { scopeFor, type Scope } from "../_data/scope";
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

  /* Resolution is the persona's, not the URL's: a scope outside this persona's
     vocabulary falls back to their default rather than rendering a category
     lead's numbers under a regional lead's rail. */
  const scope = scopeFor(persona, params.get("scope"));

  const view = measureId ? metricViewFor(module, scope, measureId, period) : undefined;

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
    : headlineFor(module, period, scope);
  const monthLabel = view?.monthLabel ?? MONTHS[MONTH_KEYS.indexOf(period)].label;

  return (
    <div className={styles.screen}>
      <header className={styles.head}>
        <div className={styles.headTop}>
          <div>
            <h1 className={styles.title}>{def.label}</h1>
            {/* The scope line is real: it names what the figures below are of,
                and it changes when the rail's picker changes. The hardcoded
                "National · all retailers · all store types" that used to sit
                here described a scope nothing could move. */}
            <p className={styles.subtitle}>
              {scope.caption} · {monthLabel}
              {view ? ` · ${view.measureLabel}` : ` · ${def.blurb}`}
            </p>
            {/* Says a ticket was already raised against this measure, and — once
                the next visit has landed — whether the number actually moved. */}
            <TicketRaisedMarker
              metric={view ? view.measureLabel : def.label}
              /* Only narrow by subject when the screen is actually scoped to
                 one. At national scope every marker for the measure is
                 relevant, and filtering by the word "National" would hide all
                 of them. */
              subject={scope.kind === "national" ? undefined : scope.label}
            />
          </div>

          <div className={styles.headActions}>
            <span className={styles.headline}>
              {headline.value}
              {headline.delta ? (
                <span className={styles.headlineDelta}>{headline.delta} MoM</span>
              ) : null}
            </span>
            <DatePresetPicker
              mode="callback"
              period={period}
              onChange={(value) => setParam("month", value, value === CURRENT_MONTH)}
            />
          </div>
        </div>

        <TabStrip
          tabs={tabs}
          active={tab}
          label={`${def.label} views`}
          query={query}
        />

        {/* Rendered only when there is a measure toggle — otherwise this is an
            empty padded strip. */}
        {measures.length > 1 && measureId ? (
        <div className={styles.controls}>
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
        </div>
        ) : null}
      </header>

      <div className={styles.body}>
        {entry && view && measureId ? (
          <TabBody
            module={module}
            tab={tab}
            view={view}
            scopeLabel={scope.label}
            monthLabel={monthLabel}
          />
        ) : (
          <BespokeBody module={module} tab={tab} period={period} scope={scope} />
        )}
      </div>
    </div>
  );
}

/** Headline for the modules the factory does not drive. */
function headlineFor(module: ModuleId, period: MonthKey, scope: Scope) {
  switch (module) {
    case "perfect-store": {
      const v = perfectStoreView(scope, period);
      return { value: v.score, delta: v.scoreDelta };
    }
    case "roi": {
      const v = roiView(scope, period);
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
  scope,
}: {
  module: ModuleId;
  tab: TabId;
  period: MonthKey;
  scope: Scope;
}) {
  switch (module) {
    case "perfect-store":
      return <PerfectStoreBody view={perfectStoreView(scope, period)} />;
    case "roi":
      return <RoiBody view={roiView(scope, period)} />;
    case "shelving":
      return <ShelvingBody view={shelvingView(scope, period)} />;
    case "merchandiser":
      return <MerchandiserBody view={merchandiserView(scope, period)} tab={tab} />;
    case "store-management":
      return <StoreManagementBody view={storeManagementView(scope, period)} tab={tab} />;
    default:
      return null;
  }
}

function TabBody({
  module,
  tab,
  view,
  scopeLabel,
  monthLabel,
}: {
  module: ModuleId;
  tab: TabId;
  view: MetricModuleView;
  scopeLabel: string;
  monthLabel: string;
}) {
  const ticketContext = (metric: string) => ({ region: scopeLabel, metric, period: monthLabel });
  const pageKey = (suffix: string) => `analytics:${module}:${suffix}`;

  switch (tab) {
    case "recommendations":
      return (
        <RecommendationsBlock
          month={view.period}
          monthLabel={monthLabel}
          scopeLabel={scopeLabel}
        />
      );

    case "analytics":
      return (
        <ReorderableGrid
          pageKey={pageKey("analytics")}
          items={[
            {
              id: "brand-and-trend",
              node: (
          <div className={styles.split}>
            <div className={`${charts.card} ${charts.tableCard}`}>
              <div className={charts.tabbedHead}>
                <div className={charts.cardTitle}>
                  {view.measureLabel} — brand wise
                </div>
                <AskInfiChatButton label={`${view.measureLabel} — brand wise`} compact />
                <ExcelDownloadButton label={`${view.measureLabel} — brand wise`} compact />
                <CreateTicketButton
                  context={ticketContext(`${view.measureLabel} — brand wise`)}
                  compact
                />
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
              <div className={charts.cardHead}>
                <div className={charts.cardTitle}>
                  {view.measureLabel} trend — month wise
                </div>
                <AskInfiChatButton label={`${view.measureLabel} trend`} compact />
                <ExcelDownloadButton label={`${view.measureLabel} trend`} compact />
                <CreateTicketButton context={ticketContext(`${view.measureLabel} trend`)} compact />
              </div>
              <TrendChart data={view.trend} />
            </div>
          </div>
              ),
            },
            {
              id: "group-and-donut",
              node: (
          <div className={styles.split}>
            <div className={`${charts.card} ${charts.cardPad}`}>
              <div className={charts.cardHead}>
                <div className={charts.cardTitle}>
                  {view.measureLabel} — {view.groupNoun} wise
                </div>
                <AskInfiChatButton
                  label={`${view.measureLabel} — ${view.groupNoun} wise`}
                  compact
                />
                <ExcelDownloadButton
                  label={`${view.measureLabel} — ${view.groupNoun} wise`}
                  compact
                />
                <CreateTicketButton
                  context={ticketContext(`${view.measureLabel} — ${view.groupNoun} wise`)}
                  compact
                />
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
                <div className={charts.cardHead}>
                  <div className={charts.cardTitle}>
                    {view.measureLabel} — own vs competition
                  </div>
                  <AskInfiChatButton
                    label={`${view.measureLabel} — own vs competition`}
                    compact
                  />
                  <ExcelDownloadButton
                    label={`${view.measureLabel} — own vs competition`}
                    compact
                  />
                  <CreateTicketButton
                    context={ticketContext(`${view.measureLabel} — own vs competition`)}
                    compact
                  />
                </div>
                <Donut data={view.donut} />
              </div>
            ) : null}
          </div>
              ),
            },
            {
              id: "outlet-detail",
              node: <TabbedTable views={view.detailViews} title="Outlet detail" />,
            },
          ]}
        />
      );

    case "gap-analysis":
      return (
        <ReorderableGrid
          pageKey={pageKey("gap-analysis")}
          items={[
            {
              id: "gap-cards-and-target",
              node: (
          <div className={styles.split}>
            <div>
              <div className={styles.sectionLabel}>
                {view.groupNoun === "segment" ? "Segment-wise" : "Category-wise"} gap
              </div>
              <GapCards cards={view.gapCards} />
            </div>
            <div className={`${charts.card} ${charts.cardPad}`}>
              <div className={charts.cardHead}>
                <div className={charts.cardTitle}>
                  {view.measureLabel} against target
                </div>
                <AskInfiChatButton label={`${view.measureLabel} against target`} compact />
                <ExcelDownloadButton label={`${view.measureLabel} against target`} compact />
                <CreateTicketButton
                  context={ticketContext(`${view.measureLabel} against target`)}
                  compact
                />
              </div>
              <GroupedColumns data={view.gapColumns} />
              <ChartLegend items={view.gapColumns.legend} shape="swatch" />
            </div>
          </div>
              ),
            },
            {
              id: "gap-detail",
              node: (
          <DetailTable
            title={`${view.measureLabel} — actual vs target`}
            caption="Rows with captured evidence link through to the session."
            columns={view.gapDetail.columns}
            rows={view.gapDetail.rows}
            emptyLabel="No visits match this selection."
            seLink={false}
          />
              ),
            },
          ]}
        />
      );

    case "actions":
      return <ActionsBlock data={view.actions} />;

    case "merchandising-impact":
      return view.merchImpact ? (
        <ReorderableGrid
          pageKey={pageKey("merchandising-impact")}
          items={[
            {
              id: "before-after-charts",
              node: (
          <div className={styles.split}>
            <div className={`${charts.card} ${charts.cardPad}`}>
              <div className={charts.cardHead}>
                <div className={charts.cardTitle}>
                  {view.groupNoun === "segment" ? "Segment-wise" : "Category-wise"}{" "}
                  {view.measureLabel.toLowerCase()} — before and after
                </div>
                <AskInfiChatButton
                  label={`${view.measureLabel} — before and after`}
                  compact
                />
                <ExcelDownloadButton
                  label={`${view.measureLabel} — before and after`}
                  compact
                />
                <CreateTicketButton
                  context={ticketContext(`${view.measureLabel} — before and after`)}
                  compact
                />
              </div>
              <div className={charts.chartBody}>
                <HBarList rows={view.merchImpact.bars} nameWidth="minmax(140px, 38%)" />
              </div>
            </div>
            <div className={`${charts.card} ${charts.cardPad}`}>
              <div className={charts.cardHead}>
                <div className={charts.cardTitle}>
                  {view.measureLabel} trend — before vs after
                </div>
                <AskInfiChatButton label={`${view.measureLabel} trend`} compact />
                <ExcelDownloadButton label={`${view.measureLabel} trend`} compact />
                <CreateTicketButton context={ticketContext(`${view.measureLabel} trend`)} compact />
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
              ),
            },
            {
              id: "before-after-table",
              node: (
          <DetailTable
            title="Outlet-wise before vs after"
            columns={view.merchImpact.table.columns}
            rows={view.merchImpact.table.rows}
            emptyLabel="No visits match this selection."
            seLink={false}
          />
              ),
            },
          ]}
        />
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
            <AskInfiChatButton
              label={`Month-wise ${view.measureLabel.toLowerCase()} trend`}
              compact
            />
            <ExcelDownloadButton
              label={`Month-wise ${view.measureLabel.toLowerCase()} trend`}
              compact
            />
            <CreateTicketButton
              context={ticketContext(`Month-wise ${view.measureLabel.toLowerCase()} trend`)}
              compact
            />
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
          filename={`${view.moduleId}-${view.scopeId}-${view.measureId}-${view.period}`}
        />
      );

    default:
      return null;
  }
}
