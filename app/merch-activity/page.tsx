import type { Metadata } from "next";
import { AppShell } from "@/app/_components/app-shell";
import { CURRENT_MONTH } from "@/app/_time/periods";
import { MerchActivityReport } from "./_components/merch-activity-report";

export const metadata: Metadata = {
  title: "Merchandiser activity & store coverage",
  description:
    "Whether the field team is working, and whether the estate is actually being reached.",
};

/** The base route is the current month, so existing links keep working. */
export default function MerchActivityPage() {
  return (
    <AppShell active="merch-activity">
      <MerchActivityReport month={CURRENT_MONTH} />
    </AppShell>
  );
}
