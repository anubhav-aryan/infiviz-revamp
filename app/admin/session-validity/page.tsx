import type { Metadata } from "next";
import { RailShell } from "@/app/_components/app-shell";
import { ValidityRulesPanel } from "../_components/validity-rules-panel";
import { SECTION, SECTION_GROUPS } from "../_data/section-nav";

export const metadata: Metadata = {
  title: "Admin · Session validity",
  description: "Per-account thresholds for disabling or reviewing a session.",
};

export default function SessionValidityPage() {
  return (
    <RailShell
      active="admin"
      section={SECTION}
      groups={SECTION_GROUPS}
      activeSection="session-validity"
    >
      <ValidityRulesPanel />
    </RailShell>
  );
}
