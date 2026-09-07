import type { Metadata } from "next";
import { Suspense } from "react";
import { AppShell } from "@/app/_components/app-shell";
import { SharedAnalytics } from "../_components/shared-analytics";

export const metadata: Metadata = {
  title: "Shared Analytics",
  description:
    "Views your team shared with you, the ones you saved, and boards of your own.",
};

/**
 * A static sibling of the `[persona]` segment. It passes `active="analytics"`
 * like every other route in this section, which is what keeps the sidebar row
 * — and its dropdown — showing where you are.
 */
export default function SharedAnalyticsPage() {
  return (
    <AppShell active="analytics" filterScope="analytics">
      {/* The board selection and a shared board's contents round-trip through
          the query string, and `useSearchParams` needs a boundary to suspend
          on — the same trade `/analytics` makes. */}
      <Suspense fallback={null}>
        <SharedAnalytics />
      </Suspense>
    </AppShell>
  );
}
