"use client";

import { STAGE_TEXT, type ChatStage } from "./chatTypes";

interface ChatLoadingProps {
  stage: ChatStage;
  locale: "ko" | "en";
}

export default function ChatLoading({ stage, locale }: ChatLoadingProps) {
  if (stage === "idle" || stage === "streaming") return null;
  const text = STAGE_TEXT[locale][stage];

  // IA_CB_00103 생성 중: 연파랑 말풍선 안 점 세 개 + 진행 문구
  return (
    <div className="flex flex-col items-start gap-2">
      <div className="flex items-center gap-1.5 rounded-[14px] bg-surface px-3.5 py-3">
        <span className="h-2 w-2 animate-pulse rounded-full bg-brand" />
        <span className="h-2 w-2 animate-pulse rounded-full bg-brand/60 [animation-delay:0.2s]" />
        <span className="h-2 w-2 animate-pulse rounded-full bg-brand/30 [animation-delay:0.4s]" />
      </div>
      <span className="text-xs text-secondary">{text}…</span>
    </div>
  );
}
