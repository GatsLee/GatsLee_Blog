import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { chunkPost, embedTexts, invalidateChunkCache } from "@/lib/rag";
import { parseBeats, beatsToMarkdown } from "@/lib/case-study";

const OLLAMA_URL = process.env.OLLAMA_URL || "http://host.docker.internal:11434";
const CHAT_MODEL = process.env.CHAT_MODEL || "gemma4:e4b";
// Use a fast non-thinking model for summary generation to avoid long waits
const SUMMARY_MODEL = process.env.SUMMARY_MODEL || "gemma2:2b";

// GET: RAG statistics
export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const totalChunks = await prisma.postChunk.count();

    // Chunks per post
    const postStats = await prisma.postChunk.groupBy({
      by: ["postId", "postTitle", "postSlug", "postCategory"],
      _count: { id: true },
      _max: { createdAt: true },
    });

    // All published posts (to show unindexed ones too)
    const allPosts = await prisma.post.findMany({
      where: { published: true },
      select: { id: true, title: true, slug: true, category: true },
    });

    const indexedMap = new Map(postStats.map((s) => [s.postId, { chunks: s._count.id, lastIndexed: s._max.createdAt }]));

    const posts = allPosts.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      category: p.category,
      chunks: indexedMap.get(p.id)?.chunks || 0,
      lastIndexed: indexedMap.get(p.id)?.lastIndexed?.toISOString() || null,
    }));

    // Ollama status
    let ollamaStatus = { available: false, chatModel: "", embedModel: "" };
    try {
      const res = await fetch(`${OLLAMA_URL}/api/tags`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const tags = await res.json();
        const models = (tags.models || []).map((m: { name: string }) => m.name);
        ollamaStatus = {
          available: true,
          chatModel: models.find((n: string) =>
            n.startsWith("qwen") || n.startsWith("llama") || n.startsWith("gemma") || n.startsWith("mistral")
          ) || "",
          embedModel: models.find((n: string) =>
            n.startsWith("bge-m3") || n.startsWith("nomic-embed")
          ) || "",
        };
      }
    } catch { /* ignore */ }

    return Response.json({
      totalChunks,
      indexedPosts: postStats.length,
      totalPosts: allPosts.length,
      ollama: ollamaStatus,
      posts,
    });
  } catch {
    return Response.json({ error: "Failed to fetch RAG stats" }, { status: 500 });
  }
}

// POST: Full reindex — embeds all posts, syncs FTS5, generates AI summaries
export async function POST() {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const posts = await prisma.post.findMany({
      where: { published: true },
      select: { id: true, title: true, slug: true, category: true, content: true, caseBeats: true },
    });

    if (posts.length === 0) return Response.json({ indexed: 0, chunks: 0 });

    await prisma.postChunk.deleteMany();
    let totalChunks = 0;

    for (const post of posts) {
      // Case study beats live in a JSON column the chunker can't see — flatten
      // them into the indexed text so the chatbot can answer from them.
      const beats = post.category === "case" ? parseBeats(post.caseBeats) : null;
      const indexable = beats
        ? `${post.content}\n\n${beatsToMarkdown(beats)}`
        : post.content;

      const chunks = chunkPost(post.title, indexable);
      if (chunks.length === 0) continue;

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
      totalChunks += chunks.length;

      // Generate AI summary using a fast model (gemma2:2b — no thinking mode overhead)
      try {
        const summaryRes = await fetch(`${OLLAMA_URL}/api/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: AbortSignal.timeout(30000),
          body: JSON.stringify({
            model: SUMMARY_MODEL,
            prompt: `다음 블로그 포스트를 2-3문장으로 한국어 요약해줘. 규칙: 반드시 완전한 문장으로 끝낼 것, 마크다운 헤더(##)나 글머리 기호(*, -)는 절대 사용하지 말 것, 일반 텍스트만 사용할 것. 핵심 내용과 배울 수 있는 점 중심으로:\n\n${indexable.slice(0, 3000)}`,
            stream: false,
            options: { temperature: 0.3, num_predict: 400 },
          }),
        });
        if (summaryRes.ok) {
          const { response: aiSummary } = await summaryRes.json();
          const cleaned = aiSummary
            ?.replace(/<think>[\s\S]*?<\/think>/g, "")   // strip thinking blocks
            .replace(/^#{1,6}\s+.*$/gm, "")               // strip markdown headers (## Title)
            .replace(/\n{3,}/g, "\n\n")                   // normalize excess newlines
            .trim();
          if (cleaned) {
            await prisma.post.update({
              where: { id: post.id },
              data: { aiSummary: cleaned },
            });
          }
        }
      } catch {
        // Summary generation is non-critical — continue indexing
      }
    }

    // Sync FTS5 trigram index for BM25 search
    try {
      await prisma.$executeRaw`DELETE FROM PostChunkFTS`;
      await prisma.$executeRaw`
        INSERT INTO PostChunkFTS(chunkId, content, postTitle)
        SELECT id, content, postTitle FROM PostChunk
      `;
    } catch {
      // FTS5 sync failure is non-critical — vector search still works
    }

    invalidateChunkCache();
    return Response.json({ indexed: posts.length, chunks: totalChunks });
  } catch (err) {
    return Response.json({ error: "Indexing failed", detail: String(err) }, { status: 500 });
  }
}

// DELETE: Clear all chunks
export async function DELETE() {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { count } = await prisma.postChunk.deleteMany();
    invalidateChunkCache();
    return Response.json({ deleted: count });
  } catch {
    return Response.json({ error: "Failed to delete chunks" }, { status: 500 });
  }
}
