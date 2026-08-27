import Link from "next/link";
import { Icon } from "@/app/_components/icon";
import type { Visit } from "@/app/_data/visits";
import { ACCURACY_OVERALL } from "../_data/session-accuracy";
import {
  sessionHistoryFor,
  STATUS_CHIP,
  type VisitDay,
} from "../_data/session-history";
import {
  formatDelta,
  snapshotLinearPct,
  snapshotSosPct,
  VISIT_SNAPSHOTS,
  type VisitSnapshot,
} from "../_data/session-previous";
import {
  AVAILABILITY,
  COUNTED_FACINGS,
  MSL,
  MSL_CHANGE,
  RANGED_COUNT,
  sessionFor,
  SHELF_METRICS,
  slugifyStore,
  type MslChange,
} from "../_data/session-viewer";
import styles from "./compare.module.css";

/**
 * One store's visits side by side — the Compare button's destination.
 *
 * Columns run oldest to newest and end on the current capture, so every row
 * reads left-to-right as "how did this number get here". Nothing on this page
 * is authored: the two history columns come from the same `VISIT_SNAPSHOTS`
 * the Insights rail derives its deltas from, and the current column from the
 * same live fixtures the rail renders — which is what keeps the two surfaces
 * incapable of disagreeing.
 *
 * A server component throughout. The page is a reading, not a workspace; the
 * one thing to do with it is follow a column back into the viewer.
 */

/** A visit's worth of one metric: display value + the number deltas come from. */
type MetricCell = { text: string; value: number };

type MetricRow = {
  label: string;
  cells: MetricCell[];
  /** Which direction of travel the delta chips paint green. */
  goodWhen: "up" | "down";
  /** Delta formatting between adjacent cells. */
  unit?: string;
  decimals?: number;
};

const osaPct = (snapshot: VisitSnapshot) =>
  +(((RANGED_COUNT - snapshot.absentSkus.length) / RANGED_COUNT) * 100).toFixed(1);

const pct = (value: number): MetricCell => ({ text: `${value}%`, value });
const count = (value: number): MetricCell => ({ text: `${value}`, value });

const METRIC_ROWS: MetricRow[] = [
  {
    label: SHELF_METRICS[0].label,
    cells: [...VISIT_SNAPSHOTS.map((s) => pct(snapshotSosPct(s))), pct(SHELF_METRICS[0].pct)],
    goodWhen: "up",
    unit: "pts",
    decimals: 1,
  },
  {
    label: "Linear SOS",
    cells: [...VISIT_SNAPSHOTS.map((s) => pct(snapshotLinearPct(s))), pct(SHELF_METRICS[1].pct)],
    goodWhen: "up",
    unit: "pts",
    decimals: 1,
  },
  {
    label: AVAILABILITY.label,
    cells: [...VISIT_SNAPSHOTS.map((s) => pct(osaPct(s))), pct(AVAILABILITY.pct)],
    goodWhen: "up",
    unit: "pts",
    decimals: 1,
  },
  {
    label: "MSL gaps",
    cells: [
      ...VISIT_SNAPSHOTS.map((s) => count(s.absentSkus.length)),
      count(MSL.filter((sku) => sku.status === "absent").length),
    ],
    goodWhen: "down",
  },
  {
    label: "Facings counted",
    cells: [...VISIT_SNAPSHOTS.map((s) => count(s.countedFacings)), count(COUNTED_FACINGS)],
    goodWhen: "up",
  },
  {
    label: "Recognition accuracy",
    cells: [
      ...VISIT_SNAPSHOTS.map((s) => pct(s.accuracyOverall)),
      pct(ACCURACY_OVERALL),
    ],
    goodWhen: "up",
    unit: "pts",
    decimals: 1,
  },
];

const CHANGE_CHIP: Record<MslChange, { label: string; tone: string }> = {
  new: { label: "Newly absent", tone: "danger" },
  recurring: { label: "Still absent", tone: "warning" },
  recovered: { label: "Back on shelf", tone: "success" },
};

