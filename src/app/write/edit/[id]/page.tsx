import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import PostEditor from "@/components/editor/PostEditorClient";
import type { EditorPost } from "@/components/editor/PostEditor";
import { ToastProvider } from "@/components/admin/ui/Toast";

export const metadata = { title: "포스트 수정" };

type Params = Promise<{ id: string }>;

// IA_AD_00204 글 수정
export default async function EditPostPage({ params }: { params: Params }) {
  const id = parseInt((await params).id);
  const post = Number.isNaN(id)
    ? null
    : await prisma.post.findUnique({
        where: { id },
        select: { id: true, title: true, description: true, content: true, category: true, topic: true, status: true, tags: true, slug: true, locale: true, createdAt: true, updatedAt: true },
      });
  if (!post) notFound();

  return (
    <ToastProvider>
      <PostEditor post={{ ...post, createdAt: post.createdAt.toISOString(), updatedAt: post.updatedAt.toISOString() } satisfies EditorPost} />
    </ToastProvider>
  );
}
