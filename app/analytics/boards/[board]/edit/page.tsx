import type { Metadata } from "next";
import { AppShell } from "@/app/_components/app-shell";
import { BoardEditorFor } from "../../../_components/board-editor-for";

export const metadata: Metadata = {
  title: "Edit board",
  description: "Rename a board or change what is on it.",
};

/** Dynamic for the same reason as the view — see the note in `../page.tsx`. */
export default async function EditBoardPage({
  params,
}: PageProps<"/analytics/boards/[board]/edit">) {
  const { board } = await params;
  return (
    <AppShell active="analytics">
      <BoardEditorFor id={board} />
    </AppShell>
  );
}
