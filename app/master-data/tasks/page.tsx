import type { Metadata } from "next";
import { RailShell } from "@/app/_components/app-shell";
import { SECTION, SECTION_GROUPS } from "../_data/section-nav";
import { TasksBoard } from "../_components/tasks-board";

export const metadata: Metadata = {
  title: "Tasks",
  description: "The visit tasks pushed to the InfiShots app, by store group.",
};

export default function TasksPage() {
  return (
    <RailShell
      active="master-data"
      section={SECTION}
      groups={SECTION_GROUPS}
      activeSection="tasks"
    >
      <TasksBoard />
    </RailShell>
  );
}
