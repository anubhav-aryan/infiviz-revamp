import type { Column, Row } from "@/app/_charts/table";
import type { TableView } from "@/app/_charts/tabbed-table";
import { num, text } from "@/app/_charts/table";

/**
 * The five session tables — SKU list, Area SOS, Share of Facings, Linear SOS
 * and Brand Blocking.
 *
 * All five are projections of the two authored arrays below, computed once at
 * module scope. That is the whole point of the file: the numbers on five tabs
 * of one card cannot be allowed to disagree with each other, or with the
 * metrics drawer, so there is exactly one place each fact is written down.
 *
 * The figures they have to reconcile with, all authored in `session-viewer.ts`:
 *
 *   SHELF_METRICS  Share of Shelf 34.2% = "128 of 374 facings"
 *   SHELF_METRICS  Linear SOS     33.8% = "2.7 m of 8.0 m"
 *   BRAND_ROWS     P/S 88, Closeup 61, CDC 42, Sensodyne 38, Colgate Total 34,
 *                  Oral-B 31, Natural 26, Max Fresh 22   (= 342 facings)
 *   MSL            eight ranged SKUs, six found (4/3/5/2/2/3 facings), two absent
 *   CONTEXT        "Optic White OSA was 33% in this session"
 *
 * `BRAND_SHELF` below reproduces those eight brand facings exactly and adds the
 * three-row tail (Salt, Optic White, Other brands) that carries 342 up to 374.
 */

/* ---------------------------------------------------------------- */
/* brand-level shelf measurements                                    */
/* ---------------------------------------------------------------- */

type BrandFact = {
  name: string;
  isOwn: boolean;
  subcategory: string;
  facings: number;
  /** Linear shelf length in cm. Sums to 800; own rows sum to 270. */
  linearCm: number;
  /**
   * The same shelf length measured off the stitch in pixels, summing to
   * 2,416.939. Authored separately rather than scaled from `linearCm`, because
   * they are two different measurements — one calibrated against the fixture,
   * one read off the image — and the small disagreement between their shares
   * (33.75% vs 33.74%) is real, not a rounding artefact.
   */
  linearPx: number;
  /** Shelf area in cm². Sums to 12,000; own rows sum to 4,152. */
  areaCm2: number;
};

/**
 * The first eight rows are `BRAND_ROWS`' facings, verbatim. The last three are
 * the tail that reconciles 342 to the 374 the Share-of-Shelf metric quotes —
 * Salt and Optic White are own brands too thin to have made the brand
 * breakdown's top eight, and "Other brands" is the unlisted competitor tail.
 *
 * Own facings: 42 + 34 + 26 + 22 + 2 + 2 = 128, which is the numerator in
 * "128 of 374 facings". Do not edit one of these without re-checking the sums
 * asserted in `TOTALS` below.
 */
const BRAND_SHELF: BrandFact[] = [
  { name: "P/S", isOwn: false, subcategory: "Everyday", facings: 88, linearCm: 186, linearPx: 575.2, areaCm2: 2790 },
  { name: "Closeup", isOwn: false, subcategory: "Freshness", facings: 61, linearCm: 129, linearPx: 380.1, areaCm2: 1935 },
  { name: "CDC", isOwn: true, subcategory: "Everyday", facings: 42, linearCm: 90, linearPx: 265.4, areaCm2: 1400 },
  { name: "Sensodyne", isOwn: false, subcategory: "Sensitivity", facings: 38, linearCm: 82, linearPx: 250.3, areaCm2: 1230 },
  { name: "Colgate Total", isOwn: true, subcategory: "Therapeutic", facings: 34, linearCm: 72, linearPx: 224.6, areaCm2: 1120 },
  { name: "Oral-B", isOwn: false, subcategory: "Therapeutic", facings: 31, linearCm: 67, linearPx: 198.7, areaCm2: 1005 },
  { name: "Natural", isOwn: true, subcategory: "Naturals", facings: 26, linearCm: 56, linearPx: 162.8, areaCm2: 870 },
  { name: "Max Fresh", isOwn: true, subcategory: "Freshness", facings: 22, linearCm: 44, linearPx: 138.2, areaCm2: 680 },
  { name: "Salt", isOwn: true, subcategory: "Naturals", facings: 2, linearCm: 4, linearPx: 11.4, areaCm2: 42 },
  { name: "Optic White", isOwn: true, subcategory: "Whitening", facings: 2, linearCm: 4, linearPx: 13.1, areaCm2: 40 },
  { name: "Other brands", isOwn: false, subcategory: "Mixed", facings: 28, linearCm: 66, linearPx: 197.139, areaCm2: 888 },
];

