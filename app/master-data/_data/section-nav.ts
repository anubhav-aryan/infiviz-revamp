import type { SectionGroup } from "@/app/_components/app-shell";

/**
 * The section rail is identical on every Master data surface — the design
 * builds it from one factory and only varies which item is active, which maps
 * onto `RailShell`'s `activeSection` prop.
 *
 * Every configured table is reachable from here. The rail briefly lost the
 * first three to a tab strip above the board, which left it holding only the
 * two unbuilt placeholders — so the section's own navigation read as two dead
 * links. Both are built now, and the rail is one list again.
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
      {
        id: "must-stock",
        label: "Must-stock list",
        icon: "clipboard-list",
        href: "/master-data/must-stock",
      },
      { id: "tasks", label: "Tasks", icon: "list-checks", href: "/master-data/tasks" },
    ],
  },
];
