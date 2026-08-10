import type { Metadata } from "next";
import { RailShell } from "@/app/_components/app-shell";
import { SECTION, SECTION_GROUPS } from "./_data/section-nav";
import { MasterDataTabs } from "./_components/master-data-tabs";
import { StoresBoard } from "./_components/stores-board";

export const metadata: Metadata = {
  title: "Stores",
  description: "Every store configured for Colgate-Palmolive Vietnam.",
};

export default function StoresPage() {
  return (
    <RailShell
      active="master-data"
      section={SECTION}
      groups={SECTION_GROUPS}
      activeSection="stores"
    >
      <MasterDataTabs active="stores" />
      <StoresBoard />
    </RailShell>
  );
}
