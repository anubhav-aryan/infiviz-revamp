"use client";

import { useCallback, useRef, useState } from "react";
import { Icon } from "@/app/_components/icon";
import { NAV_BY_ID } from "@/app/_components/nav";
import { ChatThread, type ChatThreadHandle } from "@/app/_components/chat/chat-thread";
import {
  HUB_DEFAULT_HINT,
  HUB_SUGGESTIONS,
  type ChatHint,
} from "@/app/_components/chat/_data/chat-prompts";
import styles from "@/app/_components/chat/chat.module.css";

/**
 * The dedicated assistant screen — the same `ChatThread` the floating panel
 * uses, docked full-width with room for a history rail alongside it.
 *
 * History is genuine, not fabricated: it starts empty (which is also just
 * what a real chatbot looks like the first time you use it) and fills in for
 * real as you chat, in this session — the same "nothing persists" honesty the
 * rest of the mockup already keeps, so it needs no separate disclaimer.
 * Clicking a past entry replays the question it opened with — this mockup's
 * replies are deterministic, so that reproduces the same conversation it
 * showed the first time.
 */

type HistoryEntry = { id: string; title: string; question: string; hint: ChatHint };

const HUB_PROMPTS = HUB_SUGGESTIONS.map(({ id, prompt, hint }) => ({
  ...prompt,
  icon: NAV_BY_ID[id].icon,
  hint,
}));

export function Assistant() {
  const threadRef = useRef<ChatThreadHandle>(null);
  const idRef = useRef(0);

  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleFirstMessage = useCallback((question: string, hint: ChatHint) => {
    const id = `h${idRef.current++}`;
    setHistory((prev) => [{ id, title: question, question, hint }, ...prev]);
    setActiveId(id);
  }, []);

  const newChat = useCallback(() => {
    threadRef.current?.newChat();
    setActiveId(null);
  }, []);

  const openHistory = useCallback((entry: HistoryEntry) => {
    threadRef.current?.newChat();
    threadRef.current?.send(entry.question, entry.hint);
    setActiveId(entry.id);
  }, []);

  return (
    <div className={styles.hubLayout}>
      <aside className={styles.historyRail}>
        <button type="button" className={styles.newChatButton} onClick={newChat}>
          <Icon name="plus" size={14} />
          New chat
        </button>

        <div className={styles.historyHead}>History</div>

        {history.length === 0 ? (
          <p className={styles.historyEmpty}>Your conversations will appear here.</p>
        ) : (
          <div className={styles.historyList}>
            {history.map((entry) => (
              <button
                key={entry.id}
                type="button"
                className={styles.historyItem}
                data-active={entry.id === activeId}
                onClick={() => openHistory(entry)}
              >
                <Icon name="message-circle" size={13} />
                <span className={styles.historyItemText}>{entry.title}</span>
              </button>
            ))}
          </div>
        )}
      </aside>

      <div className={styles.hubMain}>
        <ChatThread
          ref={threadRef}
          title="InfiViz Assistant"
          subtitle="A preview of an assistant that can answer questions about availability, coverage, photo quality and tickets — wherever you are in the platform."
          prompts={HUB_PROMPTS}
          hint={HUB_DEFAULT_HINT}
          variant="hub"
          onFirstMessage={handleFirstMessage}
        />
      </div>
    </div>
  );
}
