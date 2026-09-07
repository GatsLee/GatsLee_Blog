"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { AlertCircle } from "lucide-react";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { useTheme } from "@/context/ThemeContext";
import SourceCard from "./SourceCard";
import ThinkingToggle from "./ThinkingToggle";
import MessageActions from "./MessageActions";
import type { Message } from "./chatTypes";

interface ChatMessageProps {
  msg: Message;
  index: number;
  isLast: boolean;
  isStreaming: boolean;
  feedback?: "up" | "down";
  onFeedback: (idx: number, rating: "up" | "down") => void;
  onRegenerate: () => void;
  onRetry: () => void;
  locale: string;
}

export default function ChatMessage({
  msg,
  index,
  isLast,
  isStreaming,
  feedback,
  onFeedback,
  onRegenerate,
  onRetry,
  locale,
}: ChatMessageProps) {
  const { theme } = useTheme();
  const pawnSrc = theme === "dark" ? "/white_pawn.ico" : "/black_pawn.ico";

  // User message — right-aligned pill
  if (msg.role === "user") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="flex justify-end"
      >
        <div
          className="max-w-[80%] px-3.5 py-2 text-[14px] leading-[1.55] rounded-[18px] rounded-br-[6px] font-light"
          style={{ backgroundColor: "var(--color-foreground)", color: "var(--color-background)" }}
        >
          {msg.content}
        </div>
      </motion.div>
    );
  }

  // Assistant message — left accent bar (no bordered bubble)
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="group flex flex-col gap-1 chat-assistant-bar"
    >
      <div className="flex items-center gap-1.5">
        <Image src={pawnSrc} alt="" width={11} height={11} className="opacity-60" />
        <span className="editorial-label text-[9px] text-muted">ASSISTANT</span>
      </div>

      {msg.error ? (
        <div className="flex items-start gap-2 mt-1">
          <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="text-[13px] text-secondary">{msg.content}</span>
            <button
              onClick={onRetry}
              className="ml-2 text-[11px] editorial-label text-muted hover:text-foreground underline transition-colors cursor-pointer"
            >
              {locale === "ko" ? "다시 시도" : "RETRY"}
            </button>
          </div>
        </div>
      ) : (
        <div className="prose-chat text-[14px] leading-[1.65] text-foreground">
          <MarkdownRenderer content={msg.content} />
        </div>
      )}

      {msg.sources && msg.sources.length > 0 && (
        <div className="flex flex-col mt-3 pt-2 border-t border-border">
          <span className="editorial-label text-[9px] text-muted mb-1">
            {locale === "ko" ? "출처" : "SOURCES"}
          </span>
          <div className="flex flex-col">
            {msg.sources.slice(0, 3).map((s, si) => (
              <SourceCard key={si} source={s} index={si} />
            ))}
          </div>
        </div>
      )}

      {msg.thinkContent && <ThinkingToggle content={msg.thinkContent} locale={locale} />}

      {!msg.error && msg.content && !isStreaming && (
        <MessageActions
          msgIndex={index}
          content={msg.content}
          isLast={isLast}
          isStreaming={isStreaming}
          feedback={feedback}
          onFeedback={onFeedback}
          onRegenerate={onRegenerate}
          locale={locale}
        />
      )}
    </motion.div>
  );
}
