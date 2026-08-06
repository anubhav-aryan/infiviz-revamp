import type { SectionGroup } from "@/app/_components/app-shell";

/**
 * The section rail is identical on every Master data surface — the design
 * builds it from one factory and only varies which item is active, which maps
 * onto `RailShell`'s `activeSection` prop.
 */

export const SECTION = {
  title: "Master data",
  caption: "Confirm everything we've configured for you.",
};

export const SECTION_GROUPS: SectionGroup[] = [
  {
    label: "Configured data",
    items: [
      { id: "stores", label: "Stores", icon: "store", href: "/master-data" },
      { id: "users", label: "Users", icon: "users", href: "/master-data/users" },
      {
        id: "journey-plans",
        label: "Journey plans",
        icon: "calendar-days",
        href: "/master-data/journey-plans",
      },
      // Neither surface was designed, so they have no route; `RailShell`
      // renders href-less items as inert buttons.
      { id: "must-stock", label: "Must-stock list", icon: "clipboard-list" },
      { id: "tasks", label: "Tasks", icon: "list-checks" },
    ],
  },
];
