import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

// 어드민 목록 페이지 번호. 7쪽이 넘으면 가운데를 … 으로 줄인다
export default function AdminPager({ page, totalPages, hrefFor }: { page: number; totalPages: number; hrefFor: (page: number) => string }) {
  if (totalPages <= 1) return null;
  const pages: (number | "…")[] = [];
  for (let n = 1; n <= totalPages; n++) {
    if (n === 1 || n === totalPages || Math.abs(n - page) <= 1 || totalPages <= 7) pages.push(n);
    else if (pages[pages.length - 1] !== "…") pages.push("…");
  }
  const edge = "flex h-8 w-8 items-center justify-center rounded-lg border border-border";
  return (
    <nav aria-label="페이지" className="flex items-center gap-1.5">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} aria-label="이전 페이지" className={`${edge} text-foreground hover:bg-surface`}>
          <ChevronLeft size={16} />
        </Link>
      ) : (
        <span aria-hidden className={`${edge} text-muted`}>
          <ChevronLeft size={16} />
        </span>
      )}
      {pages.map((n, i) =>
        n === "…" ? (
          <span key={`gap-${i}`} className="px-1 text-[13px] text-muted">
            …
          </span>
        ) : n === page ? (
          <span key={n} aria-current="page" className="flex h-8 min-w-8 items-center justify-center rounded-lg bg-brand text-[13px] font-bold text-white">
            {n}
          </span>
        ) : (
          <Link key={n} href={hrefFor(n)} className="flex h-8 min-w-8 items-center justify-center rounded-lg text-[13px] text-foreground hover:bg-surface">
            {n}
          </Link>
        )
      )}
      {page < totalPages ? (
        <Link href={hrefFor(page + 1)} aria-label="다음 페이지" className={`${edge} text-foreground hover:bg-surface`}>
          <ChevronRight size={16} />
        </Link>
      ) : (
        <span aria-hidden className={`${edge} text-muted`}>
          <ChevronRight size={16} />
        </span>
      )}
    </nav>
  );
}
