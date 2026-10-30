import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { invalidateChunkCache } from "@/lib/rag";
import { indexPost } from "@/lib/rag-index";
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

// POST: Reindex a specific post. body.summary가 true면 AI 요약도 다시 만든다 (전체 다시 색인)
export async function POST(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { postId } = await params;
  const body = await req.json().catch(() => ({}));
  try {
    const chunks = await indexPost(parseInt(postId), { summary: body.summary === true });
    if (chunks === null) return Response.json({ error: "Post not found" }, { status: 404 });
    return Response.json({ chunks });
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
  await prisma.$executeRaw`DELETE FROM PostChunkFTS WHERE chunkId NOT IN (SELECT id FROM PostChunk)`.catch(() => 0);
  invalidateChunkCache();
  return Response.json({ deleted: count });
}
