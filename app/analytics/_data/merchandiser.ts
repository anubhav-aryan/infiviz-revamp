import type { GaugeData } from "@/app/_charts/gauge";
import type { BarRow } from "@/app/_charts/h-bar-list";
import type { GroupedColumnsData } from "@/app/_charts/chart-types";
import type { Column, Row } from "@/app/_charts/table";
import { num, text, tiered } from "@/app/_charts/table";
import { centredBandX, gridLines, groupedColumns, linearScale } from "@/app/_charts/geom";
import { group } from "@/app/_format/num";
import { MONTHS, MONTH_KEYS, type MonthKey } from "@/app/_time/periods";
import { AVAIL_SERIES, ESTATE, LAST, MONTH_INDEX } from "./spine";
import {
  PLOT,
  VIEW_BOX,
  buildGauge,
  buildSeriesTrend,
  clampPct,
  pct1,
  scopedLookup,
} from "./bespoke-shared";
import { NATIONAL, OUTLETS_BY_REGION, type RegionScopeId, type Scope } from "./scope";

/**
 * Merchandiser Management — attendance and photo quality.
 *
 * Almost nothing here is authored. The platform already publishes a
 * merchandiser team of 148 with 142 active, per-merchandiser PJP adherence, and
 * 41,320 photos at a 91.3% pass rate; those are the numbers this module reads.
 *
 * That means the figures deliberately differ from the source dashboard. PowerBI
 * shows 33% PJP adherence and 51% attendance for a different account; ours are
 * 85% and 96% because that is what this fixture says, and a module that
 * disagreed with `/merch-activity` next door would be worse than one that
 * disagrees with a screenshot of someone else's data.
 */

const PHOTOS = ESTATE.photos;
const PASS_RATE = 91.3;

/* The nine defect classes sum to the rejected pool — 41,320 × 8.7% ≈ 3,595 —
   rather than being nine independent counts that happen to look plausible. */
const REJECTED = Math.round((PHOTOS * (100 - PASS_RATE)) / 100);
const DEFECT_SHARES: [string, number][] = [
  ["Blurred", 0.34],
  ["Slanted", 0.26],
  ["Obstructed", 0.18],
  ["Too far away", 0.08],
  ["Too close", 0.05],
  ["Duplicate", 0.04],
  ["Bay in the middle", 0.02],
  ["Overlapping bays", 0.02],
  ["First/last bay missing", 0.01],
];

/**
 * The roster, with a region each.
 *
 * The regions are authored here rather than joined to the handle roster the
 * field-ops fixtures use (`huy_le`, `thao_vo`, …). `tickets/_data/people.ts`
 * documents why: those are different people, not the same ones spelled two
 * ways, and inventing a join would put one person's rejection rate against
 * another's name. Every region carries at least one merchandiser so no scope
 * lands on an empty table.
 */
type MerchFact = [
  name: string,
  adherence: number,
  visits: number,
  minutes: number,
  region: string,
];

const MERCHANDISERS: MerchFact[] = [
  ["Nguyễn Văn An", 97, 223, 41, "Ho Chi Minh City"],
  ["Trần Thị Bích", 94, 219, 38, "Ho Chi Minh City"],
  ["Lê Minh Quân", 89, 168, 34, "South East"],
  ["Phạm Thu Hà", 86, 136, 31, "South East"],
  ["Võ Hoàng Nam", 81, 104, 29, "Mekong Delta"],
  ["Đỗ Thị Mai", 74, 101, 27, "Red River Delta"],
  ["Bùi Quang Huy", 66, 101, 24, "Central"],
  ["Hoàng Thị Lan", 53, 96, 21, "North Highlands"],
];

/** Weighted mean of the per-merchandiser adherence the platform publishes. */
const adherenceOf = (team: MerchFact[]) =>
  team.reduce((sum, [, adherence, visits]) => sum + adherence * visits, 0) /
  team.reduce((sum, [, , visits]) => sum + visits, 0);

const PJP_ADHERENCE = adherenceOf(MERCHANDISERS);

/**
 * A region's own team, and with it its own adherence.
 *
 * The headline gauge is recomputed from whoever is on screen rather than scaled
 * off the national figure, so the number above the table is the table's own
 * mean — the two can never disagree.
 */
