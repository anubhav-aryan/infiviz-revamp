import { STORES } from "@/app/_data/stores-geo";
import type { ActiveFilter, FilterDimension } from "./model";

/**
 * The canonical filter vocabulary, shared by every screen that shows the global
 * filter bar.
 *
 * **Why this exists.** Before it, each screen declared its own catalogue and the
 * spellings had drifted: Store Explorer's fixtures say `Minimart` and
 * `Wholesale`, Analytics' say `Mini mart` and `Convenience`, and Store
 * Explorer's retailer facet is missing MM Mega Market. Because `parseFilters`
 * validates against the screen's own catalogue and silently drops anything it
 * doesn't recognise, a filter set on one screen used to vanish without
 * explanation on the next. A global bar makes that a constant occurrence rather
 * than an edge case, so the vocabulary has to be unified first.
 *
 * **Why aliases rather than renaming the fixtures.** Those spellings are
 * load-bearing *keys*, not display strings: `TYPE_MIX` in `_data/visits.ts`
 * keys on `Minimart`, `StoreType` in `stores-geo.ts` is a union over 124 pins,
 * `merch-activity.ts`'s `coverageTypes` keys on `Mini mart`, and Analytics'
 * `DIM_SOURCE` rows are label-indexed tuples. Renaming at source would silently
 * break `typeShare()` and several authored tables. So each canonical value
 * carries the spellings it has to answer to, and accessors run their raw field
 * through `canon()` before comparison — putting both sides of the test in the
 * same vocabulary without touching a single authored figure.
 *
 * **Scope.** These are the dimensions that *travel* between screens. Analytics
 * also filters by Brand, SKU, Sub-category and City; no other screen carries
 * those facts, so they stay in Analytics' own catalogue and are appended to
 * this one locally. A dimension only belongs here if more than one screen can
 * honestly answer for it.
 */

export type DimId =
  | "region"
  | "retailer"
  | "storeType"
  | "category"
  | "placement"
  | "placementType"
  | "store"
  | "merchandiser"
  | "session"
  | "brand"
  | "subCategory"
  | "city"
  | "sku";

export type CanonicalValue = {
  /** What `?f=` carries. Stable, lowercase, hyphenated. */
  id: string;
  label: string;
  /** Raw fixture spellings this value must also answer to. */
  aliases?: string[];
};

export type CanonicalDim = {
  id: DimId;
  label: string;
  values: CanonicalValue[];
};

/**
 * Search appears in a dimension menu above this many values.
 *
 * Ten, because that is where the existing menu stops being scannable rather
 * than because ten is a round number: the filter menu's own stylesheet is
 * `max-height: 340px` and `.menuItem` is ~31px tall, so the eleventh value is
 * the first one a reader has to scroll to find. Settled — do not re-litigate.
 */
export const SEARCH_THRESHOLD = 10;

/** Values with no alias list answer only to their own label. */
const plain = (...labels: string[]): CanonicalValue[] =>
  labels.map((label) => ({ id: slug(label), label }));

