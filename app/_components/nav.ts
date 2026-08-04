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
  | "merch-activity";

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
];

export const NAV_BY_ID = Object.fromEntries(NAV.map((n) => [n.id, n])) as Record<
  NavId,
  NavItem
>;

/**
 * Landing's onboarding states show a reduced nav where surfaces that have no
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
  configured: "Available once master data is configured",
} as const;

/** State A — empty account, master data hasn't arrived. */
export const NAV_ONBOARDING: NavEntry[] = [
  { id: "activity", state: "active" },
  { id: "store-explorer", state: "locked", tooltip: UNLOCK.configured },
  { id: "master-data", state: "locked", tooltip: "Configuring now" },
  { id: "catalog", state: "locked", tooltip: UNLOCK.catalog },
  { id: "analytics", state: "locked", tooltip: UNLOCK.analytics },
];

/** State B — master data configured, captures beginning, no analytics yet. */
export const NAV_CAPTURING: NavEntry[] = [
  { id: "activity", state: "active" },
  { id: "store-explorer", state: "normal" },
  { id: "master-data", state: "normal" },
  { id: "photo-quality", state: "normal" },
  { id: "merch-activity", state: "normal" },
  { id: "catalog", state: "locked", tooltip: UNLOCK.catalog },
  { id: "analytics", state: "locked", tooltip: UNLOCK.analytics },
];

/** The full nav, with one surface marked active. */
export function fullNav(active: NavId): NavEntry[] {
  return NAV.map((n) => ({
    id: n.id,
    state: n.id === active ? ("active" as const) : ("normal" as const),
  }));
}
