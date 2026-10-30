"use client";

import { Bot, ChevronLeft, Trash2, X } from "lucide-react";

interface ChatHeaderProps {
  hasMessages: boolean;
  ollamaAvailable: boolean | null;
  onClear: () => void;
  onClose: () => void;
  locale: string;
}

// IA_CB_001 패널 머리
export default function ChatHeader({ hasMessages, ollamaAvailable, onClear, onClose, locale }: ChatHeaderProps) {
  const ko = locale === "ko";
  return (
    <div
      className="flex shrink-0 items-center gap-2.5 border-b border-border bg-background py-3.5 pl-4 pr-3"
      style={{ paddingTop: "max(0.875rem, env(safe-area-inset-top))" }}
    >
      <button onClick={onClose} className="-ml-1 p-1 text-secondary sm:hidden" aria-label={ko ? "채팅 닫기" : "Close chat"}>
        <ChevronLeft size={20} />
      </button>
      <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand text-white">
        <Bot size={20} />
        <span
          className={`absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-background ${
            ollamaAvailable === false ? "bg-warning" : "bg-success"
          }`}
          title={ollamaAvailable === false ? (ko ? "AI 오프라인" : "AI offline") : undefined}
        />
      </span>
      <span className="flex-1">
        <span className="block text-[15px] font-bold leading-[22px] text-foreground">Gats AI</span>
        <span className="block text-xs leading-[18px] text-secondary">{ko ? "블로그 글을 근거로 답해요" : "Answers from blog posts"}</span>
      </span>
      {hasMessages && (
        <button
          onClick={onClear}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-secondary hover:bg-surface hover:text-danger"
          title={ko ? "새 대화" : "New chat"}
          aria-label={ko ? "대화 초기화" : "Clear chat"}
        >
          <Trash2 size={16} />
        </button>
      )}
      <button
        onClick={onClose}
        className="hidden h-8 w-8 items-center justify-center rounded-lg text-secondary hover:bg-surface sm:flex"
        aria-label={ko ? "채팅 닫기" : "Close chat"}
      >
        <X size={18} />
      </button>
    </div>
  );
}
