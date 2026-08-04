/**
 * The filter model shared by Store Explorer and Analytics.
 *
 * Semantics: OR within a dimension, AND across dimensions. Picking two regions
 * widens; picking a region and a retailer narrows. That is what users expect
 * from faceted filtering and it keeps the chip row readable.
 */

export type ActiveFilter = { dim: string; value: string };

export type FilterDimension = {
  key: string;
  label: string;
  values: string[];
};

/** How to read each filterable dimension off a row. */
export type Accessors<T> = Record<string, (row: T) => string | undefined>;

export function applyFilters<T>(
  rows: T[],
  filters: ActiveFilter[],
  accessors: Accessors<T>,
): T[] {
  if (filters.length === 0) return rows;

  const byDim = new Map<string, string[]>();
  for (const f of filters) {
    const list = byDim.get(f.dim);
    if (list) list.push(f.value);
    else byDim.set(f.dim, [f.value]);
  }

  return rows.filter((row) => {
    for (const [dim, values] of byDim) {
      const read = accessors[dim];
      // A dimension the row can't answer for shouldn't silently pass.
      if (!read) return false;
      const actual = read(row);
      if (actual === undefined || !values.includes(actual)) return false;
    }
    return true;
  });
}

export function hasFilter(filters: ActiveFilter[], dim: string, value: string): boolean {
  return filters.some((f) => f.dim === dim && f.value === value);
}

export function filterKey(filter: ActiveFilter): string {
  return `${filter.dim}~${filter.value}`;
}

export function filterLabel(filter: ActiveFilter): string {
  return `${filter.dim}: ${filter.value}`;
}

/* ---------- URL round-trip ---------- */

const PAIR_SEP = "|";
const KV_SEP = "~";

export function serializeFilters(filters: ActiveFilter[]): string {
  return filters.map(filterKey).join(PAIR_SEP);
}

/**
 * Parsed against the screen's own catalogue, so a hand-edited URL can't inject
 * a dimension or value the data has never heard of.
 */
export function parseFilters(
  raw: string | null | undefined,
  catalogue: FilterDimension[],
): ActiveFilter[] {
  if (!raw) return [];
  const known = new Map(catalogue.map((d) => [d.key, new Set(d.values)]));
  const out: ActiveFilter[] = [];
  const seen = new Set<string>();

  for (const pair of raw.split(PAIR_SEP)) {
    const at = pair.indexOf(KV_SEP);
    if (at < 0) continue;
    const dim = pair.slice(0, at);
    const value = pair.slice(at + 1);
    if (!known.get(dim)?.has(value)) continue;
    const key = `${dim}${KV_SEP}${value}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ dim, value });
  }
  return out;
}
