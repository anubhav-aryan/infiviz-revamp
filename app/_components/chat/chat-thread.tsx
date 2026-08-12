"use client";

import Link from "next/link";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Icon, type IconName } from "@/app/_components/icon";
import { HBarList, type BarRow } from "@/app/_charts/h-bar-list";
import type { ChatHint, ChatPrompt } from "./_data/chat-prompts";
import styles from "./chat.module.css";

/**
 * The conversation itself — shared by the floating panel and the `/infichat`
 * page, which differ only in the chrome around this.
 *
 * There is no model behind it. Every send produces the same one `hint` (or
 * whichever override the caller passes), because the mockup's job is to show
 * the shape of the experience, not to simulate a second, different answer to
 * a second question — that would read as a real capability rather than a
 * preview of one.
 *
 * The empty state is the suggestion surface — a centered mark, a title and a
 * subtitle, then suggestion cards — the way a real assistant opens, not a
 * card grid sitting above the conversation and not a chat bubble pretending
 * to be a greeting.
 */

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
  href?: string;
  linkLabel?: string;
  chart?: { rows: BarRow[]; caption: string };
  pills?: string[];
};

/**
 * A suggestion card. `icon` is optional — the hub's cards carry the source
 * screen's own nav icon; the panel's compact cards don't need one. `hint` is
 * optional too — the panel's three suggestions all share the page's one
 * `hint` prop (the fallback), but the hub's four span four different screens,
 * each needing its own real reply rather than the hub's generic fallback.
 */
export type SuggestionPrompt = ChatPrompt & { icon?: IconName; hint?: ChatHint };

export type ChatThreadHandle = {
  send: (question: string, hintOverride?: ChatHint) => void;
  newChat: () => void;
};

export const ChatThread = forwardRef<
  ChatThreadHandle,
  {
    title: string;
    subtitle: string;
    prompts: SuggestionPrompt[];
    hint: ChatHint;
    variant?: "panel" | "hub";
    /** Fires once, with the opening question and the reply it will get, the
        moment a fresh thread's first message is sent — how a caller learns
        "a new conversation started" without this component exposing its
        whole message array. */
    onFirstMessage?: (question: string, hint: ChatHint) => void;
  }
>(function ChatThread(
  { title, subtitle, prompts, hint, variant = "panel", onFirstMessage },
  ref,
) {
  const idRef = useRef(0);
  const nextId = () => `m${idRef.current++}`;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, pending]);

  const send = useCallback(
    (question: string, hintOverride?: ChatHint) => {
      const trimmed = question.trim();
      if (!trimmed || pending) return;
      const reply = hintOverride ?? hint;
      const isFirst = messages.length === 0;

      setMessages((prev) => [...prev, { id: nextId(), role: "user", text: trimmed }]);
      setInput("");
      setPending(true);
      if (isFirst) onFirstMessage?.(trimmed, reply);

      // A post-hydration client interaction, not render-time nondeterminism —
      // this is the one place in the codebase a timer is safe to use.
      window.setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: nextId(),
            role: "assistant",
            text: reply.text,
            href: reply.href,
            linkLabel: reply.label,
            chart: reply.chart,
            pills: reply.pills,
          },
        ]);
        setPending(false);
      }, 650);
    },
    [hint, pending, messages.length, onFirstMessage],
  );

  const newChat = useCallback(() => {
    setMessages([]);
    setInput("");
    setPending(false);
  }, []);

  useImperativeHandle(ref, () => ({ send, newChat }), [send, newChat]);

  const isEmpty = messages.length === 0 && !pending;

  return (
    <div className={styles.thread} data-variant={variant}>
      {isEmpty ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyMark} aria-hidden="true">
            <Icon name="sparkles" size={variant === "hub" ? 22 : 18} />
          </span>
          <h2 className={styles.emptyTitle}>{title}</h2>
          <p className={styles.emptySubtitle}>{subtitle}</p>

          {prompts.length > 0 ? (
            <div className={styles.suggestionGrid}>
              {prompts.map((prompt) => (
                <button
                  key={prompt.title}
                  type="button"
                  className={styles.suggestionCard}
                  onClick={() => send(prompt.question, prompt.hint)}
                >
                  {prompt.icon ? (
                    <span className={styles.suggestionIcon} aria-hidden="true">
                      <Icon name={prompt.icon} size={14} />
                    </span>
                  ) : null}
                  <span className={styles.suggestionBody}>
                    <span className={styles.suggestionTitle}>{prompt.title}</span>
                    <span className={styles.suggestionQuestion}>{prompt.question}</span>
                  </span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : (
        <div className={styles.messages}>
          {messages.map((message) => {
            const showChart = variant === "hub" && message.chart;
            const showPills = variant === "hub" && message.pills && message.pills.length > 0;
            return (
              <div
                key={message.id}
                className={styles.bubbleRow}
                data-role={message.role}
                data-chart={showChart ? "true" : undefined}
              >
                {message.role === "assistant" ? (
                  <span className={styles.avatar} aria-hidden="true">
                    <Icon name="sparkles" size={13} />
                  </span>
                ) : null}
                <div
                  className={styles.bubble}
                  data-role={message.role}
                  data-chart={showChart ? "true" : undefined}
                >
                  <p className={styles.bubbleText}>{message.text}</p>

                  {showChart && message.chart ? (
                    <div className={styles.bubbleChart}>
                      <HBarList rows={message.chart.rows} nameWidth="190px" />
                      <p className={styles.bubbleChartCaption}>{message.chart.caption}</p>
                    </div>
                  ) : null}

                  {showPills && message.pills ? (
                    <div className={styles.bubblePills}>
                      {message.pills.map((pill) => (
                        <span
                          key={pill}
                          className={styles.bubblePill}
                          data-inert="true"
                          title="Preview only — not wired to a real drill-down"
                        >
                          {pill}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  {message.href ? (
                    <Link href={message.href} className={styles.bubbleLink}>
                      Open {message.linkLabel}
                      <Icon name="arrow-right" size={13} />
                    </Link>
                  ) : null}
                </div>
              </div>
            );
          })}

          {pending ? (
            <div className={styles.bubbleRow} data-role="assistant">
              <span className={styles.avatar} aria-hidden="true">
                <Icon name="sparkles" size={13} />
              </span>
              <div className={styles.bubble} data-role="assistant" data-typing="true">
                <span className={styles.typingDot} />
                <span className={styles.typingDot} />
                <span className={styles.typingDot} />
              </div>
            </div>
          ) : null}
          <div ref={endRef} />
        </div>
      )}

      <form
        className={styles.composer}
        onSubmit={(event) => {
          event.preventDefault();
          send(input);
        }}
      >
        <input
          className={styles.composerInput}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask a question…"
          aria-label="Ask InfiChat"
        />
        <button
          type="submit"
          className={styles.composerSend}
          disabled={!input.trim() || pending}
          aria-label="Send"
        >
          <Icon name="send" size={15} />
        </button>
      </form>

      <p className={styles.mockNote}>
        Preview — InfiChat isn&rsquo;t connected to a model yet.
      </p>
    </div>
  );
});
