"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { AnimatePresence } from "motion/react";
import { useLanguage } from "@/context/LanguageContext";
import ChatFAB from "./ChatFAB";
import ChatPanel from "./ChatPanel";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import { useChatSession } from "./useChatSession";
import { useKeyboardShortcuts } from "./useKeyboardShortcuts";

interface ChatRootProps {
  initialMessage: string;
  defaultOpen?: boolean;
}

export default function ChatRoot({ initialMessage, defaultOpen = false }: ChatRootProps) {
  const { locale } = useLanguage();
  const lang = (locale === "ko" ? "ko" : "en") as "ko" | "en";

  const [isOpen, setIsOpen] = useState(defaultOpen);
  const inputRef = useRef<HTMLInputElement>(null);
  const fabRef = useRef<HTMLButtonElement>(null);

  const session = useChatSession({ initialMessage, locale: lang, isOpen });

  const handleClose = useCallback(() => setIsOpen(false), []);
  const handleToggle = useCallback(() => setIsOpen((v) => !v), []);

  useKeyboardShortcuts({ onToggle: handleToggle, onClose: handleClose, isOpen });

  // Focus input when widget opens, refocus FAB when closes
  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 120);
      return () => clearTimeout(t);
    } else {
      fabRef.current?.focus();
    }
  }, [isOpen]);

  const handlePickSuggestion = useCallback(
    (text: string) => {
      session.sendMessage(
        text,
        session.messages.filter((m) => m.content && !m.error)
      );
    },
    [session]
  );

  const ariaLabel = lang === "ko" ? "AI 채팅" : "AI Chat";

  return (
    <>
      {!isOpen && <ChatFAB ref={fabRef} onClick={() => setIsOpen(true)} locale={lang} />}

      <AnimatePresence>
        {isOpen && (
          <ChatPanel onClose={handleClose} ariaLabel={ariaLabel}>
            <ChatHeader
              hasMessages={session.messages.length > 0}
              ollamaAvailable={session.ollamaAvailable}
              onClear={session.clearChat}
              onClose={handleClose}
              locale={lang}
            />
            <ChatMessages
              messages={session.messages}
              isStreaming={session.isStreaming}
              stage={session.stage}
              restored={session.restored}
              feedbackGiven={session.feedbackGiven}
              onFeedback={session.submitFeedback}
              onRegenerate={session.regenerateLast}
              onRetry={session.retryLast}
              onPickSuggestion={handlePickSuggestion}
              locale={lang}
            />
            <ChatInput
              ref={inputRef}
              value={session.input}
              onChange={session.setInput}
              onSubmit={session.submitInput}
              disabled={session.isStreaming}
              ollamaOffline={session.ollamaAvailable === false}
              locale={lang}
            />
          </ChatPanel>
        )}
      </AnimatePresence>
    </>
  );
}
