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
        className="shrink-0 border-t border-border px-3 pt-3"
        style={{
          backgroundColor: "var(--color-background)",
          paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
        }}
      >
        <div
          className="flex items-center gap-2"
        >
          <input
            ref={ref}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSubmit()}
            placeholder={placeholder}
            disabled={disabled || ollamaOffline}
            className="h-11 flex-1 rounded-xl border border-border bg-surface-2 px-3.5 text-sm text-foreground outline-none placeholder:text-muted focus:border-brand disabled:opacity-50"
            aria-label={locale === "ko" ? "메시지 입력" : "Message input"}
          />
          <button
            onClick={onSubmit}
            disabled={!value.trim() || disabled || ollamaOffline}
            className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-brand text-white transition-opacity disabled:bg-[#c9d6fb]"
            aria-label={locale === "ko" ? "메시지 보내기" : "Send message"}
          >
            <ArrowUp size={18} strokeWidth={2} />
          </button>
        </div>
      </div>
    );
  }
);

ChatInput.displayName = "ChatInput";

export default ChatInput;
