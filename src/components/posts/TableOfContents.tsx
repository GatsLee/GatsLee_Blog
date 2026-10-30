"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { ChevronDown } from "lucide-react";

interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

// MarkdownRenderer의 heading id와 같은 규칙
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s가-힣-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function parseToc(content: string): TocItem[] {
  const items: TocItem[] = [];
  let inCodeBlock = false;
  for (const line of content.split("\n")) {
    if (line.trim().startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;
    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (match) {
      const text = match[2].replace(/[*_`\[\]()!]/g, "").trim();
      items.push({ id: slugify(text), text, level: match[1].length as 2 | 3 });
    }
  }
  return items;
}

function useActiveHeading(items: TocItem[]) {
  const [activeId, setActiveId] = useState("");
  const onScroll = useCallback(() => {
    let current = "";
    for (const item of items) {
      const el = document.getElementById(item.id);
      if (el && el.getBoundingClientRect().top <= 140) current = item.id;
    }
    setActiveId(current);
  }, [items]);
  useEffect(() => {
    window.addEventListener("scroll", onScroll, { passive: true });
    const raf = requestAnimationFrame(onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [onScroll]);
  return activeId;
}

function jump(e: React.MouseEvent, id: string) {
  e.preventDefault();
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

// IA_PS_002 왼쪽 "이 글의 목차" (xl 이상)
export function TocSidebar({ content }: { content: string }) {
  const items = useMemo(() => parseToc(content), [content]);
  const activeId = useActiveHeading(items);
  if (items.length < 2) return null;
  return (
    <nav aria-label="이 글의 목차" className="sticky top-32 flex flex-col gap-5">
      <p className="text-sm font-bold leading-[22px] text-foreground">이 글의 목차</p>
      {items.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          onClick={(e) => jump(e, item.id)}
          className={`text-sm leading-[22px] transition-colors ${item.level === 3 ? "pl-3" : ""} ${
            activeId === item.id ? "font-medium text-brand" : "text-secondary hover:text-foreground"
          }`}
        >
          {item.text}
        </a>
      ))}
    </nav>
  );
}

// 도입부 아래 접이식 목차 (xl 미만)
export function TocCollapsible({ content }: { content: string }) {
  const items = useMemo(() => parseToc(content), [content]);
  const [open, setOpen] = useState(false);
  if (items.length < 2) return null;
  return (
    <div className="rounded-lg bg-surface">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex h-14 w-full items-center gap-3 px-5 text-left"
      >
        <ChevronDown size={16} className={`text-brand transition-transform ${open ? "rotate-180" : ""}`} />
        <span className="text-base font-medium text-foreground">이 글의 목차</span>
        <span className="text-[13px] text-secondary">{items.length}개 항목</span>
      </button>
      {open && (
        <ol className="flex flex-col gap-2 px-12 pb-5">
          {items.map((item) => (
            <li key={item.id} className={item.level === 3 ? "pl-3" : ""}>
              <a href={`#${item.id}`} onClick={(e) => jump(e, item.id)} className="text-sm text-secondary hover:text-brand">
                {item.text}
              </a>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
