import type { Metadata } from "next";
import { AppShell } from "@/app/_components/app-shell";
import { BoardView } from "../../_components/board-view";

export const metadata: Metadata = {
  title: "Board",
  description: "A board you assembled.",
};

/**
 * Deliberately no `generateStaticParams` and no `dynamicParams = false`, unlike
 * every other dynamic segment in this app.
 *
 * A board id is invented at runtime by the reader, so there is no set of params
 * to enumerate — pinning `dynamicParams = false` here would 404 every real
 * board. The cost is nil: a board lives only in this browser's localStorage, so
 * the server has nothing to render either way and `BoardView` resolves the id
 * client-side. The title above is static for the same reason — the name is not
 * knowable on the server.
 */
export default async function BoardPage({
  params,
}: PageProps<"/analytics/boards/[board]">) {
  const { board } = await params;
  return (
    <AppShell active="analytics">
      <BoardView id={board} />
    </AppShell>
  );
}
