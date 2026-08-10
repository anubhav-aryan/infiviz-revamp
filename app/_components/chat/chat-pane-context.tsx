"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { NAV_BY_ID, type NavId } from "@/app/_components/nav";
import { CHAT_CONTEXT, HUB_DEFAULT_HINT, type ChatHint, type ChatPrompt } from "./_data/chat-prompts";

/**
 * The floating pane's state, shared by the launcher and every "Ask InfiChat"
 * button on every card — one pane per page, not one per card.
 *
 * A card only knows its own title, not the page's real prompts/hint, so
 * `openChat` lets a caller override just `label` and falls back to the page's
 * own `CHAT_CONTEXT` for the rest — the reply a card's button gets is the same
 * real per-page answer the launcher would give, just captioned with the card
 * you asked from.
 */

type PaneState =
  | { open: false }
  | { open: true; sessionId: number; label: string; prompts: ChatPrompt[]; hint: ChatHint };

type OpenChatOptions = { label?: string; prompts?: ChatPrompt[]; hint?: ChatHint };

type ChatPaneApi = {
  pageLabel: string;
  pageContext: { prompts: ChatPrompt[]; hint: ChatHint } | undefined;
  state: PaneState;
  openChat: (options?: OpenChatOptions) => void;
  closeChat: () => void;
};

const ChatPaneContext = createContext<ChatPaneApi | null>(null);

export function ChatPaneProvider({
  active,
  children,
}: {
  active: NavId;
  children: ReactNode;
}) {
  const [state, setState] = useState<PaneState>({ open: false });
  const sessionRef = useRef(0);

  const pageLabel = NAV_BY_ID[active].label;
  const pageContext = CHAT_CONTEXT[active];

  const openChat = useCallback(
    (options?: OpenChatOptions) => {
      sessionRef.current += 1;
      setState({
        open: true,
        sessionId: sessionRef.current,
        label: options?.label ?? pageLabel,
        prompts: options?.prompts ?? pageContext?.prompts ?? [],
        hint: options?.hint ?? pageContext?.hint ?? HUB_DEFAULT_HINT,
      });
    },
    [pageLabel, pageContext],
  );

  const closeChat = useCallback(() => setState({ open: false }), []);

  const value = useMemo(
    () => ({ pageLabel, pageContext, state, openChat, closeChat }),
    [pageLabel, pageContext, state, openChat, closeChat],
  );

  return <ChatPaneContext.Provider value={value}>{children}</ChatPaneContext.Provider>;
}

/**
 * `null` outside a `ChatPaneProvider` rather than throwing — the shared chart
 * primitives that call this (`ActionsBlock`, `DetailTable`, `RawTable`, …) are
 * also rendered by `/reference/charts`, a shell-free poster with no provider
 * to speak of. A missing pane means "there is nowhere to ask", so the caller
 * renders nothing rather than crashing a page that was never meant to have a
 * working assistant on it.
 */
export function useChatPane(): ChatPaneApi | null {
  return useContext(ChatPaneContext);
}
