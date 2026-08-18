import type { Metadata } from "next";
import { RailShell } from "@/app/_components/app-shell";
import { SECTION, SECTION_GROUPS } from "../_data/section-nav";
import { MustStockBoard } from "../_components/must-stock-board";

export const metadata: Metadata = {
  title: "Must-stock list",
  description: "The SKUs every store is expected to carry, by store group.",
};

export default function MustStockPage() {
  return (
    <RailShell
      active="master-data"
      section={SECTION}
      groups={SECTION_GROUPS}
      activeSection="must-stock"
    >
      <MustStockBoard />
    </RailShell>
  );
}
