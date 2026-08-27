import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppShell } from "@/app/_components/app-shell";
import { CompareView } from "../../_components/compare-view";
import { SESSION_STORES, visitBySlug } from "../../_data/session-viewer";

/**
 * The Compare button's destination: this store's visits side by side, a
 * timeline of the numbers the viewer shows one capture at a time. Prerendered
 * per store like the viewer itself, and 404s the same way on a slug nobody
 * authored.
 */
export function generateStaticParams() {
  return SESSION_STORES.map(({ slug }) => ({ store: slug }));
}

export const dynamicParams = false;

export async function generateMetadata(
  props: PageProps<"/session-viewer/[store]/compare">,
): Promise<Metadata> {
  const { store } = await props.params;
  const visit = visitBySlug(store);
  if (!visit) return { title: "Compare visits" };

  return {
    title: `Compare visits · ${visit.store}`,
    description: `Every visit to ${visit.store} side by side — metric trends and the must-stock list across captures.`,
  };
}

export default async function CompareSessionsPage(
  props: PageProps<"/session-viewer/[store]/compare">,
) {
  const { store } = await props.params;
  const visit = visitBySlug(store);
  if (!visit) notFound();

  return (
    <AppShell active="session-viewer" defaultCollapsed>
      <CompareView visit={visit} />
    </AppShell>
  );
}
