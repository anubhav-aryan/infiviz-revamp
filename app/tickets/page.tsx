import type { Metadata } from "next";
import { Suspense } from "react";
import { AppShell } from "@/app/_components/app-shell";
import { Tickets } from "./_components/tickets";

export const metadata: Metadata = {
  title: "Tickets",
  description:
    "Assign work down the field hierarchy, and turn the platform's own suggestions into tickets.",
};

export default function TicketsPage() {
  return (
    <AppShell active="tickets">
      {/* A "Create ticket" button elsewhere carries context in via
          `?compose=1&...`, read through `useSearchParams`, which needs a
          Suspense boundary — same trade `analytics/page.tsx` documents. */}
      <Suspense fallback={null}>
        <Tickets />
      </Suspense>
    </AppShell>
  );
}
