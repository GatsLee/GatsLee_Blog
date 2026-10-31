"use client";

import { useRouter } from "next/navigation";
import { LogOut, Search } from "lucide-react";

// AD/상단 도구. 검색은 글 관리 검색으로 보낸다
export default function AdminToolbar() {
  const router = useRouter();
  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    router.push("/login");
    router.refresh();
  };
  return (
    <div className="sticky top-0 z-30 flex h-[72px] items-center justify-end gap-2.5 border-b border-border bg-background px-8">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const q = new FormData(e.currentTarget).get("q")?.toString().trim();
          router.push(q ? `/admin/posts?q=${encodeURIComponent(q)}` : "/admin/posts");
        }}
        className="flex h-10 w-[300px] items-center gap-2 rounded-[10px] bg-surface px-3"
      >
        <Search size={18} className="text-secondary" />
        <input name="q" placeholder="포스트 검색" className="flex-1 bg-transparent text-[13px] text-foreground outline-none placeholder:text-secondary" />
      </form>
      <button
        type="button"
        onClick={logout}
        className="flex h-10 items-center gap-1.5 rounded-[10px] border border-border px-3 text-[13px] font-medium text-foreground hover:bg-surface"
      >
        <LogOut size={16} /> 로그아웃
      </button>
    </div>
  );
}
