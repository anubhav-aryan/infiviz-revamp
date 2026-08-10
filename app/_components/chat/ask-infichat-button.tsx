"use client";

import { Icon } from "@/app/_components/icon";
import { useChatPane } from "./chat-pane-context";
import styles from "./chat.module.css";

/**
 * The button every card gets. Opens the same page-level pane the launcher
 * does — `openChat` fills in the page's own real prompts/hint, so this only
 * ever changes what the pane is *captioned* as, never what it can answer.
 *
 * `compact` drops the label for headers with no room to spare (table strips,
 * dense rail cards) — the icon plus the aria-label carries the meaning.
 */
export function AskInfiChatButton({
  label,
  compact = false,
}: {
  label: string;
  compact?: boolean;
}) {
  const pane = useChatPane();
  // No pane to open (e.g. the `/reference` posters, which reuse these same
  // chart primitives outside any shell) — nothing to render.
  if (!pane) return null;
  const { openChat } = pane;

  return (
    <button
      type="button"
      className={styles.askButton}
      data-compact={compact}
      // Card headers sometimes sit inside a larger clickable row (an
      // expandable table row, a card that links out) — this button's click
      // should never also trigger that.
      onClick={(event) => {
        event.stopPropagation();
        openChat({ label });
      }}
      aria-label={`Ask InfiChat about ${label}`}
      title={`Ask InfiChat about ${label}`}
    >
      <Icon name="sparkles" size={12} />
      {compact ? null : "Ask InfiChat"}
    </button>
  );
}
