/**
 * Stores board fixtures, transcribed verbatim from the design doc. There is no
 * backend yet — this is the configured store list for Colgate-Palmolive
 * Vietnam as the design authored it.
 */

export type MiniBar = { name: string; w: number };

/** Widths are authored as a percentage of the largest slice, not as raw counts. */
export const RETAILER_MINI: MiniBar[] = [
  { name: "Bach Hoa Xanh", w: 100 },
  { name: "Winmart", w: 27 },
  { name: "Co.opmart", w: 19 },
  { name: "Aeon", w: 7 },
];

export const TYPE_MINI: MiniBar[] = [
  { name: "Mini mart", w: 100 },
  { name: "Supermarket", w: 29 },
  { name: "Hypermarket", w: 11 },
  { name: "Convenience", w: 4 },
];

export const REGION_MINI: MiniBar[] = [
  { name: "Ho Chi Minh City", w: 100 },
  { name: "South East", w: 46 },
  { name: "Mekong Delta", w: 22 },
  { name: "Red River Delta", w: 14 },
];

export const STORE_TOTALS = {
  total: "1,847",
  active: "1,835",
  inactive: "12 inactive",
};

export const STORES_TABLE = {
  count: "1,847 stores",
  showing: "Showing 1–10",
};

/** The design also defines a `Pending` variant, but no row uses it. */
export type StoreStatus = "Active" | "Inactive";

export type StoreRow = {
  code: string;
  name: string;
  retailer: string;
  type: string;
  region: string;
  mrch: string;
  status: StoreStatus;
  added: string;
};

export const STORE_ROWS: StoreRow[] = [
  {
    code: "VNC0304896",
    name: "30151 BHX_HCM,72 74 Vạn Kiếp",
    retailer: "Bach Hoa Xanh",
    type: "Mini mart",
    region: "Ho Chi Minh City",
    mrch: "khang_nguyen",
    status: "Active",
    added: "14 Jan 2026",
  },
  {
    code: "VNC0304895",
    name: "30150 BHX_HCM,2/3 Lê Quang Hòa",
    retailer: "Bach Hoa Xanh",
    type: "Mini mart",
    region: "Ho Chi Minh City",
    mrch: "khang_nguyen",
    status: "Active",
    added: "14 Jan 2026",
  },
  {
    code: "VNC0011867",
    name: "1698 BHX_HCM_TPH - 79 Cầu Xé",
    retailer: "Bach Hoa Xanh",
    type: "Mini mart",
    region: "South East",
    mrch: "linh_pham",
    status: "Active",
    added: "16 Jan 2026",
  },
  {
    code: "VNC0207442",
    name: "Winmart Q7 - 769A Trần Xuân Soạn",
    retailer: "Winmart",
    type: "Supermarket",
    region: "Ho Chi Minh City",
    mrch: "minh_tran",
    status: "Active",
    added: "18 Jan 2026",
  },
  {
    code: "VNC0182310",
    name: "Co.opmart Nguyễn Đình Chiểu",
    retailer: "Co.opmart",
    type: "Supermarket",
    region: "Ho Chi Minh City",
    mrch: "thao_vo",
    status: "Active",
    added: "18 Jan 2026",
  },
  {
    code: "VNC0090114",
    name: "Aeon Mall Tân Phú Celadon",
    retailer: "Aeon",
    type: "Hypermarket",
    region: "South East",
    mrch: "huy_le",
    status: "Active",
    added: "21 Jan 2026",
  },
  {
    code: "VNC0155201",
    name: "Lotte Mart Cần Thơ",
    retailer: "Lotte",
    type: "Hypermarket",
    region: "Mekong Delta",
    mrch: "nam_hoang",
    status: "Active",
    added: "03 Feb 2026",
  },
  {
    code: "VNC0233900",
    name: "Emart Gò Vấp",
    retailer: "Emart",
    type: "Hypermarket",
    region: "Ho Chi Minh City",
    mrch: "quan_do",
    status: "Active",
    added: "05 Feb 2026",
  },
  {
    code: "VNC0301778",
    name: "MM Mega Market An Phú",
    retailer: "MM Mega Market",
    type: "Hypermarket",
    region: "South East",
    mrch: "mai_bui",
    status: "Active",
    added: "07 Feb 2026",
  },
  {
    code: "VNC0044556",
    name: "Winmart+ Hà Đông 24T",
    retailer: "Winmart",
    type: "Mini mart",
    region: "Red River Delta",
    mrch: "duc_ngo",
    status: "Inactive",
    added: "12 Feb 2026",
  },
];
