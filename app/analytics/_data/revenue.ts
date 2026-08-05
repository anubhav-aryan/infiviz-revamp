import { PRICING_SERIES } from "./spine";
import { precomputeModule, type MetricModuleConfig } from "./metric-module";

/**
 * Revenue Management — pricing and promotion compliance.
 *
 * `PRICING_SERIES` is anchored in `spine.ts` so July's 41.2% makes the Perfect
 * Store score come out at the figure that module publishes. Promotion is
 * derived from it, the way the source dashboard derives its second measure
 * rather than tracking an unrelated series.
 *
 * PowerBI holds pricing to a 50% target, not 100 — a price is compliant if it
 * sits inside the recommended band, and half the range is the band.
 */
const PROMOTION = PRICING_SERIES.map((value) => +(value * 0.78).toFixed(1));

const CONFIG: MetricModuleConfig = {
  id: "revenue",
  title: "Revenue Management",
  measureNoun: "pricing",

  measures: [
    {
      id: "pricing",
      short: "Pricing",
      label: "Pricing compliance",
      series: PRICING_SERIES,
      target: 50,
    },
    {
      id: "promotion",
      short: "Promotion",
      label: "Promotion compliance",
      series: PROMOTION,
      target: 50,
    },
  ],

  brands: [
    ["Colgate Total", 95.2, 0.65, 64759],
    ["Colgate CDC", 86.2, 3.95, 59300],
    ["Max Fresh", 85.6, -1.81, 58814],
    ["Natural Salt", 81.5, 4.51, 57343],
    ["Salt Original", 74.4, 3.6, 50920],
    ["Vitamin C", 66.1, -2.2, 41880],
    ["Optic White", 51.3, -4.1, 32610],
  ],

  groups: [
    ["Toothpaste", 44.4, 1.2, 50],
    ["Toothbrush", 37.3, -0.8, 50],
    ["Mouthwash", 35.0, -1.4, 50],
    ["Kids oral care", 32.1, -0.6, 50],
    ["Whitening", 30.9, -2.1, 50],
  ],

  outlets: [
    ["3742 · Winlife HCM 94/54 - 56", "0992599", 7.4, 50, "3742-winlife-hcm-94-54-56"],
    ["3207 · BHX HCM Q07 769A Tran", "0175381", 9.4, 50, "3207-bhx-hcm-q07-769a-tran"],
    ["14830 · BHX HCM TPH 187 Tan", "0562863", 9.6, 50, "14830-bhx-hcm-tph-187-tan"],
    ["Emart Gò Vấp", "0127406", 10.0, 50, "emart-go-vap"],
    ["Co.opmart Nguyễn Đình Chiểu", "7525846", 10.0, 50, null],
    ["Aeon Tân Phú", "0079001", 10.1, 50, null],
    ["Lotte Mart Quận 7", "0305040", 10.3, 50, null],
    ["MM Mega Market An Phú", "0520608", 10.6, 50, null],
  ],

  reasons: [
    ["Product not placed on shelf", 332],
    ["Incorrect price sticker", 106],
    ["Product has no price tag", 104],
    ["Shopkeeper has not updated", 92],
  ],

  actionsByBrand: [
    ["Colgate Total", 623],
    ["Colgate CDC", 485],
    ["Max Fresh", 393],
    ["Natural Salt", 288],
    ["Salt Original", 269],
    ["Vitamin C", 250],
    ["Optic White", 214],
  ],

  completion: [
    ["Phạm Thu Hà", 137, 78],
    ["Võ Hoàng Nam", 103, 56],
    ["Đỗ Thị Mai", 38, 35],
    ["Bùi Quang Huy", 74, 31],
    ["Nguyễn Văn An", 60, 29],
    ["Trần Thị Bích", 34, 28],
    ["Lê Minh Quân", 30, 27],
  ],

  actionsTotal: 3293,
  actionsClosedPct: 29.1,

  merchImpact: [
    ["Toothpaste", 28.4, 51.2],
    ["Toothbrush", 27.9, 49.8],
    ["Mouthwash", 26.1, 48.3],
    ["Kids oral care", 25.4, 47.1],
    ["Whitening", 24.8, 46.2],
  ],
};

export const REVENUE = CONFIG;
export const REVENUE_VIEWS = precomputeModule(CONFIG);
