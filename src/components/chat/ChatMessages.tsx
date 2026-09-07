"use client";

import { useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import ChatMessage from "./ChatMessage";
import ChatLoading from "./ChatLoading";
import ChatEmptyState from "./ChatEmptyState";
import FollowUpChips from "./FollowUpChips";
import type { Message, ChatStage } from "./chatTypes";

interface ChatMessagesProps {
  messages: Message[];
  isStreaming: boolean;
  stage: ChatStage;
  restored: boolean;
  feedbackGiven: Map<number, "up" | "down">;
  onFeedback: (idx: number, rating: "up" | "down") => void;
  onRegenerate: () => void;
  onRetry: () => void;
  onPickSuggestion: (text: string) => void;
  locale: "ko" | "en";
}

export default function ChatMessages({
  messages,
  isStreaming,
  stage,
  restored,
  feedbackGiven,
  onFeedback,
  onRegenerate,
  onRetry,
  onPickSuggestion,
  locale,
}: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleAnchorClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (href && (href.startsWith("/products/") || href.startsWith("/insights/"))) {
        e.preventDefault();
        router.push(href);
      }
    },
    [router]
  );

  // Find the last assistant message index (for actions on last message only)
  const lastAssistantIdx = (() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "assistant" && messages[i].content && !messages[i].error) {
        return i;
      }
    }
    return -1;
  })();

  // Loading bubble — shown when last message is empty assistant (placeholder)
  const showInlineLoading =
    messages.length > 0 &&
    messages[messages.length - 1].role === "assistant" &&
    !messages[messages.length - 1].content &&
    !messages[messages.length - 1].error;

  return (
    <div
      className="flex-1 overflow-y-auto px-4 py-5"
      role="log"
      aria-live="polite"
      aria-label={locale === "ko" ? "대화 내역" : "Chat history"}
      onClick={handleAnchorClick}
    >
      <div className="flex flex-col gap-6 h-full">
        {!restored ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-muted animate-pulse" />
              <span className="w-1.5 h-1.5 rounded-full bg-muted animate-pulse [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-muted animate-pulse [animation-delay:0.4s]" />
            </div>
          </div>
        ) : messages.length === 0 ? (
          <ChatEmptyState onPick={onPickSuggestion} />
        ) : (
          <>
            {messages.map((msg, i) => {
              // Skip empty placeholder assistant — render ChatLoading instead
              if (
                msg.role === "assistant" &&
                !msg.content &&
                !msg.error &&
                i === messages.length - 1
              ) {
                return null;
              }
              return (
                <ChatMessage
                  key={i}
                  msg={msg}
                  index={i}
                  isLast={i === lastAssistantIdx}
                  isStreaming={isStreaming}
                  feedback={feedbackGiven.get(i)}
                  onFeedback={onFeedback}
                  onRegenerate={onRegenerate}
                  onRetry={onRetry}
                  locale={locale}
                />
              );
            })}

            {showInlineLoading && <ChatLoading stage={stage} locale={locale} />}

            <FollowUpChips
              messages={messages}
              isStreaming={isStreaming}
              locale={locale}
              onPick={onPickSuggestion}
            />
          </>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
