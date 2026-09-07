import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { chunkPost, embedTexts, invalidateChunkCache } from "@/lib/rag";
import { NextRequest } from "next/server";

type Params = { params: Promise<{ postId: string }> };

// GET: Chunks for a specific post
export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { postId } = await params;
  const id = parseInt(postId);

  const chunks = await prisma.postChunk.findMany({
    where: { postId: id },
    orderBy: { chunkIndex: "asc" },
    select: { id: true, content: true, chunkIndex: true, createdAt: true },
  });

  return Response.json({ chunks });
}

// POST: Reindex a specific post
export async function POST(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { postId } = await params;
  const id = parseInt(postId);

  try {
    const post = await prisma.post.findUnique({
      where: { id },
      select: { id: true, title: true, slug: true, category: true, content: true },
    });

    if (!post) return Response.json({ error: "Post not found" }, { status: 404 });

    // Delete existing chunks for this post
    await prisma.postChunk.deleteMany({ where: { postId: id } });

    const chunks = chunkPost(post.title, post.content);
    if (chunks.length === 0) return Response.json({ chunks: 0 });

    const embeddings = await embedTexts(chunks);
    await prisma.postChunk.createMany({
      data: chunks.map((content, i) => ({
        postId: post.id,
        postTitle: post.title,
        postSlug: post.slug,
        postCategory: post.category,
        content,
        embedding: JSON.stringify(embeddings[i]),
        chunkIndex: i,
      })),
    });

    invalidateChunkCache();
    return Response.json({ chunks: chunks.length });
  } catch (err) {
    return Response.json({ error: "Indexing failed", detail: String(err) }, { status: 500 });
  }
}

// DELETE: Remove chunks for a specific post
export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { postId } = await params;
  const id = parseInt(postId);

  const { count } = await prisma.postChunk.deleteMany({ where: { postId: id } });
  invalidateChunkCache();
  return Response.json({ deleted: count });
}