const CATEGORY = "Toothpaste";

const sum = (pick: (brand: BrandFact) => number) =>
  BRAND_SHELF.reduce((total, brand) => total + pick(brand), 0);
const sumOwn = (pick: (brand: BrandFact) => number) =>
  BRAND_SHELF.filter((brand) => brand.isOwn).reduce((total, brand) => total + pick(brand), 0);

/**
 * Every total the tables print, derived rather than retyped. If an edit above
 * breaks one of the four identities in the comment at the top of this file,
 * these are the values that will visibly move.
 */
export const TOTALS = {
  facings: sum((b) => b.facings), // 374
  ownFacings: sumOwn((b) => b.facings), // 128
  linearCm: sum((b) => b.linearCm), // 800
  ownLinearCm: sumOwn((b) => b.linearCm), // 270
  areaCm2: sum((b) => b.areaCm2), // 12000
  ownAreaCm2: sumOwn((b) => b.areaCm2), // 4152
};

const pct = (part: number, whole: number) => ((part / whole) * 100).toFixed(2);

/* ---------------------------------------------------------------- */
/* SKU-level facts                                                   */
/* ---------------------------------------------------------------- */

type SkuFact = {
  name: string;
  brand: string;
  variant: string;
  upc: string;
  productCode: string;
  externalId: string;
  facings: number;
  regularPrice: string;
  /** Whether a price sticker was read off the shelf edge for this SKU. */
  sticker: boolean;
  promo?: { type: string; price: string }[];
};

/**
 * The complete own portfolio plus the leading competitor SKUs — not an
 * exhaustive shelf inventory, which is why these facings sum to 346 of the 374
 * on shelf: the missing 28 are the "Other brands" tail, which has no SKU rows.
 *
 * Own rows sum to 128 and reproduce each own brand's facings exactly, and the
 * eight `MSL` names appear here with the facings the must-stock checklist
 * quotes — 4 / 3 / 5 / 2 / 2 / 3 for the six found, 0 for the two absent.
 *
 * Optic White is ranged three ways and present once, which is the 33% OSA the
 * Analytics context banner sent the user here to audit.
 */