function teamFor(scope: Scope): MerchFact[] {
  if (scope.kind !== "region") return MERCHANDISERS;
  const team = MERCHANDISERS.filter(([, , , , region]) => region === scope.label);
  return team.length > 0 ? team : MERCHANDISERS;
}

/** Stores with no recent visit. Each is filed under the region that owns it. */
const NOT_COVERED: [region: string, outlet: string, code: string, last: string][] = [
  ["Ho Chi Minh City", "MM Mega Market An Phú", "0123555", "18 days"],
  ["North Highlands", "Winmart Hà Giang", "0448120", "26 days"],
  ["Central", "Co.opmart Quy Nhơn", "0392044", "31 days"],
  ["Red River Delta", "Aeon Hải Phòng", "0517783", "22 days"],
  ["Mekong Delta", "BHX Cần Thơ Ninh Kiều", "0664901", "19 days"],
  ["South East", "Lotte Mart Biên Hòa", "0731064", "24 days"],
];

export type MerchandiserView = {
  period: MonthKey;
  monthLabel: string;
  gauges: { title: string; data: GaugeData }[];
  timeSpent: BarRow[];
  trend: ReturnType<typeof buildSeriesTrend>;
  plannedVsActual: GroupedColumnsData;
  timeTable: { columns: Column[]; rows: Row[] };
  notCovered: { columns: Column[]; rows: Row[] };
  photoQuality: {
    overall: string;
    delta: string;
    gauges: { title: string; data: GaugeData }[];
    trend: ReturnType<typeof buildSeriesTrend>;
    outliers: { columns: Column[]; rows: Row[] };
  };
};

