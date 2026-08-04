import Link from "next/link";
import { Icon } from "@/app/_components/icon";
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
};

/**
 * Stays a Server Component: the active tab arrives as a prop from whichever
 * page is rendering rather than being read from `usePathname`.
 */
export function ReportHeader({ title, active }: ReportHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.headerTop}>
        <div>
          <div className={styles.eyebrow}>Operational reports</div>
          <h1 className={styles.title}>{title}</h1>
          <div className={styles.subtitle}>
            Colgate-Palmolive Vietnam · July 2026
          </div>
        </div>

        <div className={styles.headerActions}>
          <button type="button" className={styles.ghostButton}>
            <Icon name="calendar" />
            This month
            <Icon name="chevron-down" />
          </button>
          <button type="button" className={styles.primaryButton}>
            <Icon name="download" />
            Export CSV
          </button>
        </div>
      </div>

      <nav className={styles.tabs} aria-label="Operational reports">
        {TABS.map((tab) => (
          <Link
            key={tab.id}
            href={tab.href}
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
