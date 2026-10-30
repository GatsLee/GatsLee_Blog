import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileSearch, LayoutList } from "lucide-react";
import { prisma } from "@/lib/db";
import { routeFor } from "@/lib/categories";
import { TOPICS, isTopic, topicLabel } from "@/lib/topics";
import { dotDate } from "@/lib/format";
import TopicIcon from "@/components/common/TopicIcon";
import Breadcrumb from "@/components/common/Breadcrumb";
import Pagination from "@/components/common/Pagination";
import ListControls from "./ListControls";

export const metadata: Metadata = { title: "글" };

const PAGE_SIZE = 10;

type SearchParams = Promise<{ topic?: string; q?: string; sort?: string; page?: string }>;

// IA_PS_001 글 목록 · 00101 전체 글 · 00102 빈 상태
export default async function InsightsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const topic = isTopic(sp.topic) ? sp.topic : null;
  const q = sp.q?.trim().slice(0, 50) ?? "";
  const oldest = sp.sort === "oldest";
  const page = Math.max(1, parseInt(sp.page ?? "1") || 1);

  // 공개된 한국어 글. 저널과 빌드 로그를 함께 보여준다 (D3)
  const where = {
    published: true,
    locale: "ko",
    category: { in: ["journal", "build"] },
    ...(topic ? { topic } : {}),
    ...(q ? { OR: [{ title: { contains: q } }, { description: { contains: q } }] } : {}),
  };
  const [total, posts] = await Promise.all([
    prisma.post.count({ where }),
    prisma.post.findMany({
      where,
      orderBy: { createdAt: oldest ? "asc" : "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: { title: true, slug: true, category: true, description: true, topic: true, createdAt: true },
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const current = topic ? TOPICS.find((t) => t.slug === topic)! : null;

  const hrefFor = (p: number) => {
    const next = new URLSearchParams();
    if (topic) next.set("topic", topic);
    if (q) next.set("q", q);
    if (oldest) next.set("sort", "oldest");
    if (p > 1) next.set("page", String(p));
    return `/insights${next.size ? `?${next}` : ""}`;
  };

  const navItem = (active: boolean) =>
    `flex items-center gap-3 rounded-lg p-3 text-[15px] leading-[23px] transition-colors ${
      active ? "bg-brand-soft font-semibold text-brand" : "text-foreground hover:bg-surface"
    }`;

  return (
    <div className="mx-auto max-w-[1184px] px-6 pb-20 pt-14">
      <Breadcrumb
        items={[{ label: "홈", href: "/" }, { label: "글", href: current ? "/insights" : undefined }, ...(current ? [{ label: current.label }] : [])]}
      />
      <div className="mt-8 flex flex-col gap-2">
        <h1 className="text-[40px] font-bold leading-[60px] text-foreground">{current?.label ?? "글"}</h1>
        <p className="text-[17px] leading-[26px] text-secondary">
          {current ? `${current.description}에 관한 글입니다.` : "기획·개발·AI 등 여러 주제로 쓴 글을 모두 모았습니다."}
        </p>
      </div>

      <div className="mt-12 flex flex-col gap-12 md:flex-row">
        <nav className="flex shrink-0 flex-col gap-3 md:w-[175px]" aria-label="주제">
          <p className="text-sm font-medium text-secondary">주제</p>
          <Link href="/insights" className={navItem(!current)}>
            <LayoutList size={18} className="text-brand" />
            전체
          </Link>
          {TOPICS.map((t) => (
            <Link key={t.slug} href={`/insights?topic=${t.slug}`} className={navItem(topic === t.slug)}>
              <span className="text-brand">
                <TopicIcon slug={t.slug} size={18} />
              </span>
              {t.label}
            </Link>
          ))}
        </nav>

        <section className="min-w-0 flex-1">
          <ListControls placeholder={current ? `${current.label} 글에서 검색` : "글 검색"} count={total} />

          {posts.length === 0 ? (
            <div className="mt-6 flex flex-col items-center gap-3 rounded-[20px] bg-surface-2 px-6 py-24 text-center">
              <FileSearch size={40} strokeWidth={1.6} className="text-[#94acf7]" />
              <p className="text-xl font-bold text-foreground">
                {q ? `‘${q}’과 맞는 글이 없어요` : "아직 이 주제의 글이 없어요"}
              </p>
              <p className="text-[15px] text-secondary">다른 주제를 고르거나 전체 글에서 찾아보세요.</p>
              <Link href="/insights" className="inline-flex items-center gap-1 text-sm font-medium text-brand">
                전체 글 보기 <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <ul className="mt-2">
              {posts.map((p) => (
                <li key={p.slug} className="border-t border-border first:border-t-0">
                  <Link href={routeFor(p.category, p.slug)} className="group flex items-start justify-between gap-6 py-8">
                    <div className="min-w-0">
                      <h2 className="text-2xl font-bold leading-9 text-foreground group-hover:text-brand">{p.title}</h2>
                      {p.description && <p className="mt-2 text-base leading-[26px] text-secondary">{p.description}</p>}
                      <p className="mt-3 font-mono text-[13px] leading-[22px] text-secondary">
                        {[topicLabel(p.topic), dotDate(p.createdAt)].filter(Boolean).join("  /  ")}
                      </p>
                    </div>
                    <ArrowRight size={18} className="mt-2 shrink-0 text-brand" />
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <Pagination page={Math.min(page, totalPages)} totalPages={totalPages} hrefFor={hrefFor} />
          {total > 0 && (
            <p className="text-center text-[13px] leading-6 text-secondary">
              전체 {total}개 중 {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)}개 · 페이지당 {PAGE_SIZE}개
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
