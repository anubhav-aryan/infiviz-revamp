/**
 * The column model for a Master data table.
 *
 * Widths live here rather than in CSS because they are now state: the header
 * and every body row read one `--cols` track list, so a dragged width lands in
 * both at once and the two cannot drift apart — the property the old
 * `.storesGrid` / `.plansGrid` classes were written to guarantee.
 *
 * Follows `_charts/table.ts`'s `Column`, which already carries a `width`.
 * Plain module, not part of `resizable-grid.tsx`, so the `_data` fixtures can
 * declare their own columns without importing a client component.
 */

export type GridColumn = {
  key: string;
  label: string;
  /** Designed width in px. The `flex` column ignores it. */
  width: number;
  align?: "right";
  /** The last column, which absorbs the remaining space as `1fr`. */
  flex?: true;
};

/** Narrow enough to still read as a column, wide enough to hold a long name. */
export const MIN_COL = 64;
export const MAX_COL = 480;

export const clampCol = (px: number) =>
  Math.min(MAX_COL, Math.max(MIN_COL, Math.round(px)));

export function trackList(
  columns: GridColumn[],
  widths: Record<string, number>,
): string {
  return columns
    .map((column) =>
      column.flex
        ? // A floor, not `minmax(0, 1fr)`: the last column stops shrinking at
          // its designed width and the table scrolls instead of crushing it.
          `minmax(${column.width}px, 1fr)`
        : `${clampCol(widths[column.key] ?? column.width)}px`,
    )
    .join(" ");
}

export function authoredWidths(columns: GridColumn[]): Record<string, number> {
  return Object.fromEntries(columns.map((column) => [column.key, column.width]));
}
