"use client";

import { ArrowRight } from "lucide-react";

// 홈 주제 상자 "ASK GATS에 질문하기". 떠 있는 챗봇 패널을 연다
export default function AskGatsButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("gats:open-chat"))}
      className="inline-flex items-center gap-2 text-[13px] text-brand hover:underline"
    >
      ASK GATS에 질문하기 <ArrowRight size={16} />
    </button>
  );
}
