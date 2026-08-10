"use client";

import { useEffect, useRef } from "react";
import { Icon } from "@/app/_components/icon";
import { ChatThread, type ChatThreadHandle } from "./chat-thread";
import type { ChatContext } from "./_data/chat-prompts";
import styles from "./chat.module.css";

/**
 * The floating widget's chrome around `ChatThread`.
 *
 * Deliberately not the scrim-and-dialog pattern `sku-panel`/`ticket-panel` use
 * elsewhere — this is a persistent companion widget, not a blocking action, so
 * it anchors above the launcher with no backdrop and no click-outside-close,
 * the standard chat-widget convention.
 */

export function ChatPanel({
  pageLabel,
  context,
  onClose,
}: {
  pageLabel: string;
  context: ChatContext;
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
    <div
      className={styles.panel}
      role="dialog"
      aria-modal="false"
      aria-label="InfiViz Assistant"
    >
      <header className={styles.panelHead}>
        <span className={styles.panelHeadAvatar} aria-hidden="true">
          <Icon name="sparkles" size={16} />
        </span>
        <div className={styles.panelHeadBody}>
          <div className={styles.panelHeadTitleRow}>
            <span className={styles.panelHeadTitle}>InfiViz Assistant</span>
            <span className={styles.panelBadge}>Preview</span>
          </div>
          <div className={styles.panelHeadCaption}>Ask about {pageLabel}</div>
        </div>
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
          aria-label="Close assistant"
        >
          <Icon name="x" size={15} />
        </button>
      </header>

      <ChatThread
        ref={threadRef}
        title="InfiViz Assistant"
        subtitle={`Ask me something about ${pageLabel}, or try a suggestion below.`}
        prompts={context.prompts}
        hint={context.hint}
        variant="panel"
      />
    </div>
  );
}
