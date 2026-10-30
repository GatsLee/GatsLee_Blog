"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface SuggestionGroup {
  readonly items: readonly { readonly text: string }[];
}

interface ChatEmptyStateProps {
  onPick: (text: string) => void;
}

type Suggestion = { id?: number; question: string };

// IA_CB_00101 제안. 추천 질문은 대표 FAQ 5개(D7), 불러오지 못하면 기본 예시를 쓴다
export default function ChatEmptyState({ onPick }: ChatEmptyStateProps) {
  const { t } = useLanguage();
  const fallback: Suggestion[] = ((t.home.suggestionGroups ?? []) as readonly SuggestionGroup[])
    .flatMap((g) => g.items.map((i) => ({ question: i.text })))
    .slice(0, 5);
  const [suggestions, setSuggestions] = useState<Suggestion[] | null>(null);
  const hint = (t.home as { chatEmptyHint?: string }).chatEmptyHint ?? "궁금한 점을 자유롭게 물어보세요";

  useEffect(() => {
    fetch("/api/chat/suggestions")
      .then((r) => r.json())
      .then((d) => setSuggestions(Array.isArray(d.suggestions) && d.suggestions.length ? d.suggestions : null))
      .catch(() => setSuggestions(null));
  }, []);

  const list = suggestions ?? fallback;

  // 대표 FAQ를 누르면 클릭 수를 남긴다 (어드민 주간 FAQ 클릭)
  const pick = (s: Suggestion) => {
    if (s.id !== undefined) {
      fetch("/api/chat/suggestions/click", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: s.id }) }).catch(() => {});
    }
    onPick(s.question);
  };

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex flex-col gap-1 py-2">
        <p className="text-base font-bold leading-6 text-foreground">안녕하세요, Gats Lee의 블로그 AI입니다.</p>
        <p className="text-[13px] leading-5 text-secondary">{hint}</p>
      </div>
      <p className="text-xs font-bold leading-[18px] text-muted">자주 묻는 질문</p>
      {list.map((s) => (
        <button
          key={s.question}
          onClick={() => pick(s)}
          className="flex items-center gap-2 rounded-xl border border-border py-[11px] pl-3.5 pr-3 text-left text-[13px] font-medium leading-5 text-foreground transition-colors hover:border-brand hover:bg-surface"
        >
          <span className="flex-1">{s.question}</span>
          <ArrowRight size={16} className="text-brand" />
        </button>
      ))}
    </div>
  );
}
