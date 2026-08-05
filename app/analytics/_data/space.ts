import { PLANOGRAM_SERIES } from "./spine";
import { precomputeModule, type MetricModuleConfig } from "./metric-module";

/**
 * Space Management — planogram compliance.
 *
 * PowerBI breaks the measure into row, bay and sequence compliance, and its
 * headline is their mean. Those three are carried as selectable measures rather
 * than as extra columns, so each gets the full tab set — the same treatment
 * pricing and promotion get next door.
 *
 * `PLANOGRAM_SERIES` is anchored in `spine.ts` so July's 57.5% makes the
 * Perfect Store score reconcile. Row, bay and sequence are offsets that average
 * back to it, which is what keeps the breakdown honest against the headline.
 */
const offset = (delta: number) =>
  PLANOGRAM_SERIES.map((value) => +(value + delta).toFixed(1));

const CONFIG: MetricModuleConfig = {
  id: "space",
  title: "Space Management",
  measureNoun: "planogram",

  measures: [
    {
      id: "planogram",
      short: "Planogram",
      label: "Planogram compliance",
      series: PLANOGRAM_SERIES,
      target: 85,
    },
    /* +6.4, −4.1 and −2.3 average to zero, so the three sub-measures average
       back to the headline in every month rather than only in July. */
    { id: "row", short: "Row", label: "Row compliance", series: offset(6.4), target: 85 },
    { id: "bay", short: "Bay", label: "Bay compliance", series: offset(-4.1), target: 85 },
    {
      id: "sequence",
      short: "Sequence",
      label: "Sequence compliance",
      series: offset(-2.3),
      target: 85,
    },
  ],

  brands: [
    ["Colgate Total", 62.4, -2.47, 64759],
    ["Colgate CDC", 59.1, -2.88, 59300],
    ["Max Fresh", 57.8, 1.2, 58814],
    ["Natural Salt", 55.3, -0.4, 57343],
    ["Salt Original", 52.9, 0.8, 50920],
    ["Vitamin C", 48.6, -1.6, 41880],
    ["Optic White", 44.2, -3.1, 32610],
  ],

  groups: [
    ["Toothpaste", 61.2, 1.4, 85],
    ["Toothbrush", 58.9, -0.7, 85],
    ["Mouthwash", 55.4, -1.2, 85],
    ["Kids oral care", 52.1, 0.6, 85],
    ["Whitening", 49.8, -1.9, 85],
  ],

  outlets: [
    ["3742 · Winlife HCM 94/54 - 56", "0026158", 71.5, 85, "3742-winlife-hcm-94-54-56"],
    ["3207 · BHX HCM Q07 769A Tran", "0027773", 66.2, 85, "3207-bhx-hcm-q07-769a-tran"],
    ["14830 · BHX HCM TPH 187 Tan", "0027775", 58.4, 85, "14830-bhx-hcm-tph-187-tan"],
    ["Emart Gò Vấp", "0066106", 55.1, 85, "emart-go-vap"],
    ["Co.opmart Nguyễn Đình Chiểu", "0123620", 52.7, 85, null],
    ["Aeon Tân Phú", "0161348", 49.3, 85, null],
    ["Lotte Mart Quận 7", "0206313", 46.8, 85, null],
    ["MM Mega Market An Phú", "0211729", 41.0, 85, null],
  ],

  reasons: [
    ["Shelf rebuilt by the retailer", 288],
    ["Planogram not available in store", 214],
    ["Insufficient bay width", 175],
    ["Sequence broken during replenishment", 129],
  ],

  actionsByBrand: [
    ["Colgate Total", 288],
    ["Colgate CDC", 269],
    ["Max Fresh", 250],
    ["Natural Salt", 214],
    ["Salt Original", 175],
    ["Vitamin C", 144],
    ["Optic White", 110],
  ],

  completion: [
    ["Lê Minh Quân", 96, 44],
    ["Nguyễn Văn An", 81, 39],
    ["Đỗ Thị Mai", 63, 31],
    ["Phạm Thu Hà", 58, 27],
    ["Trần Thị Bích", 47, 24],
    ["Bùi Quang Huy", 41, 19],
    ["Võ Hoàng Nam", 36, 15],
  ],

  actionsTotal: 1450,
  actionsClosedPct: 24.6,
};

export const SPACE = CONFIG;
export const SPACE_VIEWS = precomputeModule(CONFIG);
