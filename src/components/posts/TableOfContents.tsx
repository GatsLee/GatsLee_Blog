"use client";

import { useState, useEffect, useCallback } from "react";
import { List } from "lucide-react";

interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s가-힣-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function parseToc(content: string): TocItem[] {
  const items: TocItem[] = [];
  const lines = content.split("\n");
  let inCodeBlock = false;

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (match) {
      const text = match[2].replace(/[*_`\[\]()!]/g, "").trim();
      items.push({
        id: slugify(text),
        text,
        level: match[1].length as 2 | 3,
      });
    }
  }
  return items;
}

export default function TableOfContents({ content }: { content: string }) {
  const items = parseToc(content);
  const [activeId, setActiveId] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleScroll = useCallback(() => {
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter(Boolean) as HTMLElement[];

    let current = "";
    for (const heading of headings) {
      if (heading.getBoundingClientRect().top <= 120) {
        current = heading.id;
      }
    }
    setActiveId(current);
  }, [items]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  if (items.length < 2) return null;

  return (
    <>
      {/* Desktop: sticky sidebar */}
      <nav className="hidden xl:block" aria-label="Table of contents">
        <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
          <p className="text-xs font-mono text-muted uppercase tracking-widest mb-3">
            On this page
          </p>
          <ul className="space-y-1 border-l border-border">
            {items.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className={`block text-xs leading-5 transition-colors border-l-2 -ml-px ${
                    item.level === 3 ? "pl-6" : "pl-3"
                  } ${
                    activeId === item.id
                      ? "border-accent text-accent font-medium"
                      : "border-transparent text-muted hover:text-foreground"
                  }`}
                >
                  {item.text}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile: collapsible */}
      <div className="xl:hidden mb-6">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-xs text-muted hover:text-foreground transition-colors cursor-pointer"
        >
          <List size={14} />
          <span className="font-mono uppercase tracking-wider">
            {isOpen ? "Hide" : "Table of Contents"}
          </span>
        </button>
        {isOpen && (
          <ul className="mt-3 space-y-1 border-l border-border pl-3">
            {items.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" });
                    setIsOpen(false);
                  }}
                  className={`block text-xs leading-5 text-muted hover:text-foreground transition-colors ${
                    item.level === 3 ? "pl-4" : ""
                  }`}
                >
                  {item.text}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
