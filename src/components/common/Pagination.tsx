import Link from "next/link";

// 이전 · 번호 · 다음. 첫·마지막 페이지에서는 이전·다음을 흐리게 둔다
export default function Pagination({
  page,
  totalPages,
  hrefFor,
}: {
  page: number;
  totalPages: number;
  hrefFor: (page: number) => string;
}) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const edge = "inline-flex h-10 items-center rounded-lg px-3.5 text-sm";
  return (
    <nav className="flex items-center justify-center gap-2 py-4" aria-label="페이지">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className={`${edge} text-foreground hover:bg-surface`}>
          이전
        </Link>
      ) : (
        <span className={`${edge} text-muted`}>이전</span>
      )}
      {pages.map((p) =>
        p === page ? (
          <span key={p} aria-current="page" className="inline-flex h-10 min-w-9 items-center justify-center rounded-lg bg-brand px-3.5 text-sm text-white">
            {p}
          </span>
        ) : (
          <Link key={p} href={hrefFor(p)} className="inline-flex h-10 min-w-9 items-center justify-center rounded-lg px-3.5 text-sm text-foreground hover:bg-surface">
            {p}
          </Link>
        )
      )}
      {page < totalPages ? (
        <Link href={hrefFor(page + 1)} className={`${edge} text-foreground hover:bg-surface`}>
          다음
        </Link>
      ) : (
        <span className={`${edge} text-muted`}>다음</span>
      )}
    </nav>
  );
}
