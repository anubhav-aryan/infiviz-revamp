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

/**
 * `applyFilters`, but ignoring dimensions this row type cannot answer for.
 *
 * `applyFilters` fails a row whose dimension has no accessor, which is right
 * when a screen owns its own filter list — a filter you can see must do
 * something. It is wrong under a *global* filter bar, where a Placement-type
 * filter set on one screen travels to a table that has never heard of
 * placement types and
 * would empty it. Narrowing first means each table answers for the dimensions
 * it carries and abstains on the rest, which is what lets one filter set span
 * screens that hold different facts.
 *
 * Every call site under the global bar must go through this rather than
 * `applyFilters` directly. Screens then mark the figures they could not narrow,
 * so an abstention is visible rather than silent.
 */
export function narrowFilters<T>(
  rows: T[],
  filters: ActiveFilter[],
  accessors: Accessors<T>,
): T[] {
  const carried = filters.filter((f) => f.dim in accessors);
  return carried.length ? applyFilters(rows, carried, accessors) : rows;
}

/** Which of `filters` this row type can actually answer for. Screens use it to
 *  decide whether a figure is genuinely filtered or needs an "unfiltered" mark. */
export function carriedFilters<T>(
  filters: ActiveFilter[],
  accessors: Accessors<T>,
): ActiveFilter[] {
  return filters.filter((f) => f.dim in accessors);
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
