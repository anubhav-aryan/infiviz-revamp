import type { Metadata } from "next";
import { AppShell } from "@/app/_components/app-shell";
import { BoardEditor } from "../../_components/board-editor";

export const metadata: Metadata = {
  title: "New board",
  description: "Name a board and choose what goes on it.",
};

/** Static — a new board has no id yet, so this route needs no dynamic segment. */
export default function NewBoardPage() {
  return (
    <AppShell active="analytics">
      <BoardEditor />
    </AppShell>
  );
}
