import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Bot, Globe, Search, Smartphone } from "lucide-react";
import { prisma } from "@/lib/db";
import { parseStrings, productType } from "@/lib/product";
import Pagination from "@/components/common/Pagination";

export const metadata: Metadata = { title: "프로젝트" };

const PAGE_SIZE = 5;
const TYPE_ICON = { app: Smartphone, web: Globe, agent: Bot };

// 공개 목록 필터는 서비스(앱·웹)와 에이전트 두 갈래다
const TABS = [
  { key: "", label: "전체", types: ["app", "web", "agent"] },
  { key: "service", label: "서비스", types: ["app", "web"] },
  { key: "agent", label: "에이전트", types: ["agent"] },
] as const;

type SearchParams = Promise<{ tab?: string; q?: string; page?: string }>;

// IA_PD_001 프로젝트 목록 · IA_PD_00101 빈 상태
export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const tab = TABS.find((t) => t.key === sp.tab) ?? TABS[0];
  const q = sp.q?.trim().slice(0, 50) ?? "";
  const page = Math.max(1, parseInt(sp.page ?? "1") || 1);

  const all = await prisma.product.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    select: { slug: true, name: true, type: true, tagline: true, summary: true, coverImage: true },
  });
  const count = (types: readonly string[]) => all.filter((p) => types.includes(productType(p.type))).length;
  const filtered = all.filter(
    (p) =>
      (tab.types as readonly string[]).includes(productType(p.type)) &&
      (!q || p.name.includes(q) || p.tagline.includes(q))
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const shown = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const href = (next: { tab?: string; q?: string; page?: number }) => {
    const p = new URLSearchParams();
    const t = next.tab ?? tab.key;
    const qq = next.q ?? q;
    if (t) p.set("tab", t);
    if (qq) p.set("q", qq);
    if (next.page && next.page > 1) p.set("page", String(next.page));
    return `/products${p.size ? `?${p}` : ""}`;
  };

  return (
    <div className="mx-auto max-w-[1184px] px-6 pb-20 pt-14">
      <div className="flex flex-col gap-2">
        <h1 className="text-[40px] font-bold leading-[60px] text-foreground">프로젝트</h1>
        <p className="text-[17px] leading-[26px] text-secondary">사용자의 불편에서 시작해 기획하고 만든 서비스와 도구를 소개합니다.</p>
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
        <nav className="flex gap-2" aria-label="프로젝트 분류">
          {TABS.map((t) => {
            const active = t.key === tab.key;
            return (
              <Link
                key={t.key}
                href={href({ tab: t.key, page: 1 })}
                className={`rounded-lg px-4 py-2.5 text-sm ${active ? "bg-brand font-semibold text-white" : "bg-surface text-foreground hover:bg-brand-soft"}`}
              >
                {t.label} {count(t.types)}
              </Link>
            );
          })}
        </nav>
        <form action="/products" className="flex h-11 w-full items-center gap-2 rounded-lg border border-border bg-background px-3 sm:w-80">
          {tab.key && <input type="hidden" name="tab" value={tab.key} />}
          <Search size={18} className="text-secondary" />
          <input name="q" defaultValue={q} placeholder="프로젝트 검색" className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-secondary" />
        </form>
      </div>

      {shown.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-3 rounded-[20px] bg-surface-2 px-6 py-24 text-center">
          <Search size={40} strokeWidth={1.6} className="text-[#94acf7]" />
          <p className="text-xl font-bold text-foreground">{q ? `‘${q}’과 맞는 프로젝트가 없어요` : "아직 공개한 프로젝트가 없어요"}</p>
          <p className="text-[15px] text-secondary">다른 단어로 찾거나 전체 프로젝트를 둘러보세요.</p>
          <Link href="/products" className="inline-flex items-center gap-1 text-sm font-medium text-brand">
            전체 프로젝트 보기 <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <ul className="mt-8 flex flex-col gap-6">
          {shown.map((p) => {
            const Icon = TYPE_ICON[productType(p.type)];
            const summary = parseStrings(p.summary)[0] ?? "";
            return (
              <li key={p.slug}>
                <Link
                  href={`/products/${p.slug}`}
                  className="group relative flex flex-col gap-6 rounded-xl border border-border bg-background p-6 transition-shadow hover:shadow-[0_8px_24px_rgba(49,92,244,0.12)] md:flex-row md:items-center md:gap-10 md:pr-[92px]"
                >
                  <div className="flex flex-1 flex-col gap-5 md:py-3">
                    <span className="flex items-center gap-3">
                      <Icon size={24} strokeWidth={1.8} className="text-brand" />
                      <span className="text-[28px] font-bold leading-[42px] text-foreground">{p.name}</span>
                    </span>
                    {p.tagline && <span className="text-xl font-medium leading-8 text-foreground">{p.tagline}</span>}
                    {summary && <span className="line-clamp-2 text-[15px] leading-[25px] text-secondary">{summary}</span>}
                  </div>
                  <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-xl bg-surface md:w-[400px]">
                    {p.coverImage && <Image src={p.coverImage} alt="" fill sizes="400px" className="object-cover" />}
                  </div>
                  <span className="absolute right-6 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-brand-soft text-brand md:flex">
                    <ArrowRight size={20} />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <Pagination page={current} totalPages={totalPages} hrefFor={(p) => href({ page: p })} />
      {filtered.length > 0 && (
        <p className="text-center text-[13px] leading-6 text-secondary">
          전체 {filtered.length}개 중 {(current - 1) * PAGE_SIZE + 1}–{Math.min(current * PAGE_SIZE, filtered.length)}개 · 페이지당 {PAGE_SIZE}개
        </p>
      )}
    </div>
  );
}
