import type { Metadata } from "next";
import { AppShell } from "@/app/_components/app-shell";
import { BoardsList } from "../_components/boards-list";

export const metadata: Metadata = {
  title: "Boards",
  description: "Dashboards you assemble yourself from the figures the modules publish.",
};

/**
 * No `filterScope`: boards render at national scope with no scope picker, and
 * the filter bar's absence is how this app signals that a surface is not
 * session-scoped. It also means no `useSearchParams` here, hence no `Suspense`.
 */
export default function BoardsPage() {
  return (
    <AppShell active="analytics">
      <BoardsList />
    </AppShell>
  );
}
