import type { Metadata } from "next";
import { AppShell } from "@/app/_components/app-shell";
import { Analytics } from "./_components/analytics";

export const metadata: Metadata = {
  title: "Analytics",
  description:
    "On-shelf availability and share of shelf, sliced by one dimension at a time.",
};

export default function AnalyticsPage() {
  return (
    <AppShell
      active="analytics"
      callout={{
        title: "One question at a time",
        body: "No nested tabs. Scope by breadcrumb, slice by one picker.",
      }}
    >
      <Analytics />
    </AppShell>
  );
}
