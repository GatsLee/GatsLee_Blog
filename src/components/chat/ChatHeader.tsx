"use client";

import Image from "next/image";
import { Trash2, X, ChevronLeft } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

interface ChatHeaderProps {
  hasMessages: boolean;
  ollamaAvailable: boolean | null;
  onClear: () => void;
  onClose: () => void;
  locale: string;
}

export default function ChatHeader({
  hasMessages,
  ollamaAvailable,
  onClear,
  onClose,
  locale,
}: ChatHeaderProps) {
  const { theme } = useTheme();
  const pawnSrc = theme === "dark" ? "/white_pawn.ico" : "/black_pawn.ico";

  return (
    <div
      className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0"
      style={{
        backgroundColor: "var(--color-surface)",
        paddingTop: "max(0.75rem, env(safe-area-inset-top))",
      }}
    >
      <div className="flex items-center gap-2">
        <button
          onClick={onClose}
          className="sm:hidden p-1 -ml-1 text-muted hover:text-foreground transition-colors cursor-pointer"
          aria-label={locale === "ko" ? "채팅 닫기" : "Close chat"}
        >
          <ChevronLeft size={18} strokeWidth={1.5} />
        </button>
        <Image src={pawnSrc} alt="" width={14} height={14} className="shrink-0" />
        <span className="editorial-label text-[10px] text-foreground">GATS LAB AI</span>
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            ollamaAvailable === false ? "bg-yellow-500" : "bg-green-500"
          }`}
          title={ollamaAvailable === false ? (locale === "ko" ? "AI 오프라인" : "AI offline") : undefined}
        />
      </div>
      <div className="flex items-center gap-1">
        {hasMessages && (
          <button
            onClick={onClear}
            className="p-1 text-muted hover:text-red-500 transition-colors cursor-pointer"
            title={locale === "ko" ? "새 대화" : "New chat"}
            aria-label={locale === "ko" ? "대화 초기화" : "Clear chat"}
          >
            <Trash2 size={14} strokeWidth={1.5} />
          </button>
        )}
        <button
          onClick={onClose}
          className="hidden sm:block p-1 text-muted hover:text-foreground transition-colors cursor-pointer"
          aria-label={locale === "ko" ? "채팅 닫기" : "Close chat"}
        >
          <X size={16} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
