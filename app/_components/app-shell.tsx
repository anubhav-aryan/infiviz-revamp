import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "./icon";
import { Sidebar } from "./sidebar";
import {
  NAV_BY_ID,
  OTHER_APPS,
  fullNav,
  type NavEntry,
  type NavId,
} from "./nav";
import styles from "./app-shell.module.css";

type AppShellProps = {
  /** Which surface to highlight. Ignored when `nav` is supplied explicitly. */
  active: NavId;
  /** Override the nav entirely — used by Landing's onboarding state. */
  nav?: NavEntry[];
  children: ReactNode;
};

export function AppShell({ active, nav, children }: AppShellProps) {
  const entries = nav ?? fullNav(active);

  return (
    <div className={styles.shell}>
      <Sidebar entries={entries} />

      <main className={styles.main}>
        <div className={styles.mainInner}>{children}</div>
      </main>
    </div>
  );
}

/* ---------------------------------------------------------------- */

export type SectionGroup = {
  label: string;
  items: {
    id: string;
    label: string;
    icon: Parameters<typeof Icon>[0]["name"];
    href?: string;
    /** One-line caption under the label. Icon plus name alone is thin at 210px. */
    sub?: string;
  }[];
};

type RailShellProps = {
  active: NavId;
  /** Section-rail heading and caption. */
  section: { title: string; caption: string };
  groups: SectionGroup[];
  /** `id` of the section item to highlight. */
  activeSection: string;
  /**
   * Slot above the section title. Analytics puts its persona switcher here,
   * because the persona is what decides which modules the rail lists below —
   * the control has to sit above the thing it governs.
   */
  railHeader?: ReactNode;
  /**
   * Replaces the rendered `groups` when a section needs its links to carry
   * something the server cannot know — Analytics appends the current scope,
   * month and measure so navigating the rail does not drop them. The default is
   * `RailGroups` over the same `groups`, which is also what a Suspense fallback
   * should render so the prerendered HTML is identical either way.
   */
  railItems?: ReactNode;
  children: ReactNode;
};

/**
 * The section rail's grouped links.
 *
 * Split out of `RailShell` so a client component can render exactly this markup
 * with query-carrying hrefs. Both callers use the same classes, which is what
 * stops the two renderings from drifting apart visually.
 */
export function RailGroups({
  groups,
  activeSection,
}: {
  groups: SectionGroup[];
  activeSection: string;
}) {
  return (
    <>
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
                <span className={styles.sectionItemBody}>
                  {item.label}
                  {item.sub ? (
                    <span className={styles.sectionItemSub}>{item.sub}</span>
                  ) : null}
                </span>
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
    </>
  );
}

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
  railHeader,
  railItems,
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

        {/* Same sibling apps as AppShell's sidebar, so the nav doesn't lose
            entries on the routes that use this rail. Inert, hence a plain
            `title` — there is no focusable control here to hint against. */}
        <span className={styles.railDivider} aria-hidden="true" />
        {OTHER_APPS.map((app) => (
          <span
            key={app.label}
            className={styles.railItem}
            data-state="unavailable"
            title={app.label}
            aria-label={app.label}
            aria-disabled="true"
          >
            <Icon name={app.icon} />
          </span>
        ))}
      </nav>

      <nav className={styles.sectionRail} aria-label={section.title}>
        {railHeader ? (
          <div className={styles.railHeader}>{railHeader}</div>
        ) : null}
        <div className={styles.sectionTitle}>{section.title}</div>
        <div className={styles.sectionCaption}>{section.caption}</div>

        {railItems ?? <RailGroups groups={groups} activeSection={activeSection} />}
      </nav>

      <main className={styles.main}>
        <div className={styles.mainInner}>{children}</div>
      </main>
    </div>
  );
}