const SHELF_SKUS: SkuFact[] = [
  /* --- CDC · 4 + 5 + 33 = 42 --- */
  { name: "COL TP CDC 225G x 36", brand: "CDC", variant: "225 G", upc: "8850006491027", productCode: "CDC-225-36", externalId: "100412", facings: 4, regularPrice: "62,000", sticker: true, promo: [{ type: "discounted-price", price: "56,500" }] },
  { name: "COL TP CDC 100g x 72", brand: "CDC", variant: "100 G", upc: "8850006491034", productCode: "CDC-100-72", externalId: "100413", facings: 5, regularPrice: "31,000", sticker: true },
  { name: "COL TP CDC 180G x 48", brand: "CDC", variant: "180 G", upc: "8850006491041", productCode: "CDC-180-48", externalId: "100414", facings: 33, regularPrice: "52,000", sticker: true, promo: [{ type: "discounted-price", price: "47,000" }, { type: "bundle", price: "89,000" }] },

  /* --- Colgate Total · 3 + 3 + 28 = 34 --- */
  { name: "COL Total Charcoal Deep Clean 150G", brand: "Colgate Total", variant: "150 G", upc: "8850006492017", productCode: "TOT-CHR-150", externalId: "100518", facings: 3, regularPrice: "74,000", sticker: true },
  { name: "COL Total Professional 100G", brand: "Colgate Total", variant: "100 G", upc: "8850006492024", productCode: "TOT-PRO-100", externalId: "100519", facings: 3, regularPrice: "58,000", sticker: false },
  { name: "COL Total Advanced Health 150G", brand: "Colgate Total", variant: "150 G", upc: "8850006492031", productCode: "TOT-ADV-150", externalId: "100520", facings: 28, regularPrice: "79,000", sticker: true, promo: [{ type: "discounted-price", price: "71,000" }] },

  /* --- Natural · 2 + 24 = 26 --- */
  { name: "COL Natural Salt Herbal 180G", brand: "Natural", variant: "180 G", upc: "8850006493014", productCode: "NAT-SLT-180", externalId: "100627", facings: 2, regularPrice: "49,000", sticker: true },
  { name: "COL Natural Extracts Charcoal 180G", brand: "Natural", variant: "180 G", upc: "8850006493021", productCode: "NAT-CHR-180", externalId: "100628", facings: 24, regularPrice: "66,000", sticker: true, promo: [{ type: "discounted-price", price: "59,500" }] },

  /* --- Max Fresh · 0 + 22 = 22 (the 140G blue gel is the absent must-have) --- */
  { name: "COL Max Fresh Blue Gel 140G", brand: "Max Fresh", variant: "140 G", upc: "8850006494011", productCode: "MXF-BLU-140", externalId: "100731", facings: 0, regularPrice: "57,000", sticker: false },
  { name: "COL Max Fresh Green Tea 140G", brand: "Max Fresh", variant: "140 G", upc: "8850006494028", productCode: "MXF-GRN-140", externalId: "100732", facings: 22, regularPrice: "57,000", sticker: true },

  /* --- Salt · 2 --- */
  { name: "COL Salt Original 200G", brand: "Salt", variant: "200 G", upc: "8850006495018", productCode: "SLT-ORG-200", externalId: "100844", facings: 2, regularPrice: "44,000", sticker: true },

  /* --- Optic White · 0 + 2 + 0 = 2 → one of three ranged present = 33% OSA --- */
  { name: "COL Optic White Plus Shine 100G", brand: "Optic White", variant: "100 G", upc: "8850006496015", productCode: "OPW-SHN-100", externalId: "100952", facings: 0, regularPrice: "98,000", sticker: false },
  { name: "COL Optic White Advanced 100G", brand: "Optic White", variant: "100 G", upc: "8850006496022", productCode: "OPW-ADV-100", externalId: "100953", facings: 2, regularPrice: "105,000", sticker: true, promo: [{ type: "discounted-price", price: "94,000" }] },
  { name: "COL Optic White O2 Fresh 85G", brand: "Optic White", variant: "85 G", upc: "8850006496039", productCode: "OPW-O2F-085", externalId: "100954", facings: 0, regularPrice: "112,000", sticker: false },

  /* --- competition · P/S 88, Closeup 61, Sensodyne 38, Oral-B 31 --- */
  { name: "P/S Bảo Vệ 123 Muối 180G", brand: "P/S", variant: "180 G", upc: "8934868142011", productCode: "PS-M123-180", externalId: "200104", facings: 46, regularPrice: "38,000", sticker: true, promo: [{ type: "discounted-price", price: "34,000" }] },
  { name: "P/S Trà Xanh Hoa Cúc 180G", brand: "P/S", variant: "180 G", upc: "8934868142028", productCode: "PS-TXHC-180", externalId: "200105", facings: 42, regularPrice: "40,000", sticker: true },
  { name: "Closeup Lửa Băng 180G", brand: "Closeup", variant: "180 G", upc: "8934868143018", productCode: "CU-LB-180", externalId: "200211", facings: 35, regularPrice: "54,000", sticker: true },
  { name: "Closeup Nước Hoa Hồng 180G", brand: "Closeup", variant: "180 G", upc: "8934868143025", productCode: "CU-NHH-180", externalId: "200212", facings: 26, regularPrice: "54,000", sticker: false },
  { name: "Sensodyne Rapid Relief 100G", brand: "Sensodyne", variant: "100 G", upc: "8901571002015", productCode: "SEN-RR-100", externalId: "200318", facings: 20, regularPrice: "128,000", sticker: true },
  { name: "Sensodyne Fresh Mint 100G", brand: "Sensodyne", variant: "100 G", upc: "8901571002022", productCode: "SEN-FM-100", externalId: "200319", facings: 18, regularPrice: "124,000", sticker: true, promo: [{ type: "discounted-price", price: "112,000" }] },
  { name: "Oral-B Pro-Health 130G", brand: "Oral-B", variant: "130 G", upc: "8001090512017", productCode: "OB-PH-130", externalId: "200425", facings: 17, regularPrice: "89,000", sticker: false },
  { name: "Oral-B 3D White 120G", brand: "Oral-B", variant: "120 G", upc: "8001090512024", productCode: "OB-3DW-120", externalId: "200426", facings: 14, regularPrice: "95,000", sticker: true },
];

/** Own-brand lookup, so the SKU table's Manufacturer column agrees with the
 *  brand tables' own/competition split rather than being typed twice. */
const OWN_BRANDS = new Set(
  BRAND_SHELF.filter((brand) => brand.isOwn).map((brand) => brand.name),
);

const brandSubcategory = new Map(
  BRAND_SHELF.map((brand) => [brand.name, brand.subcategory]),
);

/* ---------------------------------------------------------------- */
/* 1 · SKU table                                                     */
/* ---------------------------------------------------------------- */

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

export const SESSION_TABLE_VIEWS: TableView[] = [
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
