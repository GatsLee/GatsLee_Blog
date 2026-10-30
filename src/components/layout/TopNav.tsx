"use client";

import { useState, useEffect, useRef, useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronDown, FileText, Menu, Moon, Rss, Search, Settings, Sun, X } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { TOPICS } from "@/lib/topics";
import TopicIcon from "@/components/common/TopicIcon";
import SearchOverlay from "@/components/common/SearchOverlay";

// 관심 주제 · 프로젝트 · 일상 · 소개. 관심 주제는 드롭다운으로 연다.
const NAV_ITEMS = [
  { href: "/products", label: "프로젝트" },
  { href: "/daily", label: "일상" },
  { href: "/about", label: "소개" },
];

function ToolButton({
  label,
  onClick,
  href,
  external,
  children,
}: {
  label: string;
  onClick?: () => void;
  href?: string;
  external?: boolean;
  children: React.ReactNode;
}) {
  const className =
    "group relative flex h-10 w-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-brand-soft";
  const tip = (
    <span className="pointer-events-none absolute top-full mt-2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background opacity-0 transition-opacity group-hover:opacity-100">
      {label}
    </span>
  );
  if (href) {
    return (
      <a
        href={href}
        aria-label={label}
        className={className}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
        {tip}
      </a>
    );
  }
  return (
    <button type="button" aria-label={label} onClick={onClick} className={className}>
      {children}
      {tip}
    </button>
  );
}

const noopSubscribe = () => () => {};

export default function TopNav({ isAdmin }: { isAdmin: boolean }) {
  // 서버 렌더에서는 테마를 모르므로 테마 아이콘은 클라이언트에서만 그린다
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [topicsOpen, setTopicsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const topicsRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const pawnSrc = theme === "dark" ? "/white_pawn.ico" : "/black_pawn.ico";

  // 화면이 바뀌면 열린 메뉴를 닫는다
  const [prevPath, setPrevPath] = useState(pathname);
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    setMobileOpen(false);
    setTopicsOpen(false);
    setSearchOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // 드롭다운 바깥을 누르면 닫는다
  useEffect(() => {
    if (!topicsOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!topicsRef.current?.contains(e.target as Node)) setTopicsOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [topicsOpen]);

  // ⌘K / Ctrl+K로 검색
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isActive = (href: string) => pathname.startsWith(href);
  const topicsActive = pathname.startsWith("/insights");

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-surface">
        <div className="mx-auto flex h-24 max-w-[1184px] items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3 text-lg font-bold text-foreground">
            <Image src={pawnSrc} alt="" width={22} height={22} className="object-contain" />
            <span>Gats Blog</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex" aria-label="주요 메뉴">
            <div ref={topicsRef} className="relative">
              <button
                type="button"
                onClick={() => setTopicsOpen((v) => !v)}
                aria-expanded={topicsOpen}
                className={`flex items-center gap-1 text-base transition-colors hover:text-brand ${
                  topicsActive ? "font-semibold text-brand" : "text-foreground"
                }`}
              >
                관심 주제
                <ChevronDown size={16} className={`transition-transform ${topicsOpen ? "rotate-180" : ""}`} />
              </button>
              {topicsOpen && (
                <div className="absolute left-1/2 top-full mt-4 w-[360px] -translate-x-1/2 rounded-2xl border border-border bg-background p-2 shadow-[0_12px_32px_rgba(24,25,27,0.12)]">
                  {TOPICS.map((t) => (
                    <Link
                      key={t.slug}
                      href={`/insights?topic=${t.slug}`}
                      className="flex items-start gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-surface"
                    >
                      <span className="mt-0.5 text-brand">
                        <TopicIcon slug={t.slug} size={18} />
                      </span>
                      <span>
                        <span className="block text-[15px] font-semibold text-foreground">{t.label}</span>
                        <span className="block text-[13px] text-secondary">{t.description}</span>
                      </span>
                    </Link>
                  ))}
                  <Link
                    href="/insights"
                    className="mt-1 block rounded-xl border-t border-border px-3 py-3 text-[13px] font-semibold text-brand hover:bg-surface"
                  >
                    글 전체 보기 →
                  </Link>
                </div>
              )}
            </div>
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-base transition-colors hover:text-brand ${
                  isActive(item.href) ? "font-semibold text-brand" : "text-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-3 md:flex">
              <ToolButton label="검색" onClick={() => setSearchOpen(true)}>
                <Search size={20} strokeWidth={1.8} />
              </ToolButton>
              <ToolButton label="이력서" href="/resume" external>
                <FileText size={20} strokeWidth={1.8} />
              </ToolButton>
              {mounted && (
                <ToolButton
                  label={theme === "light" ? "다크 모드로 전환" : "라이트 모드로 전환"}
                  onClick={toggleTheme}
                >
                  {theme === "light" ? <Moon size={20} strokeWidth={1.8} /> : <Sun size={20} strokeWidth={1.8} />}
                </ToolButton>
              )}
              <ToolButton label="RSS 피드" href="/feed.xml" external>
                <Rss size={20} strokeWidth={1.8} />
              </ToolButton>
              {isAdmin && (
                <ToolButton label="어드민" href="/admin">
                  <Settings size={20} strokeWidth={1.8} />
                </ToolButton>
              )}
            </div>
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="text-foreground md:hidden"
              aria-label={mobileOpen ? "메뉴 닫기" : "메뉴 열기"}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 top-24 z-40 flex flex-col gap-6 bg-background px-6 py-8 md:hidden">
          <Link href="/insights" className="text-2xl font-bold text-foreground">
            글
          </Link>
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className="text-2xl font-bold text-foreground">
              {item.label}
            </Link>
          ))}
          <div className="mt-4 flex gap-3">
            <ToolButton label="검색" onClick={() => setSearchOpen(true)}>
              <Search size={20} />
            </ToolButton>
            <ToolButton label="이력서" href="/resume" external>
              <FileText size={20} />
            </ToolButton>
            <ToolButton label="RSS 피드" href="/feed.xml" external>
              <Rss size={20} />
            </ToolButton>
          </div>
        </div>
      )}

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
