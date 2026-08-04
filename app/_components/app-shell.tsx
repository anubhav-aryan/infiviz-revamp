import Link from "next/link";
import type { ReactNode } from "react";
import { Hint } from "./hint";
import { Icon } from "./icon";
import {
  NAV_BY_ID,
  fullNav,
  type NavEntry,
  type NavId,
} from "./nav";
import styles from "./app-shell.module.css";

export type Callout = { title: string; body: string };

type AppShellProps = {
  /** Which surface to highlight. Ignored when `nav` is supplied explicitly. */
  active: NavId;
  /** Override the nav entirely — used by Landing's onboarding states. */
  nav?: NavEntry[];
  /** Screen-specific note pinned to the bottom of the sidebar. */
  callout?: Callout;
  children: ReactNode;
};

export function AppShell({ active, nav, callout, children }: AppShellProps) {
  const entries = nav ?? fullNav(active);

  return (
    <div className={styles.shell}>
      <nav className={styles.sidebar} aria-label="Primary">
        <Link href="/" className={styles.brand}>
          <span className={styles.brandMark} aria-hidden="true">
            iV
          </span>
          <span className={styles.brandName}>InfiViz</span>
        </Link>

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
              >
                <Icon name={item.icon} />
                <span className={styles.navLabel}>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {callout ? (
          <div className={styles.footer}>
            <div className={styles.callout}>
              <div className={styles.calloutTitle}>{callout.title}</div>
              <div className={styles.calloutBody}>{callout.body}</div>
            </div>
          </div>
        ) : null}
      </nav>

      <main className={styles.main}>
        <div className={styles.mainInner}>{children}</div>
      </main>
    </div>
  );
}

/* ---------------------------------------------------------------- */

export type SectionGroup = {
  label: string;
  items: { id: string; label: string; icon: Parameters<typeof Icon>[0]["name"]; href?: string }[];
};

type RailShellProps = {
  active: NavId;
  /** Section-rail heading and caption. */
  section: { title: string; caption: string };
  groups: SectionGroup[];
  /** `id` of the section item to highlight. */
  activeSection: string;
  children: ReactNode;
};

/**
 * Master data's two-rail shell: a collapsed icon-only product rail plus a
 * section rail for the sub-surfaces inside it. Deliberately different from
 * `AppShell` — this section is the only one with its own sub-navigation.
 */
export function RailShell({
  active,
  section,
  groups,
  activeSection,
  children,
}: RailShellProps) {
  return (
    <div className={styles.railShell}>
      <nav className={styles.productRail} aria-label="Products">
        <Link href="/" className={styles.railMark} aria-label="InfiViz home">
          iV
        </Link>
        {Object.values(NAV_BY_ID).map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={styles.railItem}
            data-state={item.id === active ? "active" : "normal"}
            title={item.title}
            aria-label={item.label}
            aria-current={item.id === active ? "page" : undefined}
          >
            <Icon name={item.icon} />
          </Link>
        ))}
      </nav>

      <nav className={styles.sectionRail} aria-label={section.title}>
        <div className={styles.sectionTitle}>{section.title}</div>
        <div className={styles.sectionCaption}>{section.caption}</div>

        {groups.map((group) => (
          <div key={group.label}>
            <div className={styles.sectionGroup}>{group.label}</div>
            {group.items.map((item) =>
              item.href ? (
                <Link
                  key={item.id}
                  href={item.href}
                  className={styles.sectionItem}
                  data-state={item.id === activeSection ? "active" : "normal"}
                  aria-current={item.id === activeSection ? "page" : undefined}
                >
                  <Icon name={item.icon} />
                  {item.label}
                </Link>
              ) : (
                // Sub-surfaces with no design and no route yet. A <button> here
                // would take focus and announce as a control that does nothing,
                // so these stay inert text — the same treatment locked items get
                // in AppShell.
                <span
                  key={item.id}
                  className={styles.sectionItem}
                  data-state="unavailable"
                  aria-disabled="true"
                >
                  <Icon name={item.icon} />
                  {item.label}
                </span>
              ),
            )}
          </div>
        ))}
      </nav>

      <main className={styles.main}>
        <div className={styles.mainInner}>{children}</div>
      </main>
    </div>
  );
}
