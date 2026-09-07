import type { IconName } from "./icon";

/**
 * The seven product surfaces. Every design that has a sidebar uses this exact
 * list in this exact order, so it lives here rather than in any one screen.
 */
export type NavId =
  | "activity"
  | "analytics"
  | "session-viewer"
  | "master-data"
  | "catalog"
  | "photo-quality"
  | "merch-activity"
  | "tickets"
  | "infichat"
  | "admin";

/**
 * A row inside a nav item's dropdown.
 *
 * Deliberately *not* a `NavId`. A `NavId` is a product surface: it owns an
 * icon, an entry in the collapsed rail, an `active` prop that every page in it
 * passes down, and a line in `NAV_CAPTURING`. These are none of those — they
 * are links in a disclosure, and widening `NavId` for them would force
 * `NAV_BY_ID`, `fullNav` and both shells' `active` props to grow a case for a
 * row that never appears in any of those places.
 */
export type NavChild = { label: string; href: string };

export type NavItem = {
  id: NavId;
  label: string;
  /** Short label for the collapsed icon rail's tooltip. */
  title: string;
  icon: IconName;
  href: string;
  /**
   * Sub-surfaces reached from a dropdown under this row. The item stays its
   * own link — the chevron expands, the label still navigates — so adding
   * children never takes a destination away from someone who had it.
   *
   * The first child is conventionally the item's own `href` under a plainer
   * name ("Overview"), so the dropdown is a complete list of where it goes
   * rather than a list of everywhere *except* the obvious place.
   */
  children?: NavChild[];
  /**
   * Internal tooling, not part of the client's product. Present here so it is a
   * valid `NavId` for the shells, but filtered out of both the sidebar and the
   * icon rail — a PDM's staging console has no business in a client's nav.
   */
  internal?: true;
};

export const NAV: NavItem[] = [
  { id: "activity", label: "Activity", title: "Activity", icon: "activity", href: "/" },
  {
    id: "analytics",
    label: "Analytics",
    title: "Analytics",
    icon: "bar-chart-3",
    href: "/analytics",
    children: [
      { label: "Overview", href: "/analytics" },
      { label: "Shared Analytics", href: "/analytics/shared" },
      { label: "Boards", href: "/analytics/boards" },
    ],
  },
  { id: "session-viewer", label: "Session Viewer", title: "Session Viewer", icon: "image", href: "/session-viewer" },
  { id: "master-data", label: "Master data", title: "Master data", icon: "database", href: "/master-data" },
  { id: "catalog", label: "Catalog", title: "Catalog", icon: "package", href: "/catalog" },
  { id: "photo-quality", label: "Photo quality", title: "Photo quality", icon: "camera", href: "/photo-quality" },
  {
    id: "merch-activity",
    label: "Merch activity & coverage",
    title: "Merch activity & coverage",
    icon: "users",
    href: "/merch-activity",
  },
  { id: "tickets", label: "Tickets", title: "Tickets", icon: "list-checks", href: "/tickets" },
  { id: "infichat", label: "InfiChat", title: "InfiChat", icon: "sparkles", href: "/infichat" },
  {
    id: "admin",
    label: "Admin",
    title: "Admin",
    icon: "sliders-horizontal",
    href: "/admin",
    internal: true,
  },
];

/** What a client actually sees — every nav surface except internal tooling. */
export const PRODUCT_NAV = NAV.filter((item) => !item.internal);

export const NAV_BY_ID = Object.fromEntries(NAV.map((n) => [n.id, n])) as Record<
  NavId,
  NavItem
>;

/**
 * The onboarding phase shows a reduced nav where surfaces that have no
 * data yet are visibly locked rather than absent.
 */
export type NavState = "active" | "normal" | "locked";

export type NavEntry = {
  id: NavId;
  state: NavState;
  /** Tooltip explaining what unlocks a locked surface. */
  tooltip?: string;
};

export const UNLOCK = {
  catalog: "Unlocks when your catalog is digitised",
  analytics: "Unlocks when the first sessions are processed",
} as const;

/** Onboarding — master data configured, captures beginning, no analytics yet. */
export const NAV_CAPTURING: NavEntry[] = [
  { id: "activity", state: "active" },
  { id: "session-viewer", state: "normal" },
  { id: "master-data", state: "normal" },
  { id: "photo-quality", state: "normal" },
  { id: "merch-activity", state: "normal" },
  /* Not derived from `NAV` — a surface missing here silently disappears from
     the sidebar during onboarding, with no type error to catch it. Tickets is
     usable as soon as captures arrive, so it is open like the other reports. */
  { id: "tickets", state: "normal" },
  /* Fully mocked, no data dependency — available from the first screen rather
     than gated behind onboarding like Catalog/Analytics. */
  { id: "infichat", state: "normal" },
  { id: "catalog", state: "locked", tooltip: UNLOCK.catalog },
  { id: "analytics", state: "locked", tooltip: UNLOCK.analytics },
];

/**
 * Sibling applications, shown below the InfiViz surfaces. Deliberately not part
 * of `NAV`: they have no route in this app, so they carry no `id`, no `href`
 * and no active state, and every shell renders them inert. Power BI is
 * Microsoft's, hence the neutral "Other apps" heading rather than a suite name.
 */
export const OTHER_APPS_LABEL = "Other apps";

export type OtherApp = { label: string; icon: IconName };

export const OTHER_APPS: OtherApp[] = [
  { label: "InfiHub", icon: "boxes" },
  { label: "Infilytics", icon: "pie-chart" },
  { label: "Infi-C-Brain", icon: "brain" },
  { label: "Power BI", icon: "presentation" },
  { label: "Data Quality Studio", icon: "shield-check" },
  { label: "InfiDocs", icon: "file-text" },
];

/** The full nav, with one surface marked active. */
export function fullNav(active: NavId): NavEntry[] {
  return PRODUCT_NAV.map((n) => ({
    id: n.id,
    state: n.id === active ? ("active" as const) : ("normal" as const),
  }));
}
