import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import CommentSection from "@/components/posts/CommentSection";
import { PostBackLink, PostMetaInfo } from "@/components/posts/PostMeta";

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

        <div className="prose prose-invert prose-p:text-[#b0b0bc] prose-headings:text-[#d4d4dc] max-w-none font-light text-sm leading-8 whitespace-pre-line">
          {post.content}
        </div>

        <CommentSection postId={post.id} />
      </div>
    </div>
  );
}
