import type { Metadata } from "next";
import { RailShell } from "@/app/_components/app-shell";
import { CURRENT_MONTH } from "@/app/_time/periods";
import { SECTION, SECTION_GROUPS } from "../_data/section-nav";
import { JourneyPlansBoard } from "../_components/journey-plans-board";

export const metadata: Metadata = {
  title: "Journey plans",
  description: "Planned versus completed visits for July 2026, by merchandiser.",
};

/** The base route is the current month, so existing links keep working. */
export default function JourneyPlansPage() {
  return (
    <RailShell
      active="master-data"
      section={SECTION}
      groups={SECTION_GROUPS}
      activeSection="journey-plans"
    >
      <JourneyPlansBoard month={CURRENT_MONTH} />
    </RailShell>
  );
}
