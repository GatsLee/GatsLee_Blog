"use client";

import { forwardRef } from "react";
import { ArrowUp } from "lucide-react";

interface ChatInputProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled: boolean;
  ollamaOffline: boolean;
  locale: string;
}

const ChatInput = forwardRef<HTMLInputElement, ChatInputProps>(
  ({ value, onChange, onSubmit, disabled, ollamaOffline, locale }, ref) => {
    const placeholder = ollamaOffline
      ? locale === "ko"
        ? "AI가 현재 오프라인입니다"
        : "AI is currently offline"
      : locale === "ko"
      ? "궁금한 점을 자유롭게 물어보세요"
      : "Ask anything about Gats Lab...";

    return (
      <div
        className="px-3 pt-2 pb-3 border-t border-border shrink-0"
        style={{
          backgroundColor: "var(--color-surface)",
          paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
        }}
      >
        <div
          className="flex items-center gap-2 border border-border rounded-xl overflow-hidden focus-within:border-foreground transition-colors"
          style={{ backgroundColor: "var(--color-background)" }}
        >
          <input
            ref={ref}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSubmit()}
            placeholder={placeholder}
            disabled={disabled || ollamaOffline}
            className="flex-1 bg-transparent px-3 py-3 sm:py-2.5 text-sm text-foreground placeholder:text-muted outline-none font-light disabled:opacity-50"
            aria-label={locale === "ko" ? "메시지 입력" : "Message input"}
          />
          <button
            onClick={onSubmit}
            disabled={!value.trim() || disabled || ollamaOffline}
            className="mr-2 p-1.5 rounded-full bg-foreground text-background disabled:opacity-30 hover:opacity-80 transition-opacity cursor-pointer"
            aria-label={locale === "ko" ? "메시지 보내기" : "Send message"}
          >
            <ArrowUp size={14} strokeWidth={2} />
          </button>
        </div>
      </div>
    );
  }
);

ChatInput.displayName = "ChatInput";

export default ChatInput;
