import { PEOPLE, type Person } from "@/app/tickets/_data/people";
import type { GridColumn } from "../_components/grid-columns";
import type { MiniBar } from "./stores";
import { CURRENT_PLAN_ROWS } from "./journey-plans";

/**
 * Users fixtures.
 *
 * The rows are the platform's real directory — `tickets/_data/people.ts`,
 * which already reconciles handles, display names, regions and the
 * supervisor-per-region rule into one chain. That file's own doc comment says
 * it follows the naming rule this one set, so reading it back closes the loop:
 * a user listed here is the same person who appears on a ticket and against a
 * journey plan, rather than a second list free to drift from both.
 *
 * Everything derived below is computed at module scope from stable inputs —
 * no `Date.now()`, no `Math.random()` — for the reason `journey-plans.ts`
 * spells out: the server and the client have to agree byte for byte.
 */

export type UserTile = { label: string; val: string; note?: string };

/** The account totals the design authored; the table shows the 21 modelled.
 *  Three numeric tiles and two breakdowns, so the row fills the same five
 *  columns Stores does. Supervisors and leads are left to the By role tile. */
export const USER_TILES: UserTile[] = [
  { label: "Total users", val: "148" },
  { label: "Active", val: "141", note: "7 dormant" },
  { label: "Merchandisers", val: "132", note: "16 supervisors & leads" },
];

export const USER_COLUMNS: GridColumn[] = [
  { key: "id", label: "User ID", width: 150 },
  { key: "name", label: "Name", width: 160 },
  { key: "role", label: "Role", width: 140 },
  { key: "region", label: "Region", width: 150 },
  { key: "stores", label: "Stores", width: 90, align: "right" },
  { key: "version", label: "App version", width: 110 },
  { key: "active", label: "Last active", width: 110 },
  { key: "status", label: "Status", width: 100, flex: true },
];

export type UserStatus = "Active" | "Inactive";

export type UserRow = {
  id: string;
  name: string;
  role: string;
  region: string;
  /** `null` above the field — leads and the exec carry no store list. */
  stores: number | null;
  /** `"—"` for the desk roles, which never open the capture app. */
  version: string;
  active: string;
  status: UserStatus;
};

/** Stores per merchandiser, from the journey plans they actually appear in. */
const PLANNED_STORES = new Map(
  CURRENT_PLAN_ROWS.map((row) => [row.mrch, row.stores]),
);

/** The app builds a merchandiser rolls out to. Two are a version behind, which
 *  is the point of the column — an old build is a support case, not decoration. */
const APP_VERSIONS = ["4.8.2", "4.8.2", "4.8.2", "4.8.1", "4.8.2", "4.7.9"];

/** How long ago each person last opened something, cycled deterministically. */
const LAST_ACTIVE = ["2h ago", "5h ago", "1d ago", "3h ago", "2d ago", "8d ago"];

/** Field users with no plan of their own are still onboarding: the three
 *  merchandisers `journey-plans.ts` does not list get a smaller book. */
const UNPLANNED_STORES = 18;

function storesFor(person: Person): number | null {
  if (person.rank === "merchandiser") {
    return PLANNED_STORES.get(person.id) ?? UNPLANNED_STORES;
  }
  if (person.rank === "supervisor") {
    // A supervisor covers every store their region's merchandisers carry.
    return PEOPLE.filter(
      (other) => other.rank === "merchandiser" && other.region === person.region,
    ).reduce((sum, other) => sum + (storesFor(other) ?? 0), 0);
  }
  return null;
}

export const USER_ROWS: UserRow[] = PEOPLE.map((person, index) => {
  const inField = person.rank === "merchandiser" || person.rank === "supervisor";
  const active = LAST_ACTIVE[index % LAST_ACTIVE.length];
  return {
    id: person.id,
    name: person.name,
    role: person.role,
    region: person.region,
    stores: storesFor(person),
    version: inField ? APP_VERSIONS[index % APP_VERSIONS.length] : "—",
    active,
    // Dormant is defined by the column beside it: a week without opening the
    // app is the account the admin is being asked to look at.
    status: active === "8d ago" ? "Inactive" : "Active",
  };
});

export const USERS_TABLE = {
  count: "148 users",
  showing: `Showing ${USER_ROWS.length} modelled accounts`,
};

function share(rows: UserRow[], of: (row: UserRow) => string): MiniBar[] {
  const counts = new Map<string, number>();
  for (const row of rows) counts.set(of(row), (counts.get(of(row)) ?? 0) + 1);
  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
  const top = ranked[0]?.[1] ?? 1;
  // Widths are a percentage of the largest slice, as in `stores.ts`.
  return ranked.map(([name, n]) => ({ name, w: Math.round((n / top) * 100) }));
}

export const ROLE_MINI: MiniBar[] = share(USER_ROWS, (row) => row.role);
export const USER_REGION_MINI: MiniBar[] = share(
  USER_ROWS.filter((row) => row.region !== "National"),
  (row) => row.region,
);
