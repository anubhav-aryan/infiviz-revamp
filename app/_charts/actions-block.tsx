import type { PieData } from "./chart-types";
import { HBarList, type BarRow } from "./h-bar-list";
import { MeasureTable } from "./measure-table";
import { Pie } from "./radial";
import { StatCard, type StatCardProps } from "./stat-card";
import type { Column, Row } from "./table";
import styles from "./charts.module.css";

/**
 * The Actions tab, whole. Category Management, Availability, Revenue and Space
 * each ship this exact layout over their own measure — six visuals × five
 * modules is thirty of the eighty in the inventory, which is why it is one
 * component taking data rather than five near-identical pages.
 *
 * Layout follows PowerBI's: three stacked stats, the open/closed pie, the
 * reason bars and the category bars across the top; merchandiser completion
 * and the raw extract beneath.
 */

export type ActionsBlockData = {
  /** Number of actions, actions per visit, actions completed. */
  stats: StatCardProps[];
  openClosed: PieData;
  /** "Why SOS was not fixed?" — the reason codes, longest bar first. */
  reasons: { title: string; rows: BarRow[]; axisLabel: string };
  /** "Category-wise actions generated". */
  byCategory: { title: string; rows: BarRow[]; axisLabel: string };
  completion: {
    title: string;
    columns: Column[];
    rows: Row[];
  };
  raw: {
    title: string;
    columns: Column[];
    rows: Row[];
  };
};

export function ActionsBlock({ data }: { data: ActionsBlockData }) {
  return (
    <div className={styles.stack}>
      <div className={styles.actionsTop}>
        <div className={styles.actionsStats}>
          {data.stats.map((stat) => (
            <StatCard key={stat.label} {...stat} size="sm" />
          ))}
        </div>

        <div className={`${styles.card} ${styles.cardPad}`}>
          <div className={styles.cardTitle}>Open vs closed tasks</div>
          <Pie data={data.openClosed} />
        </div>

        <div className={`${styles.card} ${styles.cardPad}`}>
          <div className={styles.cardTitle}>{data.reasons.title}</div>
          <div className={styles.chartBody}>
            {/* Reason codes are sentences, not names — they need the room. */}
            <HBarList rows={data.reasons.rows} nameWidth="minmax(168px, 48%)" />
          </div>
          <div className={styles.axisCaption}>{data.reasons.axisLabel}</div>
        </div>

        <div className={`${styles.card} ${styles.cardPad}`}>
          <div className={styles.cardTitle}>{data.byCategory.title}</div>
          <div className={styles.chartBody}>
            <HBarList rows={data.byCategory.rows} nameWidth="minmax(110px, 32%)" />
          </div>
          <div className={styles.axisCaption}>{data.byCategory.axisLabel}</div>
        </div>
      </div>

      <div className={styles.actionsBottom}>
        <div className={`${styles.card} ${styles.tableCard}`}>
          <div className={styles.tabbedHead}>
            <div className={styles.cardTitle}>{data.completion.title}</div>
          </div>
          <MeasureTable
            columns={data.completion.columns}
            rows={data.completion.rows}
            emptyLabel="No merchandiser activity for this selection."
            maxHeight={300}
          />
        </div>

        <div className={`${styles.card} ${styles.tableCard}`}>
          <div className={styles.tabbedHead}>
            <div className={styles.cardTitle}>{data.raw.title}</div>
          </div>
          <MeasureTable
            columns={data.raw.columns}
            rows={data.raw.rows}
            emptyLabel="No actions for this selection."
            maxHeight={300}
            wide
          />
        </div>
      </div>
    </div>
  );
}
