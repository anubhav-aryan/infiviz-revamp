"use client";

import { useState } from "react";
import { Icon } from "@/app/_components/icon";
import { NAV_BY_ID, type NavId } from "@/app/_components/nav";
import { ChatPanel } from "./chat-panel";
import { CHAT_CONTEXT } from "./_data/chat-prompts";
import styles from "./chat.module.css";

/**
 * The fixed launcher every shell renders. Looks up its own context from
 * `active`, so wiring it into a shell is a one-prop addition — no page has to
 * know the assistant exists.
 */
export function ChatLauncher({ active }: { active: NavId }) {
  const [open, setOpen] = useState(false);
  const context = CHAT_CONTEXT[active];

  // No point floating a launcher for the assistant page you're already on,
  // and nothing to show for a screen with no authored context.
  if (active === "assistant" || !context) return null;

  const pageLabel = NAV_BY_ID[active].label;

  return (
    <>
      {open ? (
        <ChatPanel
          pageLabel={pageLabel}
          context={context}
          onClose={() => setOpen(false)}
        />
      ) : null}

      <button
        type="button"
        className={styles.launcher}
        data-open={open}
        onClick={() => setOpen((wasOpen) => !wasOpen)}
        aria-expanded={open}
        aria-label={open ? "Close assistant" : "Open assistant"}
      >
        <Icon name={open ? "x" : "message-circle"} size={22} />
      </button>
    </>
  );
}
