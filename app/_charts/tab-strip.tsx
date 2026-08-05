import Link from "next/link";
import { Icon, type IconName } from "@/app/_components/icon";
import styles from "./charts.module.css";

/**
 * The module tab strip — Analytics · Gap Analysis · Actions · … Extracted from
 * `_reports/report-header.tsx`, which had the same markup inline.
 *
 * Tabs are `<Link>`s, not buttons: a tab is a location (`/analytics/[persona]/
 * [module]/[tab]`), so it should be middle-clickable, deep-linkable and
 * prerendered. View state — month, filters, metric toggles — stays in the
 * query string and is carried across by `query`.
 */

export type Tab = {
  id: string;
  label: string;
  href: string;
  icon?: IconName;
};

export function TabStrip({
  tabs,
  active,
  label,
  query = "",
}: {
  tabs: Tab[];
  active: string;
  /** Accessible name for the strip, e.g. "Category Management views". */
  label: string;
  /** Serialized query string to preserve across tabs, including the `?`. */
  query?: string;
}) {
  return (
    <nav className={styles.tabs} aria-label={label}>
      {tabs.map((tab) => (
        <Link
          key={tab.id}
          href={`${tab.href}${query}`}
          className={styles.tab}
          data-active={tab.id === active}
          aria-current={tab.id === active ? "page" : undefined}
        >
          {tab.icon ? <Icon name={tab.icon} size={15} /> : null}
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
