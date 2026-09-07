import { prisma } from "./db";
import { routeFor } from "./categories";

const OLLAMA_URL = process.env.OLLAMA_URL || "http://host.docker.internal:11434";
const EMBED_MODEL = process.env.EMBED_MODEL || "bge-m3";

export interface ChunkResult {
  postTitle: string;
  postSlug: string;
  postCategory: string;
  content: string;
  score: number;
  route: string; // full route path e.g. "/products/my-project"
}

/**
 * Strip markdown syntax to plain text, keeping code blocks readable.
 */
export function stripMarkdown(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, (match) => {
      // Keep code content, remove fences
      return match.replace(/```\w*\n?/g, "").trim();
    })
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1") // images → alt text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")  // links → text
    .replace(/#{1,6}\s+(.+)/g, "Section: $1") // headers
    .replace(/(\*\*|__)(.*?)\1/g, "$2")        // bold
    .replace(/(\*|_)(.*?)\1/g, "$2")           // italic
    .replace(/~~(.*?)~~/g, "$1")               // strikethrough
    .replace(/`([^`]+)`/g, "$1")               // inline code
    .replace(/>\s+/g, "")                      // blockquotes
    .replace(/[-*+]\s+/g, "- ")               // list items
    .replace(/\d+\.\s+/g, "")                 // numbered lists
    .replace(/\n{3,}/g, "\n\n")               // collapse newlines
    .trim();
}

/**
 * Chunk a post into 600-1000 char segments with title prefix.
 * Keeps markdown formatting (Qwen excels at markdown comprehension).
 */
export function chunkPost(title: string, content: string): string[] {
  // Keep markdown but strip image links (noise for embeddings)
  const cleaned = content.replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1").trim();
  const paragraphs = cleaned.split(/\n\n+/).filter((p) => p.trim().length > 50);

  const chunks: string[] = [];

  for (const para of paragraphs) {
    if (para.length <= 1000) {
      chunks.push(`[Post: ${title}] ${para.trim()}`);
    } else {
      // Split long paragraphs by sentences
      const sentences = para.match(/[^.!?。]+[.!?。]?\s*/g) || [para];
      let current = "";
      for (const sentence of sentences) {
        if ((current + sentence).length > 1000 && current.length > 0) {
          chunks.push(`[Post: ${title}] ${current.trim()}`);
          current = sentence;
        } else {
          current += sentence;
        }
      }
      if (current.trim().length > 50) {
        chunks.push(`[Post: ${title}] ${current.trim()}`);
      }
    }
  }

  return chunks;
}

/**
 * Generate embedding via Ollama (bge-m3 by default).
 */
export async function embedText(text: string): Promise<number[]> {
  const res = await fetch(`${OLLAMA_URL}/api/embed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: EMBED_MODEL, input: text }),
  });

  if (!res.ok) {
    throw new Error(`Embedding failed: ${res.status}`);
  }

  const data = await res.json();
  return data.embeddings[0];
}

/**
 * Batch embed multiple texts.
 */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  const res = await fetch(`${OLLAMA_URL}/api/embed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: EMBED_MODEL, input: texts }),
  });

  if (!res.ok) {
    throw new Error(`Batch embedding failed: ${res.status}`);
  }

  const data = await res.json();
  return data.embeddings;
}

