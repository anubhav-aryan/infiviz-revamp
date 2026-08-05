import Link from "next/link";
import { Icon } from "@/app/_components/icon";
import { DeltaChip } from "@/app/_reports/marks";
import type { Cell, Column, Row } from "./table";
import styles from "./charts.module.css";

/**
 * The base table. Pure markup over the plain-data model in `table.ts` — no
 * hooks, no directive, so it renders on the server wherever it is not wrapped
 * by `SortableTable`.
 *
 * `maxHeight` turns on the card's own vertical scroller with a sticky header;
 * `wide` additionally allows horizontal scrolling *inside the card*, which a
 * few PowerBI tables (15-column attendance raw, per-flavour blocks) genuinely
 * need. The page itself must never scroll sideways.
 */

export type MeasureTableProps = {
  columns: Column[];
  rows: Row[];
  emptyLabel: string;
  maxHeight?: number;
  wide?: boolean;
  /** Rendered by `SortableTable`; plain headers otherwise. */
  headerSlot?: (column: Column, index: number) => React.ReactNode;
  /** Drives `aria-sort` on the active header. Set by `SortableTable`. */
  sortState?: { index: number; dir: "asc" | "desc" };
};

function CellBody({ cell }: { cell: Cell }) {
  if (cell.seLink) {
    return cell.href ? (
      <Link href={cell.href} className={styles.seLink} aria-label="Open session evidence">
        <Icon name="eye" size={15} />
      </Link>
    ) : (
      // No session was captured for this row. Shown, but visibly inert —
      // a link that 404s is worse than a greyed glyph.
      <span
        className={styles.seLink}
        data-inert="true"
        title="No session evidence for this row"
      >
        <Icon name="eye" size={15} aria-hidden="true" />
      </span>
    );
  }

  if (cell.delta) return <DeltaChip {...cell.delta} size="inline" />;

  const label = cell.href ? (
    <Link href={cell.href} className={styles.seLink}>
      {cell.text}
    </Link>
  ) : (
    cell.text
  );

  if (cell.bar === undefined) return <>{label}</>;

  return (
    <span className={styles.cellBar}>
      <span className={styles.barTrack}>
        <span className={styles.barFill} style={{ width: `${cell.bar}%` }} />
      </span>
      {label}
    </span>
  );
}

export function MeasureTable({
  columns,
  rows,
  emptyLabel,
  maxHeight,
  wide = false,
  headerSlot,
  sortState,
}: MeasureTableProps) {
  if (rows.length === 0) return <div className={styles.empty}>{emptyLabel}</div>;

  return (
    <div
      className={styles.tableScroll}
      data-wide={wide || undefined}
      style={maxHeight ? { ["--table-max" as string]: `${maxHeight}px` } : undefined}
    >
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th
                key={column.key}
                data-align={column.align === "right" ? "right" : undefined}
                style={column.width ? { width: column.width } : undefined}
                aria-sort={
                  sortState?.index === index
                    ? sortState.dir === "asc"
                      ? "ascending"
                      : "descending"
                    : undefined
                }
              >
                {headerSlot ? headerSlot(column, index) : column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className={row.total ? styles.totalRow : undefined}>
              {row.cells.map((cell, index) => {
                const column = columns[index];
                return (
                  <td
                    key={column?.key ?? index}
                    className={
                      cell.tier
                        ? styles.scaleCell
                        : cell.mono
                          ? styles.numeric
                          : undefined
                    }
                    data-tier={cell.tier}
                    data-align={column?.align === "right" ? "right" : undefined}
                  >
                    <CellBody cell={cell} />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
