import Link from "next/link";
import { Icon } from "@/app/_components/icon";
import type { CsvTable } from "@/app/_export/csv";
import { ExportButton } from "@/app/_export/export-button";
import { MONTH_BY_KEY, type MonthKey, stepMonth } from "@/app/_time/periods";
import styles from "./reports.module.css";

/** The two operational reports. In the design these were tabs over one shell. */
export type ReportTab = "photo-quality" | "merch-activity";

const TABS = [
  {
    id: "photo-quality",
    href: "/photo-quality",
    icon: "camera",
    label: "Photo quality",
  },
  {
    id: "merch-activity",
    href: "/merch-activity",
    icon: "users",
    label: "Merchandiser activity & store coverage",
  },
] as const;

type ReportHeaderProps = {
  /** Page h1. Doubles as the label of the tab that is currently rendering. */
  title: string;
  active: ReportTab;
  month: MonthKey;
  /** The active report's own route. The stepper and the CSV filename both
      come off it, so neither can drift from the tab you are on. */
  basePath: string;
  /** Serialized by the page: `ExportButton` is a Client Component, so a column
      accessor could not cross the boundary. */
  csv: CsvTable;
  /** Deep analytics for this report, in the Analytics module section. */
  detailHref?: string;
};

/**
 * Stays a Server Component: the active tab arrives as a prop from whichever
 * page is rendering rather than being read from `usePathname`, and the month
 * control is two links rather than a menu.
 */
export function ReportHeader({
  title,
  active,
  month,
  basePath,
  csv,
  detailHref,
}: ReportHeaderProps) {
  const previous = stepMonth(month, -1);
  const next = stepMonth(month, 1);

  return (
    <div className={styles.header}>
      <div className={styles.headerTop}>
        <div>
          <div className={styles.eyebrow}>Operational reports</div>
          <h1 className={styles.title}>{title}</h1>
          <div className={styles.subtitle}>
            Colgate-Palmolive Vietnam · {MONTH_BY_KEY[month].label}
          </div>
        </div>

        <div className={styles.headerActions}>
          <div className={styles.monthStepper}>
            {/* Inert at the ends of the authored Feb–Jul window rather than
                linking to a month with no data behind it. */}
            {previous ? (
              <Link
                href={`${basePath}/${previous}`}
                className={styles.stepperArrow}
                aria-label="Previous month"
              >
                <Icon name="chevron-left" />
              </Link>
            ) : (
              <span
                className={styles.stepperArrow}
                data-disabled="true"
                aria-hidden="true"
              >
                <Icon name="chevron-left" />
              </span>
            )}
            <span className={styles.monthLabel}>
              {MONTH_BY_KEY[month].label}
            </span>
            {next ? (
              <Link
                href={`${basePath}/${next}`}
                className={styles.stepperArrow}
                aria-label="Next month"
              >
                <Icon name="chevron-right" />
              </Link>
            ) : (
              <span
                className={styles.stepperArrow}
                data-disabled="true"
                aria-hidden="true"
              >
                <Icon name="chevron-right" />
              </span>
            )}
          </div>

          {detailHref ? (
            <Link href={detailHref} className={styles.secondaryButton}>
              View detailed analytics
              <Icon name="arrow-up-right" size={14} />
            </Link>
          ) : null}

          <ExportButton
            table={csv}
            filename={`${basePath.slice(1)}-${month}`}
            className={styles.primaryButton}
          />
        </div>
      </div>

      <nav className={styles.tabs} aria-label="Operational reports">
        {TABS.map((tab) => (
          <Link
            key={tab.id}
            /* Carries the month across, so switching report keeps the period
               instead of silently snapping back to the current one. */
            href={`${tab.href}/${month}`}
            className={styles.tab}
            data-active={tab.id === active}
            aria-current={tab.id === active ? "page" : undefined}
          >
            <Icon name={tab.icon} />
            {tab.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
