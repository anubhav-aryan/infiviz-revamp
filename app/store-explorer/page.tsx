import type { Metadata } from "next";
import { AppShell } from "@/app/_components/app-shell";
import { StoreExplorer } from "./_components/store-explorer";

export const metadata: Metadata = {
  title: "Store Explorer",
  description:
    "Which stores were visited today, and the raw App Images from each visit.",
};

export default function StoreExplorerPage() {
  return (
    <AppShell active="store-explorer">
      <StoreExplorer />
    </AppShell>
  );
}
