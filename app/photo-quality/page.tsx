import type { Metadata } from "next";
import { AppShell } from "@/app/_components/app-shell";
import { CURRENT_MONTH } from "@/app/_time/periods";
import { PhotoQualityReport } from "./_components/photo-quality-report";

export const metadata: Metadata = {
  title: "Photo quality",
  description:
    "How many captures pass quality checks, why the rest were rejected, and who is sending them.",
};

/** The base route is the current month, so existing links keep working. */
export default function PhotoQualityPage() {
  return (
    <AppShell
      active="photo-quality"
      callout={{
        title: "Phase 1 · Onboarding",
        body: "The reports Customer Success lives in from day one.",
      }}
    >
      <PhotoQualityReport month={CURRENT_MONTH} />
    </AppShell>
  );
}
