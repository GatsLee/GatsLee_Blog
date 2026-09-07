import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import CommentSection from "@/components/posts/CommentSection";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import TableOfContents from "@/components/posts/TableOfContents";
import ProductBackLink from "./ProductBackLink";
import ReadingProgress from "@/components/posts/ReadingProgress";
import ShareButton from "@/components/posts/ShareButton";
import { ExternalLink, Github, Globe } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.post.findUnique({
    where: { slug },
    select: { title: true, description: true, purpose: true, content: true },
  });
  if (!post) return {};
  const description = post.description || post.purpose || post.content.slice(0, 160).replace(/\n/g, " ");
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

function getVideoEmbed(url: string): string | null {
  const ytMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
  );
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return null;
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const post = await prisma.post.findUnique({
    where: { slug },
  });

  if (!post) notFound();

  // Parse demo images
  let demoImages: string[] = [];
  if (post.demoImages) {
    try { demoImages = JSON.parse(post.demoImages); } catch { /* ignore */ }
  }

  let externalLinks: { label: string; url: string }[] = [];
  if (post.externalLinks) {
    try { externalLinks = JSON.parse(post.externalLinks); } catch { /* ignore */ }
  }

  const embedUrl = post.demoVideo ? getVideoEmbed(post.demoVideo) : null;
  const hasStructuredFields = post.targetAudience || post.purpose || post.expectedEffect;
  const wordCount = post.content.split(/\s+/).length;
  const readingTime = Math.max(1, Math.round(wordCount / 200));
  let tags: string[] = [];
  try { tags = JSON.parse(post.tags); } catch { /* ignore */ }

  return (
    <div className="max-w-7xl mx-auto animate-fadeIn">
      <ReadingProgress />
      <div className="flex gap-8">
        {/* Main article */}
        <article className="max-w-5xl flex-1 min-w-0">
          <div className="bg-surface min-h-[600px] card-border p-4 sm:p-6 md:p-12 relative transition-colors">
            <ProductBackLink />

            {/* Cover image */}
            {post.coverImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-64 object-cover rounded-lg card-border mb-8 mt-4"
              />
            )}

            {/* Title + metadata */}
            <div className={`pb-8 mb-8 ${post.coverImage ? '' : 'mt-4'}`}>
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

            {/* External links */}
            {externalLinks.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {externalLinks.map((link, i) => {
                  const isGithub = /github/i.test(link.label) || /github\.com/i.test(link.url);
                  const Icon = isGithub ? Github : /demo|live|site|app/i.test(link.label) ? Globe : ExternalLink;
                  return (
                    <a
                      key={i}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium card-border rounded-lg hover:bg-hover transition-colors text-foreground"
                    >
                      <Icon size={15} />
                      {link.label}
                    </a>
                  );
                })}
              </div>
            )}

            {/* Demo video */}
            {embedUrl && (
              <div className="mb-8 aspect-video">
                <iframe
                  src={embedUrl}
                  className="w-full h-full rounded-lg card-border"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            )}

            {/* Structured info cards */}
            {hasStructuredFields && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {post.purpose && (
                  <div className="bg-background card-border rounded-lg p-5">
                    <h3 className="text-xs font-bold text-muted uppercase tracking-widest mb-2">Purpose</h3>
                    <p className="text-sm text-foreground leading-relaxed">{post.purpose}</p>
                  </div>
                )}
                {post.targetAudience && (
                  <div className="bg-background card-border rounded-lg p-5">
                    <h3 className="text-xs font-bold text-muted uppercase tracking-widest mb-2">Target Audience</h3>
                    <p className="text-sm text-foreground leading-relaxed">{post.targetAudience}</p>
                  </div>
                )}
                {post.expectedEffect && (
                  <div className="bg-background card-border rounded-lg p-5">
                    <h3 className="text-xs font-bold text-muted uppercase tracking-widest mb-2">Expected Effect</h3>
                    <p className="text-sm text-foreground leading-relaxed">{post.expectedEffect}</p>
                  </div>
                )}
              </div>
            )}

            {/* Demo images gallery */}
            {demoImages.length > 0 && (
              <div className="mb-8">
                <h3 className="text-[10px] font-bold text-muted uppercase tracking-widest mb-4">Screenshots</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {demoImages.map((url, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={url}
                      alt={`Screenshot ${i + 1}`}
                      className="w-full rounded-lg card-border"
                      loading="lazy"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Mobile TOC — hidden on desktop where sidebar TOC is shown */}
            <div className="xl:hidden">
              <TableOfContents content={post.content} />
            </div>

            {/* Main content */}
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
