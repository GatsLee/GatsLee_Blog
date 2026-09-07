"use client";

import { useState } from "react";
import { Copy, Check, RotateCcw, ThumbsUp, ThumbsDown } from "lucide-react";

interface MessageActionsProps {
  msgIndex: number;
  content: string;
  isLast: boolean;
  isStreaming: boolean;
  feedback?: "up" | "down";
  onFeedback: (idx: number, rating: "up" | "down") => void;
  onRegenerate: () => void;
  locale: string;
}

export default function MessageActions({
  msgIndex,
  content,
  isLast,
  isStreaming,
  feedback,
  onFeedback,
  onRegenerate,
  locale,
}: MessageActionsProps) {
  const [copied, setCopied] = useState(false);
  const hasFeedback = !!feedback;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable
    }
  };

  return (
    <div className="flex items-center gap-0.5 mt-2 opacity-100 sm:opacity-50 sm:group-hover:opacity-100 transition-opacity">
      <button
        onClick={handleCopy}
        className="p-1 rounded text-muted hover:text-foreground hover:bg-hover transition-colors cursor-pointer"
        aria-label={locale === "ko" ? "복사" : "Copy"}
        title={locale === "ko" ? "복사" : "Copy"}
      >
        {copied ? <Check size={12} strokeWidth={1.5} /> : <Copy size={12} strokeWidth={1.5} />}
      </button>

      {isLast && !isStreaming && (
        <button
          onClick={onRegenerate}
          className="p-1 rounded text-muted hover:text-foreground hover:bg-hover transition-colors cursor-pointer"
          aria-label={locale === "ko" ? "다시 생성" : "Regenerate"}
          title={locale === "ko" ? "다시 생성" : "Regenerate"}
        >
          <RotateCcw size={12} strokeWidth={1.5} />
        </button>
      )}

      <span className="w-px h-3 bg-border mx-1" aria-hidden />

      <button
        onClick={() => onFeedback(msgIndex, "up")}
        disabled={hasFeedback}
        className={`p-1 rounded transition-colors cursor-pointer hover:bg-hover ${
          feedback === "up" ? "text-foreground" : "text-muted hover:text-foreground"
        } disabled:cursor-default disabled:hover:bg-transparent`}
        aria-label={locale === "ko" ? "도움이 됐어요" : "Helpful"}
      >
        <ThumbsUp
          size={12}
          strokeWidth={1.5}
          className={feedback === "up" ? "fill-foreground" : ""}
        />
      </button>
      <button
        onClick={() => onFeedback(msgIndex, "down")}
        disabled={hasFeedback}
        className={`p-1 rounded transition-colors cursor-pointer hover:bg-hover ${
          feedback === "down" ? "text-foreground" : "text-muted hover:text-foreground"
        } disabled:cursor-default disabled:hover:bg-transparent`}
        aria-label={locale === "ko" ? "아쉬워요" : "Not helpful"}
      >
        <ThumbsDown
          size={12}
          strokeWidth={1.5}
          className={feedback === "down" ? "fill-foreground" : ""}
        />
      </button>

      {hasFeedback && (
        <span className="text-[10px] text-muted ml-1.5">
          {locale === "ko" ? "감사합니다" : "Thanks"}
        </span>
      )}
    </div>
  );
}
