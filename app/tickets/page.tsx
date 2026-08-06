import type { Metadata } from "next";
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
      <Tickets />
    </AppShell>
  );
}
