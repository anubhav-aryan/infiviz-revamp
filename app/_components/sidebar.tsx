"use client";

import Link from "next/link";
import { Hint } from "./hint";
import { Icon } from "./icon";
import { NAV_BY_ID, OTHER_APPS, OTHER_APPS_LABEL, type NavEntry } from "./nav";
import { useSidebarCollapsed } from "./use-sidebar-collapsed";
import styles from "./app-shell.module.css";

/**
 * The primary sidebar. Split out of `AppShell` purely so the collapse toggle
 * can be interactive: the shell itself, and every page inside it, stays a
 * server component.
 *
 * Collapsing is one `data-collapsed` attribute driving CSS rather than a second
 * set of markup — labels hide, the rail narrows, and the same links keep their
 * identity, so React never remounts a nav item on toggle.
 */
export function Sidebar({ entries }: { entries: NavEntry[] }) {
  const [collapsed, toggle] = useSidebarCollapsed();

  return (
    <nav
      id="primary-sidebar"
      className={styles.sidebar}
      data-collapsed={collapsed ? "true" : undefined}
      aria-label="Primary"
    >
      <div className={styles.sidebarHead}>
        <Link href="/" className={styles.brand}>
          <span className={styles.brandMark} aria-hidden="true">
            iV
          </span>
          <span className={styles.brandName}>InfiViz</span>
        </Link>

        <button
          type="button"
          className={styles.collapseButton}
          onClick={toggle}
          aria-expanded={!collapsed}
          aria-controls="primary-sidebar"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <Icon name={collapsed ? "chevron-right" : "chevron-left"} size={16} />
        </button>
      </div>

      <div className={styles.nav}>
        {entries.map((entry) => {
          const item = NAV_BY_ID[entry.id];

          // Locked surfaces have no data yet, so they are not navigable.
          if (entry.state === "locked") {
            return (
              // The unlock reason is the only explanation the user gets, so
              // it goes in a focusable Hint rather than a mouse-only `title`.
              <Hint
                key={entry.id}
                text={entry.tooltip ?? "Not available yet"}
                className={styles.navItem}
                data-state="locked"
                data-disabled="true"
              >
                <Icon name={item.icon} />
                <span className={styles.navLabel}>{item.label}</span>
                <span className={styles.lockPill}>Locked</span>
              </Hint>
            );
          }

          return (
            <Link
              key={entry.id}
              href={item.href}
              className={styles.navItem}
              data-state={entry.state}
              aria-current={entry.state === "active" ? "page" : undefined}
              // Collapsed, the label is hidden, so the name has to come from
              // somewhere. Expanded, it would only duplicate visible text.
              title={collapsed ? item.title : undefined}
            >
              <Icon name={item.icon} />
              <span className={styles.navLabel}>{item.label}</span>
            </Link>
          );
        })}

        {/* Inside the scroll region, not beside it, so a short viewport
            scrolls these with the surfaces above rather than clipping them.
            They go nowhere in this build, so — like the routeless section
            items in RailShell — they stay inert text rather than buttons or
            links that would announce as controls and then do nothing. */}
        <div className={styles.otherApps}>
          <div className={styles.otherAppsLabel}>{OTHER_APPS_LABEL}</div>
          {OTHER_APPS.map((app) => (
            <span
              key={app.label}
              className={styles.navItem}
              data-state="unavailable"
              aria-disabled="true"
              title={collapsed ? app.label : undefined}
            >
              <Icon name={app.icon} />
              <span className={styles.navLabel}>{app.label}</span>
            </span>
          ))}
        </div>
      </div>
    </nav>
  );
}
