import type { SectionGroup } from "@/app/_components/app-shell";

/**
 * The section rail is identical on every Master data surface — the design
 * builds it from one factory and only varies which item is active, which maps
 * onto `RailShell`'s `activeSection` prop.
 *
 * Stores/Users/Journey plans used to switch via this rail (each carried its
 * own `href`); that job now belongs to `MasterDataTabs`, a strip at the top of
 * the scrollable pane — see `_components/master-data-tabs.tsx`. The rail
 * itself stays fixed and is left with only the still-unbuilt surfaces, in the
 * same href-less/inert treatment they already had.
 */

export const SECTION = {
  title: "Master data",
  caption: "Confirm everything we've configured for you.",
};

export const SECTION_GROUPS: SectionGroup[] = [
  {
    label: "Configured data",
    items: [
      // Neither surface was designed, so they have no route; `RailShell`
      // renders href-less items as inert buttons.
      { id: "must-stock", label: "Must-stock list", icon: "clipboard-list" },
      { id: "tasks", label: "Tasks", icon: "list-checks" },
    ],
  },
];
