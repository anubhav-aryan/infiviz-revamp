import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppShell } from "@/app/_components/app-shell";
import { MONTH_BY_KEY, MONTH_KEYS, isMonthKey } from "@/app/_time/periods";
import { PhotoQualityReport } from "../_components/photo-quality-report";

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
  props: PageProps<"/photo-quality/[month]">,
): Promise<Metadata> {
  const { month } = await props.params;
  const label = isMonthKey(month) ? MONTH_BY_KEY[month].label : month;
  return {
    title: `Photo quality · ${label}`,
    description: `How many captures passed quality checks in ${label}, why the rest were rejected, and who was sending them.`,
  };
}

export default async function PhotoQualityMonthPage(
  props: PageProps<"/photo-quality/[month]">,
) {
  const { month } = await props.params;
  if (!isMonthKey(month)) notFound();

  return (
    <AppShell active="photo-quality">
      <PhotoQualityReport month={month} />
    </AppShell>
  );
}
