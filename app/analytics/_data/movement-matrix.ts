import { STORES } from "@/app/_data/stores-geo";
import { lcg } from "@/app/_time/variants";
import type { MatrixCell, MatrixGroup } from "@/app/_charts/month-matrix";
import { MONTH_INDEX, VIS_SERIES } from "./spine";
import type { MonthKey } from "@/app/_time/periods";

/**
 * Store × brand share of shelf, with the cells that moved most picked out by
 * colour.
 *
 * **Why this replaces the aggregate trend.** A national trend line tells you
 * something changed and nothing about where — the meeting's word for it was
 * confusing. A matrix makes the whole surface scannable at once, and colouring
 * by *movement* rather than by level routes attention to the handful of cells
 * worth opening. A store that is quietly bad all year is not news; a store that
 * fell nine points this month is.
 *
 * **Colour encodes |movement|, text shows the level.** Those are two different
 * questions — "how much did this change" and "where does it stand" — and a
 * single visual channel can only answer one. Colour takes the first because
 * that is the one the reader cannot get by scanning numbers.
 *
 * Structure is retailer → store rows, brand columns. Every cell drills into
 * that store and brand.
 *
 * NOTE: the shape here is authored. Anil is sending the PowerBI workbook this
 * is modelled on; when it lands, only `BRANDS` and `cellFor` should need to
 * change — the grouping, colouring and drill-down are independent of it.
 */

/** The columns. Own portfolio first, then the competitors worth watching. */
const BRANDS = [
  "Colgate Total",
  "CDC",
  "Max Fresh",
  "Natural",
  "Optic White",
  "P/S",
  "Closeup",
  "Sensodyne",
];

/** Movement, in points, that counts as the top of the colour ramp. */
const BIG_MOVE = 6;

/**
 * |movement| → the 0–4 ramp the heatmaps already use. Deliberately steep at the
 * bottom: most cells barely move, and if half the matrix lights up nothing is
 * highlighted at all.
 */
function levelFor(move: number): 0 | 1 | 2 | 3 | 4 {
  const size = Math.abs(move);
  if (size >= BIG_MOVE) return 4;
  if (size >= BIG_MOVE * 0.66) return 3;
  if (size >= BIG_MOVE * 0.4) return 2;
  if (size >= BIG_MOVE * 0.2) return 1;
  return 0;
}

/** Stores are grouped under their retailer, matching every other store table. */
const RETAILERS = [...new Set(STORES.map((store) => store.retailer))];

/**
 * One deterministic figure per store × brand × month. Seeded from the store id
 * and brand name so a cell holds still across renders and across a server and
 * client pass — the house rule for anything derived.
 */
function cellFor(
  storeId: string,
  brand: string,
  monthIndex: number,
): { value: number; move: number } {
  const seed =
    [...storeId, ...brand].reduce((total, ch) => total + ch.charCodeAt(0), 0) * 31;
  const rand = lcg(seed);

  // Centred on the national level for the month, spread wide enough that the
  // matrix has something to say.
  const base = VIS_SERIES[monthIndex] * (0.45 + rand() * 1.15);
  const previous = base * (0.9 + rand() * 0.2);
  return {
    value: +Math.min(96, Math.max(2, base)).toFixed(1),
    move: +(base - previous).toFixed(1),
  };
}

function rowCells(storeId: string, monthIndex: number, href: (b: string) => string) {
  return BRANDS.map<MatrixCell>((brand) => {
    const { value, move } = cellFor(storeId, brand, monthIndex);
    return {
      text: `${value}`,
      level: levelFor(move),
      href: href(brand),
      title: `${brand} · ${value}% share of shelf · ${
        move >= 0 ? "+" : ""
      }${move} pts vs last month`,
    };
  });
}

/** A retailer row averages its stores, so the group line is a real roll-up. */
function groupCells(storeIds: string[], monthIndex: number): MatrixCell[] {
  return BRANDS.map<MatrixCell>((brand, column) => {
    const rows = storeIds.map((id) => cellFor(id, brand, monthIndex));
    const value = rows.reduce((t, r) => t + r.value, 0) / rows.length;
    const move = rows.reduce((t, r) => t + r.move, 0) / rows.length;
    return {
      text: value.toFixed(1),
      level: levelFor(move),
      title: `${BRANDS[column]} · ${storeIds.length} stores · ${
        move >= 0 ? "+" : ""
      }${move.toFixed(1)} pts average movement`,
    };
  });
}

export type MovementMatrix = { columns: string[]; groups: MatrixGroup[] };

export function movementMatrix(month: MonthKey): MovementMatrix {
  const monthIndex = MONTH_INDEX[month] ?? VIS_SERIES.length - 1;

  const groups: MatrixGroup[] = RETAILERS.map((retailer) => {
    // Capped at eight stores a retailer: the matrix is for scanning, and a
    // 124-row wall is the thing it exists to avoid.
    const stores = STORES.filter((store) => store.retailer === retailer).slice(0, 8);
    return {
      id: retailer,
      label: retailer,
      cells: groupCells(
        stores.map((store) => store.id),
        monthIndex,
      ),
      children: stores.map((store) => ({
        id: store.id,
        label: store.name,
        cells: rowCells(store.id, monthIndex, (brand) =>
          `/store-explorer?f=store~${store.id}|brand~${slugBrand(brand)}`,
        ),
      })),
    };
  });

  return { columns: BRANDS, groups };
}

/** Matches the canonical brand ids in `_filters/registry.ts`. */
function slugBrand(brand: string): string {
  return brand.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
