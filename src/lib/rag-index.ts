import { prisma } from "@/lib/db";
import { chunkPost, embedTexts, invalidateChunkCache } from "@/lib/rag";

const OLLAMA_URL = process.env.OLLAMA_URL || "http://host.docker.internal:11434";
// Use a fast non-thinking model for summary generation to avoid long waits
const SUMMARY_MODEL = process.env.SUMMARY_MODEL || "gemma2:2b";

// 한 글의 청크를 FTS5 색인과 맞춘다. 지워진 청크 줄을 빼고 이 글의 청크를 다시 넣는다
async function syncFts(postId: number) {
  try {
    await prisma.$executeRaw`DELETE FROM PostChunkFTS WHERE chunkId NOT IN (SELECT id FROM PostChunk)`;
    await prisma.$executeRaw`DELETE FROM PostChunkFTS WHERE chunkId IN (SELECT id FROM PostChunk WHERE postId = ${postId})`;
    await prisma.$executeRaw`
      INSERT INTO PostChunkFTS(chunkId, content, postTitle)
      SELECT id, content, postTitle FROM PostChunk WHERE postId = ${postId}
    `;
  } catch {
    // FTS5 sync failure is non-critical — vector search still works
  }
}

// Generate AI summary using a fast model (gemma2:2b — no thinking mode overhead)
async function summarize(postId: number, content: string) {
  try {
    const summaryRes = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(30000),
      body: JSON.stringify({
        model: SUMMARY_MODEL,
        prompt: `다음 블로그 포스트를 2-3문장으로 한국어 요약해줘. 규칙: 반드시 완전한 문장으로 끝낼 것, 마크다운 헤더(##)나 글머리 기호(*, -)는 절대 사용하지 말 것, 일반 텍스트만 사용할 것. 핵심 내용과 배울 수 있는 점 중심으로:\n\n${content.slice(0, 3000)}`,
        stream: false,
        options: { temperature: 0.3, num_predict: 400 },
      }),
    });
    if (!summaryRes.ok) return;
    const { response: aiSummary } = await summaryRes.json();
    const cleaned = aiSummary
      ?.replace(/<think>[\s\S]*?<\/think>/g, "") // strip thinking blocks
      .replace(/^#{1,6}\s+.*$/gm, "") // strip markdown headers (## Title)
      .replace(/\n{3,}/g, "\n\n") // normalize excess newlines
      .trim();
    if (cleaned) await prisma.post.update({ where: { id: postId }, data: { aiSummary: cleaned } });
  } catch {
    // Summary generation is non-critical — continue indexing
  }
}

/**
 * 글 하나를 다시 색인한다: 청크 나누기 → 임베딩 → 저장 → FTS 동기화 (→ 요약).
 * 어드민 RAG 관리의 "이 글 다시 색인"과 "전체 다시 색인"이 글마다 부른다.
 */
export async function indexPost(id: number, { summary = false } = {}): Promise<number | null> {
  const post = await prisma.post.findUnique({
    where: { id },
    select: { id: true, title: true, slug: true, category: true, content: true },
  });
  if (!post) return null;

  const chunks = chunkPost(post.title, post.content);
  // 임베딩이 실패하면 기존 청크를 지우기 전에 멈춘다
  const embeddings = chunks.length ? await embedTexts(chunks) : [];
  await prisma.postChunk.deleteMany({ where: { postId: id } });
  if (chunks.length) {
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
  }
  await syncFts(id);
  if (summary) await summarize(post.id, post.content);
  invalidateChunkCache();
  return chunks.length;
}

// 공개 글이 아닌 글(비공개·삭제)의 청크를 지운다
export async function removeOrphanChunks(): Promise<number> {
  const published = await prisma.post.findMany({ where: { published: true }, select: { id: true } });
  const { count } = await prisma.postChunk.deleteMany({ where: { postId: { notIn: published.map((p) => p.id) } } });
  try {
    await prisma.$executeRaw`DELETE FROM PostChunkFTS WHERE chunkId NOT IN (SELECT id FROM PostChunk)`;
  } catch {
    // FTS5 없음
  }
  invalidateChunkCache();
  return count;
}
