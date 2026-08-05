import { AVAIL_SERIES, DIM_SOURCE } from "./spine";
import { precomputeModule, type MetricModuleConfig } from "./metric-module";

/**
 * Availability Management — on-shelf availability.
 *
 * The brand rows are **not authored here**. They are the `Brand` dimension the
 * Analytics screen already publishes, mapped into the module's shape, so the
 * two surfaces cannot drift: Optic White reads 8.6% with a 6.4-point drop on
 * both, because it is literally the same fact.
 *
 * Facings are derived from each brand's ranged store count rather than invented
 * — a brand present in 610 stores at roughly 46 facings a store.
 */
const BRANDS = DIM_SOURCE.Brand.map(
  ([name, osa, delta, stores]) =>
    [name, osa, delta, stores * 46] as [string, number, number, number],
);

const CONFIG: MetricModuleConfig = {
  id: "availability",
  title: "Availability Management",
  measureNoun: "availability",

  /* PowerBI holds OSA to 100%: every ranged SKU should be on the shelf, so the
     gap is the whole story and there is no softer target to hide behind. */
  measures: [
    {
      id: "osa",
      short: "OSA",
      label: "On-shelf availability",
      series: AVAIL_SERIES,
      target: 100,
    },
    {
      id: "msl",
      short: "MSL OSA",
      label: "Must-stock availability",
      series: AVAIL_SERIES.map((value) => +(value * 1.136).toFixed(1)),
      target: 100,
    },
  ],

  brands: BRANDS,

  groups: [
    ["Toothpaste", 65.1, 1.2, 100],
    ["Toothbrush", 61.0, 0.5, 100],
    ["Mouthwash", 58.4, -0.3, 100],
    ["Kids oral care", 54.0, -1.1, 100],
    ["Whitening", 46.2, -2.4, 100],
  ],

  outlets: [
    ["3742 · Winlife HCM 94/54 - 56", "0274622", 74.0, 100, "3742-winlife-hcm-94-54-56"],
    ["3207 · BHX HCM Q07 769A Tran", "0537180", 66.0, 100, "3207-bhx-hcm-q07-769a-tran"],
    ["14830 · BHX HCM TPH 187 Tan", "0502802", 52.0, 100, "14830-bhx-hcm-tph-187-tan"],
    ["Emart Gò Vấp", "0983302", 58.0, 100, "emart-go-vap"],
    ["Co.opmart Nguyễn Đình Chiểu", "0550508", 61.0, 100, null],
    ["Aeon Tân Phú", "0429239", 58.0, 100, null],
    ["Lotte Mart Quận 7", "0807727", 53.9, 100, null],
    ["MM Mega Market An Phú", "0438637", 49.0, 100, null],
  ],

  reasons: [
    ["No stock at store — reported", 1001],
    ["Product not in the range", 926],
    ["No shelf space allocated", 652],
    ["Retailer has not replenished", 450],
  ],

  actionsByBrand: [
    ["Optic White", 630],
    ["Colgate Total", 610],
    ["CDC", 590],
    ["Max Fresh", 540],
    ["Natural", 470],
    ["Salt", 410],
    ["Kid", 360],
    ["Vitamin C", 300],
  ],

  completion: [
    ["Nguyễn Văn An", 694, 114],
    ["Trần Thị Bích", 372, 86],
    ["Lê Minh Quân", 191, 61],
    ["Phạm Thu Hà", 544, 59],
    ["Võ Hoàng Nam", 379, 53],
    ["Đỗ Thị Mai", 320, 48],
    ["Bùi Quang Huy", 349, 43],
  ],

  /* Reconciles with the fixture the platform already ships: the must-stock gap
     list sums to 1,065 absent store-SKUs, and PowerBI generates one action per
     absent store-SKU. */
  actionsTotal: 1065,
  actionsClosedPct: 8.1,

  merchImpact: [
    ["Toothpaste", 39.95, 69.99],
    ["Toothbrush", 40.17, 70.52],
    ["Mouthwash", 37.98, 70.03],
    ["Kids oral care", 39.69, 70.24],
    ["Whitening", 40.3, 69.29],
  ],
};

export const AVAILABILITY = CONFIG;
export const AVAILABILITY_VIEWS = precomputeModule(CONFIG);
