"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ThinkingToggleProps {
  content: string;
  locale: string;
}

export default function ThinkingToggle({ content, locale }: ThinkingToggleProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-[10px] editorial-label text-muted hover:text-foreground transition-colors cursor-pointer"
      >
        {open ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
        {locale === "ko" ? "추론 과정" : "Reasoning"}
      </button>
      {open && (
        <div className="mt-1 p-2 rounded bg-hover text-xs text-muted/80 leading-relaxed whitespace-pre-wrap max-h-32 overflow-y-auto">
          {content}
        </div>
      )}
    </div>
  );
}
