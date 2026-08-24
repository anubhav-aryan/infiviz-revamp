import type { Column, Row } from "@/app/_charts/table";
import type { TableView } from "@/app/_charts/tabbed-table";
import { num, text } from "@/app/_charts/table";
import {
  brandSubcategory,
  BRAND_SHELF,
  CATEGORY,
  OWN_BRANDS,
  pct,
  SHELF_SKUS,
  sum,
  sumOwn,
  TOTALS,
  type BrandFact,
  type SkuFact,
} from "./shelf-facts";

/**
 * The five session tables — SKU list, Area SOS, Share of Facings, Linear SOS
 * and Brand Blocking. All five are projections of `shelf-facts.ts`, computed
 * once at module scope, so the numbers on five tabs of one card cannot
 * disagree with each other or with the rail.
 */

const SKU_COLUMNS: Column[] = [
  { key: "category", label: "Category", width: "120px" },
  { key: "brand", label: "Brand", width: "120px" },
  { key: "manufacturer", label: "Manufacturer", width: "130px" },
  { key: "upc", label: "UPC", width: "130px" },
  { key: "productCode", label: "Product code", width: "130px" },
  { key: "externalId", label: "SKU external ID", width: "130px" },
  { key: "subcategory", label: "Subcategory", width: "120px" },
  { key: "name", label: "Full name", width: "260px" },
  { key: "variant", label: "Variant", width: "90px" },
  { key: "facings", label: "Facings", align: "right", width: "90px" },
  { key: "regularPrice", label: "Regular price", align: "right", width: "120px" },
  { key: "sticker", label: "Price sticker", width: "120px" },
  { key: "promoType1", label: "Promo price type 1", width: "150px" },
  { key: "promo1", label: "Promo price 1", align: "right", width: "120px" },
  { key: "promoType2", label: "Promo price type 2", width: "150px" },
  { key: "promo2", label: "Promo price 2", align: "right", width: "120px" },
  { key: "promoType3", label: "Promo price type 3", width: "150px" },
  { key: "promo3", label: "Promo price 3", align: "right", width: "120px" },
];

/** `N/A` rather than an empty cell, matching how the product prints a missing
 *  promo slot — a blank would read as "not yet loaded". */
const NA = text("N/A");

const promoCells = (sku: SkuFact) =>
  [0, 1, 2].flatMap((slot) => {
    const promo = sku.promo?.[slot];
    return promo
      ? [text(promo.type), { text: promo.price, mono: true }]
      : [NA, NA];
  });

const SKU_ROWS: Row[] = SHELF_SKUS.map((sku) => ({
  id: sku.externalId,
  cells: [
    text(CATEGORY),
    text(sku.brand),
    text(OWN_BRANDS.has(sku.brand) ? "OWN" : "COMPETITION"),
    { text: sku.upc, mono: true },
    { text: sku.productCode, mono: true },
    { text: sku.externalId, mono: true },
    text(brandSubcategory.get(sku.brand) ?? "Mixed"),
    text(sku.name),
    text(sku.variant),
    num(String(sku.facings), sku.facings),
    { text: sku.regularPrice, mono: true },
    text(sku.sticker ? "Captured" : "N/A"),
    ...promoCells(sku),
  ],
}));

/* ---------------------------------------------------------------- */
/* 2–4 · the three share tables                                      */
/* ---------------------------------------------------------------- */

/** Shared by Area SOS, Share of Facings and Linear SOS — same eleven brands,
 *  same order, only the measure changes. */
const shareColumns = (measure: string, detail: string): Column[] => [
  { key: "category", label: "Category", width: "120px" },
  { key: "subcategory", label: "Sub-category", width: "140px" },
  { key: "brand", label: "Brand", width: "150px" },
  { key: "detail", label: detail, align: "right", width: "160px" },
  { key: "share", label: measure, align: "right", width: "150px" },
];

/** One builder for all three tables, so a change to how a share is presented
 *  cannot land on one tab and miss the other two. */
function shareView(
  id: string,
  label: string,
  detail: string,
  measure: string,
  pick: (brand: BrandFact) => number,
  format: (value: number) => string,
): TableView {
  const total = sum(pick);
  return {
    id,
    label,
    columns: shareColumns(measure, detail),
    rows: [
      ...BRAND_SHELF.map((brand) => ({
        id: brand.name,
        cells: [
          text(CATEGORY),
          text(brand.subcategory),
          text(brand.name),
          {
            text: `${format(pick(brand))}/${format(total)}`,
            value: pick(brand),
            mono: true,
          },
          {
            text: pct(pick(brand), total),
            value: pick(brand) / total,
            mono: true,
            bar: (pick(brand) / total) * 100,
          },
        ],
      })),
      {
        id: "total",
        total: true,
        cells: [
          text(CATEGORY),
          text("All"),
          text(`Own share · ${BRAND_SHELF.filter((b) => b.isOwn).length} brands`),
          { text: `${format(sumOwn(pick))}/${format(total)}`, mono: true },
          { text: pct(sumOwn(pick), total), mono: true },
        ],
      },
    ],
    emptyLabel: "No shelf measured in this session.",
  };
}

const round1 = (value: number) => value.toFixed(1);

/**
 * Linear SOS gets its own builder rather than a fourth call to `shareView`:
 * it is the one measure captured at two scales, so it carries four numeric
 * columns instead of two.
 */
