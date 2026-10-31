"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

type Hit = { title: string; summary: string; href: string };
type Tab = "all" | "posts" | "products";

// IA_SY_002 검색, IA_SY_00201 결과 없음
export default function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Tab>("all");
  const [posts, setPosts] = useState<Hit[]>([]);
  const [products, setProducts] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState(0);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setPosts([]);
    setProducts([]);
    setTab("all");
    setCursor(0);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const q = query.trim();
    if (!q) {
      setPosts([]);
      setProducts([]);
      return;
    }
    setLoading(true);
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: ctrl.signal });
        const data = await res.json();
        setPosts(data.posts ?? []);
        setProducts(data.products ?? []);
        setCursor(0);
      } catch {
        // 입력이 바뀌어 취소된 요청은 무시한다
      } finally {
        setLoading(false);
      }
    }, 180);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [query, open]);

  const groups = useMemo(() => {
    const g: { label: string; items: Hit[] }[] = [];
    if (tab !== "products" && posts.length) g.push({ label: "글", items: posts });
    if (tab !== "posts" && products.length) g.push({ label: "프로젝트", items: products });
    return g;
  }, [tab, posts, products]);
  const flat = groups.flatMap((g) => g.items);

  const go = (hit: Hit | undefined) => {
    if (!hit) return;
    onClose();
    router.push(hit.href);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    else if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, flat.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    } else if (e.key === "Enter") go(flat[cursor]);
  };

  if (!open) return null;

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "all", label: "전체", count: posts.length + products.length },
    { key: "posts", label: "글", count: posts.length },
    { key: "products", label: "프로젝트", count: products.length },
  ];
  const hasQuery = query.trim().length > 0;
  let index = -1;

  return (
    <div className="fixed inset-0 z-[60] bg-foreground/45" onMouseDown={onClose} role="presentation">
      <div
        role="dialog"
        aria-label="검색"
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={onKeyDown}
        className="mx-auto mt-24 w-[min(720px,calc(100%-32px))] overflow-hidden rounded-[20px] bg-background shadow-[0_24px_56px_rgba(0,0,0,0.2)]"
      >
        <div className="flex items-center gap-3 border-b border-border px-5 py-[18px]">
          <Search size={22} className="text-brand" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="글과 프로젝트를 검색하세요"
            className="flex-1 bg-transparent text-lg font-medium text-foreground outline-none placeholder:text-muted"
          />
          <kbd className="rounded-md border border-border px-1.5 py-0.5 text-[11px] font-medium text-muted">esc</kbd>
        </div>

        {hasQuery && (
          <div className="flex gap-1 px-4 pt-3">
            {tabs.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => {
                  setTab(t.key);
                  setCursor(0);
                }}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[13px] ${
                  tab === t.key ? "bg-brand-soft font-bold text-brand" : "font-medium text-secondary"
                }`}
              >
                {t.label}
                <span className={`text-xs font-bold ${tab === t.key ? "text-brand" : "text-muted"}`}>{t.count}</span>
              </button>
            ))}
          </div>
        )}

        <div className="max-h-[420px] overflow-y-auto p-2.5">
          {!hasQuery && <p className="px-3 py-8 text-center text-sm text-secondary">찾고 싶은 글이나 프로젝트 이름을 입력하세요.</p>}
          {hasQuery && !loading && flat.length === 0 && (
            <div className="px-3 py-10 text-center">
              <p className="text-base font-bold text-foreground">‘{query.trim()}’과 맞는 결과가 없어요</p>
              <p className="mt-1 text-sm text-secondary">다른 단어로 찾거나 포스트 주제별로 둘러보세요.</p>
            </div>
          )}
          {groups.map((g) => (
            <div key={g.label}>
              <p className="px-2.5 pb-1 pt-2.5 text-xs font-bold text-muted">{g.label}</p>
              {g.items.map((hit) => {
                index += 1;
                const i = index;
                return (
                  <button
                    key={hit.href}
                    type="button"
                    onMouseEnter={() => setCursor(i)}
                    onClick={() => go(hit)}
                    className={`block w-full rounded-[10px] px-3 py-2.5 text-left ${cursor === i ? "bg-surface" : ""}`}
                  >
                    <span className="block text-[15px] font-bold text-foreground">{hit.title}</span>
                    {hit.summary && <span className="block truncate text-[13px] text-secondary">{hit.summary}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="flex gap-4 bg-surface-2 px-5 py-3 text-xs text-secondary">
          <span>↑↓ 이동</span>
          <span>Enter 열기</span>
          <span>esc 닫기</span>
        </div>
      </div>
    </div>
  );
}
