import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChessKnight, ChessPawn, ChessRook } from "lucide-react";
import { prisma } from "@/lib/db";
import { routeFor } from "@/lib/categories";
import { TOPICS, topicLabel } from "@/lib/topics";
import { dotDate } from "@/lib/format";
import { parseStrings, productType } from "@/lib/product";
import { getStreak } from "@/lib/streak";
import TopicIcon from "@/components/common/TopicIcon";
import UploadStreak from "@/components/common/UploadStreak";
import SectionHead from "@/components/home/SectionHead";
import ProjectCard from "@/components/home/ProjectCard";
import AskGatsButton from "@/components/home/AskGatsButton";
import TypingWord from "@/components/home/TypingWord";
import RevealOnScroll from "@/components/home/RevealOnScroll";
import { isChatVisible } from "@/lib/chat-settings";

// IA_HM_001 홈. DB가 비었거나 실패하면 블록을 숨긴다 (IA_HM_00101)
export default async function Home() {
  const chatVisible = await isChatVisible();
  const [projects, posts, streak] = await Promise.all([
    prisma.product
      .findMany({
        where: { published: true },
        orderBy: { sortOrder: "asc" },
        take: 3,
        select: { slug: true, name: true, type: true, tagline: true, summary: true },
      })
      .catch(() => []),
    prisma.post
      .findMany({
        where: { published: true, locale: "ko", category: { in: ["journal", "build"] } },
        orderBy: { createdAt: "desc" },
        take: 3,
        select: { title: true, slug: true, category: true, description: true, topic: true, createdAt: true },
      })
      .catch(() => []),
    getStreak(52).catch(() => null),
  ]);

  // 순서대로 늦게 나타나는 간격 (ms)
  const delay = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;

  return (
    <>
      <RevealOnScroll />
      <section className="bg-surface">
        <div className="mx-auto flex max-w-[1184px] flex-col items-center gap-12 px-6 py-14 md:flex-row md:gap-[120px]">
          <div className="flex flex-1 flex-col gap-6">
            <div className="flex flex-col gap-[5px]">
              <p className="motion-rise text-sm font-medium leading-6 text-foreground">
                안녕하세요! 쓸 만한 무언가를 만들고 있는 <strong className="text-2xl font-bold">이준열(Gats Lee)</strong>입니다
              </p>
              <h1 style={delay(120)} className="motion-rise isolate text-[34px] font-bold leading-[48px] tracking-[-1px] text-foreground md:text-[52px] md:tracking-[-2px] md:leading-[72px]">
                <TypingWord words={["유저", "User"]} />의 관점에서
                <br />
                문제를 찾고 해결합니다
              </h1>
            </div>
            <p style={delay(260)} className="motion-rise text-[17px] leading-[25px] text-secondary">
              사용자가 언제, 왜 불편을 겪는지 찾고 필요한 서비스를 만듭니다
              <br />
              직접 만들고 운영하면서 배운 점들을 이 블로그에 기록합니다
            </p>
          </div>
          <div style={delay(200)} className="motion-rise">
            <Image src="/images/hero-chess-v2.png" alt="체스를 두는 이준열 캐릭터" width={336} height={419} priority quality={90} className="hero-float" />
          </div>
        </div>
      </section>

      {projects.length > 0 && (
        <section id="projects" className="scroll-mt-20 bg-surface">
          <div className="mx-auto flex max-w-[1184px] flex-col gap-7 px-6 pb-14 pt-14">
            <div data-reveal>
              <SectionHead icon={<ChessRook size={28} strokeWidth={1.8} aria-hidden />} title="최근에 만든 프로젝트" href="/products" linkLabel="프로젝트 전체 보기" />
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {projects.map((p, i) => {
                const summary = parseStrings(p.summary)[0] ?? "";
                return (
                  <ProjectCard
                    key={p.slug}
                    revealDelay={i * 90}
                    slug={p.slug}
                    name={p.name}
                    type={productType(p.type)}
                    headline={p.tagline || summary}
                    detail={p.tagline ? summary : ""}
                  />
                );
              })}
            </div>
          </div>
        </section>
      )}
      <div className="checker-boundary-down" aria-hidden />

      <section className="mx-auto flex max-w-[1184px] flex-col gap-12 px-6 pb-16 pt-9 lg:flex-row lg:gap-[79px]">
        <div className="min-w-0 flex-1">
          <div data-reveal>
            <SectionHead icon={<ChessKnight size={28} strokeWidth={1.8} aria-hidden />} title="최근에 작성한 포스트" href="/insights" linkLabel="포스트 전체 보기" />
          </div>
          {posts.length === 0 ? (
            <p className="mt-8 text-base text-secondary">아직 공개한 포스트가 없어요.</p>
          ) : (
            <ul className="mt-4">
              {posts.map((p, i) => (
                <li key={p.slug} data-reveal style={delay(i * 90)} className="border-t border-border first:border-t-0">
                  <Link href={routeFor(p.category, p.slug)} className="group block py-6">
                    <span className="block text-[22px] font-bold leading-[34px] text-foreground transition-colors duration-300 group-hover:text-brand">{p.title}</span>
                    {p.description && <span className="mt-1 block text-base leading-7 text-secondary">{p.description}</span>}
                    <span className="mt-2 block font-mono text-[11px] leading-4 text-secondary">
                      {[topicLabel(p.topic), dotDate(p.createdAt)].filter(Boolean).join("  /  ")}
                    </span>
                    <span className="mt-3 inline-flex items-center gap-2 text-[13px] text-brand">
                      포스트 읽기 <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <aside data-reveal style={delay(120)} className="flex w-full flex-col items-center gap-1 self-start rounded-2xl bg-surface p-8 text-center lg:w-[304px] lg:items-stretch lg:text-left">
          <p className="font-mono text-[10px] uppercase leading-[15px] tracking-[0.04em] text-brand">Topics</p>
          <p className="text-[22px] font-bold leading-[34px] text-foreground">주제별로 포스트 보기</p>
          {/* 모바일은 주제를 가운데 정렬로 가로로 늘어놓고, 넓은 화면(lg)에서 왼쪽 정렬 세로 목록으로 바꾼다 */}
          <ul className="mt-3 flex w-full flex-wrap justify-center gap-2 lg:flex-col lg:flex-nowrap lg:gap-0">
            {TOPICS.map((t) => (
              <li key={t.slug}>
                <Link
                  href={`/insights?topic=${t.slug}`}
                  className="group flex items-center gap-2 rounded-full border border-border bg-background px-3.5 py-2 text-sm font-medium text-foreground transition-colors duration-300 hover:text-brand lg:gap-3 lg:rounded-none lg:border-x-0 lg:border-b-0 lg:bg-transparent lg:px-0 lg:py-3 lg:text-base"
                >
                  <span className="text-brand transition-transform duration-300 group-hover:translate-x-0.5 group-hover:scale-110">
                    <TopicIcon slug={t.slug} size={18} />
                  </span>
                  {t.label}
                </Link>
              </li>
            ))}
          </ul>
          {chatVisible && (
            <>
              <p className="mt-4 text-[13px] leading-[22px] text-foreground">어떤 포스트부터 볼지 모르겠다면</p>
              <AskGatsButton />
            </>
          )}
        </aside>
      </section>

      {streak && (
        <section className="mx-auto flex max-w-[1184px] flex-col gap-6 px-6 pb-[72px] pt-6">
          <div data-reveal>
            <SectionHead icon={<ChessPawn size={28} strokeWidth={1.8} aria-hidden />} title="꾸준히 쓰고 만들고 있어요" href="/insights" linkLabel="포스트 전체 보기" />
          </div>
          <div data-reveal style={delay(100)}>
            <UploadStreak data={streak} />
          </div>
        </section>
      )}
    </>
  );
}