/**
 * Cosine similarity between two vectors.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

// --- In-memory caches ---

interface CachedChunk {
  id: number;
  postTitle: string;
  postSlug: string;
  postCategory: string;
  content: string;
  embedding: number[];
}

let chunkCache: CachedChunk[] | null = null;
let cacheLoadedAt = 0;
const CHUNK_CACHE_TTL = 5 * 60 * 1000;

async function getChunks(): Promise<CachedChunk[]> {
  if (chunkCache && Date.now() - cacheLoadedAt < CHUNK_CACHE_TTL) {
    return chunkCache;
  }
  const raw = await prisma.postChunk.findMany({
    select: { id: true, postTitle: true, postSlug: true, postCategory: true, content: true, embedding: true },
  });
  chunkCache = raw.map((c) => ({
    id: c.id,
    postTitle: c.postTitle,
    postSlug: c.postSlug,
    postCategory: c.postCategory,
    content: c.content,
    embedding: JSON.parse(c.embedding) as number[],
  }));
  cacheLoadedAt = Date.now();
  return chunkCache;
}

export function invalidateChunkCache() {
  chunkCache = null;
}

const embeddingCache = new Map<string, { embedding: number[]; ts: number }>();
const EMBED_CACHE_TTL = 10 * 60 * 1000;

async function getCachedEmbedding(text: string): Promise<number[]> {
  const cached = embeddingCache.get(text);
  if (cached && Date.now() - cached.ts < EMBED_CACHE_TTL) {
    return cached.embedding;
  }
  const embedding = await embedText(text);
  embeddingCache.set(text, { embedding, ts: Date.now() });
  if (embeddingCache.size > 100) {
    const oldest = embeddingCache.keys().next().value;
    if (oldest) embeddingCache.delete(oldest);
  }
  return embedding;
}

// --- BM25 via SQLite FTS5 ---

interface BM25Result {
  chunkId: number;
  rank: number;
}

/**
 * BM25 keyword search via SQLite FTS5 trigram index.
 * Falls back to empty array if FTS5 table unavailable.
 */
async function bm25Search(query: string, topK = 20): Promise<BM25Result[]> {
  // Strip special FTS5 query syntax to avoid parse errors
  const safeQuery = query.replace(/["*()\[\]{};:]/g, " ").trim();
  if (!safeQuery) return [];
  try {
    return await prisma.$queryRaw<BM25Result[]>`
      SELECT chunkId, rank FROM PostChunkFTS
      WHERE PostChunkFTS MATCH ${safeQuery}
      ORDER BY rank
      LIMIT ${topK}
    `;
  } catch {
    return [];
  }
}

/**
 * Reciprocal Rank Fusion — fuses two ranked ID lists.
 * Score formula: 1/(k + rank), k=60 (Elasticsearch default).
 */
function rrfFusion(vectorIds: number[], bm25Ids: number[], k = 60): Map<number, number> {
  const scores = new Map<number, number>();
  const add = (ids: number[]) =>
    ids.forEach((id, i) => scores.set(id, (scores.get(id) ?? 0) + 1 / (k + i + 1)));
  add(vectorIds);
  add(bm25Ids);
  return scores;
}

/**
 * Retrieve relevant context chunks for a query using Hybrid Retrieval.
 * Pipeline: dense vector (top-20) + BM25 FTS5 (top-20) → RRF → top-K with diversity filter.
 */
export async function retrieveContext(query: string, topK: number = 5): Promise<ChunkResult[]> {
  // Load chunks and query embedding in parallel
  const [allChunks, queryEmbedding] = await Promise.all([
    getChunks(),
    getCachedEmbedding(query),
  ]);

  if (allChunks.length === 0) return [];

  // Dense vector search (in-memory cosine similarity)
  const vectorScored = allChunks
    .map((chunk) => ({ id: chunk.id, score: cosineSimilarity(queryEmbedding, chunk.embedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);

  // BM25 search (async DB call) — runs after vector scoring since it's non-blocking
  const bm25Scored = await bm25Search(query, 20);

  const vectorIds = vectorScored.map((r) => r.id);
  const bm25Ids = bm25Scored.map((r) => r.chunkId);

  // Fuse rankings with RRF
  const rrfScores = rrfFusion(vectorIds, bm25Ids);

  // Sort by RRF score, over-fetch for diversity filter
  const rankedIds = [...rrfScores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topK * 3)
    .map(([id]) => id);

  const chunkMap = new Map(allChunks.map((c) => [c.id, c]));

  // Apply per-post diversity limit (max 2 chunks per post)
  const postCount: Record<string, number> = {};
  const results: ChunkResult[] = [];

  for (const id of rankedIds) {
    if (results.length >= topK) break;
    const chunk = chunkMap.get(id);
    if (!chunk) continue;
    const count = postCount[chunk.postSlug] || 0;
    if (count >= 2) continue;
    postCount[chunk.postSlug] = count + 1;
    results.push({
      postTitle: chunk.postTitle,
      postSlug: chunk.postSlug,
      postCategory: chunk.postCategory,
      content: chunk.content,
      score: rrfScores.get(id) ?? 0,
      route: routeFor(chunk.postCategory, chunk.postSlug),
    });
  }

  return results;
}
