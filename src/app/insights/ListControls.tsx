"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Search } from "lucide-react";

// 글 목록의 검색 입력과 정렬. 값은 주소(searchParams)에 둔다
export default function ListControls({ placeholder, count }: { placeholder: string; count: number }) {
  const router = useRouter();
  const params = useSearchParams();

  const push = (next: Record<string, string>) => {
    const sp = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v) sp.set(k, v);
      else sp.delete(k);
    }
    sp.delete("page");
    router.push(`/insights${sp.size ? `?${sp}` : ""}`);
  };

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const q = new FormData(e.currentTarget).get("q")?.toString().trim() ?? "";
          push({ q });
        }}
        className="flex h-[52px] items-center gap-3 rounded-lg border border-border bg-background px-4"
      >
        <Search size={20} className="text-foreground" />
        <input
          name="q"
          defaultValue={params.get("q") ?? ""}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-[15px] text-foreground outline-none placeholder:text-secondary"
        />
      </form>
      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">포스트 {count}개</p>
        {/* 브라우저 기본 화살표 대신 테두리에서 16px 띄운 화살표를 그린다 */}
        <div className="relative">
          <select
            aria-label="정렬"
            defaultValue={params.get("sort") ?? "latest"}
            onChange={(e) => push({ sort: e.target.value === "latest" ? "" : e.target.value })}
            className="h-10 appearance-none rounded-md border border-border bg-background pl-3 pr-10 text-sm text-secondary"
          >
            <option value="latest">최신순</option>
            <option value="oldest">오래된순</option>
          </select>
          <ChevronDown size={16} aria-hidden className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-secondary" />
        </div>
      </div>
    </>
  );
}
