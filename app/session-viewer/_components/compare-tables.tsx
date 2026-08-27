"use client";

import { useState } from "react";
import { Icon } from "@/app/_components/icon";
import { formatDelta } from "../_data/session-previous";
import type { MslChange } from "../_data/session-viewer";
import styles from "./compare.module.css";

/** One visit's column, current capture included — built by the server page. */
export type TrendColumn = {
  label: string;
  sosPct: number;
  linearPct: number;
  osaPct: number;
  gaps: number;
  counted: number;
  accuracy: number;
  /** Found/absent per must-stock SKU, aligned with `skus`. */
  mslFound: boolean[];
  current?: boolean;
};

export type TrendSku = { name: string; brand: string; change: MslChange | null };

/** How many prior visits the tables open with, beside the capture itself. */
const DEFAULT_PRIOR = 4;

type MetricRow = {
  label: string;
  value: (column: TrendColumn) => number;
  text: (column: TrendColumn) => string;
  goodWhen: "up" | "down";
  unit?: string;
  decimals?: number;
};

const METRIC_ROWS: MetricRow[] = [
  { label: "Share of Shelf", value: (c) => c.sosPct, text: (c) => `${c.sosPct}%`, goodWhen: "up", unit: "pts", decimals: 1 },
  { label: "Linear SOS", value: (c) => c.linearPct, text: (c) => `${c.linearPct}%`, goodWhen: "up", unit: "pts", decimals: 1 },
  { label: "On-Shelf Availability", value: (c) => c.osaPct, text: (c) => `${c.osaPct}%`, goodWhen: "up", unit: "pts", decimals: 1 },
  { label: "MSL gaps", value: (c) => c.gaps, text: (c) => `${c.gaps}`, goodWhen: "down" },
  { label: "Facings counted", value: (c) => c.counted, text: (c) => `${c.counted}`, goodWhen: "up" },
  { label: "Recognition accuracy", value: (c) => c.accuracy, text: (c) => `${c.accuracy}%`, goodWhen: "up", unit: "pts", decimals: 1 },
];

/**
 * The Metric trend and Must-stock matrix, with the visits as pickable columns.
 *
 * The two tables share one column set on purpose — a gap counted in the trend
 * is a cross in the matrix, and letting them show different visits would let
 * them disagree. The tables open on the last few visits; every earlier one is
 * in the "Add visit" picker, and any prior column can be dismissed again. The
 * current capture cannot: it is the thing the page compares against.
 */
export function CompareTables({
  columns,
  skus,
}: {
  /** Every visit oldest→newest, the current capture last. */
  columns: TrendColumn[];
  skus: TrendSku[];
}) {
  const priorLabels = columns.filter((c) => !c.current).map((c) => c.label);
  const [shown, setShown] = useState<ReadonlySet<string>>(
    () => new Set(priorLabels.slice(-DEFAULT_PRIOR)),
  );

  const visible = columns.filter((c) => c.current || shown.has(c.label));
  const hidden = priorLabels.filter((label) => !shown.has(label));
  const currentIdx = visible.length - 1;

  const addVisit = (label: string) => {
    if (!label) return;
    setShown((current) => new Set([...current, label]));
  };
  const removeVisit = (label: string) => {
    setShown((current) => {
      const next = new Set(current);
      next.delete(label);
      return next;
    });
  };

  const headCells = (
    <tr>
      <th scope="col" aria-label="Row" />
      {visible.map((column) => (
        <th key={column.label} scope="col" data-current={column.current}>
          {column.label}
          {!column.current ? (
            <button
              type="button"
              className={styles.columnRemove}
              onClick={() => removeVisit(column.label)}
              aria-label={`Remove ${column.label} from the comparison`}
            >
              <Icon name="x" size={11} />
            </button>
          ) : null}
        </th>
      ))}
    </tr>
  );

  return (
    <>
      <section className={styles.card}>
        <div className={styles.cardHead}>
          <span className={styles.cardTitle}>Metric trend</span>
          <span className={styles.cardCaption}>
            each delta compares with the visit shown before it
          </span>
          {hidden.length > 0 ? (
            <select
              className={styles.addVisit}
              value=""
              onChange={(event) => addVisit(event.target.value)}
              aria-label="Add a visit to the comparison"
            >
              <option value="" disabled>
                + Add visit…
              </option>
              {hidden.map((label) => (
                <option key={label} value={label}>
                  {label}
                </option>
              ))}
            </select>
          ) : null}
        </div>
        <div className={styles.tableScroll}>
          <table className={styles.trendTable}>
            <thead>{headCells}</thead>
            <tbody>
              {METRIC_ROWS.map((row) => (
                <tr key={row.label}>
                  <th scope="row">{row.label}</th>
                  {visible.map((column, index) => {
                    const prior = index > 0 ? visible[index - 1] : null;
                    const delta =
                      prior === null
                        ? null
                        : formatDelta(row.value(column) - row.value(prior), {
                            unit: row.unit,
                            decimals: row.decimals ?? 0,
                          });
                    const good =
                      prior === null
                        ? true
                        : row.goodWhen === "up"
                          ? row.value(column) >= row.value(prior)
                          : row.value(column) <= row.value(prior);
                    return (
                      <td key={column.label} data-current={index === currentIdx}>
                        <span className={styles.cellValue}>{row.text(column)}</span>
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
        </div>
      </section>

      <section className={styles.card}>
        <div className={styles.cardHead}>
          <span className={styles.cardTitle}>Must-stock across visits</span>
          <span className={styles.cardCaption}>
            {skus.length} ranged SKUs · found or absent per visit
          </span>
        </div>
        <div className={styles.tableScroll}>
          <table className={styles.matrixTable}>
            <thead>
              <tr>
                <th scope="col" aria-label="SKU" />
                {visible.map((column) => (
                  <th key={column.label} scope="col" data-current={column.current}>
                    {column.label}
                  </th>
                ))}
                <th scope="col" aria-label="Change" />
              </tr>
            </thead>
            <tbody>
              {skus.map((sku, skuIndex) => (
                <tr key={sku.name}>
                  <th scope="row">
                    <span className={styles.skuName}>{sku.name}</span>
                    <span className={styles.skuBrand}>{sku.brand}</span>
                  </th>
                  {visible.map((column, index) => (
                    <td key={column.label} data-current={index === currentIdx}>
                      <span
                        className={styles.mark}
                        data-found={column.mslFound[skuIndex]}
                        aria-label={column.mslFound[skuIndex] ? "Found" : "Absent"}
                      >
                        <Icon name={column.mslFound[skuIndex] ? "check" : "x"} size={13} />
                      </span>
                    </td>
                  ))}
                  <td className={styles.changeCell}>
                    {sku.change ? (
                      <span className={styles.chip} data-tone={CHANGE_TONE[sku.change]}>
                        {CHANGE_LABEL[sku.change]}
                      </span>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

const CHANGE_LABEL: Record<MslChange, string> = {
  new: "Newly absent",
  recurring: "Still absent",
  recovered: "Back on shelf",
};

const CHANGE_TONE: Record<MslChange, string> = {
  new: "danger",
  recurring: "warning",
  recovered: "success",
};
