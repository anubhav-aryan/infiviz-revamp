import { group } from "@/app/_format/num";
import { MONTHS, type MonthKey } from "@/app/_time/periods";
import { PHOTO_QUALITY } from "@/app/photo-quality/_data/photo-quality";

/**
 * Top-of-funnel data health: how much raw capture arrived, how much of it the
 * pipeline finished, and how much survived quality gating well enough to be
 * analysed.
 *
 * This is the block that qualifies every other number on the dashboard, which
 * is why it reads before them. It answers a question the product could not
 * answer at all before: the gap between what was captured and what is actually
 * usable was something you had to work out by hand.
 *
 * Three deliberate choices:
 *
 * - **Captured and processed are one tile, not two.** The gap between them *is*
 *   the signal — capture happened but the pipeline did not finish — and two
 *   numbers side by side make the reader do the subtraction.
 * - **Auditable is its own figure.** Captured is raw volume; auditable is
 *   usable volume, and only the second one can carry an analysis.
 * - **The trend is a share, not a count.** Auditable sessions rise with rollout
 *   whether or not quality improves, so a raw count would read as progress on a
 *   month where gating got worse. As a percentage of captured it only moves
 *   when field behaviour or the gating itself moves.
 *
 * The pass rate comes from Photo quality's authored series, so this block and
 * that report cannot disagree about how much was rejected.
 */

export type DataHealth = {
  monthLabel: string;
  capturedPhotos: number;
  processedPhotos: number;
  /** Photos that arrived but never finished the pipeline. */
  stalledPhotos: number;
  sessions: number;
  auditableSessions: number;
  /** Auditable as a share of captured sessions, this month. */
  auditableShare: number;
  /** Six-month history of that share, for the sparkline. */
  shareSeries: number[];
  /** Points moved against last month. */
  shareDelta: number;
};

/**
 * Sessions captured per month — the same series the landing screen's "Sessions
 * by month" card publishes, so the two screens quote one history.
 */
const SESSIONS: Record<MonthKey, number> = {
  "2026-02": 8420,
  "2026-03": 9310,
  "2026-04": 10120,
  "2026-05": 11040,
  "2026-06": 11890,
  "2026-07": 12847,
};

/** Photos per session, authored. Steady — it is a capture protocol, not a metric. */
const PHOTOS_PER_SESSION = 3.22;

/**
 * The share of captured photos the pipeline finished. Below 100 because
 * stitching and recognition genuinely drop some — this is the gap the paired
 * tile exists to show, and it narrows as the platform matures.
 */
const PROCESSED_SHARE: Record<MonthKey, number> = {
  "2026-02": 0.941,
  "2026-03": 0.948,
  "2026-04": 0.955,
  "2026-05": 0.961,
  "2026-06": 0.968,
  "2026-07": 0.9647,
};

function auditableShareFor(month: MonthKey): number {
  // A session is auditable when the pipeline finished it *and* it cleared
  // quality gating, so the two rates compound rather than one masking the other.
  const passRate = PHOTO_QUALITY[month].hero.pct / 100;
  return +(PROCESSED_SHARE[month] * passRate * 100).toFixed(1);
}

const SHARE_SERIES = MONTHS.map((month) => auditableShareFor(month.key));

function build(month: MonthKey, index: number): DataHealth {
  const sessions = SESSIONS[month];
  const capturedPhotos = Math.round(sessions * PHOTOS_PER_SESSION);
  const processedPhotos = Math.round(capturedPhotos * PROCESSED_SHARE[month]);
  const auditableShare = SHARE_SERIES[index];

  return {
    monthLabel: MONTHS[index].label,
    capturedPhotos,
    processedPhotos,
    stalledPhotos: capturedPhotos - processedPhotos,
    sessions,
    auditableSessions: Math.round((sessions * auditableShare) / 100),
    auditableShare,
    shareSeries: SHARE_SERIES,
    // February has no month before it inside the authored window.
    shareDelta: +(auditableShare - (SHARE_SERIES[index - 1] ?? auditableShare)).toFixed(1),
  };
}

export const DATA_HEALTH: Record<MonthKey, DataHealth> = Object.fromEntries(
  MONTHS.map((month, index) => [month.key, build(month.key, index)]),
) as Record<MonthKey, DataHealth>;

/** Pre-formatted so nothing is formatted at render — see the house rule. */
export function dataHealthTiles(health: DataHealth) {
  return {
    captured: {
      label: "Photos captured → processed",
      value: group(health.capturedPhotos),
      secondary: group(health.processedPhotos),
      caption:
        health.stalledPhotos > 0
          ? `${group(health.stalledPhotos)} did not finish the pipeline`
          : "every capture finished",
    },
    auditable: {
      label: "Auditable visits",
      value: group(health.auditableSessions),
      caption: `of ${group(health.sessions)} captured this period`,
    },
    trend: {
      label: "Auditable share",
      value: `${health.auditableShare}%`,
      caption: "of captured sessions · six-month trend",
    },
  };
}
