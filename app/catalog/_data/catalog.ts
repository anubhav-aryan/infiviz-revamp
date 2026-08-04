import type { IconName } from "@/app/_components/icon";

/**
 * Demo content for the Catalog screen, transcribed verbatim from the design
 * doc. There is no backend yet — every figure here is fixture data for
 * Colgate-Palmolive Vietnam.
 */

export const CATALOG_HEADER = {
  subtitle: "Colgate-Palmolive Vietnam · 121 SKUs digitised across 2 categories",
  updated: "Last updated 21 Jul 2026",
};

export type Category = {
  name: string;
  icon: IconName;
  updated: string;
  skus: number;
  brands: number;
  subs: number;
  /** Share of SKUs that have a pack shot, as a whole percentage. */
  packshot: number;
  /** Only Toothpaste drills through; Toothbrush is deliberately inert. */
  openable: boolean;
};

export const CATEGORIES: Category[] = [
  {
    name: "Toothpaste",
    icon: "package",
    updated: "21 Jul 2026",
    skus: 78,
    brands: 8,
    subs: 4,
    packshot: 86,
    openable: true,
  },
  {
    name: "Toothbrush",
    icon: "package",
    updated: "18 Jul 2026",
    skus: 43,
    brands: 5,
    subs: 3,
    packshot: 79,
    openable: false,
  },
];

export const TOOTHPASTE = {
  title: "Toothpaste",
  subtitle: "78 SKUs · 8 brands",
};

/** Brand filter chips — presentational in the design, one pre-selected. */
export const BRAND_CHIPS: { name: string; count: number; active: boolean }[] = [
  { name: "Colgate Total", count: 14, active: true },
  { name: "CDC", count: 12, active: false },
  { name: "Max Fresh", count: 11, active: false },
  { name: "Optic White", count: 10, active: false },
  { name: "Natural", count: 9, active: false },
  { name: "Kid", count: 8, active: false },
  { name: "Salt", count: 8, active: false },
  { name: "Vitamin C", count: 6, active: false },
];

export type TriState = "all" | "yes" | "no";

export const PACKSHOT_FILTERS: { label: string; value: TriState }[] = [
  { label: "All", value: "all" },
  { label: "With pack shot", value: "yes" },
  { label: "Missing", value: "no" },
];

export const TRAINED_FILTERS: { label: string; value: TriState }[] = [
  { label: "All", value: "all" },
  { label: "Trained", value: "yes" },
  { label: "Untrained", value: "no" },
];

type RawSku = {
  name: string;
  code: string;
  ean: string;
  brand: string;
  subCategory: string;
  variant: string;
  /** Millimetres. */
  height: number;
  width: number;
  tags: string[];
  desc: string;
  /** Store count this SKU is ranged in, pre-formatted to keep SSR and the
   *  client byte-identical — `toLocaleString()` would depend on the locale. */
  ranged: string;
};

