import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RailShell } from "@/app/_components/app-shell";
import { MONTH_BY_KEY, MONTH_KEYS, isMonthKey } from "@/app/_time/periods";
import { SECTION, SECTION_GROUPS } from "../../_data/section-nav";
import { JourneyPlansBoard } from "../../_components/journey-plans-board";

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
  props: PageProps<"/master-data/journey-plans/[month]">,
): Promise<Metadata> {
  const { month } = await props.params;
  const label = isMonthKey(month) ? MONTH_BY_KEY[month].label : month;
  return {
    title: `Journey plans · ${label}`,
    description: `Planned versus completed visits for ${label}, by merchandiser.`,
  };
}

export default async function JourneyPlansMonthPage(
  props: PageProps<"/master-data/journey-plans/[month]">,
) {
  const { month } = await props.params;
  if (!isMonthKey(month)) notFound();

  return (
    <RailShell
      active="master-data"
      section={SECTION}
      groups={SECTION_GROUPS}
      activeSection="journey-plans"
    >
      <JourneyPlansBoard month={month} />
    </RailShell>
  );
}
