import { VISITS } from "@/app/store-explorer/_data/store-explorer";
import { slugifyStore } from "@/app/session-viewer/_data/session-viewer";

/**
 * The canonical list of stores whose captures can be opened.
 *
 * Three parts of the platform name stores, and none of them agree: Store
 * Explorer's eight visits, Photo Quality's rejected sessions, and the
 * per-merchandiser bad-store lists behind the rejection-rate table. A "View
 * images" link that points at a store missing from this list 404s, because the
 * route sets `dynamicParams = false`.
 *
 * So the union is authored here, once, and both the route's
 * `generateStaticParams` and every link on the platform read from it. That is
 * the whole reason this file exists rather than each screen slugifying its own
 * names — the two would drift and the drift would only show as a 404.
 *
 * Deliberately not imported by `store-explorer` or `photo-quality` in the other
 * direction: this module depends on them, never the reverse, so there is no
 * cycle.
 */

/** Store Explorer's own visits, so those eight stay in step automatically. */
const EXPLORER_STORES = VISITS.map((visit) => visit.store);

/** Named by Photo Quality's rejected sessions and its per-merchandiser lists. */
const PHOTO_QUALITY_STORES = [
  "30151 BHX_HCM Vạn Kiếp",
  "Winmart Q7 Trần",
  "Co.opmart N.Đ.Chiểu",
  "Aeon Tân Phú",
  "Lotte Mart Cần Thơ",
  "Emart Gò Vấp",
  "MM Mega Market An Phú",
  "Co.opmart Quy Nhơn",
  "BHX Đà Nẵng Hải Châu",
  "Winmart Huế Đông Ba",
  "Winmart Hà Giang",
  "BHX Lào Cai Cốc Lếu",
  "BHX Cần Thơ Ninh Kiều",
  "Co.opmart Long Xuyên",
  "Aeon Hải Phòng",
  "Winmart Hà Nội Cầu Giấy",
  "BHX Biên Hòa Tân Phong",
  "Winmart Hà Nội Mỹ Đình",
];

export type SessionImageStore = { slug: string; name: string };

/** Deduped by slug — several names collapse to the same slug after folding. */
export const SESSION_IMAGE_STORES: SessionImageStore[] = (() => {
  const bySlug = new Map<string, SessionImageStore>();
  for (const name of [...EXPLORER_STORES, ...PHOTO_QUALITY_STORES]) {
    const slug = slugifyStore(name);
    if (!bySlug.has(slug)) bySlug.set(slug, { slug, name });
  }
  return [...bySlug.values()];
})();

const SLUGS = new Set(SESSION_IMAGE_STORES.map((entry) => entry.slug));

/**
 * The href for a store's captures, or `null` where none exist — callers render
 * the link inert rather than pointing at a page that would 404.
 */
export function sessionImageHref(store: string): string | null {
  const slug = slugifyStore(store);
  return SLUGS.has(slug) ? `/session-images/${slug}` : null;
}

export function storeForSlug(slug: string): SessionImageStore | undefined {
  return SESSION_IMAGE_STORES.find((entry) => entry.slug === slug);
}