const RAW_SKUS: RawSku[] = [
  {
    name: "COL Optic White Plus Shine 100G",
    code: "61053301",
    ean: "8850006958201",
    brand: "Optic White",
    subCategory: "Whitening",
    variant: "Plus Shine",
    height: 120,
    width: 45,
    tags: ["Optic White", "Shine", "Enamel safe", "with Fluoride"],
    desc: "Whitening toothpaste, red & white pack.",
    ranged: "1,240",
  },
  {
    name: "COL TP CDC 225G x 36",
    code: "61053251",
    ean: "8850006958117",
    brand: "CDC",
    subCategory: "Cavity protection",
    variant: "Base Cavity Protection",
    height: 212,
    width: 52,
    tags: [
      "Cavity protection",
      "Calcium boost",
      "Icy cool mint",
      "Made in Thailand",
    ],
    desc: "Cavity protection, red & green pack.",
    ranged: "1,512",
  },
  {
    name: "COL Max Fresh Blue Gel 140G",
    code: "61054010",
    ean: "8850006940112",
    brand: "Max Fresh",
    subCategory: "Cooling",
    variant: "Blue Gel",
    height: 150,
    width: 48,
    tags: ["Max Fresh", "Cooling crystals", "Blue gel"],
    desc: "Cooling gel toothpaste.",
    ranged: "1,105",
  },
  {
    name: "COL Total Charcoal Deep Clean 150G",
    code: "61052001",
    ean: "8850006931001",
    brand: "Colgate Total",
    subCategory: "Whole mouth",
    variant: "Charcoal Deep Clean",
    height: 160,
    width: 50,
    tags: ["Total", "Charcoal", "12h protection"],
    desc: "Charcoal deep-clean, dark pack.",
    ranged: "980",
  },
  {
    name: "KĐR COL NSR RCK Bo doi 225g",
    code: "61053209",
    ean: "8850006934074",
    brand: "CDC",
    subCategory: "Cavity protection",
    variant: "Twin pack",
    height: 225,
    width: 90,
    tags: ["Cavity", "Twin pack", "Bạc hà"],
    desc: "Twin-pack cavity protection.",
    ranged: "1,330",
  },
  {
    name: "COL Natural Salt Herbal 180G",
    code: "61055002",
    ean: "8850006952010",
    brand: "Natural",
    subCategory: "Herbal",
    variant: "Salt Herbal",
    height: 175,
    width: 52,
    tags: ["Natural", "Salt", "Herbal"],
    desc: "Herbal salt toothpaste.",
    ranged: "640",
  },
  {
    name: "KDR COL Tre em Minions 80g x 36",
    code: "61056110",
    ean: "8850006961020",
    brand: "Kid",
    subCategory: "Kids",
    variant: "Minions",
    height: 95,
    width: 38,
    tags: ["Kids", "Minions", "Strawberry"],
    desc: "Kids toothpaste, Minions pack.",
    ranged: "520",
  },
  {
    name: "COL Salt Original 200G",
    code: "61057001",
    ean: "8850006953017",
    brand: "Salt",
    subCategory: "Gum care",
    variant: "Original",
    height: 190,
    width: 55,
    tags: ["Salt", "Original", "Gum care"],
    desc: "Salt gum-care toothpaste.",
    ranged: "470",
  },
  {
    name: "COL Vitamin C Fresh 120G",
    code: "61058004",
    ean: "8850006954021",
    brand: "Vitamin C",
    subCategory: "Fresh",
    variant: "Citrus",
    height: 130,
    width: 46,
    tags: ["Vitamin C", "Fresh", "Citrus"],
    desc: "Vitamin C fresh toothpaste.",
    ranged: "410",
  },
  {
    name: "COL Total Professional 100G",
    code: "61052044",
    ean: "8850006931118",
    brand: "Colgate Total",
    subCategory: "Whole mouth",
    variant: "Professional",
    height: 118,
    width: 42,
    tags: ["Total", "Professional", "Whole mouth"],
    desc: "Professional whole-mouth health.",
    ranged: "720",
  },
  {
    name: "COL Optic White O2 Sparkling 85G",
    code: "61053340",
    ean: "8850006958309",
    brand: "Optic White",
    subCategory: "Whitening",
    variant: "O2 Sparkling",
    height: 100,
    width: 40,
    tags: ["Optic White", "O2", "Sparkling mint"],
    desc: "Oxygen whitening, sparkling mint.",
    ranged: "560",
  },
  {
    name: "COL TP CDC 100g@13k x 72",
    code: "61053252",
    ean: "8850006934579",
    brand: "CDC",
    subCategory: "Cavity protection",
    variant: "Value",
    height: 100,
    width: 42,
    tags: ["Cavity", "Value pack", "Made in Thailand"],
    desc: "Value cavity protection.",
    ranged: "1,180",
  },
];

/** The two flags are held as index lists in the design, not per-SKU fields. */
const WITHOUT_PACKSHOT = [4, 7, 10];
const WITHOUT_TRAINING = [6, 9, 11];

export type Sku = RawSku & {
  /** Position in `SKUS` — the slide-over addresses SKUs by index, so filtered
   *  lists have to carry the unfiltered one along. */
  index: number;
  category: string;
  /** `H×W mm`, only ever rendered as one string. */
  hw: string;
  packshot: boolean;
  trained: boolean;
};

export const SKUS: Sku[] = RAW_SKUS.map((sku, index) => ({
  ...sku,
  index,
  category: "Toothpaste",
  hw: `${sku.height}×${sku.width} mm`,
  packshot: !WITHOUT_PACKSHOT.includes(index),
  trained: !WITHOUT_TRAINING.includes(index),
}));

export function filterSkus(packshot: TriState, trained: TriState): Sku[] {
  return SKUS.filter(
    (sku) =>
      (packshot === "all" || (packshot === "yes") === sku.packshot) &&
      (trained === "all" || (trained === "yes") === sku.trained),
  );
}

export type SkuAttribute = {
  key: string;
  value: string;
  /** Drives which of the three value treatments the row uses. */
  kind: "text" | "mono" | "desc";
};

export function skuAttributes(sku: Sku): SkuAttribute[] {
  return [
    { key: "Category", value: sku.category, kind: "text" },
    { key: "Sub-category", value: sku.subCategory, kind: "text" },
    { key: "Brand", value: sku.brand, kind: "text" },
    { key: "Variant", value: sku.variant, kind: "text" },
    { key: "SKU code", value: sku.code, kind: "mono" },
    { key: "EAN", value: sku.ean, kind: "mono" },
    { key: "Height", value: `${sku.height} mm`, kind: "mono" },
    { key: "Width", value: `${sku.width} mm`, kind: "mono" },
    { key: "Description", value: sku.desc, kind: "desc" },
  ];
}

/** The same sentence for every SKU in the design. */
export const RANGED_EXAMPLES =
  "Bach Hoa Xanh, Winmart, Co.opmart, Aeon and 4 other retailers across all 6 regions.";
