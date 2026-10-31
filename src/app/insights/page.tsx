import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileSearch, LayoutList } from "lucide-react";
import { prisma } from "@/lib/db";
import { routeFor } from "@/lib/categories";
import { TOPICS, isTopic, topicLabel } from "@/lib/topics";
import { dotDate } from "@/lib/format";
import CircleArrow from "@/components/common/CircleArrow";
import TopicIcon from "@/components/common/TopicIcon";
import Breadcrumb from "@/components/common/Breadcrumb";
import Pagination from "@/components/common/Pagination";
import RevealOnScroll from "@/components/home/RevealOnScroll";
import ListControls from "./ListControls";

export const metadata: Metadata = { title: "포스트" };

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

  // 모바일은 가로로 늘어선 칩, md 이상은 세로 목록
  const navItem = (active: boolean) =>
    `flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm transition-colors md:gap-3 md:rounded-lg md:border-0 md:p-3 md:text-[15px] md:leading-[23px] ${
      active ? "border-transparent bg-brand-soft font-semibold text-brand" : "border-border bg-background text-foreground hover:bg-surface md:bg-transparent"
    }`;

  // 순서대로 늦게 나타나는 간격 (ms)
  const delay = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;

  return (
    <div className="mx-auto max-w-[1184px] px-6 pb-20 pt-14">
      {/* 주제·검색·정렬·페이지가 바뀌면 새로 들어온 행도 드러나도록 다시 붙인다 */}
      <RevealOnScroll key={hrefFor(page)} />
      <div className="motion-rise">
        <Breadcrumb
          items={[{ label: "홈", href: "/" }, { label: "포스트", href: current ? "/insights" : undefined }, ...(current ? [{ label: current.label }] : [])]}
        />
      </div>
      <div style={delay(100)} className="motion-rise mt-8 flex flex-col gap-2">
        <h1 className="text-[40px] font-bold leading-[60px] text-foreground">{current?.label ?? "포스트"}</h1>
        <p className="text-[17px] leading-[26px] text-secondary">
          {current ? `${current.description}에 관한 포스트입니다.` : "기획·개발·AI 등 여러 주제로 쓴 포스트를 모두 모았습니다."}
        </p>
      </div>

      <div className="mt-12 flex flex-col gap-12 md:flex-row">
        <nav style={delay(200)} className="motion-rise flex shrink-0 flex-wrap gap-2 md:w-[175px] md:flex-col md:flex-nowrap md:gap-3" aria-label="주제">
          <p className="w-full text-sm font-medium text-secondary">주제</p>
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
          <div style={delay(260)} className="motion-rise">
            <ListControls placeholder={current ? `${current.label} 포스트에서 검색` : "포스트 검색"} count={total} />
          </div>

          {posts.length === 0 ? (
            <div style={delay(320)} className="motion-rise mt-6 flex flex-col items-center gap-3 rounded-[20px] bg-surface-2 px-6 py-24 text-center">
              <FileSearch size={40} strokeWidth={1.6} className="text-[#94acf7]" />
              <p className="text-xl font-bold text-foreground">
                {q ? `‘${q}’과 맞는 포스트가 없어요` : "아직 이 주제의 포스트가 없어요"}
              </p>
              <p className="text-[15px] text-secondary">다른 주제를 고르거나 전체 포스트에서 찾아보세요.</p>
              <Link href="/insights" className="group inline-flex items-center gap-1 text-sm font-medium text-brand">
                전체 포스트 보기 <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          ) : (
            <ul className="mt-2">
              {posts.map((p, i) => (
                <li key={p.slug} data-reveal style={delay(300 + i * 70)} className="border-t border-border first:border-t-0">
                  <Link href={routeFor(p.category, p.slug)} className="group flex items-center justify-between gap-6 py-8">
                    <div className="min-w-0">
                      <h2 className="text-2xl font-bold leading-9 text-foreground transition-colors duration-300 group-hover:text-brand">{p.title}</h2>
                      {p.description && <p className="mt-2 text-base leading-[26px] text-secondary">{p.description}</p>}
                      <p className="mt-3 font-mono text-[13px] leading-[22px] text-secondary">
                        {[topicLabel(p.topic), dotDate(p.createdAt)].filter(Boolean).join("  /  ")}
                      </p>
                    </div>
                    <CircleArrow />
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
