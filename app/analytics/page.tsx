import type { Metadata } from "next";
import { Suspense } from "react";
import { AppShell } from "@/app/_components/app-shell";
import { Analytics } from "./_components/analytics";

export const metadata: Metadata = {
  title: "Analytics",
  description:
    "On-shelf availability and share of shelf, sliced by one dimension at a time.",
};

export default function AnalyticsPage() {
  return (
    <AppShell active="analytics">
      {/* Persona, month, dimension, compare and filters round-trip through the
          query string, and `useSearchParams` needs a boundary to suspend on.
          The accepted trade is that the route prerenders the shell and the nav
          around it, and this screen arrives with the client bundle. */}
      <Suspense fallback={null}>
        <Analytics />
      </Suspense>
    </AppShell>
  );
}
