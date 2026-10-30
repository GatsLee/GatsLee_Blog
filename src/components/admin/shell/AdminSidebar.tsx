"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, ChessPawn, FileText, FolderClosed, LayoutGrid } from "lucide-react";
import { StreakCell, StreakLegend } from "@/components/common/UploadStreak";
import type { StreakData } from "@/lib/streak";
import ResumeModal, { type ResumeState } from "./ResumeModal";

const GROUPS = [
  {
    label: "콘텐츠 관리",
    items: [
      { href: "/admin", label: "대시보드", icon: LayoutGrid, exact: true },
      { href: "/admin/posts", label: "글", icon: FileText },
      { href: "/admin/projects", label: "프로젝트", icon: FolderClosed },
    ],
  },
  { label: "서비스", items: [{ href: "/admin/chatbot", label: "AI 챗봇", icon: Bot }] },
];

// AD/사이드바
export default function AdminSidebar({ streak, resume }: { streak: StreakData | null; resume: ResumeState }) {
  const pathname = usePathname() ?? "";
  const active = (href: string, exact?: boolean) => (exact ? pathname === href : pathname.startsWith(href));
  const recent = streak ? streak.weeks.flat().filter((n) => n > 0).length : 0;

  return (
    <aside className="sticky top-0 hidden h-screen w-[240px] shrink-0 flex-col border-r border-border bg-background px-6 pb-6 pt-7 lg:flex">
      <Link href="/admin" className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-brand text-white">
          <ChessPawn size={18} />
        </span>
        <span className="leading-tight">
          <span className="block text-sm font-bold text-foreground">GATS BLOG</span>
          <span className="block text-[10px] font-medium tracking-wide text-secondary">ADMIN</span>
        </span>
      </Link>
      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3.5 inline-flex w-fit items-center gap-1.5 rounded-full bg-surface px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-brand-soft"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-success" />
        블로그 보기
      </a>

      <nav className="mt-7 flex flex-col gap-7" aria-label="어드민 메뉴">
        {GROUPS.map((g) => (
          <div key={g.label} className="flex flex-col gap-1">
            <p className="mb-1 text-[11px] font-bold text-secondary">{g.label}</p>
            {g.items.map((item) => {
              const on = active(item.href, "exact" in item ? item.exact : false);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex h-11 items-center gap-3 rounded-xl px-3.5 text-sm ${
                    on ? "bg-brand-soft font-bold text-brand" : "font-medium text-foreground hover:bg-surface"
                  }`}
                >
                  <Icon size={20} strokeWidth={1.7} className={on ? "text-brand" : "text-secondary"} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-4">
        <ResumeModal initial={resume} />
        {streak && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-secondary">업로드 기록</span>
              <span className="text-muted">최근 12주</span>
            </div>
            <div className="flex gap-[3px]">
              {streak.weeks.map((w, i) => (
                <div key={i} className="flex flex-col gap-[3px]">
                  {w.map((n, d) => (
                    <StreakCell key={d} n={n} size={12} />
                  ))}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-foreground">
                글 {streak.posts} · 프로젝트 {streak.projects}
              </span>
              <StreakLegend size={8} />
            </div>
            <span className="sr-only">최근 12주 중 {recent}일 업로드</span>
          </div>
        )}
      </div>
    </aside>
  );
}
