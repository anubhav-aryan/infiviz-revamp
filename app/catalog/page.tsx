import type { Metadata } from "next";
import { AppShell } from "@/app/_components/app-shell";
import { Catalog } from "./_components/catalog";

export const metadata: Metadata = {
  title: "Catalog",
  description:
    "Your product catalog, digitised and confirmed — categories, SKUs and their attributes.",
};

export default function CatalogPage() {
  return (
    <AppShell
      active="catalog"
      callout={{
        title: "Phase 2 · Catalog",
        body: "Your product catalog, digitised and confirmed.",
      }}
    >
      <Catalog />
    </AppShell>
  );
}
