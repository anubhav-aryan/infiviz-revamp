"use client";

import { Icon } from "@/app/_components/icon";
import type { NavId } from "@/app/_components/nav";
import { ChatPanel } from "./chat-panel";
import { useChatPane } from "./chat-pane-context";
import styles from "./chat.module.css";

/**
 * The fixed launcher every shell renders. Reads the shared pane state from
 * `ChatPaneProvider` rather than owning it — every "Ask InfiChat" button on
 * every card opens the same pane this toggles, just pre-scoped to a card
 * instead of the whole page.
 */
export function ChatLauncher({ active }: { active: NavId }) {
  const pane = useChatPane();

  // No point floating a launcher for the InfiChat page you're already on,
  // and nothing to show for a screen with no authored context — or no
  // provider at all, which every shell supplies but this guards anyway.
  if (active === "infichat" || !pane?.pageContext) return null;
  const { state, pageLabel, openChat, closeChat } = pane;

  return (
    <>
      {state.open ? (
        <ChatPanel
          key={state.sessionId}
          label={state.label}
          prompts={state.prompts}
          hint={state.hint}
          onClose={closeChat}
        />
      ) : null}

      <button
        type="button"
        className={styles.launcher}
        data-open={state.open}
        onClick={() => (state.open ? closeChat() : openChat({ label: pageLabel }))}
        aria-expanded={state.open}
        aria-label={state.open ? "Close InfiChat" : "Open InfiChat"}
      >
        <Icon name={state.open ? "x" : "message-circle"} size={22} />
      </button>
    </>
  );
}