export function CompareView({ visit }: { visit: Visit }) {
  const identity = sessionFor(visit);
  const slug = slugifyStore(visit.store);

  /* Oldest first, to match the columns. */
  const days: VisitDay[] = [...sessionHistoryFor(visit)].reverse();
  const sessionCount = days.reduce((total, day) => total + day.sessions.length, 0);
  const currentIdx = days.length - 1;

  /* Which visits each metric/matrix column describes. */
  const columnLabels = days.map((day) => day.label);

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
            {days.length} visits · {sessionCount} sessions · {days[0].label} →{" "}
            {days[currentIdx].label}
          </span>
          <Link href={`/session-viewer/${slug}`} className={styles.toolButton}>
            <Icon name="image" size={14} />
            Open latest session
          </Link>
        </div>
      </header>

      <div className={styles.body}>
        {/* ---- the visits themselves ---- */}
        <section className={styles.card}>
          <div className={styles.cardHead}>
            <span className={styles.cardTitle}>Visit timeline</span>
            <span className={styles.cardCaption}>oldest → newest</span>
          </div>
          <div className={styles.visitGrid} data-cols={days.length}>
            {days.map((day, index) => {
              const current = index === currentIdx;
              const chip = current ? STATUS_CHIP[visit.status] : STATUS_CHIP.Complete;
              return (
                <div key={day.date} className={styles.visitCol} data-current={current}>
                  <div className={styles.visitDate}>
                    {day.label}
                    {current ? <span className={styles.currentTag}>This capture</span> : null}
                  </div>
                  <span className={styles.chip} data-tone={chip.tone}>
                    <Icon name="check" size={11} />
                    {chip.label}
                  </span>
                  <ul className={styles.sessionList}>
                    {day.sessions.map((session) => (
                      <li key={session.id}>
                        <span className={styles.sessionTime}>{session.startedAt}</span>
                        {session.label}
                      </li>
                    ))}
                  </ul>
                  {current ? (
                    <div className={styles.visitFoot}>
                      <Icon name="image" size={13} />
                      {identity.photos} photos
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>

        {/* ---- the numbers over time ---- */}
        <section className={styles.card}>
          <div className={styles.cardHead}>
            <span className={styles.cardTitle}>Metric trend</span>
            <span className={styles.cardCaption}>
              each delta compares with the visit before it
            </span>
          </div>
          <table className={styles.trendTable}>
            <thead>
              <tr>
                <th scope="col" aria-label="Metric" />
                {columnLabels.map((label, index) => (
                  <th key={label} scope="col" data-current={index === currentIdx}>
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {METRIC_ROWS.map((row) => (
                <tr key={row.label}>
                  <th scope="row">{row.label}</th>
                  {row.cells.map((cell, index) => {
                    const prior = index > 0 ? row.cells[index - 1] : null;
                    const delta =
                      prior === null
                        ? null
                        : formatDelta(cell.value - prior.value, {
                            unit: row.unit,
                            decimals: row.decimals ?? 0,
                          });
                    const good =
                      prior === null
                        ? true
                        : row.goodWhen === "up"
                          ? cell.value >= prior.value
                          : cell.value <= prior.value;
                    return (
                      <td key={index} data-current={index === currentIdx}>
                        <span className={styles.cellValue}>{cell.text}</span>
                        {delta ? (
                          <span className={styles.deltaChip} data-good={good}>
                            {delta}
                          </span>
                        ) : null}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* ---- must-stock, visit by visit ---- */}
        <section className={styles.card}>
          <div className={styles.cardHead}>
            <span className={styles.cardTitle}>Must-stock across visits</span>
            <span className={styles.cardCaption}>
              {RANGED_COUNT} ranged SKUs · found or absent per visit
            </span>
          </div>
          <table className={styles.matrixTable}>
            <thead>
              <tr>
                <th scope="col" aria-label="SKU" />
                {columnLabels.map((label, index) => (
                  <th key={label} scope="col" data-current={index === currentIdx}>
                    {label}
                  </th>
                ))}
                <th scope="col" aria-label="Change" />
              </tr>
            </thead>
            <tbody>
              {MSL.map((sku) => {
                const change = MSL_CHANGE.get(sku.name);
                const perVisit = [
                  ...VISIT_SNAPSHOTS.map((s) => !s.absentSkus.includes(sku.name)),
                  sku.status === "found",
                ];
                return (
                  <tr key={sku.name}>
                    <th scope="row">
                      <span className={styles.skuName}>{sku.name}</span>
                      <span className={styles.skuBrand}>{sku.brand}</span>
                    </th>
                    {perVisit.map((found, index) => (
                      <td key={index} data-current={index === currentIdx}>
                        <span
                          className={styles.mark}
                          data-found={found}
                          aria-label={found ? "Found" : "Absent"}
                        >
                          <Icon name={found ? "check" : "x"} size={13} />
                        </span>
                      </td>
                    ))}
                    <td className={styles.changeCell}>
                      {change ? (
                        <span className={styles.chip} data-tone={CHANGE_CHIP[change].tone}>
                          {CHANGE_CHIP[change].label}
                        </span>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
