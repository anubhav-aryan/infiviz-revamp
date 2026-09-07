"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ROLES, useRole, type Role } from "@/app/_identity/use-role";
import { DEMO_STATES, useDemoState } from "@/app/_landing/use-demo-state";
import type { LandingStateId } from "@/app/_landing/_data/landing";
import { Hint } from "./hint";
import { Icon } from "./icon";
import { NAV_BY_ID, OTHER_APPS, OTHER_APPS_LABEL, type NavEntry } from "./nav";
import { useSidebarCollapsed } from "./use-sidebar-collapsed";
import styles from "./app-shell.module.css";

/**
 * One navigable row, plus its dropdown when it has children.
 *
 * The row stays a link and the chevron is a separate button beside it, so the
 * label still navigates for anyone used to clicking it — a surface does not
 * lose its destination by gaining children.
 *
 * Two deliberate choices about state:
 *
 * - **Open is seeded from `entry.state`, not the path.** Every page under
 *   `/analytics/*` already passes `active="analytics"` down explicitly, which
 *   is this file's convention for "where am I" — so the dropdown is open
 *   exactly when you are somewhere inside it, with no routing dependency.
 *   It is `useState`, not derived, so a reader can then close it and have that
 *   respected while they stay on the section.
 * - **`usePathname` is used only to mark the current child.** There is no prop
 *   carrying which child is active, and a dropdown that highlights nothing
 *   reads as broken. The comparison is exact rather than prefixed, because
 *   `/analytics` is a prefix of `/analytics/shared` and would otherwise mark
 *   Overview current on every page in the section.
 */
function NavRow({ entry, collapsed }: { entry: NavEntry; collapsed: boolean }) {
  const item = NAV_BY_ID[entry.id];
  const pathname = usePathname();
  const [open, setOpen] = useState(entry.state === "active");

  const children = item.children;

  const link = (
    <Link
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

  if (!children?.length) return link;

  return (
    <>
      {/* The link and its chevron share a row but are separate controls, so
          the row needs a wrapper the CSS can lay out without either one
          swallowing the other's hit area. */}
      <div className={styles.navRow}>
        {link}
        <button
          type="button"
          className={styles.navExpand}
          onClick={() => setOpen((wasOpen) => !wasOpen)}
          aria-expanded={open}
          aria-label={`${open ? "Collapse" : "Expand"} ${item.title}`}
        >
          <Icon name={open ? "chevron-up" : "chevron-down"} size={14} />
        </button>
      </div>

      {/* Collapsed, the rail is icons only and there is nowhere for a label to
          go, so the dropdown is not rendered at all rather than hidden — the
          same reasoning as `.navLabel`, which the collapsed rules hide. */}
      {open && !collapsed ? (
        <div className={styles.navChildren}>
          {children.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              className={styles.navChild}
              data-state={pathname === child.href ? "active" : undefined}
              aria-current={pathname === child.href ? "page" : undefined}
            >
              {child.label}
            </Link>
          ))}
        </div>
      ) : null}
    </>
  );
}

/**
 * The primary sidebar, used by both shells. Split out of `AppShell` purely so
 * the collapse toggle can be interactive: the shell itself, and every page
 * inside it, stays a server component.
 *
 * Collapsing is one `data-collapsed` attribute driving CSS rather than a second
 * set of markup — labels hide, the rail narrows into the dark icon rail, and
 * the same links keep their identity, so React never remounts a nav item on
 * toggle.
 */
export function Sidebar({
  entries,
  defaultCollapsed,
}: {
  entries: NavEntry[];
  /** Collapsed until the user says otherwise — see `useSidebarCollapsed`. */
  defaultCollapsed?: boolean;
}) {
  const [collapsed, toggle] = useSidebarCollapsed(defaultCollapsed);
  const { role, setRole } = useRole();
  const { demoState, setDemoState } = useDemoState();

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
          <span className={styles.brandName}>InfiView</span>
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
            <NavRow key={entry.id} entry={entry} collapsed={collapsed} />
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

      {/* Pinned to the bottom of the rail: the two account-level demo
          controls that used to float over individual screens, then the
          session chrome. Settings and Logout are presentational for now —
          the demo has one shared password and nothing to configure — so they
          carry no handlers rather than handlers that pretend. */}
      <div className={styles.sidebarFoot}>
        <label className={styles.footField}>
          <span className={styles.footLabel}>Role</span>
          <select
            className={styles.footSelect}
            value={role}
            onChange={(event) => setRole(event.target.value as Role)}
          >
            {ROLES.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.label}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.footField}>
          <span className={styles.footLabel}>Account state</span>
          <select
            className={styles.footSelect}
            value={demoState}
            onChange={(event) => setDemoState(event.target.value as LandingStateId)}
          >
            {DEMO_STATES.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.label}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          className={styles.navItem}
          title={collapsed ? "Settings" : undefined}
        >
          <Icon name="settings" />
          <span className={styles.navLabel}>Settings</span>
        </button>
        <button
          type="button"
          className={styles.navItem}
          title={collapsed ? "Logout" : undefined}
        >
          <Icon name="log-out" />
          <span className={styles.navLabel}>Logout</span>
        </button>
      </div>
    </nav>
  );
}
