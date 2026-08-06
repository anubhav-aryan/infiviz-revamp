import { VIS_SERIES } from "./spine";
import {
  precomputeModule,
  type MetricModuleConfig,
} from "./metric-module";

/**
 * Category Management — share of shelf and its three siblings.
 *
 * PowerBI reports four measures here. Only SOS is authored: the platform
 * already publishes 38.7% and every screen quotes it, so the other three are
 * *derived* from it by a fixed offset rather than invented. That is what the
 * source dashboard does too — its own SOS and LSOS sit 1.11 points apart in
 * every month, because they measure the same shelf two ways.
 *
 * Filters: the brand table, the category cards, the detail tables and the raw
 * extract all carry the dimensions the filter bar offers, so all of them
 * respond. The trend, the gap columns and the donut deliberately do not — they
 * are national six-month series, and narrowing them would put figures on screen
 * that no fact accounts for. Same line `analytics.ts` draws.
 */

/** SOS is the authored spine; the rest are offsets from it. */
const SOS = VIS_SERIES;
const offset = (delta: number) => SOS.map((value) => +(value + delta).toFixed(1));

const CONFIG: MetricModuleConfig = {
  id: "category-management",
  title: "Category Management",
  measureNoun: "share of shelf",

  measures: [
    {
      id: "sof",
      short: "SOF",
      label: "Share of facings",
      series: offset(2.4),
      target: 45,
      competitive: true,
    },
    {
      id: "sos",
      short: "SOS",
      label: "Share of shelf",
      series: SOS,
      target: 45,
      competitive: true,
    },
    {
      id: "lsos",
      short: "LSOS",
      label: "Linear share of shelf",
      series: offset(-1.1),
      target: 42,
      competitive: true,
    },
    {
      id: "asos",
      short: "ASOS",
      label: "Adjusted share of shelf",
      series: offset(-0.3),
      target: 44,
      competitive: true,
    },
  ],

  /* Facings reconcile with the catalogue: 121 SKUs across 1,412 audited
     stores, so the leading brand carrying ~65k facings is ~46 per store. */
  brands: [
    ["Colgate Total", 11.2, -0.07, 64759],
    ["Colgate CDC", 9.1, -0.04, 59300],
    ["Max Fresh", 7.0, -0.14, 58814],
    ["Natural Salt", 5.9, 0.01, 57343],
    ["Salt Original", 3.0, -0.01, 50920],
    ["Vitamin C", 2.7, -0.06, 41880],
    ["Optic White", 2.1, -0.21, 32610],
  ],

  groups: [
    ["Toothpaste", 49.5, -2.08, 54.8],
    ["Toothbrush", 21.3, -0.58, 70.2],
    ["Mouthwash", 19.6, -0.05, 60.6],
    ["Kids oral care", 34.6, 0.47, 62.1],
    ["Whitening", 59.7, -1.14, 53.3],
  ],

  outlets: [
    ["3742 · Winlife HCM 94/54 - 56", "0486650", 21.4, 30, "3742-winlife-hcm-94-54-56"],
    ["3207 · BHX HCM Q07 769A Tran", "0897101", 60.3, 60, "3207-bhx-hcm-q07-769a-tran"],
    ["14830 · BHX HCM TPH 187 Tan", "0555099", 24.3, 20, "14830-bhx-hcm-tph-187-tan"],
    ["Emart Gò Vấp", "0568981", 60.0, 50, "emart-go-vap"],
    ["Co.opmart Nguyễn Đình Chiểu", "0581636", 36.7, 50, null],
    ["Aeon Tân Phú", "0513934", 10.8, 20, null],
    ["Lotte Mart Quận 7", "0129319", 30.3, 60, null],
    ["MM Mega Market An Phú", "0123555", 10.6, 60, null],
  ],

  reasons: [
    ["No stock — reported to store", 411],
    ["Goods excluded from range", 288],
    ["Planogram space unavailable", 96],
    ["Stock present, not shelved", 41],
  ],

  actionsByBrand: [
    ["Colgate Total", 101],
    ["Colgate CDC", 100],
    ["Max Fresh", 92],
    ["Natural Salt", 61],
    ["Salt Original", 52],
    ["Vitamin C", 49],
    ["Optic White", 46],
  ],

  completion: [
    ["Nguyễn Văn An", 30, 26],
    ["Trần Thị Bích", 19, 24],
    ["Lê Minh Quân", 97, 18],
    ["Phạm Thu Hà", 18, 14],
    ["Võ Hoàng Nam", 38, 13],
    ["Đỗ Thị Mai", 29, 12],
    ["Bùi Quang Huy", 9, 12],
  ],

  /* Brand and outlet figures are shares of shelf; the others scale off them. */
  baseMeasure: "sos",

  /* This module's spine is share of shelf, so a region moves it by its own
     share-of-shelf standing rather than by its availability. */
  scopeAxis: "sos",

  actionsTotal: 700,
  actionsClosedPct: 27.9,

  merchImpact: [
    ["Toothpaste", 39.95, 69.99],
    ["Toothbrush", 40.17, 70.52],
    ["Mouthwash", 37.98, 70.03],
    ["Kids oral care", 39.69, 70.24],
    ["Whitening", 40.3, 69.29],
  ],
};

export const CATEGORY_MANAGEMENT = CONFIG;

/** Every measure × every month, built once. */
export const CATEGORY_MANAGEMENT_VIEWS = precomputeModule(CONFIG);
