import type { SectionGroup } from "@/app/_components/app-shell";

export const SECTION = {
  title: "Admin",
  caption: "Internal — account configuration, not part of the client's product.",
};

export const SECTION_GROUPS: SectionGroup[] = [
  {
    label: "Client dashboard",
    items: [
      {
        id: "metrics",
        label: "Metrics & charts",
        icon: "bar-chart-3",
        href: "/admin",
        sub: "What this client sees",
      },
    ],
  },
  {
    label: "Data quality",
    items: [
      {
        id: "session-validity",
        label: "Session validity",
        icon: "shield-alert",
        href: "/admin/session-validity",
        sub: "Thresholds feeding the review queue",
      },
    ],
  },
];
