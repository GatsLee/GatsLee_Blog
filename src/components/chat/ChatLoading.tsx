"use client";

import { STAGE_TEXT, type ChatStage } from "./chatTypes";

interface ChatLoadingProps {
  stage: ChatStage;
  locale: "ko" | "en";
}

export default function ChatLoading({ stage, locale }: ChatLoadingProps) {
  if (stage === "idle" || stage === "streaming") return null;
  const text = STAGE_TEXT[locale][stage];

  return (
    <div className="flex items-center gap-3 chat-assistant-bar py-1">
      <div className="flex items-center gap-1.5">
        <span
          className={`w-1.5 h-1.5 rounded-full transition-colors ${
            stage === "searching" ? "bg-foreground animate-pulse" : "bg-foreground"
          }`}
        />
        <span className="w-3 h-px bg-border" aria-hidden />
        <span
          className={`w-1.5 h-1.5 rounded-full transition-colors ${
            stage === "generating"
              ? "bg-foreground animate-pulse"
              : stage === "searching"
              ? "bg-border"
              : "bg-foreground"
          }`}
        />
      </div>
      <span className="text-[11px] editorial-label text-muted">
        {text}
        <span className="inline-block ml-0.5 animate-pulse">···</span>
      </span>
    </div>
  );
}
