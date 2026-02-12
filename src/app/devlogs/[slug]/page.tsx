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
      <div className="bg-[#22223a] min-h-[600px] border border-[#2e2e4a] rounded-lg p-8 relative">
        <PostBackLink />

        <div className="border-b border-[#2e2e4a] pb-8 mb-8 mt-4">
          <h1 className="text-3xl font-bold text-[#d4d4dc] mb-4 tracking-tight">
            {post.title}
          </h1>
          <PostMetaInfo
            date={post.createdAt.toISOString().split("T")[0]}
            category={post.category}
          />
        </div>

        <div
          className="prose prose-invert max-w-none text-sm leading-7"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
        />

        <CommentSection postId={post.id} />
      </div>
    </div>
  );
}
