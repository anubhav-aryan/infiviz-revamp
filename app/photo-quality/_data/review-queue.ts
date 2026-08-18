import { group } from "@/app/_format/num";
import { STORES } from "@/app/_data/stores-geo";
import { lcg } from "@/app/_time/variants";
import type { MonthKey } from "@/app/_time/periods";
import { PHOTO_QUALITY } from "./photo-quality";

/**
 * Sessions waiting on a human decision.
 *
 * Everything the validity rules flag rather than auto-disable lands here, and
 * the only two outcomes are accept or disable. This is the piece that moves the
 * manual checking off one person and onto the PDM who owns the account — it
 * does not remove the work, it relocates and bounds it.
 *
 * **The design constraint is speed of decision.** A queue that cannot be
 * cleared quickly is one that stops being opened, so every row carries what the
 * reviewer needs in one glance: why it was flagged, what the store normally
 * looks like, and what accepting it would do to the numbers. A row that only
 * said "flagged" would send the reviewer to three other screens.
 */

export type FlagReason = "photo-quality" | "photo-count" | "percentile";

export const FLAG_LABEL: Record<FlagReason, string> = {
  "photo-quality": "Low capture score",
  "photo-count": "Photo count below the store's band",
  percentile: "Bottom percentile by share of shelf",
};

export type ReviewItem = {
  id: string;
  storeId: string;
  store: string;
  retailer: string;
  merchandiser: string;
  captured: string;
  reason: FlagReason;
  /** The figure that tripped the rule, pre-formatted. */
  figure: string;
  /** What this store normally does — the comparison that makes it decidable. */
  baseline: string;
  photos: number;
  /** Photos this store usually sends. */
  usualPhotos: number;
  /** Effect on the month's numbers if this session is accepted, in points. */
  impact: number;
};

const MERCHANDISERS = ["khang_nguyen", "linh_pham", "minh_tran", "quan_do", "mai_bui", "huy_le"];

const REASONS: FlagReason[] = ["photo-quality", "photo-count", "percentile"];

function build(index: number, month: MonthKey): ReviewItem {
  const store = STORES[(index * 13) % STORES.length];
  const rand = lcg(index * 97 + month.charCodeAt(5));
  const reason = REASONS[index % REASONS.length];

  const usualPhotos = 8 + Math.floor(rand() * 5);
  const photos =
    reason === "photo-count" ? usualPhotos - (4 + Math.floor(rand() * 3)) : usualPhotos;
  const score = 38 + Math.floor(rand() * 20);

  return {
    id: `rev-${index}`,
    storeId: store.id,
    store: store.name,
    retailer: store.retailer,
    merchandiser: MERCHANDISERS[index % MERCHANDISERS.length],
    captured: `${String(4 + (index % 20)).padStart(2, "0")} Jul`,
    reason,
    figure:
      reason === "photo-quality"
        ? `Score ${score}`
        : reason === "photo-count"
          ? `${photos} photos`
          : `${(12 + rand() * 8).toFixed(1)}% SOS`,
    baseline:
      reason === "photo-quality"
        ? `Store averages ${score + 18} over its last 6 visits`
        : reason === "photo-count"
          ? `Usually ${usualPhotos} · band ±3`
          : `Category median ${(34 + rand() * 6).toFixed(1)}%`,
    photos,
    usualPhotos,
    impact: +(rand() * 1.4).toFixed(2),
  };
}

export function reviewQueueFor(month: MonthKey): ReviewItem[] {
  // Scaled off the month's rejected pool so the queue and the report agree
  // about how bad the month was.
  const size = Math.max(4, Math.min(9, PHOTO_QUALITY[month].rejected.length + 3));
  return Array.from({ length: size }, (_, index) => build(index, month));
}

/** Header line — how much work is waiting, and what it would move. */
export function queueSummary(items: ReviewItem[]) {
  const impact = items.reduce((total, item) => total + item.impact, 0);
  return {
    count: group(items.length),
    impact: impact.toFixed(1),
  };
}