function slug(label: string): string {
  return label
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Store is derived from `stores-geo.ts` rather than authored here — that file is
 * already the canonical estate (124 pins, the one list every map and store
 * table reads), and re-typing it would be the exact drift this module exists to
 * prevent. In production this is the 1,847-store estate, which is why it is the
 * dimension the search threshold was designed around.
 */
const STORE_VALUES: CanonicalValue[] = STORES.map((store) => ({
  id: store.id,
  label: store.name,
}));

export const REGISTRY: Record<DimId, CanonicalDim> = {
  region: {
    id: "region",
    label: "Region",
    // The one dimension all three screens already spell identically.
    values: plain(
      "Ho Chi Minh City",
      "South East",
      "Mekong Delta",
      "Red River Delta",
      "Central",
      "North Highlands",
    ),
  },

  retailer: {
    id: "retailer",
    label: "Retailer",
    /* Seven, the union. Store Explorer's visit facet names only six because MM
       Mega Market accounts for the 16 visits outside its named rows — but the
       retailer exists, its stores are on the map, and Analytics filters by it,
       so the shared vocabulary carries it. */
    values: plain(
      "Bach Hoa Xanh",
      "Winmart",
      "Co.opmart",
      "Aeon",
      "Lotte",
      "Emart",
      "MM Mega Market",
    ),
  },

  storeType: {
    id: "storeType",
    label: "Store type",
    /* The conflict this module was written for. `Minimart` and `Mini mart` are
       the same format spelled two ways, so they collapse to one value with both
       aliases. `Wholesale` and `Convenience` are NOT merged: a cash-and-carry
       is not a convenience store. They are genuinely different formats that
       happen to each appear in only one screen's fixtures. */
    values: [
      { id: "hypermarket", label: "Hypermarket" },
      { id: "supermarket", label: "Supermarket" },
      { id: "mini-mart", label: "Mini mart", aliases: ["Minimart", "Mini mart"] },
      { id: "wholesale", label: "Wholesale" },
      { id: "convenience", label: "Convenience" },
    ],
  },

  category: {
    id: "category",
    label: "Category",
    /* The five this account actually has — the same set `catalog.ts`,
       `category-metrics.ts` and `scope.ts` all carry. This used to hold two,
       which is why the Analytics share-of-shelf card could show five
       categories that the Category filter had never heard of.

       A screen holding fewer than five narrows the list itself rather than
       offering a value it cannot answer for; see Store Explorer's catalogue. */
    values: plain(
      "Toothpaste",
      "Toothbrush",
      "Mouthwash",
      "Kids oral care",
      "Whitening",
    ),
  },

  placement: {
    id: "placement",
    /* Retitled from "Placement" when `placementType` took that name. The id
       stays `placement`: it is the key `canon()` and `VISIT_ACCESSORS` read,
       and every fixture row carries a `placement` field, so renaming it would
       touch four dozen call sites to say the same thing. Label and id drift
       here deliberately — the label is what these five values actually are. */
    label: "Shelf Position",
    values: plain(
      "Eye Level",
      "Top Shelf",
      "Bottom Shelf",
      "End Cap",
      "Checkout Counter",
    ),
  },

  placementType: {
    id: "placementType",
    label: "Placement Type",
    /* Where the product is merchandised — the fixture it sits in — which is a
       different question from `placement` above (now "Shelf Position"), where
       on a shelf it sits. Nothing in the fixtures carries a placement type
       yet, so no accessor answers for it; it is offered because it is one of
       the facts that define a session.

       Written out rather than through `plain()` because two of these replace
       earlier spellings and have to keep answering to them — see `aliases`.
       Cut from twelve values to five on review; this used to be the dimension
       that demonstrated the menu's search box, which `store` and
       `merchandiser` still do. */
    values: [
      { id: "shelf", label: "Shelf" },
      { id: "display", label: "Display" },
      { id: "freezer", label: "Freezer", aliases: ["Cooler"] },
      { id: "poster", label: "Poster", aliases: ["POSM"] },
      { id: "bin", label: "Bin" },
    ],
  },

  store: { id: "store", label: "Store", values: STORE_VALUES },

  merchandiser: {
    id: "merchandiser",
    label: "Merchandiser",
    // Handles, because that is how every screen in the app displays them.
    values: [
      "khang_nguyen",
      "linh_pham",
      "minh_tran",
      "quan_do",
      "mai_bui",
      "huy_le",
      "thao_vo",
      "nam_hoang",
      "bao_vu",
      "duc_ngo",
      "ha_pham",
    ].map((handle) => ({ id: handle, label: handle })),
  },

  /* The four below are answerable only by Analytics, whose spine carries brand-
     and SKU-level facts no other screen holds. They live here anyway so the
     shell can build any scope's catalogue without importing Analytics' data
     into every page's bundle; `FILTER_SCOPES` is what keeps them off the menus
     that cannot answer for them. Mirrors `DIM_SOURCE` in
     `app/analytics/_data/spine.ts` — keep in step if that list changes. */
  brand: {
    id: "brand",
    label: "Brand",
    values: plain(
      "Colgate Total",
      "CDC",
      "Max Fresh",
      "Natural",
      "Salt",
      "Kid",
      "Vitamin C",
      "Optic White",
    ),
  },

  subCategory: {
    id: "subCategory",
    label: "Sub-category",
    values: plain("Cavity protection", "Whitening", "Herbal", "Kids"),
  },

  city: {
    id: "city",
    label: "City",
    values: plain("Quận 1", "Quận 7", "Bình Thạnh", "Thủ Đức", "Gò Vấp", "Tân Phú"),
  },

  sku: {
    id: "sku",
    label: "SKU",
    values: plain(
      "COL TP CDC 225G",
      "COL Total Charcoal 150G",
      "COL Max Fresh 140G",
      "COL Natural Salt 180G",
      "COL Salt Original 200G",
      "COL Optic White 100G",
    ),
  },

  session: {
    id: "session",
    label: "Session ID",
    /* Deliberately empty: session ids are per-visit and there are as many as
       there are captures, so offering them as a browsable list is never the
       right control. Store Explorer still filters by one when a row is opened;
       it just isn't a menu you scroll. */
    values: [],
  },
};

export const DIM_IDS = Object.keys(REGISTRY) as DimId[];

export function isDimId(value: string): value is DimId {
  return value in REGISTRY;
}

/**
 * Whether a dimension's menu earns a search box.
 *
 * Takes anything with a `values` array rather than a `CanonicalDim`, because
 * both vocabularies ask this question: the global bar holds `CanonicalDim`s
 * and a screen's own catalogue holds `FilterDimension`s. Widening it here is
 * what lets `SEARCH_THRESHOLD` stay a single number — it had been copied as a
 * bare `> 10` into `global-filter-bar.tsx` and drifted.
 */
export function isSearchable(dim: { values: readonly unknown[] }): boolean {
  return dim.values.length > SEARCH_THRESHOLD;
}

/* ---------- alias resolution ---------- */

/** `dim → (lowercased spelling → canonical id)`, built once. */
const ALIAS_INDEX: Record<DimId, Map<string, string>> = (() => {
  const out = {} as Record<DimId, Map<string, string>>;
  for (const id of DIM_IDS) {
    const index = new Map<string, string>();
    for (const value of REGISTRY[id].values) {
      index.set(value.id.toLowerCase(), value.id);
      index.set(value.label.toLowerCase(), value.id);
      for (const alias of value.aliases ?? []) index.set(alias.toLowerCase(), value.id);
    }
    out[id] = index;
  }
  return out;
})();

/**
 * A raw fixture value → its canonical id. `undefined` when the vocabulary has
 * never heard of it, which `applyFilters` then treats as "this row does not
 * match" rather than silently passing.
 */
export function canon(dim: DimId, raw: string | undefined): string | undefined {
  if (raw === undefined) return undefined;
  return ALIAS_INDEX[dim].get(raw.toLowerCase());
}

/** Canonical id → the label to print. Falls back to the id for open dimensions
 *  like `session`, whose values are not enumerated. */
export function valueLabel(dim: DimId, id: string): string {
  return REGISTRY[dim].values.find((v) => v.id === id)?.label ?? id;
}

/** What a chip should read: `Store type` / `Mini mart`. */
export function describeFilter(filter: ActiveFilter): {
  dimLabel: string;
  valueLabel: string;
} {
  if (!isDimId(filter.dim)) {
    // A screen-local dimension (Analytics' Brand, SKU, …) — already human.
    return { dimLabel: filter.dim, valueLabel: filter.value };
  }
  return {
    dimLabel: REGISTRY[filter.dim].label,
    valueLabel: valueLabel(filter.dim, filter.value),
  };
}

/**
 * The `FilterDimension[]` shape `parseFilters` and `useFilterMenu` already take,
 * built from the canonical registry so every screen validates `?f=` against the
 * same vocabulary. `extra` lets a screen append dimensions only it can answer
 * for — Analytics' Brand and SKU — without putting them in the shared registry.
 */
export function catalogueFor(
  dims: readonly DimId[],
  extra: FilterDimension[] = [],
): FilterDimension[] {
  return [
    ...dims.map((id) => ({
      key: id,
      label: REGISTRY[id].label,
      values: REGISTRY[id].values.map((v) => v.id),
    })),
    ...extra,
  ];
}
