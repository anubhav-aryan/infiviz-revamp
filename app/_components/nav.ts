import type { IconName } from "./icon";

/**
 * The seven product surfaces. Every design that has a sidebar uses this exact
 * list in this exact order, so it lives here rather than in any one screen.
 */
export type NavId =
  | "activity"
  | "analytics"
  | "store-explorer"
  | "master-data"
  | "catalog"
  | "photo-quality"
  | "merch-activity"
  | "tickets";

export type NavItem = {
  id: NavId;
  label: string;
  /** Short label for the collapsed icon rail's tooltip. */
  title: string;
  icon: IconName;
  href: string;
};

export const NAV: NavItem[] = [
  { id: "activity", label: "Activity", title: "Activity", icon: "activity", href: "/" },
  { id: "analytics", label: "Analytics", title: "Analytics", icon: "bar-chart-3", href: "/analytics" },
  { id: "store-explorer", label: "Store Explorer", title: "Store Explorer", icon: "map", href: "/store-explorer" },
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
];

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
  { id: "store-explorer", state: "normal" },
  { id: "master-data", state: "normal" },
  { id: "photo-quality", state: "normal" },
  { id: "merch-activity", state: "normal" },
  /* Not derived from `NAV` — a surface missing here silently disappears from
     the sidebar during onboarding, with no type error to catch it. Tickets is
     usable as soon as captures arrive, so it is open like the other reports. */
  { id: "tickets", state: "normal" },
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
  return NAV.map((n) => ({
    id: n.id,
    state: n.id === active ? ("active" as const) : ("normal" as const),
  }));
}
