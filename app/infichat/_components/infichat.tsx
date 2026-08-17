"use client";

import { useCallback, useRef, useState } from "react";
import { Icon } from "@/app/_components/icon";
import { ChatIdentity } from "@/app/_components/chat/chat-identity";
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
 * History isn't empty on load: it opens seeded with the same five grounded
 * chart examples the empty state offers as suggestion cards, so the chart
 * capability is discoverable without the user having to already know what to
 * ask — the same five conversations either entry point replays. Real questions
 * still fill in above them exactly as before, keyed to the full question text
 * rather than the seeded entries' short titles.
 */

type HistoryEntry = { id: string; title: string; question: string; hint: ChatHint };

const HUB_PROMPTS = HUB_SUGGESTIONS.map(({ prompt, icon, hint }) => ({
  ...prompt,
  icon,
  hint,
}));

const SEED_HISTORY: HistoryEntry[] = HUB_SUGGESTIONS.map(({ prompt, hint }, i) => ({
  id: `seed-${i}`,
  title: prompt.title,
  question: prompt.question,
  hint,
}));

export function InfiChat() {
  const threadRef = useRef<ChatThreadHandle>(null);
  const idRef = useRef(0);
  /** Suppresses `onFirstMessage` while `openHistory` replays a past entry —
      `newChat()` empties the thread first, so the replay looks exactly like a
      fresh send and would otherwise re-add the entry it's replaying. */
  const replayingRef = useRef(false);

  const [history, setHistory] = useState<HistoryEntry[]>(SEED_HISTORY);
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleFirstMessage = useCallback((question: string, hint: ChatHint) => {
    if (replayingRef.current) return;
    const id = `h${idRef.current++}`;
    setHistory((prev) => [{ id, title: question, question, hint }, ...prev]);
    setActiveId(id);
  }, []);

  const newChat = useCallback(() => {
    threadRef.current?.newChat();
    setActiveId(null);
  }, []);

  const openHistory = useCallback((entry: HistoryEntry) => {
    replayingRef.current = true;
    threadRef.current?.newChat();
    threadRef.current?.send(entry.question, entry.hint);
    replayingRef.current = false;
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
        <header className={styles.hubHead}>
          <ChatIdentity caption="Answers grounded in this platform's own data" />
        </header>

        <ChatThread
          ref={threadRef}
          title="InfiChat"
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
