import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppShell } from "@/app/_components/app-shell";
import { MONTH_BY_KEY, MONTH_KEYS, isMonthKey } from "@/app/_time/periods";
import { MerchActivityReport } from "../_components/merch-activity-report";

/**
 * One prerendered page per authored month. `dynamicParams = false` means an
 * unknown month 404s at the edge rather than trying to render data that was
 * never authored.
 */
export function generateStaticParams() {
  return MONTH_KEYS.map((month) => ({ month }));
}

export const dynamicParams = false;

export async function generateMetadata(
  props: PageProps<"/merch-activity/[month]">,
): Promise<Metadata> {
  const { month } = await props.params;
  const label = isMonthKey(month) ? MONTH_BY_KEY[month].label : month;
  return {
    title: `Merchandiser activity & store coverage · ${label}`,
    description: `Whether the field team was working in ${label}, and whether the estate was actually being reached.`,
  };
}

export default async function MerchActivityMonthPage(
  props: PageProps<"/merch-activity/[month]">,
) {
  const { month } = await props.params;
  if (!isMonthKey(month)) notFound();

  return (
    <AppShell active="merch-activity">
      <MerchActivityReport month={month} />
    </AppShell>
  );
}