function build(period: MonthKey, scope: Scope = NATIONAL): MerchandiserView {
  const i = MONTH_INDEX[period];
  const level = AVAIL_SERIES[i] / AVAIL_SERIES[LAST];
  const days = MONTHS[i].days;
  const share = scope.countShare;

  const team = teamFor(scope);
  const teamSize = Math.max(team.length, Math.round(ESTATE.team * share));
  const active = Math.round(ESTATE.activeToday * level * share);
  const visited = Math.round(ESTATE.stores * level * share);
  const planned = Math.round(ESTATE.estate * level * share);
  /* Recomputed from whoever is on screen, so the gauge is the table's own
     weighted mean rather than the nation's scaled. */
  const pjp = adherenceOf(team) * level;
  /* Geo compliance has no per-region fact; availability standing is the proxy
     for how carefully a region works. */
  const geo = clampPct(91 * level * scope.factors.osa);

  /* Daily planned-vs-actual across the month. Weekly rhythm rather than noise:
     visits dip at weekends, which is what the shape should say. */
  const daily = Array.from({ length: days }, (_, day) => {
    const weekend = (day + 3) % 7 >= 5;
    const base = (visited / days) * (weekend ? 0.42 : 1.18);
    return { actual: Math.round(base), planned: Math.round((planned / days) * 1.05) };
  });

  const domain: [number, number] = [0, Math.max(...daily.map((d) => d.planned)) * 1.2];
  const y = linearScale(domain, [PLOT.y1, PLOT.y0]);
  const xs = centredBandX(days, PLOT.x0, PLOT.x1);
  const slot = (PLOT.x1 - PLOT.x0) / days;
  const rects = groupedColumns(
    daily.map((d) => [d.actual, d.planned]),
    xs,
    slot,
    y,
    PLOT.y1,
    1,
  );

  /* Scoping a pass rate scales the *rejection*, not the rate: multiplying 91.3
     by a strong region's factor would print 101.9, and clamping that to 100
     would claim a region rejects nothing. Shrinking the 8.7% it fails on keeps
     the direction right and the ceiling honest. */
  const rejectionFactor = scope.kind === "national" ? 1 : 1 / scope.factors.osa;
  const qualityAt = (monthLevel: number) =>
    +(100 - (100 - PASS_RATE * (0.97 + monthLevel * 0.03)) * rejectionFactor).toFixed(2);
  const overallQuality = qualityAt(level);
  const qualitySeries = AVAIL_SERIES.map((value) =>
    qualityAt(value / AVAIL_SERIES[LAST]),
  );

  const outlierStores =
    scope.kind === "region"
      ? OUTLETS_BY_REGION[scope.id as RegionScopeId].map((store) => store.outlet)
      : [
          "3742 · Winlife HCM 94/54",
          "3207 · BHX Q07",
          "Emart Gò Vấp",
          "Aeon Tân Phú",
          "Lotte Quận 7",
          "MM An Phú",
        ];

  return {
    period,
    monthLabel: MONTHS[i].label,

    gauges: [
      {
        title: "PJP adherence",
        data: buildGauge({
          value: pjp,
          min: 0,
          max: 100,
          target: 90,
          label: `${Math.round(pjp)}%`,
          caption: `${group(Math.round((visited * pjp) / 100))} / ${group(visited)}`,
          minLabel: "0%",
          maxLabel: "100%",
          tone: pjp >= 90 ? "success" : "warning",
          ariaLabel: `Journey plan adherence ${Math.round(pjp)} percent against a 90 percent target.`,
        }),
      },
      {
        title: "Merchandiser attendance",
        data: buildGauge({
          value: (active / teamSize) * 100,
          min: 0,
          max: 100,
          target: 95,
          label: `${Math.round((active / teamSize) * 100)}%`,
          caption: `${active} / ${teamSize}`,
          minLabel: "0%",
          maxLabel: "100%",
          tone: "primary",
          ariaLabel: `${active} of ${teamSize} merchandisers active.`,
        }),
      },
      {
        title: "Store visits",
        data: buildGauge({
          value: visited,
          min: 0,
          max: Math.round(ESTATE.estate * share),
          target: planned,
          label: group(visited),
          caption: `of ${group(Math.round(ESTATE.estate * share))} stores`,
          minLabel: "0",
          maxLabel: group(Math.round(ESTATE.estate * share)),
          tone: "tertiary",
          ariaLabel: `${group(visited)} of ${group(Math.round(ESTATE.estate * share))} stores visited.`,
        }),
      },
      {
        title: "Geo compliance",
        data: buildGauge({
          value: geo,
          min: 0,
          max: 100,
          target: 95,
          label: `${Math.round(geo)}%`,
          caption: `${group(Math.round((visited * geo) / 100))} / ${group(visited)}`,
          minLabel: "0%",
          maxLabel: "100%",
          tone: geo >= 95 ? "success" : "warning",
          ariaLabel: `Geo compliance ${Math.round(geo)} percent.`,
        }),
      },
    ],

    timeSpent: team.map(([name, , , minutes]) => ({
      label: name,
      value: `${Math.round(minutes * level)} min`,
      pct: +((minutes / team[0][3]) * 100).toFixed(1),
    })),

    trend: buildSeriesTrend({
      series: [
        { label: "Store coverage", values: AVAIL_SERIES.map((v) => clampPct(+(v * 1.19 * scope.factors.osa).toFixed(1))), tone: "primary" },
        { label: "PJP adherence", values: AVAIL_SERIES.map((v) => +((adherenceOf(team) * v) / AVAIL_SERIES[LAST]).toFixed(1)), tone: "tertiary" },
        { label: "Geo compliance", values: AVAIL_SERIES.map((v) => clampPct(+((91 * v * scope.factors.osa) / AVAIL_SERIES[LAST]).toFixed(1))), tone: "secondary" },
      ],
      labelled: false,
      axisTitle: "Percent",
      ariaLabel: "Coverage, journey-plan adherence and geo compliance, February to July 2026.",
    }),

    plannedVsActual: {
      viewBox: VIEW_BOX,
      plot: PLOT,
      grid: gridLines(domain, y, 4, (v) => group(Math.round(v))),
      groups: daily.map((_, day) => ({
        label: String(day + 1),
        bars: rects[day].map((rect, barIndex) => ({
          ...rect,
          tone: barIndex === 0 ? ("primary" as const) : ("target" as const),
        })),
      })),
      legend: [
        { label: "Actual visits", tone: "primary" },
        { label: "Planned", tone: "target" },
      ],
      /* Every third day, so a 31-column axis stays readable. */
      xLabels: xs
        .map((x, day) => ({ x: +x.toFixed(1), label: String(day + 1) }))
        .filter((_, day) => day % 3 === 0),
      axisTitle: { x: 12, y: 82, text: "Visits", rotate: -90 },
      ariaLabel: `Actual against planned visits for each day of ${MONTHS[i].label}.`,
    },

    timeTable: {
      columns: [
        { key: "merch", label: "Merchandiser" },
        { key: "visits", label: "Visits", align: "right" },
        { key: "avg", label: "Avg time in store", align: "right" },
        { key: "pjp", label: "PJP adherence", align: "right" },
      ],
      rows: team.map(([name, adherence, visits, minutes]) => {
        const scaled = adherence * level;
        return {
          id: name,
          cells: [
            text(name),
            num(group(Math.round(visits * level)), Math.round(visits * level)),
            num(`${Math.round(minutes * level)} min`, minutes),
            tiered(
              pct1(scaled),
              scaled,
              scaled >= 90 ? "good" : scaled >= 75 ? "warn" : "bad",
            ),
          ],
        };
      }),
    },

    notCovered: {
      columns: [
        { key: "region", label: "Region" },
        { key: "outlet", label: "Outlet" },
        { key: "code", label: "Outlet code" },
        { key: "last", label: "Last visited", align: "right" },
      ],
      rows: NOT_COVERED.filter(
        ([region]) => scope.kind !== "region" || region === scope.label,
      ).map(([region, outlet, code, last]) => ({
        id: code,
        cells: [text(region), text(outlet), text(code), text(last)],
      })),
    },

    photoQuality: {
      overall: pct2Local(overallQuality),
      delta: `${overallQuality >= qualitySeries[Math.max(0, i - 1)] ? "+" : "−"}${Math.abs(overallQuality - qualitySeries[Math.max(0, i - 1)]).toFixed(2)}%`,
      gauges: [
        {
          title: "Good quality",
          data: buildGauge({
            value: Math.round((PHOTOS - REJECTED) * level * share),
            min: 0,
            max: Math.round(PHOTOS * level * share),
            label: group(Math.round((PHOTOS - REJECTED) * level * share)),
            minLabel: "0",
            maxLabel: group(Math.round(PHOTOS * level * share)),
            tone: "success",
            ariaLabel: `${group(Math.round((PHOTOS - REJECTED) * level * share))} captures passed quality checks.`,
          }),
        },
        ...DEFECT_SHARES.map(([label, defectShare]) => {
          const count = Math.round(REJECTED * defectShare * level * share);
          return {
            title: label,
            data: buildGauge({
              value: count,
              min: 0,
              max: Math.round(REJECTED * level * share),
              label: group(count),
              minLabel: "0",
              maxLabel: group(Math.round(REJECTED * level * share)),
              tone: "warning",
              ariaLabel: `${group(count)} captures rejected for ${label.toLowerCase()}.`,
            }),
          };
        }),
      ],
      trend: buildSeriesTrend({
        series: [{ label: "Photo quality", values: qualitySeries, tone: "primary", fill: true }],
        format: pct1,
        axisTitle: "Pass rate",
        withTrendline: true,
        ariaLabel: "Photo quality pass rate, February to July 2026.",
      }),
      outliers: {
        columns: [
          { key: "store", label: "Store" },
          { key: "merch", label: "Merchandiser" },
          { key: "quality", label: "Photo quality", align: "right" },
        ],
        rows: team.slice(0, 6).map(([name, adherence], index) => {
          const quality = clampPct(adherence * 0.92 * level);
          return {
            id: `outlier-${name}`,
            cells: [
              text(outlierStores[index % outlierStores.length]),
              text(name),
              tiered(
                pct1(quality),
                quality,
                quality >= 85 ? "good" : quality >= 70 ? "warn" : "bad",
              ),
            ],
          };
        }),
      },
    },
  };
}

const pct2Local = (v: number) => `${v.toFixed(2)}%`;

export const MERCHANDISER_VIEWS = Object.fromEntries(
  MONTH_KEYS.map((key) => [key, build(key)]),
) as Record<MonthKey, MerchandiserView>;

export const merchandiserView = scopedLookup(MERCHANDISER_VIEWS, build);
