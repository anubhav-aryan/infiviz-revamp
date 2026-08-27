import Link from "next/link";
import { Icon } from "@/app/_components/icon";
import type { Visit } from "@/app/_data/visits";
import { ACCURACY_OVERALL } from "../_data/session-accuracy";
import { flatSessionsFor } from "../_data/session-history";
import { VISIT_METRICS } from "../_data/session-previous";
import {
  AVAILABILITY,
  COUNTED_FACINGS,
  MSL,
  MSL_CHANGE,
  RANGED_COUNT,
  sessionFor,
  SHELF_METRICS,
  slugifyStore,
} from "../_data/session-viewer";
import { CompareTables, type TrendColumn, type TrendSku } from "./compare-tables";
import { SessionFeed } from "./session-feed";
import styles from "./compare.module.css";

/**
 * One store's sessions and visits over time — the Compare button's
 * destination.
 *
 * The feed leads: every session newest-first, photos beside metadata, ten at
 * a time. Below it, the trend and matrix over pickable visit columns —
 * oldest to newest, ending on the current capture, so every row reads
 * left-to-right as "how did this number get here". Nothing here is authored
 * twice: the history columns come from the same `VISIT_METRICS` history the
 * Insights rail's baseline belongs to, the feed from the same history the
 * header's Session picker lists, and the current column from the live
 * fixtures — which is what keeps the surfaces incapable of disagreeing.
 */

export function CompareView({ visit }: { visit: Visit }) {
  const identity = sessionFor(visit);
  const slug = slugifyStore(visit.store);

  /* Newest first — the feed's order. */
  const sessions = flatSessionsFor(visit);

  /* Every prior visit as a pickable column, then the capture itself, whose
     numbers come from the live fixtures rather than a snapshot. */
  const skus: TrendSku[] = MSL.map((sku) => ({
    name: sku.name,
    brand: sku.brand,
    change: MSL_CHANGE.get(sku.name) ?? null,
  }));
  const columns: TrendColumn[] = [
    ...VISIT_METRICS.map((metrics) => ({
      label: metrics.label,
      sosPct: metrics.sosPct,
      linearPct: metrics.linearPct,
      osaPct: +(((RANGED_COUNT - metrics.absentSkus.length) / RANGED_COUNT) * 100).toFixed(1),
      gaps: metrics.absentSkus.length,
      counted: metrics.countedFacings,
      accuracy: metrics.accuracyOverall,
      mslFound: MSL.map((sku) => !metrics.absentSkus.includes(sku.name)),
    })),
    {
      label: sessions[0].dayLabel,
      sosPct: SHELF_METRICS[0].pct,
      linearPct: SHELF_METRICS[1].pct,
      osaPct: AVAILABILITY.pct,
      gaps: MSL.filter((sku) => sku.status === "absent").length,
      counted: COUNTED_FACINGS,
      accuracy: ACCURACY_OVERALL,
      mslFound: MSL.map((sku) => sku.status === "found"),
      current: true,
    },
  ];

  return (
    <div>
      <header className={styles.header}>
        <nav className={styles.eyebrow} aria-label="Breadcrumb">
          <Link href="/session-viewer" className={styles.crumbLink}>
            Session Viewer
          </Link>
          <span className={styles.crumbSep} aria-hidden="true">
            /
          </span>
          <Link href={`/session-viewer/${slug}`} className={styles.crumbLink}>
            {visit.store}
          </Link>
          <span className={styles.crumbSep} aria-hidden="true">
            /
          </span>
          <span className={styles.crumbHere}>Compare</span>
        </nav>

        <div className={styles.headRow}>
          <h1 className={styles.title}>{identity.title}</h1>
          <span className={styles.caption}>
            {sessions.length} sessions · {sessions[sessions.length - 1].dayLabel} →{" "}
            {sessions[0].dayLabel}
          </span>
          <Link href={`/session-viewer/${slug}`} className={styles.toolButton}>
            <Icon name="image" size={14} />
            Open latest session
          </Link>
        </div>
      </header>

      <div className={styles.body}>
        <SessionFeed
          sessions={sessions}
          store={visit.store}
          place={identity.place}
          storeId={visit.storeId}
          merchandiser={identity.merchandiser}
          viewerHref={`/session-viewer/${slug}`}
        />

        {/* ---- the numbers over time, columns picked by the reader ---- */}
        <CompareTables columns={columns} skus={skus} />
      </div>
    </div>
  );
}
