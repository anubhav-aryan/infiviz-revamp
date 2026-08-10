import Link from "next/link";
import styles from "./master-data.module.css";

type MasterDataTab = "stores" | "users" | "journey-plans";

const TABS: { id: MasterDataTab; label: string; href: string }[] = [
  { id: "stores", label: "Stores", href: "/master-data" },
  { id: "users", label: "Users", href: "/master-data/users" },
  { id: "journey-plans", label: "Journey plans", href: "/master-data/journey-plans" },
];

/**
 * Store / Users / Journey plans used to switch via the section rail; now the
 * rail is fixed (just a "Master data" heading + the still-inert Must-stock/
 * Tasks placeholders) and this strip, at the top of the scrollable pane,
 * carries the switching instead. Still real `<Link>` navigation across the
 * same 3 routes, not client-side tab state — keeps each board a Server
 * Component and leaves Journey Plans' own month-in-path stepper untouched.
 */
export function MasterDataTabs({ active }: { active: MasterDataTab }) {
  return (
    <nav className={styles.tabs} aria-label="Master data sections">
      {TABS.map((tab) => (
        <Link
          key={tab.id}
          href={tab.href}
          className={styles.tab}
          data-active={tab.id === active}
          aria-current={tab.id === active ? "page" : undefined}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
