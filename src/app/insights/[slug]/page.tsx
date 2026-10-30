import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { routeFor } from "@/lib/categories";
import { topicLabel } from "@/lib/topics";
import { koreanDate } from "@/lib/format";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import CommentSection from "@/components/posts/CommentSection";
import { TocCollapsible, TocSidebar } from "@/components/posts/TableOfContents";
import PostTools from "@/components/posts/PostTools";
import MarginFootnotes from "@/components/posts/MarginFootnotes";
import Breadcrumb from "@/components/common/Breadcrumb";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.post.findUnique({
    where: { slug },
    select: { title: true, description: true, content: true, published: true },
  });
  if (!post || !post.published) return {};
  const description = post.description || post.content.slice(0, 160).replace(/\n/g, " ");
  return { title: post.title, description, openGraph: { title: post.title, description, type: "article" } };
}

// IA_PS_002 글 상세 · 00201 댓글 있음 · 00203 초안 미리보기
export default async function InsightDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = await prisma.post.findUnique({
    where: { slug },
    include: { product: { select: { name: true, slug: true, tagline: true, published: true } } },
  });
  if (!post) notFound();

  // 비공개 글은 어드민에게만 초안 안내와 함께 보여준다
  const isDraft = !post.published;
  if (isDraft && !(await getSession())) notFound();

  let tags: string[] = [];
  try {
    tags = JSON.parse(post.tags);
  } catch {
    /* 태그 형식이 깨진 글은 태그 없이 보여준다 */
  }

  // 함께 읽을 글: 지정한 관련 글이 있으면 그것, 없으면 같은 주제 최근 글
  let relatedIds: number[] = [];
  try {
    relatedIds = (JSON.parse(post.relatedPosts) as unknown[]).map(Number).filter(Boolean);
  } catch {
    /* 비어 있으면 같은 주제로 채운다 */
  }
  const related = await prisma.post.findMany({
    where: {
      published: true,
      locale: "ko",
      id: relatedIds.length ? { in: relatedIds } : { not: post.id },
      ...(relatedIds.length ? {} : { topic: post.topic || "__none__" }),
    },
    orderBy: { createdAt: "desc" },
    take: 2,
    select: { title: true, slug: true, category: true },
  });
  const project = post.product?.published ? post.product : null;
  const topic = topicLabel(post.topic);

  return (
    <article>
      {isDraft && (
        <div className="bg-brand-soft px-6 py-3 text-center text-sm text-brand">
          비공개 초안입니다. 방문자에게는 보이지 않아요.
        </div>
      )}

      <header className="mx-auto flex max-w-[1184px] flex-col gap-[18px] px-6 pb-16 pt-14">
        <Breadcrumb
          items={[{ label: "글", href: "/insights" }, ...(topic ? [{ label: topic, href: `/insights?topic=${post.topic}` }] : [])]}
        />
        <h1 className="text-[36px] font-bold leading-[50px] text-foreground md:text-[56px] md:leading-[78px]">{post.title}</h1>
        {post.description && (
          <p className="text-[20px] leading-8 text-secondary md:text-[25px] md:leading-10">{post.description}</p>
        )}
        {tags.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {tags.slice(0, 5).map((tag) => (
              <li key={tag} className="rounded-full bg-brand px-3 py-[5px] text-sm font-medium leading-[22px] text-white">
                {tag}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-2 flex items-center justify-between border-t border-border pt-4">
          <time dateTime={post.createdAt.toISOString()} className="text-sm text-secondary">
            {koreanDate(post.createdAt)}
          </time>
          <PostTools />
        </div>
        <div className="xl:hidden">
          <TocCollapsible content={post.content} />
        </div>
      </header>

      <div className="mx-auto flex max-w-[1184px] gap-8 px-6 pb-8">
        <aside className="hidden w-[176px] shrink-0 xl:block">
          <TocSidebar content={post.content} />
        </aside>
        <div id="post-body" className="article-body min-w-0 max-w-[720px] flex-1">
          <MarkdownRenderer content={post.content} />
        </div>
        <aside className="hidden w-[224px] shrink-0 xl:block">
          <MarginFootnotes articleId="post-body" />
        </aside>
      </div>

      <div className="mx-auto flex max-w-[1184px] flex-col gap-14 px-6 pb-24 xl:pl-[232px] xl:pr-[280px]">
        {project && (
          <Link
            href={`/products/${project.slug}`}
            className="flex items-center justify-between gap-6 rounded-2xl bg-surface p-6 transition-colors hover:bg-brand-soft"
          >
            <span>
              <span className="block text-sm text-brand">관련 프로젝트</span>
              <span className="mt-1 block text-[26px] font-bold leading-[38px] text-foreground">{project.name}</span>
              {project.tagline && <span className="block text-base text-secondary">{project.tagline}</span>}
            </span>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-background text-brand">
              <ArrowRight size={20} />
            </span>
          </Link>
        )}

        {related.length > 0 && (
          <section>
            <h2 className="text-[26px] font-bold leading-[38px] text-foreground">함께 읽을 글</h2>
            <ul className="mt-4">
              {related.map((r) => (
                <li key={r.slug} className="border-t border-border">
                  <Link href={routeFor(r.category, r.slug)} className="flex items-center justify-between gap-4 py-4 text-lg font-bold text-foreground hover:text-brand">
                    {r.title}
                    <ArrowRight size={16} className="shrink-0 text-brand" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <CommentSection postId={post.id} />
      </div>
    </article>
  );
}