const LINEAR_COLUMNS: Column[] = [
  { key: "category", label: "Category", width: "120px" },
  { key: "subcategory", label: "Sub-category", width: "140px" },
  { key: "brand", label: "Brand", width: "150px" },
  { key: "cm", label: "Linear length CM", align: "right", width: "170px" },
  { key: "px", label: "Linear length PX", align: "right", width: "180px" },
  { key: "shareCm", label: "Linear share of shelf CM (%)", align: "right", width: "220px" },
  { key: "sharePx", label: "Linear share of shelf PX (%)", align: "right", width: "220px" },
];

const LINEAR_TOTAL_PX = sum((brand) => brand.linearPx);

const LINEAR_ROWS: Row[] = [
  ...BRAND_SHELF.map((brand) => ({
    id: brand.name,
    cells: [
      text(CATEGORY),
      text(brand.subcategory),
      text(brand.name),
      {
        text: `${brand.linearCm.toFixed(1)}/${TOTALS.linearCm.toFixed(1)}`,
        value: brand.linearCm,
        mono: true,
      },
      {
        text: `${brand.linearPx.toFixed(3)}/${LINEAR_TOTAL_PX.toFixed(3)}`,
        value: brand.linearPx,
        mono: true,
      },
      {
        text: pct(brand.linearCm, TOTALS.linearCm),
        value: brand.linearCm / TOTALS.linearCm,
        mono: true,
        bar: (brand.linearCm / TOTALS.linearCm) * 100,
      },
      {
        text: pct(brand.linearPx, LINEAR_TOTAL_PX),
        value: brand.linearPx / LINEAR_TOTAL_PX,
        mono: true,
      },
    ],
  })),
  {
    id: "total",
    total: true,
    cells: [
      text(CATEGORY),
      text("All"),
      text("Own share · 6 brands"),
      { text: `${TOTALS.ownLinearCm.toFixed(1)}/${TOTALS.linearCm.toFixed(1)}`, mono: true },
      {
        text: `${sumOwn((b) => b.linearPx).toFixed(3)}/${LINEAR_TOTAL_PX.toFixed(3)}`,
        mono: true,
      },
      { text: pct(TOTALS.ownLinearCm, TOTALS.linearCm), mono: true },
      { text: pct(sumOwn((b) => b.linearPx), LINEAR_TOTAL_PX), mono: true },
    ],
  },
];

/* ---------------------------------------------------------------- */
/* 5 · brand blocking                                                */
/* ---------------------------------------------------------------- */

const BLOCKING_COLUMNS: Column[] = [
  { key: "brand", label: "Brand", width: "160px" },
  { key: "category", label: "Category", width: "140px" },
  { key: "subcategory", label: "Sub category", width: "160px" },
  { key: "count", label: "Count", align: "right", width: "110px" },
  { key: "block", label: "Block", width: "150px" },
];

/**
 * The colour column. `Cell` has no colour field by design — cells are plain
 * serialisable data — so the swatch rides on the existing `pill`, whose `tone`
 * is a name the stylesheet maps. `own` / `comp` are the two tones needed.
 */
const BLOCKING_ROWS: Row[] = BRAND_SHELF.filter((brand) => brand.facings > 0)
  .map((brand) => ({
    id: brand.name,
    cells: [
      text(brand.name),
      text(CATEGORY),
      text(brand.subcategory),
      num(String(brand.facings), brand.facings),
      {
        text: brand.isOwn ? "Own block" : "Competitor block",
        pill: {
          label: brand.isOwn ? "Own block" : "Competitor block",
          tone: brand.isOwn ? "own" : "comp",
        },
      },
    ],
  }));

/* ---------------------------------------------------------------- */
/* the card's five views                                             */
/* ---------------------------------------------------------------- */

const ALL_VIEWS: TableView[] = [
  {
    id: "sku",
    label: "SKU Table",
    columns: SKU_COLUMNS,
    rows: SKU_ROWS,
    emptyLabel: "No SKUs recognised in this session.",
  },
  shareView(
    "area",
    "Area Share Of Shelf",
    "Details (cm²)",
    "Area share of shelf %",
    (brand) => brand.areaCm2,
    round1,
  ),
  shareView(
    "facings",
    "Share of Facings",
    "Details (facings)",
    "Share of facings %",
    (brand) => brand.facings,
    round1,
  ),
  {
    id: "linear",
    label: "Linear Share of Shelf",
    columns: LINEAR_COLUMNS,
    rows: LINEAR_ROWS,
    emptyLabel: "No shelf measured in this session.",
  },
  {
    id: "blocking",
    label: "Brand Blocking",
    columns: BLOCKING_COLUMNS,
    rows: BLOCKING_ROWS,
    emptyLabel: "No brand blocks detected.",
  },
];

/** Printed beside the tab row so the reader can check the sums themselves. */
export const TABLES_CAPTION =
  `${TOTALS.ownFacings} own of ${TOTALS.facings} facings · ` +
  `${(TOTALS.ownLinearCm / 100).toFixed(1)} m of ${(TOTALS.linearCm / 100).toFixed(1)} m linear`;

/**
 * The tables, optionally narrowed to one brand.
 *
 * Only the SKU tab narrows: the other four are brand-level summaries of the
 * whole bay, and filtering a share-of-shelf table to one brand would leave it
 * claiming that brand holds 100% of the shelf.
 */
export function sessionTableViews(brand: string | null): TableView[] {
  if (!brand) return ALL_VIEWS;
  return ALL_VIEWS.map((view) =>
    view.id === "sku"
      ? {
          ...view,
          /* Cell 1 is the brand column — see `SKU_COLUMNS`. */
          rows: view.rows.filter((row) => row.cells[1].text === brand),
          emptyLabel: `No ${brand} SKUs recognised in this session.`,
        }
      : view,
  );
}

export const SESSION_TABLE_VIEWS = ALL_VIEWS;
