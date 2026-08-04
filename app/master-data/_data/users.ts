/**
 * Users fixtures. This surface is only a layout sketch in the design, so the
 * table shows four representative rows and the real column set is spelled out
 * in `USERS_FOOTNOTE` rather than built.
 */

export type UserTile = { label: string; val: string };

export const USER_TILES: UserTile[] = [
  { label: "Total", val: "148" },
  { label: "Active", val: "141" },
  { label: "Merchandisers", val: "132" },
  { label: "Supervisors", val: "12" },
];

export type UserRow = {
  id: string;
  name: string;
  role: string;
  region: string;
  active: string;
};

export const USER_ROWS: UserRow[] = [
  { id: "minh_tran", name: "Minh Trần", role: "Merchandiser", region: "Ho Chi Minh City", active: "2h ago" },
  { id: "thao_vo", name: "Thảo Võ", role: "Merchandiser", region: "Mekong Delta", active: "1d ago" },
  { id: "sup_anand", name: "Anand K", role: "Supervisor", region: "National", active: "4h ago" },
  { id: "nam_hoang", name: "Nam Hoàng", role: "Merchandiser", region: "North Highlands", active: "8d ago" },
];

export const USERS_FOOTNOTE =
  "Columns: user ID, name, role, region, stores assigned, app version, last active, status. Same tile + table + CSV pattern as Stores.";
