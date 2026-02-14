import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import CommentSection from "@/components/posts/CommentSection";
import { PostBackLink, PostMetaInfo } from "@/components/posts/PostMeta";
import { renderMarkdown } from "@/lib/markdown";

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const post = await prisma.post.findUnique({
    where: { slug },
  });

  if (!post) notFound();

  return (
    <div className="max-w-5xl mx-auto animate-fadeIn">
      <div className="bg-surface min-h-[600px] border border-border rounded-lg p-8 md:p-12 relative transition-colors">
        <PostBackLink />

        <div className="border-b border-border pb-8 mb-8 mt-4">
          <h1 className="text-3xl md:text-4xl font-semibold text-foreground mb-4 tracking-tight" style={{ fontFamily: 'Archivo, sans-serif' }}>
            {post.title}
          </h1>
          <PostMetaInfo
            date={post.createdAt.toISOString().split("T")[0]}
            category={post.category}
          />
        </div>

        <div
          className="prose prose-invert dark:prose-invert prose-zinc max-w-none text-base leading-7 text-foreground"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
        />

        <CommentSection postId={post.id} />
      </div>
    </div>
  );
}
