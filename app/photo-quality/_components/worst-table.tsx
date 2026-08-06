"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/app/_components/icon";
import { Bar } from "@/app/_reports/marks";
import type { WorstRow } from "../_data/photo-quality";
import shared from "@/app/_reports/reports.module.css";
import styles from "./photo-quality.module.css";

/**
 * Merchandisers by rejection rate, with each row expandable to the stores
 * behind it.
 *
 * A rejection rate says who to talk to; the stores say what to talk about. The
 * two were previously a table and a dead end, so the drill-down lives inline
 * rather than on another screen — the reader stays where the comparison is.
 *
 * Client only for the open-row set; the rows themselves are built on the server
 * like the rest of the report.
 */
export function WorstTable({ rows }: { rows: WorstRow[] }) {
  const [open, setOpen] = useState<string[]>([]);

  const toggle = (mrch: string) =>
    setOpen((current) =>
      current.includes(mrch)
        ? current.filter((entry) => entry !== mrch)
        : [...current, mrch],
    );

  return (
    <>
      <div
        className={`${styles.worstGrid} ${shared.tableHead} ${styles.worstHeadRow}`}
      >
        <span>Merchandiser</span>
        <span>Supervisor</span>
        <span>Region</span>
        <span className={shared.numRight}>Captures</span>
        <span className={shared.numRight}>Rejection rate</span>
        <span>Top reason</span>
        <span className={styles.srOnly}>Stores</span>
      </div>

      {rows.map((row) => {
        const isOpen = open.includes(row.mrch);
        return (
          <div key={row.mrch}>
            <div
              className={`${styles.worstGrid} ${shared.tableRow} ${styles.worstRow}`}
              data-open={isOpen}
            >
              <span className={styles.worstMrch}>{row.mrch}</span>
              <span className={styles.worstText}>{row.supervisor}</span>
              <span className={styles.worstText}>{row.region}</span>
              <span className={styles.worstCaptures}>{row.captures}</span>
              <span className={styles.worstRate}>
                <Bar pct={row.width} height={6} track="w90" />
                <span className={styles.rateValue} data-tier={row.tier}>
                  {row.rate}%
                </span>
              </span>
              <span className={styles.worstText}>{row.reason}</span>

              <button
                type="button"
                className={styles.expandButton}
                onClick={() => toggle(row.mrch)}
                aria-expanded={isOpen}
                aria-label={`${isOpen ? "Hide" : "Show"} stores with rejected images for ${row.mrch}`}
                disabled={row.stores.length === 0}
              >
                <Icon name={isOpen ? "chevron-down" : "chevron-right"} size={16} />
              </button>
            </div>

            {isOpen ? (
              <div className={styles.storePanel}>
                <div className={styles.storeHeadRow}>
                  <span>Store name</span>
                  <span>Store code</span>
                  <span>Visit date</span>
                  <span />
                </div>

                {row.stores.map((store) => (
                  <div key={store.code} className={styles.storeRow}>
                    <span className={styles.storeName}>{store.store}</span>
                    <span className={styles.storeCode}>{store.code}</span>
                    <span className={styles.storeDate}>{store.visited}</span>
                    {store.href ? (
                      <Link href={store.href} className={styles.storeLink}>
                        View images
                        <Icon name="arrow-up-right" size={13} />
                      </Link>
                    ) : (
                      <span
                        className={styles.storeLink}
                        data-inert="true"
                        title="No captures stored for this visit"
                      >
                        View images
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        );
      })}
    </>
  );
}
