"use client";

import { useEffect, useRef } from "react";
import { Icon } from "@/app/_components/icon";
import { ChatIdentity } from "./chat-identity";
import { ChatThread, type ChatThreadHandle } from "./chat-thread";
import type { ChatHint, ChatPrompt } from "./_data/chat-prompts";
import styles from "./chat.module.css";

/**
 * The floating widget's chrome around `ChatThread`.
 *
 * Deliberately not the scrim-and-dialog pattern `sku-panel`/`ticket-panel` use
 * elsewhere — this is a persistent companion widget, not a blocking action, so
 * it anchors above the launcher with no backdrop and no click-outside-close,
 * the standard chat-widget convention.
 *
 * `label` names whatever opened this — the page itself (from the launcher) or
 * one specific card (from its own "Ask InfiChat" button) — while `prompts`
 * and `hint` are always the page's real data, so the reply is the same one
 * the launcher would give, just captioned with what you actually asked from.
 */

export function ChatPanel({
  label,
  prompts,
  hint,
  onClose,
}: {
  label: string;
  prompts: ChatPrompt[];
  hint: ChatHint;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const threadRef = useRef<ChatThreadHandle>(null);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      opener?.focus?.();
    };
  }, [onClose]);

  return (
    <div className={styles.panel} role="dialog" aria-modal="false" aria-label="InfiChat">
      <header className={styles.panelHead}>
        <ChatIdentity caption={`Ask about ${label}`} />
        <button
          type="button"
          className={styles.panelIconButton}
          onClick={() => threadRef.current?.newChat()}
          aria-label="New chat"
          title="New chat"
        >
          <Icon name="refresh-cw" size={14} />
        </button>
        <button
          ref={closeRef}
          type="button"
          className={styles.panelIconButton}
          onClick={onClose}
          aria-label="Close InfiChat"
        >
          <Icon name="x" size={15} />
        </button>
      </header>

      <ChatThread
        ref={threadRef}
        title="InfiChat"
        subtitle={`Ask me something about ${label}, or try a suggestion below.`}
        prompts={prompts}
        hint={hint}
        variant="panel"
      />
    </div>
  );
}
