// GENERATED FILE — do not edit by hand.
//
// The store estate, with real coordinates. Replaces the two files of projected
// SVG pin coordinates the flat silhouette maps used: those pins were a seeded
// RNG jittering ±0.5° around six cluster centres, which reads fine on an
// outline and lands in the Mekong and the sea on a real basemap.
//
// WHAT CHANGED ABOUT THE NETWORK CONTRACT. The files this replaces claimed
// "no runtime dependency, no network call, no loading state". Two of the three
// no longer hold: the basemap is fetched at runtime from a third-party tile
// service. What does still hold is the part that matters — this geometry is
// static, and Leaflet positions every marker from lat/lng through its own CRS,
// so the stores stay in their correct relative positions with the network down.
// Only the backdrop is lost.
//
// TILE LICENSING. The maps draw CARTO's free basemap over OpenStreetMap data.
// Both attributions are a licence obligation and are rendered by Leaflet's
// attribution control — do not hide them. The free tier is for small-scale use;
// anything client-facing needs a paid provider or self-hosting.
//
// INVARIANTS, all asserted by the generator that emitted this file:
//   • 124 stores. Region totals 56/22/17/15/9/5 and retailer totals
//     50/27/18/11/7/6/5 are the facet tables in store-explorer.ts scaled to 124.
//   • Store type falls out of retailer (Winmart splits 18 Winlife minimarts /
//     9 Winmart supermarkets), giving 68/27/24/5 — within 0.5 of the
//     `storeTypes` facet scaled the same way.
//   • coverage: 95 of 124 covered = 76.6%, which is the headline
//     "1,412 of 1,847 audited" = 76.4%. The dot mix encodes that number.
//   • Bach Hoa Xanh has no northern stores. Emart is an HCMC chain apart from
//     Emart Vinh, which is named for a north-central city and which
//     merch-activity also files under Central — the store's own name and the
//     other fixture beat the footprint generalisation.
//
// THE EIGHT NAMES THAT MUST NOT CHANGE. /session-viewer/[store] prerenders one
// page per name in `VISITS`, via slugifyStore, with dynamicParams = false.
// Changing a character in any of those eight names 404s a live route.
//
// KNOWN CONTRADICTIONS IN OTHER FIXTURES, left alone deliberately:
// merch-activity puts a Bach Hoa Xanh store in North Highlands, which no chain
// footprint here allows; Winlife 3157 is South East here and in VISITS but
// Central in merch-activity; Aeon Tân Phú is HCMC here and in VISITS but South
// East in master-data, and Tân Phú is a district of HCMC so VISITS is right.
// Reconciling those files is a separate change with its own blast radius.

export type Retailer =
  | "Bach Hoa Xanh" | "Winmart" | "Co.opmart" | "Aeon" | "Lotte" | "Emart" | "MM Mega Market";
export type StoreType = "Minimart" | "Supermarket" | "Hypermarket" | "Wholesale";
export type Region =
  | "Ho Chi Minh City" | "South East" | "Mekong Delta" | "Red River Delta" | "Central" | "North Highlands";
export type VisitStatus = "today" | "range" | "none";
export type CoverageStatus = "covered" | "overdue" | "notyet";

export type GeoStore = {
  /** Master code, same shape as master-data's StoreRow.code. */
  id: string;
  name: string;
  retailer: Retailer;
  type: StoreType;
  region: Region;
  /** Real administrative unit. */
  district: string;
  lat: number;
  lng: number;
  /** Store Explorer's ramp. */
  visit: VisitStatus;
  /** Merch activity's ramp. */
  coverage: CoverageStatus;
  /** "04 Aug 09:31" for today, "28 Jul" for earlier, null when never visited. */
  lastVisit: string | null;
  photos: number;
};

/**
 * One list with two status fields rather than two lists — which is what makes
 * it impossible for the same store to be described two different ways by the
 * two maps.
 */
