import type { Metadata } from "next";
import { AppShell } from "@/app/_components/app-shell";
import { InfiChat } from "./_components/infichat";

export const metadata: Metadata = {
  title: "InfiChat",
  description: "A preview of an assistant that can answer questions about any screen's data.",
};

export default function InfiChatPage() {
  return (
    <AppShell active="infichat">
      <InfiChat />
    </AppShell>
  );
}
