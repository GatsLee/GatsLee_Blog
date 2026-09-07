import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import CommentSection from "@/components/posts/CommentSection";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import TableOfContents from "@/components/posts/TableOfContents";
import InsightBackLink from "./InsightBackLink";
import ReadingProgress from "@/components/posts/ReadingProgress";
import ShareButton from "@/components/posts/ShareButton";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.post.findUnique({
    where: { slug },
    select: { title: true, description: true, content: true },
  });
  if (!post) return {};
  const description = post.description || post.content.slice(0, 160).replace(/\n/g, " ");
  return {
    title: post.title,
    description,
    openGraph: {
      title: post.title,
      description,
      type: "article",
    },
  };
}

export default async function InsightDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const post = await prisma.post.findUnique({
    where: { slug },
  });

  if (!post) notFound();

  const wordCount = post.content.split(/\s+/).length;
  const readingTime = Math.max(1, Math.round(wordCount / 200));
  let tags: string[] = [];
  try { tags = JSON.parse(post.tags); } catch { /* ignore */ }

  return (
    <div className="max-w-7xl mx-auto animate-fadeIn">
      <ReadingProgress />
      <div className="flex gap-8">
        {/* Main article */}
        <article className="max-w-4xl flex-1 min-w-0">
          <div className="bg-surface min-h-[600px] card-border p-4 sm:p-6 md:p-12 relative transition-colors">
            <InsightBackLink />

            <div className="pb-8 mb-8 mt-4">
              <h1
                className="text-3xl md:text-4xl font-semibold text-foreground mb-4 tracking-tight"
                style={{ fontFamily: "'Manrope', 'Pretendard', sans-serif" }}
              >
                {post.title}
              </h1>
              <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-xs text-muted tracking-wide">
                <span>{post.createdAt.toISOString().split("T")[0]}</span>
                <span className="text-border-strong">|</span>
                <span className="capitalize">{post.category}</span>
                <span className="text-border-strong">|</span>
                <span>{readingTime} min read</span>
                <span className="text-border-strong">|</span>
                <ShareButton title={post.title} />
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="px-2 py-0.5 text-xs font-mono bg-hover text-muted rounded card-border">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {post.aiSummary && (
              <div className="my-4 rounded-lg border border-accent/30 bg-accent/5 px-5 py-4">
                <p className="text-xs font-mono text-accent mb-2 uppercase tracking-widest">AI 요약</p>
                <div className="text-sm text-foreground/80 leading-relaxed prose prose-sm max-w-none prose-p:my-1 prose-strong:text-foreground prose-li:my-0.5 prose-ul:my-1">
                  <MarkdownRenderer content={post.aiSummary} />
                </div>
              </div>
            )}

            {/* Mobile TOC — hidden on desktop where sidebar TOC is shown */}
            <div className="xl:hidden">
              <TableOfContents content={post.content} />
            </div>

            <MarkdownRenderer content={post.content} />

            <CommentSection postId={post.id} />
          </div>
        </article>

        {/* Desktop TOC sidebar */}
        <aside className="hidden xl:block w-56 shrink-0">
          <TableOfContents content={post.content} />
        </aside>
      </div>
    </div>
  );
}
