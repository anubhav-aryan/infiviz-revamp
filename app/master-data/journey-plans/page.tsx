import type { Metadata } from "next";
import { RailShell } from "@/app/_components/app-shell";
import { SECTION, SECTION_GROUPS } from "../_data/section-nav";
import { JourneyPlansBoard } from "../_components/journey-plans-board";

export const metadata: Metadata = {
  title: "Journey plans",
  description: "Planned versus completed visits for July 2026, by merchandiser.",
};

export default function JourneyPlansPage() {
  return (
    <RailShell
      active="master-data"
      section={SECTION}
      groups={SECTION_GROUPS}
      activeSection="journey-plans"
    >
      <JourneyPlansBoard />
    </RailShell>
  );
}
