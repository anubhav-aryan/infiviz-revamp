import type { Metadata } from "next";
import { AppShell } from "@/app/_components/app-shell";
import { MerchActivityReport } from "./_components/merch-activity-report";

export const metadata: Metadata = {
  title: "Merchandiser activity & store coverage",
  description:
    "Whether the field team is working, and whether the estate is actually being reached.",
};

export default function MerchActivityPage() {
  return (
    <AppShell
      active="merch-activity"
      callout={{
        title: "Phase 1 · Onboarding",
        body: "The reports Customer Success lives in from day one.",
      }}
    >
      <MerchActivityReport />
    </AppShell>
  );
}
