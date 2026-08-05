import type { Delta } from "@/app/_reports/thresholds";

/**
 * The table model every measure/detail/raw table on the platform is built from.
 *
 * Cells are **plain data, never render functions**. These tables are built in
 * `_data` on the server and some of them are handed to client components
 * (`SortableTable`, `TabbedTable`), and a function prop cannot cross that
 * boundary — it fails the build with "Functions cannot be passed directly to
 * Client Components". Everything a cell can look like is therefore enumerated
 * here as serialisable fields.
 */

export type CellTier = "good" | "warn" | "bad";

export type Cell = {
  /** Display text, already formatted in `_data` — never formatted at render. */
  text: string;
  /**
   * Sort key. Text columns sort on `text`; numeric ones need this because
   * "1,412" and "9" do not compare correctly as strings.
   */
  value?: number;
  /** Conditional-formatting tier — the colour-scaled cells PowerBI leans on. */
  tier?: CellTier;
  /** Renders a delta chip (arrow + tone) instead of plain text. */
  delta?: Delta;
  /** Renders an inline bar at this percentage behind/next to the text. */
  bar?: number;
  /** Makes the cell a link. */
  href?: string;
  /** Renders the session-evidence glyph; inert when `href` is absent. */
  seLink?: boolean;
  /** Tabular figures. Set for anything that should column-align. */
  mono?: boolean;
};

export type Column = {
  key: string;
  label: string;
  align?: "left" | "right";
  /** Fixed width, e.g. `"120px"`. Omit to share the remaining space. */
  width?: string;
  /** Excluded from sorting — the SE Link column has nothing to sort on. */
  unsortable?: boolean;
};

export type Row = {
  /** Stable React key. Must be unique within the table. */
  id: string;
  cells: Cell[];
  /** Pins the row to the bottom in the inverted style PowerBI uses for totals. */
  total?: boolean;
};

/** Convenience for the common cases, so `_data` files stay readable. */
export const text = (value: string): Cell => ({ text: value });

export const num = (value: string, sortValue: number): Cell => ({
  text: value,
  value: sortValue,
  mono: true,
});

export const tiered = (
  value: string,
  sortValue: number,
  tier: CellTier,
): Cell => ({ text: value, value: sortValue, tier, mono: true });

export const deltaCell = (delta: Delta, sortValue: number): Cell => ({
  text: delta.label,
  value: sortValue,
  delta,
});

/**
 * Sorts rows by a column, leaving any total row pinned at the bottom. Exported
 * so `SortableTable` and the CSV export sort identically — an export that
 * disagrees with what is on screen is worse than no export.
 */
export function sortRows(rows: Row[], columnIndex: number, dir: "asc" | "desc"): Row[] {
  const body = rows.filter((row) => !row.total);
  const totals = rows.filter((row) => row.total);

  const sorted = body.slice().sort((a, b) => {
    const left = a.cells[columnIndex];
    const right = b.cells[columnIndex];
    // Missing cells sort last in either direction rather than throwing.
    if (!left) return 1;
    if (!right) return -1;

    // Deliberately not `localeCompare`: it depends on the runtime's collation
    // data, so a table sorted here and re-sorted on the client could disagree.
    // Code-unit order is not linguistically ideal for Vietnamese diacritics,
    // but it is identical everywhere, which matters more.
    const delta =
      left.value !== undefined && right.value !== undefined
        ? left.value - right.value
        : left.text < right.text
          ? -1
          : left.text > right.text
            ? 1
            : 0;

    return dir === "asc" ? delta : -delta;
  });

  return [...sorted, ...totals];
}
