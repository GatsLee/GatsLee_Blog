import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import CommentSection from "@/components/posts/CommentSection";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import InsightBackLink from "./InsightBackLink";

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

  return (
    <div className="max-w-5xl mx-auto animate-fadeIn">
      <div className="bg-surface min-h-[600px] card-border rounded-lg p-8 md:p-12 relative transition-colors">
        <InsightBackLink />

        <div className="pb-8 mb-8 mt-4">
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

        <MarkdownRenderer content={post.content} />

        <CommentSection postId={post.id} />
      </div>
    </div>
  );
}
