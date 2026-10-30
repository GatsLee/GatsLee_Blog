import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
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

  return (
    <>
      <section className="bg-surface">
        <div className="mx-auto flex max-w-[1184px] flex-col items-center gap-12 px-6 py-14 md:flex-row md:gap-[120px]">
          <div className="flex flex-1 flex-col gap-6">
            <p className="text-sm font-medium leading-6 text-foreground">
              안녕하세요! 쓸 만한 무언가를 만들고 있는 이준열(Gats Lee)입니다
            </p>
            <h1 className="text-[34px] font-bold leading-[48px] tracking-[-1px] text-foreground md:text-[52px] md:tracking-[-2px] md:leading-[72px]">
              사용자의 관점에서
              <br />
              문제를 찾고 해결합니다
            </h1>
            <p className="text-[17px] leading-[25px] text-secondary">
              사용자가 언제, 왜 불편을 겪는지 찾고 필요한 서비스를 만듭니다
              <br />
              직접 만들고 운영하면서 배운 점들을 이곳에 적습니다
            </p>
            <div className="flex flex-wrap items-center gap-6">
              <a
                href="#projects"
                className="inline-flex h-[46px] items-center gap-2 rounded-lg bg-brand px-5 text-sm font-medium text-white"
              >
                기획한 서비스 보기 <ArrowDown size={16} />
              </a>
              <Link href="/insights?topic=planning" className="inline-flex items-center gap-2 text-sm font-medium text-brand">
                문제 해결 과정 읽기 <ArrowRight size={16} />
              </Link>
            </div>
          </div>
          <Image src="/images/hero-chess.png" alt="체스를 두는 이준열 캐릭터" width={336} height={419} priority />
        </div>
      </section>

      {projects.length > 0 && (
        <section id="projects" className="scroll-mt-28 bg-surface">
          <div className="mx-auto flex max-w-[1184px] flex-col gap-7 px-6 pb-14 pt-14">
            <SectionHead label="Recent projects" title="최근에 만든 프로젝트" href="/products" linkLabel="프로젝트 전체 보기" />
            <div className="grid gap-6 md:grid-cols-3">
              {projects.map((p) => {
                const summary = parseStrings(p.summary)[0] ?? "";
                return (
                  <ProjectCard
                    key={p.slug}
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
          <SectionHead label="Recent posts" title="최근에 작성한 글" href="/insights" linkLabel="글 전체 보기" />
          {posts.length === 0 ? (
            <p className="mt-8 text-base text-secondary">아직 공개한 글이 없어요.</p>
          ) : (
            <ul className="mt-4">
              {posts.map((p) => (
                <li key={p.slug} className="border-t border-border first:border-t-0">
                  <Link href={routeFor(p.category, p.slug)} className="group block py-6">
                    <span className="block text-[22px] font-bold leading-[34px] text-foreground group-hover:text-brand">{p.title}</span>
                    {p.description && <span className="mt-1 block text-base leading-7 text-secondary">{p.description}</span>}
                    <span className="mt-2 block font-mono text-[11px] leading-4 text-secondary">
                      {[topicLabel(p.topic), dotDate(p.createdAt)].filter(Boolean).join("  /  ")}
                    </span>
                    <span className="mt-3 inline-flex items-center gap-2 text-[13px] text-brand">
                      글 읽기 <ArrowRight size={16} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <aside className="flex flex-col gap-1 self-start rounded-2xl bg-surface p-8 lg:w-[304px]">
          <p className="font-mono text-[10px] uppercase leading-[15px] tracking-[0.04em] text-brand">Topics</p>
          <p className="text-[22px] font-bold leading-[34px] text-foreground">주제별로 글 보기</p>
          <ul className="mt-3 flex flex-col">
            {TOPICS.map((t) => (
              <li key={t.slug}>
                <Link
                  href={`/insights?topic=${t.slug}`}
                  className="flex items-center gap-3 border-t border-border py-3 text-base font-medium text-foreground hover:text-brand"
                >
                  <span className="text-brand">
                    <TopicIcon slug={t.slug} size={18} />
                  </span>
                  {t.label}
                </Link>
              </li>
            ))}
          </ul>
          {chatVisible && (
            <>
              <p className="mt-4 text-[13px] leading-[22px] text-foreground">어떤 글부터 볼지 모르겠다면</p>
              <AskGatsButton />
            </>
          )}
        </aside>
      </section>

      {streak && (
        <section className="mx-auto flex max-w-[1184px] flex-col gap-6 px-6 pb-[72px] pt-6">
          <SectionHead label="Upload streak" title="꾸준히 쓰고 만들고 있어요" href="/insights" linkLabel="글 전체 보기" />
          <UploadStreak data={streak} />
        </section>
      )}
    </>
  );
}