export const STORES: GeoStore[] = [
  { id: "VNC0304137", name: "3742 · Winlife HCM 94/54 - 56", retailer: "Winmart", type: "Minimart", region: "Ho Chi Minh City", district: "Q. Bình Thạnh", lat: 10.80762, lng: 106.71066, visit: "today", coverage: "overdue", lastVisit: "04 Aug 09:31", photos: 7 },
  { id: "VNC0304274", name: "3207 · BHX HCM Q07 - 769A Trần", retailer: "Bach Hoa Xanh", type: "Minimart", region: "Ho Chi Minh City", district: "Quận 7", lat: 10.72841, lng: 106.72456, visit: "today", coverage: "covered", lastVisit: "04 Aug 09:48", photos: 5 },
  { id: "VNC0304411", name: "14830 · BHX_HCM_TPH - 187 Tân", retailer: "Bach Hoa Xanh", type: "Minimart", region: "Ho Chi Minh City", district: "Q. Tân Phú", lat: 10.7982, lng: 106.62267, visit: "today", coverage: "covered", lastVisit: "04 Aug 10:05", photos: 4 },
  { id: "VNC0304548", name: "Co.opmart Nguyễn Đình Chiểu", retailer: "Co.opmart", type: "Supermarket", region: "Ho Chi Minh City", district: "Quận 3", lat: 10.78685, lng: 106.68695, visit: "today", coverage: "notyet", lastVisit: "04 Aug 10:22", photos: 8 },
  { id: "VNC0304685", name: "Aeon Mall Tân Phú Celadon", retailer: "Aeon", type: "Hypermarket", region: "Ho Chi Minh City", district: "Q. Tân Phú", lat: 10.80114, lng: 106.62398, visit: "today", coverage: "covered", lastVisit: "04 Aug 10:40", photos: 6 },
  { id: "VNC0304822", name: "Emart Gò Vấp", retailer: "Emart", type: "Hypermarket", region: "Ho Chi Minh City", district: "Q. Gò Vấp", lat: 10.84011, lng: 106.66194, visit: "today", coverage: "covered", lastVisit: "04 Aug 11:02", photos: 3 },
  { id: "VNC0304959", name: "3157 · Winlife 537 Nguyễn Duy", retailer: "Winmart", type: "Minimart", region: "South East", district: "Thuận An", lat: 10.916, lng: 106.70796, visit: "today", coverage: "covered", lastVisit: "04 Aug 11:15", photos: 5 },
  { id: "VNC0305096", name: "MM Mega Market An Phú", retailer: "MM Mega Market", type: "Wholesale", region: "South East", district: "Thuận An", lat: 10.92328, lng: 106.70842, visit: "today", coverage: "covered", lastVisit: "04 Aug 11:40", photos: 9 },
  { id: "VNC0305233", name: "Emart Vinh", retailer: "Emart", type: "Hypermarket", region: "Central", district: "TP. Vinh", lat: 18.67114, lng: 105.69138, visit: "none", coverage: "notyet", lastVisit: null, photos: 0 },
  { id: "VNC0305370", name: "Aeon Hà Đông", retailer: "Aeon", type: "Hypermarket", region: "Red River Delta", district: "Q. Hà Đông", lat: 20.97387, lng: 105.77536, visit: "none", coverage: "overdue", lastVisit: "23 May", photos: 0 },
  { id: "VNC0305507", name: "Lotte Mart Đà Nẵng", retailer: "Lotte", type: "Hypermarket", region: "Central", district: "Hải Châu", lat: 16.06887, lng: 108.22303, visit: "today", coverage: "overdue", lastVisit: "04 Jun", photos: 0 },
  { id: "VNC0305644", name: "Lotte Mart Cần Thơ", retailer: "Lotte", type: "Hypermarket", region: "Mekong Delta", district: "Ninh Kiều", lat: 10.03518, lng: 105.78806, visit: "none", coverage: "covered", lastVisit: "29 Jul", photos: 0 },
  { id: "VNC0305781", name: "Co.opmart Hạ Long", retailer: "Co.opmart", type: "Supermarket", region: "North Highlands", district: "Hạ Long", lat: 20.95361, lng: 107.07126, visit: "today", coverage: "overdue", lastVisit: "11 Jun", photos: 0 },
  { id: "VNC0305918", name: "3207 · BHX HCM 1 - 536 Võ Văn Ngâ", retailer: "Bach Hoa Xanh", type: "Minimart", region: "Ho Chi Minh City", district: "Quận 1", lat: 10.77166, lng: 106.70283, visit: "today", coverage: "covered", lastVisit: "04 Aug 09:05", photos: 7 },
  { id: "VNC0306055", name: "3214 · BHX HCM GÒ  - 673 Hai Bà Trư", retailer: "Bach Hoa Xanh", type: "Minimart", region: "Ho Chi Minh City", district: "Q. Gò Vấp", lat: 10.83813, lng: 106.66666, visit: "none", coverage: "notyet", lastVisit: null, photos: 0 },
  { id: "VNC0306192", name: "3221 · BHX_HCM_QUẬ - 549 Hoàng Văn", retailer: "Bach Hoa Xanh", type: "Minimart", region: "Ho Chi Minh City", district: "Quận 7", lat: 10.72744, lng: 106.7207, visit: "none", coverage: "covered", lastVisit: "09 Jul", photos: 5 },
  { id: "VNC0306329", name: "3228 · BHX HCM 7 - 216 Lý Thường", retailer: "Bach Hoa Xanh", type: "Minimart", region: "Ho Chi Minh City", district: "Quận 7", lat: 10.72891, lng: 106.71933, visit: "today", coverage: "covered", lastVisit: "04 Aug 10:11", photos: 9 },
  { id: "VNC0306466", name: "3235 · BHX_HCM_QUẬ - 824 Kim Mã", retailer: "Bach Hoa Xanh", type: "Minimart", region: "Ho Chi Minh City", district: "Quận 3", lat: 10.78815, lng: 106.68943, visit: "range", coverage: "covered", lastVisit: "18 Jul", photos: 7 },
  { id: "VNC0306603", name: "3242 · BHX_HCM_TP. - 249 Nguyễn Oan", retailer: "Bach Hoa Xanh", type: "Minimart", region: "Ho Chi Minh City", district: "TP. Thủ Đức", lat: 10.85207, lng: 106.77366, visit: "none", coverage: "covered", lastVisit: "14 Jul", photos: 2 },
  { id: "VNC0306740", name: "3249 · BHX HCM 7 - 137 Lý Thường", retailer: "Bach Hoa Xanh", type: "Minimart", region: "Ho Chi Minh City", district: "Quận 7", lat: 10.72965, lng: 106.72412, visit: "range", coverage: "covered", lastVisit: "18 Jul", photos: 5 },
  { id: "VNC0306877", name: "3256 · BHX HCM 7 - 667 Nguyễn Thị", retailer: "Bach Hoa Xanh", type: "Minimart", region: "Ho Chi Minh City", district: "Quận 7", lat: 10.72983, lng: 106.7209, visit: "today", coverage: "covered", lastVisit: "04 Aug 11:26", photos: 9 },
  { id: "VNC0307014", name: "3263 · BHX_HCM_Q.  - 926 Xô Viết Ng", retailer: "Bach Hoa Xanh", type: "Minimart", region: "Ho Chi Minh City", district: "Q. Tân Phú", lat: 10.80442, lng: 106.62695, visit: "range", coverage: "covered", lastVisit: "24 Jun", photos: 4 },
  { id: "VNC0307151", name: "3270 · BHX_HCM_QUẬ - 492 Tô Hiến Th", retailer: "Bach Hoa Xanh", type: "Minimart", region: "Ho Chi Minh City", district: "Quận 7", lat: 10.73191, lng: 106.72361, visit: "range", coverage: "covered", lastVisit: "21 Jul", photos: 2 },
  { id: "VNC0307288", name: "3277 · BHX HCM 7 - 653 Bà Triệu", retailer: "Bach Hoa Xanh", type: "Minimart", region: "Ho Chi Minh City", district: "Quận 7", lat: 10.73085, lng: 106.72057, visit: "range", coverage: "covered", lastVisit: "09 Jul", photos: 6 },
  { id: "VNC0307425", name: "3284 · BHX HCM 3 - 169 Hoàng Văn", retailer: "Bach Hoa Xanh", type: "Minimart", region: "Ho Chi Minh City", district: "Quận 3", lat: 10.78224, lng: 106.69057, visit: "today", coverage: "covered", lastVisit: "04 Aug 08:40", photos: 4 },
  { id: "VNC0307562", name: "3291 · BHX_HCM_Q.  - 338 Nguyễn Thị", retailer: "Bach Hoa Xanh", type: "Minimart", region: "Ho Chi Minh City", district: "Q. Tân Phú", lat: 10.799, lng: 106.62197, visit: "today", coverage: "covered", lastVisit: "04 Aug 10:48", photos: 7 },
  { id: "VNC0307699", name: "3298 · BHX_HCM_Q.  - 804 Hai Bà Trư", retailer: "Bach Hoa Xanh", type: "Minimart", region: "Ho Chi Minh City", district: "Q. Tân Phú", lat: 10.79981, lng: 106.62277, visit: "today", coverage: "covered", lastVisit: "04 Aug 08:40", photos: 9 },
  { id: "VNC0307836", name: "3305 · BHX HCM 7 - 929 Phạm Văn Đ", retailer: "Bach Hoa Xanh", type: "Minimart", region: "Ho Chi Minh City", district: "Quận 7", lat: 10.72613, lng: 106.71906, visit: "range", coverage: "covered", lastVisit: "28 Jul", photos: 3 },
  { id: "VNC0307973", name: "3312 · BHX HCM GÒ  - 918 Lý Thường", retailer: "Bach Hoa Xanh", type: "Minimart", region: "Ho Chi Minh City", district: "Q. Gò Vấp", lat: 10.83843, lng: 106.66831, visit: "none", coverage: "covered", lastVisit: "14 Jul", photos: 2 },
  { id: "VNC0308110", name: "3319 · BHX HCM 10 - 664 Xô Viết Ng", retailer: "Bach Hoa Xanh", type: "Minimart", region: "Ho Chi Minh City", district: "Quận 10", lat: 10.77104, lng: 106.66992, visit: "range", coverage: "covered", lastVisit: "18 Jul", photos: 4 },
  { id: "VNC0308247", name: "3326 · BHX_HCM_QUẬ - 815 Điện Biên", retailer: "Bach Hoa Xanh", type: "Minimart", region: "Ho Chi Minh City", district: "Quận 1", lat: 10.77284, lng: 106.70624, visit: "today", coverage: "notyet", lastVisit: "04 Aug 12:04", photos: 6 },
  { id: "VNC0308384", name: "3333 · BHX_HCM_QUẬ - 475 Bà Triệu", retailer: "Bach Hoa Xanh", type: "Minimart", region: "Ho Chi Minh City", district: "Quận 10", lat: 10.77082, lng: 106.66445, visit: "today", coverage: "covered", lastVisit: "04 Aug 09:05", photos: 3 },
  { id: "VNC0308521", name: "3340 · BHX HCM 7 - 310 Hoàng Văn", retailer: "Bach Hoa Xanh", type: "Minimart", region: "Ho Chi Minh City", district: "Quận 7", lat: 10.72601, lng: 106.72415, visit: "range", coverage: "notyet", lastVisit: "28 Jul", photos: 2 },
  { id: "VNC0308658", name: "3347 · BHX_HCM_Q.  - 390 Cách Mạng", retailer: "Bach Hoa Xanh", type: "Minimart", region: "Ho Chi Minh City", district: "Q. Tân Phú", lat: 10.79824, lng: 106.62927, visit: "today", coverage: "covered", lastVisit: "04 Aug 12:04", photos: 6 },
  { id: "VNC0308795", name: "3354 · BHX_HCM_QUẬ - 799 Xô Viết Ng", retailer: "Bach Hoa Xanh", type: "Minimart", region: "Ho Chi Minh City", district: "Quận 10", lat: 10.77164, lng: 106.66743, visit: "today", coverage: "covered", lastVisit: "04 Aug 14:02", photos: 3 },
  { id: "VNC0308932", name: "3361 · BHX HCM 3 - 484 Bà Triệu", retailer: "Bach Hoa Xanh", type: "Minimart", region: "Ho Chi Minh City", district: "Quận 3", lat: 10.78792, lng: 106.69358, visit: "range", coverage: "covered", lastVisit: "02 Jul", photos: 3 },
  { id: "VNC0309069", name: "3368 · BHX HCM 3 - 811 Hoàng Văn", retailer: "Bach Hoa Xanh", type: "Minimart", region: "Ho Chi Minh City", district: "Quận 3", lat: 10.78306, lng: 106.68927, visit: "range", coverage: "overdue", lastVisit: "18 Jul", photos: 5 },
  { id: "VNC0309206", name: "3375 · BHX HCM 10 - 752 Trần Hưng", retailer: "Bach Hoa Xanh", type: "Minimart", region: "Ho Chi Minh City", district: "Quận 10", lat: 10.7736, lng: 106.66962, visit: "today", coverage: "covered", lastVisit: "04 Aug 12:04", photos: 4 },
  { id: "VNC0309343", name: "3382 · BHX_HCM_QUẬ - 410 Nguyễn Thị", retailer: "Bach Hoa Xanh", type: "Minimart", region: "Ho Chi Minh City", district: "Quận 7", lat: 10.72847, lng: 106.72424, visit: "range", coverage: "overdue", lastVisit: "02 Jul", photos: 4 },
  { id: "VNC0309480", name: "3389 · BHX HCM 3 - 34 Lê Văn Sỹ", retailer: "Bach Hoa Xanh", type: "Minimart", region: "Ho Chi Minh City", district: "Quận 3", lat: 10.78648, lng: 106.69204, visit: "none", coverage: "covered", lastVisit: "02 Jul", photos: 2 },
  { id: "VNC0309617", name: "3396 · BHX BDG BIÊ - 910 Bà Triệu", retailer: "Bach Hoa Xanh", type: "Minimart", region: "South East", district: "Biên Hòa", lat: 10.94772, lng: 106.82267, visit: "none", coverage: "covered", lastVisit: "25 Jul", photos: 2 },
  { id: "VNC0309754", name: "3403 · BHX_BDG_DĨ  - 375 Nguyễn Duy", retailer: "Bach Hoa Xanh", type: "Minimart", region: "South East", district: "Dĩ An", lat: 10.90232, lng: 106.76962, visit: "range", coverage: "covered", lastVisit: "25 Jul", photos: 4 },
  { id: "VNC0309891", name: "3410 · BHX BDG THỦ - 155 Phan Xích", retailer: "Bach Hoa Xanh", type: "Minimart", region: "South East", district: "Thủ Dầu Một", lat: 10.97966, lng: 106.65131, visit: "range", coverage: "covered", lastVisit: "21 Jul", photos: 2 },
  { id: "VNC0310028", name: "3417 · BHX_BDG_THU - 166 Quang Trun", retailer: "Bach Hoa Xanh", type: "Minimart", region: "South East", district: "Thuận An", lat: 10.92381, lng: 106.7083, visit: "none", coverage: "covered", lastVisit: "24 Jun", photos: 5 },
  { id: "VNC0310165", name: "3424 · BHX_BDG_BIÊ - 341 Cách Mạng", retailer: "Bach Hoa Xanh", type: "Minimart", region: "South East", district: "Biên Hòa", lat: 10.9467, lng: 106.82413, visit: "today", coverage: "covered", lastVisit: "04 Aug 11:26", photos: 8 },
  { id: "VNC0310302", name: "3431 · BHX BDG BIÊ - 798 Hoàng Văn", retailer: "Bach Hoa Xanh", type: "Minimart", region: "South East", district: "Biên Hòa", lat: 10.94398, lng: 106.82047, visit: "none", coverage: "notyet", lastVisit: null, photos: 0 },
  { id: "VNC0310439", name: "3438 · BHX BDG THU - 323 Nguyễn Trã", retailer: "Bach Hoa Xanh", type: "Minimart", region: "South East", district: "Thuận An", lat: 10.92157, lng: 106.70223, visit: "range", coverage: "covered", lastVisit: "02 Jul", photos: 6 },
  { id: "VNC0310576", name: "3445 · BHX_BDG_VŨN - 94 Lê Văn Sỹ", retailer: "Bach Hoa Xanh", type: "Minimart", region: "South East", district: "Vũng Tàu", lat: 10.34497, lng: 107.08112, visit: "today", coverage: "covered", lastVisit: "04 Aug 09:22", photos: 6 },
  { id: "VNC0310713", name: "3452 · BHX_BDG_THU - 806 Nguyễn Thị", retailer: "Bach Hoa Xanh", type: "Minimart", region: "South East", district: "Thuận An", lat: 10.91841, lng: 106.70173, visit: "today", coverage: "covered", lastVisit: "04 Aug 09:22", photos: 9 },
  { id: "VNC0310850", name: "3459 · BHX_BDG_BIÊ - 368 Phạm Văn Đ", retailer: "Bach Hoa Xanh", type: "Minimart", region: "South East", district: "Biên Hòa", lat: 10.94255, lng: 106.8281, visit: "none", coverage: "covered", lastVisit: "18 Jul", photos: 4 },
  { id: "VNC0310987", name: "3466 · BHX_CTO_MỸ  - 727 Tô Hiến Th", retailer: "Bach Hoa Xanh", type: "Minimart", region: "Mekong Delta", district: "Mỹ Tho", lat: 10.35638, lng: 106.35814, visit: "none", coverage: "covered", lastVisit: "28 Jul", photos: 1 },
  { id: "VNC0311124", name: "3473 · BHX_CTO_NIN - 377 Lê Văn Sỹ", retailer: "Bach Hoa Xanh", type: "Minimart", region: "Mekong Delta", district: "Ninh Kiều", lat: 10.03626, lng: 105.78934, visit: "range", coverage: "covered", lastVisit: "02 Jul", photos: 2 },
  { id: "VNC0311261", name: "3480 · BHX CTO MỸ  - 425 Cách Mạng", retailer: "Bach Hoa Xanh", type: "Minimart", region: "Mekong Delta", district: "Mỹ Tho", lat: 10.35858, lng: 106.35712, visit: "today", coverage: "overdue", lastVisit: "04 Aug 09:22", photos: 3 },
  { id: "VNC0311398", name: "3487 · BHX_CTO_MỸ  - 587 Lê Văn Sỹ", retailer: "Bach Hoa Xanh", type: "Minimart", region: "Mekong Delta", district: "Mỹ Tho", lat: 10.35998, lng: 106.35745, visit: "range", coverage: "notyet", lastVisit: "21 Jul", photos: 7 },
  { id: "VNC0311535", name: "3494 · BHX_CTO_CÀ  - 747 Nguyễn Duy", retailer: "Bach Hoa Xanh", type: "Minimart", region: "Mekong Delta", district: "Cà Mau", lat: 9.17639, lng: 105.15236, visit: "none", coverage: "covered", lastVisit: "21 Jul", photos: 2 },
  { id: "VNC0311672", name: "3501 · BHX_CTO_RẠC - 502 Nguyễn Thị", retailer: "Bach Hoa Xanh", type: "Minimart", region: "Mekong Delta", district: "Rạch Giá", lat: 10.01163, lng: 105.0804, visit: "today", coverage: "covered", lastVisit: "04 Aug 15:30", photos: 3 },
  { id: "VNC0311809", name: "3508 · BHX_CTO_CÀ  - 339 Lý Thường", retailer: "Bach Hoa Xanh", type: "Minimart", region: "Mekong Delta", district: "Cà Mau", lat: 9.17528, lng: 105.15194, visit: "none", coverage: "notyet", lastVisit: null, photos: 0 },
  { id: "VNC0311946", name: "3515 · BHX_CTO_CÀ  - 776 Tô Hiến Th", retailer: "Bach Hoa Xanh", type: "Minimart", region: "Mekong Delta", district: "Cà Mau", lat: 9.17313, lng: 105.14642, visit: "today", coverage: "covered", lastVisit: "04 Aug 12:04", photos: 9 },
  { id: "VNC0312083", name: "3522 · BHX DNG NHA - 38 Lý Thường", retailer: "Bach Hoa Xanh", type: "Minimart", region: "Central", district: "Nha Trang", lat: 12.23516, lng: 109.19985, visit: "today", coverage: "covered", lastVisit: "04 Aug 14:02", photos: 7 },
  { id: "VNC0312220", name: "3529 · BHX_DNG_TP. - 115 Kim Mã", retailer: "Bach Hoa Xanh", type: "Minimart", region: "Central", district: "TP. Huế", lat: 16.46252, lng: 107.58835, visit: "none", coverage: "covered", lastVisit: "14 Jul", photos: 5 },
  { id: "VNC0312357", name: "3536 · BHX DNG NHA - 630 Phạm Văn Đ", retailer: "Bach Hoa Xanh", type: "Minimart", region: "Central", district: "Nha Trang", lat: 12.24037, lng: 109.20068, visit: "none", coverage: "covered", lastVisit: "09 Jul", photos: 1 },
  { id: "VNC0312494", name: "Winmart Q. Bình Thạnh", retailer: "Winmart", type: "Supermarket", region: "Ho Chi Minh City", district: "Q. Bình Thạnh", lat: 10.80204, lng: 106.70799, visit: "range", coverage: "covered", lastVisit: "21 Jul", photos: 4 },
  { id: "VNC0312631", name: "Winmart Quận 3", retailer: "Winmart", type: "Supermarket", region: "Ho Chi Minh City", district: "Quận 3", lat: 10.78562, lng: 106.69193, visit: "today", coverage: "covered", lastVisit: "04 Aug 10:48", photos: 6 },
  { id: "VNC0312768", name: "Winmart Q. Tân Phú", retailer: "Winmart", type: "Supermarket", region: "Ho Chi Minh City", district: "Q. Tân Phú", lat: 10.80415, lng: 106.62169, visit: "none", coverage: "covered", lastVisit: "18 Jul", photos: 5 },
  { id: "VNC0312905", name: "Winmart Quận 7", retailer: "Winmart", type: "Supermarket", region: "Ho Chi Minh City", district: "Quận 7", lat: 10.72884, lng: 106.72066, visit: "none", coverage: "covered", lastVisit: "24 Jun", photos: 4 },
  { id: "VNC0313042", name: "Winmart Q. Tân Phú 2", retailer: "Winmart", type: "Supermarket", region: "Ho Chi Minh City", district: "Q. Tân Phú", lat: 10.80493, lng: 106.62391, visit: "none", coverage: "covered", lastVisit: "25 Jul", photos: 4 },
  { id: "VNC0313179", name: "Winmart Q. Tân Phú 3", retailer: "Winmart", type: "Supermarket", region: "Ho Chi Minh City", district: "Q. Tân Phú", lat: 10.79857, lng: 106.62265, visit: "today", coverage: "covered", lastVisit: "04 Aug 08:40", photos: 4 },
  { id: "VNC0313316", name: "Winmart Q. Bình Thạnh 2", retailer: "Winmart", type: "Supermarket", region: "Ho Chi Minh City", district: "Q. Bình Thạnh", lat: 10.80767, lng: 106.71172, visit: "none", coverage: "overdue", lastVisit: "28 Jul", photos: 1 },
  { id: "VNC0313453", name: "Winmart Q. Tân Phú 4", retailer: "Winmart", type: "Supermarket", region: "Ho Chi Minh City", district: "Q. Tân Phú", lat: 10.80445, lng: 106.62302, visit: "none", coverage: "notyet", lastVisit: null, photos: 0 },
  { id: "VNC0313590", name: "Winmart Vũng Tàu", retailer: "Winmart", type: "Supermarket", region: "South East", district: "Vũng Tàu", lat: 10.34423, lng: 107.08437, visit: "none", coverage: "overdue", lastVisit: "21 Jul", photos: 4 },
  { id: "VNC0313727", name: "3111 · Winlife 74 Nguyễn Trã", retailer: "Winmart", type: "Minimart", region: "South East", district: "Dĩ An", lat: 10.90433, lng: 106.76992, visit: "none", coverage: "notyet", lastVisit: null, photos: 0 },
  { id: "VNC0313864", name: "3122 · Winlife 919 Bà Triệu", retailer: "Winmart", type: "Minimart", region: "South East", district: "Thủ Dầu Một", lat: 10.9795, lng: 106.65107, visit: "none", coverage: "covered", lastVisit: "02 Jul", photos: 2 },
  { id: "VNC0314001", name: "3133 · Winlife 890 Xô Viết Ng", retailer: "Winmart", type: "Minimart", region: "Mekong Delta", district: "Cà Mau", lat: 9.17765, lng: 105.1467, visit: "today", coverage: "covered", lastVisit: "04 Aug 11:26", photos: 7 },
  { id: "VNC0314138", name: "3144 · Winlife 157 Phan Xích", retailer: "Winmart", type: "Minimart", region: "Mekong Delta", district: "Rạch Giá", lat: 10.00914, lng: 105.08111, visit: "range", coverage: "covered", lastVisit: "14 Jul", photos: 6 },
  { id: "VNC0314275", name: "3155 · Winlife 630 Kim Mã", retailer: "Winmart", type: "Minimart", region: "Mekong Delta", district: "Mỹ Tho", lat: 10.35609, lng: 106.35741, visit: "range", coverage: "overdue", lastVisit: "18 Jul", photos: 3 },
  { id: "VNC0314412", name: "3166 · Winlife 137 Phạm Văn Đ", retailer: "Winmart", type: "Minimart", region: "Red River Delta", district: "Q. Long Biên", lat: 21.0433, lng: 105.8869, visit: "today", coverage: "overdue", lastVisit: "04 Aug 08:40", photos: 5 },
  { id: "VNC0314549", name: "3177 · Winlife 693 Võ Văn Ngâ", retailer: "Winmart", type: "Minimart", region: "Red River Delta", district: "Q. Long Biên", lat: 21.04665, lng: 105.8891, visit: "today", coverage: "notyet", lastVisit: "04 Aug 11:26", photos: 5 },
  { id: "VNC0314686", name: "3188 · Winlife 733 Trần Hưng", retailer: "Winmart", type: "Minimart", region: "Red River Delta", district: "Q. Cầu Giấy", lat: 21.02922, lng: 105.80272, visit: "none", coverage: "covered", lastVisit: "14 Jul", photos: 4 },
  { id: "VNC0314823", name: "3199 · Winlife 561 Lê Văn Sỹ", retailer: "Winmart", type: "Minimart", region: "Red River Delta", district: "Q. Cầu Giấy", lat: 21.03188, lng: 105.80207, visit: "range", coverage: "covered", lastVisit: "25 Jul", photos: 4 },
  { id: "VNC0314960", name: "3210 · Winlife 602 Nguyễn Thị", retailer: "Winmart", type: "Minimart", region: "Red River Delta", district: "Q. Cầu Giấy", lat: 21.02839, lng: 105.798, visit: "none", coverage: "covered", lastVisit: "18 Jul", photos: 2 },
  { id: "VNC0315097", name: "3221 · Winlife 718 Hoàng Văn", retailer: "Winmart", type: "Minimart", region: "Red River Delta", district: "Q. Long Biên", lat: 21.04232, lng: 105.88967, visit: "today", coverage: "covered", lastVisit: "04 Aug 10:48", photos: 5 },
  { id: "VNC0315234", name: "3232 · Winlife 512 Phạm Văn Đ", retailer: "Winmart", type: "Minimart", region: "Red River Delta", district: "Q. Cầu Giấy", lat: 21.03188, lng: 105.79987, visit: "none", coverage: "covered", lastVisit: "28 Jul", photos: 1 },
  { id: "VNC0315371", name: "3243 · Winlife 826 Tô Hiến Th", retailer: "Winmart", type: "Minimart", region: "Central", district: "Quy Nhơn", lat: 13.783, lng: 109.21511, visit: "none", coverage: "covered", lastVisit: "02 Jul", photos: 4 },
  { id: "VNC0315508", name: "3254 · Winlife 209 Tô Hiến Th", retailer: "Winmart", type: "Minimart", region: "Central", district: "TP. Vinh", lat: 18.67621, lng: 105.6913, visit: "none", coverage: "covered", lastVisit: "24 Jun", photos: 2 },
  { id: "VNC0315645", name: "3265 · Winlife 729 Phan Xích", retailer: "Winmart", type: "Minimart", region: "North Highlands", district: "Thái Nguyên", lat: 21.59175, lng: 105.84296, visit: "today", coverage: "covered", lastVisit: "04 Aug 10:11", photos: 4 },
  { id: "VNC0315782", name: "3276 · Winlife 491 Hoàng Văn", retailer: "Winmart", type: "Minimart", region: "North Highlands", district: "Hạ Long", lat: 20.94859, lng: 107.07597, visit: "none", coverage: "covered", lastVisit: "21 Jul", photos: 3 },
  { id: "VNC0315919", name: "Co.opmart TP. Thủ Đức", retailer: "Co.opmart", type: "Supermarket", region: "Ho Chi Minh City", district: "TP. Thủ Đức", lat: 10.84843, lng: 106.76901, visit: "today", coverage: "covered", lastVisit: "04 Aug 10:48", photos: 3 },
  { id: "VNC0316056", name: "Co.opmart Q. Tân Bình", retailer: "Co.opmart", type: "Supermarket", region: "Ho Chi Minh City", district: "Q. Tân Bình", lat: 10.8035, lng: 106.6523, visit: "today", coverage: "covered", lastVisit: "04 Aug 14:02", photos: 7 },
  { id: "VNC0316193", name: "Co.opmart Quận 10", retailer: "Co.opmart", type: "Supermarket", region: "Ho Chi Minh City", district: "Quận 10", lat: 10.77024, lng: 106.66794, visit: "none", coverage: "covered", lastVisit: "21 Jul", photos: 3 },
  { id: "VNC0316330", name: "Co.opmart Q. Tân Bình 2", retailer: "Co.opmart", type: "Supermarket", region: "Ho Chi Minh City", district: "Q. Tân Bình", lat: 10.80054, lng: 106.65655, visit: "today", coverage: "covered", lastVisit: "04 Aug 11:26", photos: 9 },
  { id: "VNC0316467", name: "Co.opmart Q. Tân Phú", retailer: "Co.opmart", type: "Supermarket", region: "Ho Chi Minh City", district: "Q. Tân Phú", lat: 10.79914, lng: 106.6225, visit: "today", coverage: "notyet", lastVisit: "04 Aug 10:48", photos: 4 },
  { id: "VNC0316604", name: "Co.opmart Quận 10 2", retailer: "Co.opmart", type: "Supermarket", region: "Ho Chi Minh City", district: "Quận 10", lat: 10.76983, lng: 106.66429, visit: "none", coverage: "covered", lastVisit: "25 Jul", photos: 1 },
  { id: "VNC0316741", name: "Co.opmart Thuận An", retailer: "Co.opmart", type: "Supermarket", region: "South East", district: "Thuận An", lat: 10.91785, lng: 106.70883, visit: "range", coverage: "covered", lastVisit: "14 Jul", photos: 4 },
  { id: "VNC0316878", name: "Co.opmart Dĩ An", retailer: "Co.opmart", type: "Supermarket", region: "South East", district: "Dĩ An", lat: 10.90749, lng: 106.76586, visit: "none", coverage: "overdue", lastVisit: "18 Jul", photos: 5 },
  { id: "VNC0317015", name: "Co.opmart Thủ Dầu Một", retailer: "Co.opmart", type: "Supermarket", region: "South East", district: "Thủ Dầu Một", lat: 10.97911, lng: 106.65403, visit: "range", coverage: "covered", lastVisit: "02 Jul", photos: 3 },
  { id: "VNC0317152", name: "Co.opmart Vĩnh Long", retailer: "Co.opmart", type: "Supermarket", region: "Mekong Delta", district: "Vĩnh Long", lat: 10.2522, lng: 105.97442, visit: "none", coverage: "covered", lastVisit: "18 Jul", photos: 5 },
  { id: "VNC0317289", name: "Co.opmart Mỹ Tho", retailer: "Co.opmart", type: "Supermarket", region: "Mekong Delta", district: "Mỹ Tho", lat: 10.35604, lng: 106.35918, visit: "range", coverage: "covered", lastVisit: "14 Jul", photos: 2 },
  { id: "VNC0317426", name: "Co.opmart Vĩnh Long 2", retailer: "Co.opmart", type: "Supermarket", region: "Mekong Delta", district: "Vĩnh Long", lat: 10.25437, lng: 105.97482, visit: "none", coverage: "covered", lastVisit: "02 Jul", photos: 4 },
  { id: "VNC0317563", name: "Co.opmart Long Xuyên", retailer: "Co.opmart", type: "Supermarket", region: "Mekong Delta", district: "Long Xuyên", lat: 10.38259, lng: 105.43315, visit: "none", coverage: "notyet", lastVisit: null, photos: 0 },
  { id: "VNC0317700", name: "Co.opmart Nam Định", retailer: "Co.opmart", type: "Supermarket", region: "Red River Delta", district: "Nam Định", lat: 20.41881, lng: 106.16747, visit: "range", coverage: "covered", lastVisit: "24 Jun", photos: 3 },
  { id: "VNC0317837", name: "Co.opmart Q. Hoàn Kiếm", retailer: "Co.opmart", type: "Supermarket", region: "Red River Delta", district: "Q. Hoàn Kiếm", lat: 21.03173, lng: 105.8535, visit: "range", coverage: "overdue", lastVisit: "28 Jul", photos: 2 },
  { id: "VNC0317974", name: "Co.opmart Hải Châu", retailer: "Co.opmart", type: "Supermarket", region: "Central", district: "Hải Châu", lat: 16.07016, lng: 108.2205, visit: "range", coverage: "covered", lastVisit: "14 Jul", photos: 2 },
  { id: "VNC0318111", name: "Aeon Mall Quận 1", retailer: "Aeon", type: "Hypermarket", region: "Ho Chi Minh City", district: "Quận 1", lat: 10.77778, lng: 106.70095, visit: "range", coverage: "covered", lastVisit: "02 Jul", photos: 3 },
  { id: "VNC0318248", name: "Aeon Mall Q. Bình Thạnh", retailer: "Aeon", type: "Hypermarket", region: "Ho Chi Minh City", district: "Q. Bình Thạnh", lat: 10.80088, lng: 106.70955, visit: "none", coverage: "covered", lastVisit: "09 Jul", photos: 1 },
  { id: "VNC0318385", name: "Aeon Mall Thuận An", retailer: "Aeon", type: "Hypermarket", region: "South East", district: "Thuận An", lat: 10.92259, lng: 106.70437, visit: "today", coverage: "covered", lastVisit: "04 Aug 09:05", photos: 4 },
  { id: "VNC0318522", name: "Aeon Mall Thuận An 2", retailer: "Aeon", type: "Hypermarket", region: "South East", district: "Thuận An", lat: 10.92022, lng: 106.70799, visit: "range", coverage: "covered", lastVisit: "21 Jul", photos: 6 },
  { id: "VNC0318659", name: "Aeon Mall Long Xuyên", retailer: "Aeon", type: "Hypermarket", region: "Mekong Delta", district: "Long Xuyên", lat: 10.38408, lng: 105.43453, visit: "today", coverage: "covered", lastVisit: "04 Aug 08:40", photos: 6 },
  { id: "VNC0318796", name: "Aeon Mall Q. Hoàn Kiếm", retailer: "Aeon", type: "Hypermarket", region: "Red River Delta", district: "Q. Hoàn Kiếm", lat: 21.02568, lng: 105.85181, visit: "none", coverage: "covered", lastVisit: "25 Jul", photos: 5 },
  { id: "VNC0318933", name: "Aeon Mall Q. Hoàn Kiếm 2", retailer: "Aeon", type: "Hypermarket", region: "Red River Delta", district: "Q. Hoàn Kiếm", lat: 21.02932, lng: 105.85289, visit: "none", coverage: "covered", lastVisit: "09 Jul", photos: 3 },
  { id: "VNC0319070", name: "Aeon Mall TP. Vinh", retailer: "Aeon", type: "Hypermarket", region: "Central", district: "TP. Vinh", lat: 18.67297, lng: 105.68955, visit: "today", coverage: "covered", lastVisit: "04 Aug 15:30", photos: 6 },
  { id: "VNC0319207", name: "Aeon Mall Sơn La", retailer: "Aeon", type: "Hypermarket", region: "North Highlands", district: "Sơn La", lat: 21.32879, lng: 103.91965, visit: "none", coverage: "covered", lastVisit: "25 Jul", photos: 2 },
  { id: "VNC0319344", name: "Lotte Mart Quận 7", retailer: "Lotte", type: "Hypermarket", region: "Ho Chi Minh City", district: "Quận 7", lat: 10.72869, lng: 106.72242, visit: "range", coverage: "covered", lastVisit: "14 Jul", photos: 3 },
  { id: "VNC0319481", name: "Lotte Mart Quận 7 2", retailer: "Lotte", type: "Hypermarket", region: "Ho Chi Minh City", district: "Quận 7", lat: 10.73264, lng: 106.71831, visit: "today", coverage: "covered", lastVisit: "04 Aug 15:30", photos: 6 },
  { id: "VNC0319618", name: "Lotte Mart Thuận An", retailer: "Lotte", type: "Hypermarket", region: "South East", district: "Thuận An", lat: 10.91796, lng: 106.70723, visit: "range", coverage: "covered", lastVisit: "21 Jul", photos: 7 },
  { id: "VNC0319755", name: "Lotte Mart Q. Long Biên", retailer: "Lotte", type: "Hypermarket", region: "Red River Delta", district: "Q. Long Biên", lat: 21.04371, lng: 105.88714, visit: "today", coverage: "covered", lastVisit: "04 Aug 09:22", photos: 7 },
  { id: "VNC0319892", name: "Lotte Mart Q. Long Biên 2", retailer: "Lotte", type: "Hypermarket", region: "Red River Delta", district: "Q. Long Biên", lat: 21.04387, lng: 105.88834, visit: "none", coverage: "covered", lastVisit: "25 Jul", photos: 4 },
  { id: "VNC0320029", name: "Emart Quận 10", retailer: "Emart", type: "Hypermarket", region: "Ho Chi Minh City", district: "Quận 10", lat: 10.77056, lng: 106.66418, visit: "none", coverage: "covered", lastVisit: "14 Jul", photos: 2 },
  { id: "VNC0320166", name: "Emart Quận 3", retailer: "Emart", type: "Hypermarket", region: "Ho Chi Minh City", district: "Quận 3", lat: 10.78666, lng: 106.69211, visit: "range", coverage: "overdue", lastVisit: "14 Jul", photos: 4 },
  { id: "VNC0320303", name: "Emart Q. Bình Thạnh", retailer: "Emart", type: "Hypermarket", region: "Ho Chi Minh City", district: "Q. Bình Thạnh", lat: 10.80005, lng: 106.71076, visit: "range", coverage: "overdue", lastVisit: "25 Jul", photos: 6 },
  { id: "VNC0320440", name: "Emart Quận 1", retailer: "Emart", type: "Hypermarket", region: "Ho Chi Minh City", district: "Quận 1", lat: 10.77497, lng: 106.70575, visit: "range", coverage: "covered", lastVisit: "18 Jul", photos: 7 },
  { id: "VNC0320577", name: "MM Mega Market TP. Thủ Đức", retailer: "MM Mega Market", type: "Wholesale", region: "Ho Chi Minh City", district: "TP. Thủ Đức", lat: 10.84897, lng: 106.77525, visit: "range", coverage: "covered", lastVisit: "09 Jul", photos: 7 },
  { id: "VNC0320714", name: "MM Mega Market Dĩ An", retailer: "MM Mega Market", type: "Wholesale", region: "South East", district: "Dĩ An", lat: 10.90447, lng: 106.76871, visit: "today", coverage: "overdue", lastVisit: "04 Aug 14:02", photos: 6 },
  { id: "VNC0320851", name: "MM Mega Market Lê Chân", retailer: "MM Mega Market", type: "Wholesale", region: "Red River Delta", district: "Lê Chân", lat: 20.84675, lng: 106.685, visit: "range", coverage: "covered", lastVisit: "25 Jul", photos: 3 },
  { id: "VNC0320988", name: "MM Mega Market Thái Nguyên", retailer: "MM Mega Market", type: "Wholesale", region: "North Highlands", district: "Thái Nguyên", lat: 21.59008, lng: 105.84069, visit: "none", coverage: "covered", lastVisit: "18 Jul", photos: 5 },
];

const BY_ID = new Map(STORES.map((s) => [s.id, s]));

export function storeById(id: string): GeoStore {
  const store = BY_ID.get(id);
  // A miss means a fixture references a store that no longer exists; failing
  // loudly at module scope beats rendering a card full of undefined.
  if (!store) throw new Error(`Unknown store id: ${id}`);
  return store;
}

const BY_NAME = new Map(STORES.map((s) => [s.name, s]));

export function storeByName(name: string): GeoStore | undefined {
  return BY_NAME.get(name);
}
