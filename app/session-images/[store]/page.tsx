import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppShell } from "@/app/_components/app-shell";
import { SessionImages } from "../_components/session-images";
import {
  SESSION_IMAGE_STORES,
  storeForSlug,
} from "../_data/session-images";

/**
 * One prerendered page per store that has captures, enumerated from the
 * canonical list in `_data/session-images.ts`. `dynamicParams = false` means a
 * store outside that list 404s — which is exactly why every "View images" link
 * on the platform builds its href from the same list.
 */
export function generateStaticParams() {
  return SESSION_IMAGE_STORES.map(({ slug }) => ({ store: slug }));
}

export const dynamicParams = false;

export async function generateMetadata(
  props: PageProps<"/session-images/[store]">,
): Promise<Metadata> {
  const { store } = await props.params;
  const entry = storeForSlug(store);
  return {
    title: entry ? `${entry.name} · Session images` : "Session images",
    description: "The captures behind a store visit, stacked by category.",
  };
}

export default async function SessionImagesPage(
  props: PageProps<"/session-images/[store]">,
) {
  const { store } = await props.params;
  const entry = storeForSlug(store);
  if (!entry) notFound();

  return (
    <AppShell active="photo-quality">
      <SessionImages store={entry.name} />
    </AppShell>
  );
}
