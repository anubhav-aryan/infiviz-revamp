import type { Metadata } from "next";
import { RailShell } from "@/app/_components/app-shell";
import { SECTION, SECTION_GROUPS } from "../_data/section-nav";
import { UsersSketch } from "../_components/users-sketch";

export const metadata: Metadata = {
  title: "Users",
  description: "Merchandisers and supervisors configured on the account.",
};

export default function UsersPage() {
  return (
    <RailShell
      active="master-data"
      section={SECTION}
      groups={SECTION_GROUPS}
      activeSection="users"
    >
      <UsersSketch />
    </RailShell>
  );
}
