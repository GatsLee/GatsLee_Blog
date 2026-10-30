import Image from "next/image";
import Link from "next/link";
import { Pencil, Search } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import StampSelect from "@/components/admin/projects/StampSelect";

export const metadata = { title: "프로젝트 관리" };

type SearchParams = Promise<{ tab?: string; q?: string }>;

const TABS = [
  { key: undefined, label: "전체", where: {} },
  { key: "service", label: "서비스", where: { type: { in: ["app", "web"] } } },
  { key: "agent", label: "에이전트", where: { type: "agent" } },
] as const satisfies readonly { key: string | undefined; label: string; where: Prisma.ProductWhereInput }[];

const monthDay = (d: Date) => `${d.getMonth() + 1}월 ${d.getDate()}일`;

// IA_AD_003 프로젝트 관리 · 00302 진행 단계 변경
export default async function AdminProjectsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const tab = TABS.find((t) => t.key === sp.tab) ?? TABS[0];
  const q = sp.q?.trim() ?? "";
  const search: Prisma.ProductWhereInput = q ? { OR: [{ name: { contains: q } }, { tagline: { contains: q } }] } : {};

  const [counts, products] = await Promise.all([
    Promise.all(TABS.map((t) => prisma.product.count({ where: { ...t.where, ...search } }))),
    prisma.product.findMany({
      where: { ...tab.where, ...search },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, type: true, tagline: true, coverImage: true, stamp: true, published: true, updatedAt: true, _count: { select: { posts: true } } },
    }),
  ]);
  const href = (key?: string) => {
    const p = new URLSearchParams();
    if (key) p.set("tab", key);
    if (q) p.set("q", q);
    const s = p.toString();
    return s ? `/admin/projects?${s}` : "/admin/projects";
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold leading-8 text-foreground">프로젝트</h1>
          <p className="mt-1 text-[13px] text-secondary">블로그에 소개하는 프로젝트와 공개 상태를 관리합니다.</p>
        </div>
        <Link href="/admin/projects/new" className="flex h-11 items-center rounded-[10px] bg-brand px-4 text-sm font-bold text-white hover:opacity-90">
          새 프로젝트
        </Link>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <nav aria-label="유형" className="flex gap-1">
          {TABS.map((t, i) => {
            const active = t === tab;
            return (
              <Link
                key={t.label}
                href={href(t.key)}
                aria-current={active ? "page" : undefined}
                className={`flex h-9 items-center gap-1.5 rounded-[10px] px-3.5 text-[13px] ${active ? "bg-brand-soft font-bold text-brand" : "font-medium text-secondary hover:bg-background"}`}
              >
                {t.label}
                <span className={active ? "text-brand" : "text-muted"}>{counts[i]}</span>
              </Link>
            );
          })}
        </nav>
        <form action="/admin/projects" className="flex h-10 w-[240px] items-center gap-2 rounded-[10px] border border-border bg-background px-3 focus-within:border-brand">
          {tab.key && <input type="hidden" name="tab" value={tab.key} />}
          <input name="q" defaultValue={q} placeholder="프로젝트 검색" aria-label="프로젝트 검색" className="min-w-0 flex-1 bg-transparent text-[13px] text-foreground outline-none placeholder:text-muted" />
          <button type="submit" aria-label="검색">
            <Search size={16} className="text-secondary" />
          </button>
        </form>
      </div>

      {products.length === 0 ? (
        <p className="rounded-3xl border border-border bg-background py-16 text-center text-sm text-secondary">
          {q ? "조건에 맞는 프로젝트가 없어요." : "아직 등록한 프로젝트가 없어요."}
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {products.map((p) => (
            <article key={p.id} className="flex flex-col gap-4 rounded-3xl border border-border bg-background p-5">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-surface">
                {p.coverImage ? (
                  <Image src={p.coverImage} alt="" fill sizes="400px" className="object-cover" />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-xs text-muted">대표 이미지 · 4:3</span>
                )}
                {!p.published && <span className="absolute left-3 top-3 rounded-full bg-foreground/80 px-2.5 py-1 text-[11px] font-bold text-white">비공개</span>}
              </div>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-brand">{p.type === "agent" ? "에이전트" : "서비스"}</p>
                  <p className="mt-1 truncate text-lg font-bold text-foreground">{p.name}</p>
                </div>
                <StampSelect id={p.id} name={p.name} stamp={p.stamp} />
              </div>
              <p className="line-clamp-1 text-sm text-secondary">{p.tagline || "한 줄 소개가 아직 없어요."}</p>
              <div className="flex items-center justify-between border-t border-border pt-4">
                <span className="text-xs text-secondary">
                  연결된 글 {p._count.posts}개 · {monthDay(p.updatedAt)} 수정
                </span>
                <Link href={`/admin/projects/${p.id}`} aria-label={`${p.name} 수정`} className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-foreground hover:border-brand hover:text-brand">
                  <Pencil size={15} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
