import { SKUS, type Sku } from "@/app/catalog/_data/catalog";
import type { GridColumn } from "../_components/grid-columns";
import type { MiniBar } from "./stores";

/**
 * Must-stock list fixtures.
 *
 * The rows are the catalogue's own SKUs — `catalog/_data/catalog.ts`, filtered
 * to the ones Colgate owns, since a must-stock list is by definition a list of
 * your own products. Reading them back means the code, the name, the brand and
 * the ranged-store count cannot drift from what Catalog shows for the same SKU.
 *
 * What master data adds on top is the part Catalog does not model: which store
 * group the SKU is mandatory in, whether it is must-have or merely recommended,
 * and since when. Those are authored here, deterministically by SKU index —
 * no clock, no randomness, so the server and the client agree.
 */

export type Priority = "Must-have" | "Recommended";

export type MustStockRow = {
  code: string;
  name: string;
  brand: string;
  category: string;
  /** The store group the SKU is mandatory in. */
  group: string;
  /** Stores the SKU is ranged in, pre-formatted by the catalogue. */
  ranged: string;
  priority: Priority;
  since: string;
  status: "Active" | "Inactive";
};

/** Store groups, in the retailer/type vocabulary `stores.ts` established. */
const GROUPS = [
  "All stores",
  "Bach Hoa Xanh",
  "Supermarket",
  "Winmart",
  "Mini mart",
  "Co.opmart",
];

/** The list was configured in waves, oldest first. */
const SINCE = ["12 Feb 2026", "12 Feb 2026", "03 Mar 2026", "18 Apr 2026", "02 Jun 2026"];

/** Every third SKU is stocked on advice rather than mandate. */
const priorityFor = (index: number): Priority =>
  index % 3 === 2 ? "Recommended" : "Must-have";

/** Only Colgate's own SKUs — a must-stock list of a competitor's product would
 *  be a category plan, not master data. */
const OWN_SKUS: Sku[] = SKUS.filter((sku) => sku.ownership === "own");

export const MUST_STOCK_ROWS: MustStockRow[] = OWN_SKUS.map((sku, index) => ({
  code: sku.code,
  name: sku.name,
  brand: sku.brand,
  category: sku.category,
  group: GROUPS[index % GROUPS.length],
  ranged: sku.ranged,
  priority: priorityFor(index),
  since: SINCE[index % SINCE.length],
  // The one delisted line: kept on the list, visibly off it.
  status: index === OWN_SKUS.length - 1 ? "Inactive" : "Active",
}));

const MUST_HAVE = MUST_STOCK_ROWS.filter((row) => row.priority === "Must-have");

export type MustStockTile = { label: string; val: string; note?: string };

export const MUST_STOCK_TILES: MustStockTile[] = [
  {
    label: "SKUs on the list",
    val: String(MUST_STOCK_ROWS.length),
    note: `of ${SKUS.length} in the catalogue`,
  },
  {
    label: "Must-have",
    val: String(MUST_HAVE.length),
    note: `${MUST_STOCK_ROWS.length - MUST_HAVE.length} recommended`,
  },
  {
    label: "Store groups",
    val: String(new Set(MUST_STOCK_ROWS.map((row) => row.group)).size),
    note: "Last updated 02 Jun 2026",
  },
];

function share(of: (row: MustStockRow) => string): MiniBar[] {
  const counts = new Map<string, number>();
  for (const row of MUST_STOCK_ROWS) {
    counts.set(of(row), (counts.get(of(row)) ?? 0) + 1);
  }
  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
  const top = ranked[0]?.[1] ?? 1;
  return ranked.map(([name, n]) => ({ name, w: Math.round((n / top) * 100) }));
}

export const MSL_BRAND_MINI: MiniBar[] = share((row) => row.brand);
export const MSL_GROUP_MINI: MiniBar[] = share((row) => row.group);

export const MUST_STOCK_COLUMNS: GridColumn[] = [
  { key: "code", label: "SKU code", width: 110 },
  { key: "name", label: "SKU name", width: 230 },
  { key: "brand", label: "Brand", width: 120 },
  { key: "group", label: "Store group", width: 130 },
  { key: "ranged", label: "Ranged stores", width: 110, align: "right" },
  { key: "priority", label: "Priority", width: 110 },
  { key: "since", label: "Effective from", width: 110 },
  { key: "status", label: "Status", width: 100, flex: true },
];

export const MUST_STOCK_TABLE = {
  count: `${MUST_STOCK_ROWS.length} must-stock SKUs`,
  showing: "Toothpaste · the digitised category",
};
