import { prisma } from "@/lib/db";
import BlueprintEditor from "@/components/editor/BlueprintEditor";

export default async function BlueprintEditorPage() {
  const posts = await prisma.post.findMany({
    where: { category: "blueprint" },
    orderBy: { createdAt: "asc" },
  });

  const serialized = posts.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    content: p.content,
    tags: p.tags,
    createdAt: p.createdAt.toISOString(),
  }));

  return <BlueprintEditor initialPosts={serialized} />;
}
