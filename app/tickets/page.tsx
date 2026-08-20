import type { Metadata } from "next";
import { Suspense } from "react";
import { AppShell } from "@/app/_components/app-shell";
import { RolePicker } from "@/app/_identity/role-picker";
import { Tickets } from "./_components/tickets";

export const metadata: Metadata = {
  title: "Tickets",
  description:
    "Assign work down the field hierarchy, and turn the platform's own suggestions into tickets.",
};

export default function TicketsPage() {
  return (
    <>
      <AppShell active="tickets">
        {/* A "Create ticket" button elsewhere carries context in via
            `?compose=1&...`, read through `useSearchParams`, which needs a
            Suspense boundary — same trade `analytics/page.tsx` documents. */}
        <Suspense fallback={null}>
          <Tickets />
        </Suspense>
      </AppShell>
      {/* The role decides both the visible pool and who a ticket can be
          assigned to, so the switch belongs on this screen as much as on
          Analytics. */}
      <RolePicker />
    </>
  );
}
