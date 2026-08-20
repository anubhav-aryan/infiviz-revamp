import type { Metadata } from "next";
import { Suspense } from "react";
import { AppShell } from "@/app/_components/app-shell";
import { RolePicker } from "@/app/_identity/role-picker";
import { Analytics } from "./_components/analytics";

export const metadata: Metadata = {
  title: "Analytics",
  description:
    "On-shelf availability and share of shelf, sliced by one dimension at a time.",
};

export default function AnalyticsPage() {
  return (
    <>
      <AppShell active="analytics" filterScope="analytics">
        {/* Persona, month, dimension, compare and filters round-trip through the
            query string, and `useSearchParams` needs a boundary to suspend on.
            The accepted trade is that the route prerenders the shell and the nav
            around it, and this screen arrives with the client bundle. */}
        <Suspense fallback={null}>
          <Analytics />
        </Suspense>
      </AppShell>
      {/* A sibling of the shell, like the landing screen's demo-state picker:
          it is a walkthrough affordance parked over the page, not chrome
          belonging to any one surface inside it. */}
      <RolePicker />
    </>
  );
}
