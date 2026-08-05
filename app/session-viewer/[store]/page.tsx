import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppShell } from "@/app/_components/app-shell";
import { SessionViewer } from "../_components/session-viewer";
import {
  SESSION_STORES,
  sessionFor,
  visitBySlug,
} from "../_data/session-viewer";

/**
 * One prerendered page per store in the Store Explorer visit list, so an
 * Analytics or Store Explorer row can deep-link to the session it is about.
 * `dynamicParams = false` means a slug that was never authored 404s at the edge
 * instead of rendering an empty session.
 */
export function generateStaticParams() {
  return SESSION_STORES.map(({ slug }) => ({ store: slug }));
}

export const dynamicParams = false;

export async function generateMetadata(
  props: PageProps<"/session-viewer/[store]">,
): Promise<Metadata> {
  const { store } = await props.params;
  const visit = visitBySlug(store);
  if (!visit) return { title: "Session Viewer" };

  return {
    title: `Session Viewer · ${visit.store}`,
    description: `The stitched shelf, the recognition boxes and the numbers behind the ${visit.time} visit to ${visit.store}.`,
  };
}

export default async function StoreSessionPage(
  props: PageProps<"/session-viewer/[store]">,
) {
  const { store } = await props.params;
  const visit = visitBySlug(store);
  // Unreachable while `dynamicParams` is false, but it is what narrows `visit`
  // and what keeps the page honest if that flag is ever relaxed.
  if (!visit) notFound();

  return (
    // Analytics stays highlighted: this surface has no nav entry of its own and
    // is only ever reached by drilling into an Analytics number.
    <AppShell active="analytics">
      <SessionViewer session={sessionFor(visit)} />
    </AppShell>
  );
}
