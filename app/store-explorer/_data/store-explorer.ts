import type { IconName } from "@/app/_components/icon";

/**
 * Demo content for the Store Explorer screen, transcribed verbatim from the
 * design doc. There is no backend yet — every figure here is fixture data for
 * Colgate-Palmolive Vietnam, 04 Aug 2026.
 */

export type SummaryTile = { icon: IconName; value: string; label: string };

export const SUMMARY: SummaryTile[] = [
  { icon: "footprints", value: "418", label: "Visits today" },
  { icon: "store", value: "392", label: "Stores covered" },
  { icon: "image", value: "6,204", label: "Photos captured" },
  { icon: "users", value: "142", label: "Merchandisers in field" },
];

export const DATE_OPTIONS = [
  { label: "Today", active: true },
  { label: "Yesterday", active: false },
  { label: "Last 7 days", active: false },
  { label: "Custom", active: false },
];

export const FILTER_CHIPS = [
  "Region: Ho Chi Minh City",
  "Retailer: Bach Hoa Xanh",
];

export const STORES_VISITED = {
  count: "392",
  target: "1,847",
  awaiting: "76",
};

const RETAILER_VISITS: [name: string, visits: number][] = [
  ["Bach Hoa Xanh", 168],
  ["Winmart", 92],
  ["Co.opmart", 61],
  ["Aeon", 38],
  ["Lotte", 24],
  ["Emart", 19],
];

const RETAILER_MAX = 168;
const RETAILER_TOTAL = 418;

/** Bars are scaled against the busiest retailer; the label shows share of total. */
export const RETAILERS = RETAILER_VISITS.map(([name, visits]) => ({
  name,
  visits,
  pct: ((visits / RETAILER_TOTAL) * 100).toFixed(1),
  width: +((visits / RETAILER_MAX) * 100).toFixed(1),
}));

export type VisitStatus = "Complete" | "Processing" | "Queued";

export type Visit = {
  store: string;
  retailer: string;
  time: string;
  merchandiser: string;
  photos: number;
  categories: string;
  status: VisitStatus;
};

export const VISIT_COUNT_LABEL = "418 visits";

export const VISITS: Visit[] = [
  {
    store: "3742 · Winlife HCM 94/54 - 56",
    retailer: "Winmart",
    time: "09:31",
    merchandiser: "minh_tran",
    photos: 7,
    categories: "Toothpaste, Toothbrush",
    status: "Complete",
  },
  {
    store: "3207 · BHX HCM Q07 - 769A Trần",
    retailer: "Bach Hoa Xanh",
    time: "09:48",
    merchandiser: "khang_nguyen",
    photos: 5,
    categories: "Toothpaste",
    status: "Complete",
  },
  {
    store: "14830 · BHX_HCM_TPH - 187 Tân",
    retailer: "Bach Hoa Xanh",
    time: "10:05",
    merchandiser: "khang_nguyen",
    photos: 4,
    categories: "Multi-category",
    status: "Processing",
  },
  {
    store: "Co.opmart Nguyễn Đình Chiểu",
    retailer: "Co.opmart",
    time: "10:22",
    merchandiser: "thao_vo",
    photos: 8,
    categories: "Toothpaste, Toothbrush",
    status: "Complete",
  },
  {
    store: "Aeon Mall Tân Phú Celadon",
    retailer: "Aeon",
    time: "10:40",
    merchandiser: "huy_le",
    photos: 6,
    categories: "Multi-category",
    status: "Complete",
  },
  {
    store: "Emart Gò Vấp",
    retailer: "Emart",
    time: "11:02",
    merchandiser: "quan_do",
    photos: 3,
    categories: "Toothbrush",
    status: "Queued",
  },
  {
    store: "3157 · Winlife 537 Nguyễn Duy",
    retailer: "Winmart",
    time: "11:15",
    merchandiser: "minh_tran",
    photos: 5,
    categories: "Toothpaste",
    status: "Complete",
  },
  {
    store: "MM Mega Market An Phú",
    retailer: "MM Mega Market",
    time: "11:40",
    merchandiser: "mai_bui",
    photos: 9,
    categories: "Multi-category",
    status: "Complete",
  },
];

/* ---- App Images: the one visit that is drilled into ---- */

export const VISIT_DETAIL = {
  title: "3742 · Winlife HCM 94/54 - 56",
  retailer: "Winmart",
  address: "94/54 Nguyễn Duy, Q. Bình Thạnh, HCMC",
  date: "04 Aug 2026",
  merchandiser: "minh_tran",
  photoCountLabel: "7 photos · raw captures",
  totalTime: "19 min",
};

export type TimelineStep = {
  icon: IconName;
  label: string;
  time: string;
  gap?: string;
};

export const TIMELINE: TimelineStep[] = [
  { icon: "log-in", label: "Arrived at store", time: "09:12" },
  { icon: "camera", label: "Toothpaste captured", time: "09:18", gap: "6 min" },
  { icon: "camera", label: "Toothbrush captured", time: "09:27", gap: "9 min" },
  { icon: "check", label: "Visit confirmed", time: "09:31", gap: "4 min" },
];

export type Photo = {
  category: string;
  seq: string;
  time: string;
  quality: "good" | "flag";
};

/** Flat list — the lightbox pages through it by index. */
export const PHOTOS: Photo[] = [
  { category: "Toothpaste", seq: "01", time: "09:18", quality: "good" },
  { category: "Toothpaste", seq: "02", time: "09:19", quality: "good" },
  { category: "Toothpaste", seq: "03", time: "09:20", quality: "flag" },
  { category: "Toothpaste", seq: "04", time: "09:21", quality: "good" },
  { category: "Toothbrush", seq: "05", time: "09:27", quality: "good" },
  { category: "Toothbrush", seq: "06", time: "09:28", quality: "good" },
  { category: "Toothbrush", seq: "07", time: "09:29", quality: "good" },
];

/** Category groupings, addressing `PHOTOS` by index so the lightbox stays in sync. */
export const PHOTO_GROUPS = [
  { name: "Toothpaste", timeRange: "09:18–09:21", from: 0, to: 4 },
  { name: "Toothbrush", timeRange: "09:27–09:29", from: 4, to: 7 },
];

export function photoMetadata(photo: Photo) {
  return [
    { key: "Timestamp", value: `04 Aug ${photo.time}` },
    { key: "Category", value: photo.category },
    { key: "Sequence", value: `#${photo.seq}` },
    { key: "Device", value: "Samsung A54" },
    { key: "GPS accuracy", value: "±8 m" },
    { key: "Quality", value: photo.quality === "flag" ? "Flagged" : "Good" },
  ];
}
