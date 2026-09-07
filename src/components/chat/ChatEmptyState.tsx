"use client";

import { useLanguage } from "@/context/LanguageContext";
import { CATEGORY_ICONS } from "./chatTypes";

interface SuggestionItem {
  readonly text: string;
}
interface SuggestionGroup {
  readonly id: string;
  readonly label: string;
  readonly icon: string;
  readonly items: readonly SuggestionItem[];
}

interface ChatEmptyStateProps {
  onPick: (text: string) => void;
}

export default function ChatEmptyState({ onPick }: ChatEmptyStateProps) {
  const { t, locale } = useLanguage();
  const groups: readonly SuggestionGroup[] = (t.home.suggestionGroups ?? []) as readonly SuggestionGroup[];
  const hint = (t.home as { chatEmptyHint?: string }).chatEmptyHint;

  return (
    <div className="flex flex-col h-full px-1 pt-2 pb-4">
      <div className="text-center mb-5">
        <p className="text-[12px] editorial-label text-muted">
          {locale === "ko" ? "AI ASSISTANT" : "AI ASSISTANT"}
        </p>
        <p className="text-sm text-secondary font-light mt-1.5">
          {hint || (locale === "ko" ? "궁금한 점을 자유롭게 물어보세요" : "Ask anything about Gats Lab")}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {groups.map((g) => {
          const Icon = CATEGORY_ICONS[g.icon];
          return (
            <div
              key={g.id}
              className="border border-border rounded-xl p-3 hover:border-border-strong transition-colors bg-background"
            >
              <div className="flex items-center gap-1.5 mb-2">
                {Icon && <Icon size={12} strokeWidth={1.5} className="text-muted" />}
                <span className="editorial-label text-[9px] text-muted">{g.label}</span>
              </div>
              <div className="flex flex-col">
                {g.items.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => onPick(s.text)}
                    className="block w-full text-left text-[12px] text-secondary hover:text-foreground py-1 leading-snug transition-colors cursor-pointer"
                  >
                    {s.text}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
