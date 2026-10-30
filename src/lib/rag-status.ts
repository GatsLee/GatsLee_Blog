import { prisma } from "@/lib/db";

// 글별 색인 상태 (IA_AD_004 RAG 카드, IA_AD_00403)
export type IndexState = "fresh" | "stale" | "missing" | "orphan";

export const INDEX_LABEL: Record<IndexState, string> = {
  fresh: "최신",
  stale: "색인 후 수정",
  missing: "미색인",
  orphan: "비공개 남음",
};

// 상태 막대·점 색
export const INDEX_COLOR: Record<IndexState, string> = {
  fresh: "bg-success",
  stale: "bg-[#e0a03c]",
  missing: "bg-[#c4c9d2]",
  orphan: "bg-danger",
};

export interface PostIndex {
  postId: number;
  title: string;
  state: IndexState;
  chunks: number;
  indexedAt: Date | null;
}

export async function getIndexStates(): Promise<PostIndex[]> {
  const [posts, groups] = await Promise.all([
    prisma.post.findMany({ select: { id: true, title: true, published: true, updatedAt: true } }),
    prisma.postChunk.groupBy({ by: ["postId", "postTitle"], _count: { id: true }, _min: { createdAt: true } }),
  ]);
  const byPost = new Map(groups.map((g) => [g.postId, g]));
  const out: PostIndex[] = [];
  for (const p of posts) {
    const g = byPost.get(p.id);
    if (p.published) {
      const indexedAt = g?._min.createdAt ?? null;
      const state: IndexState = !g ? "missing" : indexedAt && indexedAt < p.updatedAt ? "stale" : "fresh";
      out.push({ postId: p.id, title: p.title, state, chunks: g?._count.id ?? 0, indexedAt });
    } else if (g) {
      out.push({ postId: p.id, title: p.title, state: "orphan", chunks: g._count.id, indexedAt: g._min.createdAt });
    }
    byPost.delete(p.id);
  }
  // 글은 지워졌는데 청크만 남은 경우
  for (const g of byPost.values()) out.push({ postId: g.postId, title: g.postTitle, state: "orphan", chunks: g._count.id, indexedAt: g._min.createdAt });
  return out;
}

export function countStates(list: PostIndex[]): Record<IndexState, number> {
  const c: Record<IndexState, number> = { fresh: 0, stale: 0, missing: 0, orphan: 0 };
  for (const p of list) c[p.state]++;
  return c;
}

// 모델 서버 상태 (읽기 전용)
export async function modelServer() {
  const url = process.env.OLLAMA_URL || "http://host.docker.internal:11434";
  const ok = await fetch(`${url}/api/tags`, { signal: AbortSignal.timeout(2000), cache: "no-store" })
    .then((r) => r.ok)
    .catch(() => false);
  return { ok, chatModel: process.env.CHAT_MODEL || "gemma4:e4b", embedModel: process.env.EMBED_MODEL || "bge-m3" };
}
