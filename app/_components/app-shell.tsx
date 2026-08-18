import Link from "next/link";
import type { ReactNode } from "react";
import { FilterBar, FilterProvider, FilterRegion } from "@/app/_filters/filter-region";
import type { FilterScopeId } from "@/app/_filters/filter-scopes";
import { ChatLauncher } from "./chat/chat-launcher";
import { ChatPaneProvider } from "./chat/chat-pane-context";
import { Icon } from "./icon";
import { Sidebar } from "./sidebar";
import { ToastProvider } from "./toast/toast-context";
import { ToastHost } from "./toast/toast-host";
import { fullNav, type NavEntry, type NavId } from "./nav";
import styles from "./app-shell.module.css";

type AppShellProps = {
  /** Which surface to highlight. Ignored when `nav` is supplied explicitly. */
  active: NavId;
  /** Override the nav entirely — used by Landing's onboarding state. */
  nav?: NavEntry[];
  /**
   * Shows the global filter bar for this scope. Omitted on screens where
   * session filters are meaningless — Catalog, Master data, Tickets — and the
   * bar's absence is the signal that they are not session-scoped.
   */
  filterScope?: FilterScopeId;
  children: ReactNode;
};

/** `.sectionRail`'s width in `app-shell.module.css`, which the toast has to
 *  clear on the two-rail routes. */
const SECTION_RAIL_W = 210;

export function AppShell({ active, nav, filterScope, children }: AppShellProps) {
  const entries = nav ?? fullNav(active);

  return (
    <div className={styles.shell}>
      <Sidebar entries={entries} />

      {/* Paired with the shell rather than the root layout, which is a server
          component with no providers — the same reason `ChatPaneProvider` is
          mounted here and again in `RailShell` below. */}
      <ToastProvider>
        <ChatPaneProvider active={active}>
          <main className={styles.main}>
            {/* The bar sits outside `.mainInner` because every page supplies its
                own padding; inside it, the bar would inherit that inset and stop
                spanning the screen. */}
            {filterScope ? (
              <FilterRegion scope={filterScope}>
                <div className={styles.mainInner}>{children}</div>
              </FilterRegion>
            ) : (
              <div className={styles.mainInner}>{children}</div>
            )}
          </main>

          <ChatLauncher active={active} />
        </ChatPaneProvider>

        <ToastHost />
      </ToastProvider>
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
  /**
   * Section-rail heading and caption. Optional: Analytics carries a persona
   * switcher and a scope picker above its module list and needs no prose on top
   * of them, so it omits this and supplies `railLabel` instead.
   */
  section?: { title: string; caption: string };
  /** The rail's accessible name where there is no `section.title` to use. */
  railLabel?: string;
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
  /** See `AppShellProps.filterScope`. */
  filterScope?: FilterScopeId;
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
        // Keyed by the first item where the label is empty — unlabelled groups
        // would otherwise all share the key "".
        <div key={group.label || group.items[0]?.id}>
          {/* Empty label means the grouping is for ordering and spacing only —
              Analytics groups its nine modules but names none of them. */}
          {group.label ? (
            <div className={styles.sectionGroup}>{group.label}</div>
          ) : null}
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
 * The two-rail shell: the same primary `Sidebar`, collapsed by default, plus a
 * section rail for the sub-surfaces inside the active product. Used by the
 * sections that have their own sub-navigation, where an expanded sidebar and a
 * section rail would together crowd out the content.
 *
 * The sidebar is only *defaulted* collapsed, not forced — the toggle works here
 * exactly as it does under `AppShell`, and the choice carries across both.
 */
export function RailShell({
  active,
  section,
  railLabel,
  groups,
  activeSection,
  railHeader,
  railItems,
  filterScope,
  children,
}: RailShellProps) {
  const shell = (
    <div className={styles.railShell}>
      <Sidebar entries={fullNav(active)} defaultCollapsed />

      <nav className={styles.sectionRail} aria-label={railLabel ?? section?.title}>
        {railHeader ? (
          <div className={styles.railHeader}>{railHeader}</div>
        ) : null}
        {/* Omitted entirely rather than rendered empty — two blank divs still
            take their margins, and Analytics has nothing to put here. */}
        {section ? (
          <>
            <div className={styles.sectionTitle}>{section.title}</div>
            <div className={styles.sectionCaption}>{section.caption}</div>
          </>
        ) : null}

        {railItems ?? <RailGroups groups={groups} activeSection={activeSection} />}
      </nav>

      <ToastProvider>
        <ChatPaneProvider active={active}>
          <main className={styles.main}>
            {filterScope ? (
              <FilterBar scope={filterScope}>
                <div className={styles.mainInner}>{children}</div>
              </FilterBar>
            ) : (
              <div className={styles.mainInner}>{children}</div>
            )}
          </main>

          <ChatLauncher active={active} />
        </ChatPaneProvider>

        {/* Same default the sidebar above gets, or the toast would sit 176px
            adrift of a rail that opened collapsed — plus the section rail's own
            width, which only this shell has. */}
        <ToastHost defaultCollapsed inset={SECTION_RAIL_W} />
      </ToastProvider>
    </div>
  );

  /* The provider wraps the whole shell, not just `<main>`: this rail carries
     filter controls of its own — Analytics' scope picker is a Region/Category
     filter — and they sit beside the content, not under the bar. The bar still
     renders inside `<main>`, where it belongs. */
  return filterScope ? (
    <FilterProvider scope={filterScope}>{shell}</FilterProvider>
  ) : (
    shell
  );
}
