import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import CommentSection from "@/components/posts/CommentSection";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import ProductBackLink from "./ProductBackLink";

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

  const embedUrl = post.demoVideo ? getVideoEmbed(post.demoVideo) : null;
  const hasStructuredFields = post.targetAudience || post.purpose || post.expectedEffect;

  return (
    <div className="max-w-5xl mx-auto animate-fadeIn">
      <div className="bg-surface min-h-[600px] card-border rounded-lg p-8 md:p-12 relative transition-colors">
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
            style={{ fontFamily: "Archivo, sans-serif" }}
          >
            {post.title}
          </h1>
          <div className="flex items-center text-xs text-muted space-x-4 tracking-wide">
            <span>{post.createdAt.toISOString().split("T")[0]}</span>
            <span className="text-border-strong">|</span>
            <span className="capitalize">{post.category}</span>
          </div>
        </div>

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
                <h3 className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2">Purpose</h3>
                <p className="text-sm text-foreground leading-relaxed">{post.purpose}</p>
              </div>
            )}
            {post.targetAudience && (
              <div className="bg-background card-border rounded-lg p-5">
                <h3 className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2">Target Audience</h3>
                <p className="text-sm text-foreground leading-relaxed">{post.targetAudience}</p>
              </div>
            )}
            {post.expectedEffect && (
              <div className="bg-background card-border rounded-lg p-5">
                <h3 className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2">Expected Effect</h3>
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

        {/* Main content */}
        <MarkdownRenderer content={post.content} />

        <CommentSection postId={post.id} />
      </div>
    </div>
  );
}
