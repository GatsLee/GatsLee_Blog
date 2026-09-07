/**
 * FAQ Semantic Router — 4-Tier chat routing
 *
 *   Tier 0: exact string match → static answer (instant)
 *   Tier 1: cosine similarity ≥ MATCH_THRESHOLD → static answer
 *   Tier 2: CONTEXT_THRESHOLD ≤ similarity < MATCH_THRESHOLD → return FAQ for LLM-assisted synthesis
 *   Tier 3: similarity < CONTEXT_THRESHOLD → caller falls back to RAG + LLM
 */

import { prisma } from "@/lib/db";
import { embedText, embedTexts, cosineSimilarity } from "@/lib/rag";

/** Tier 1 cutoff — answer is returned verbatim above this similarity */
export const MATCH_THRESHOLD = parseFloat(process.env.FAQ_MATCH_THRESHOLD || "0.85");
/** Tier 2 cutoff — FAQ is returned as reference for LLM synthesis above this (and below MATCH) */
export const CONTEXT_THRESHOLD = parseFloat(process.env.FAQ_CONTEXT_THRESHOLD || "0.60");

const EMBED_BATCH_SIZE = 20;
const FAQ_CACHE_TTL = 24 * 60 * 60 * 1000;

export interface FaqEntryShape {
  id: number;
  slug: string;
  qVariants: string[];
  a_ko: string;
  a_en: string;
  tags: string[];
}

interface FaqEmbeddedEntry {
  entry: FaqEntryShape;
  qEmbeddings: number[][];
}

let faqCache: FaqEmbeddedEntry[] | null = null;
let faqCacheInitializedAt = 0;
let faqInitPromise: Promise<void> | null = null;

async function loadFaqsFromDb(): Promise<FaqEntryShape[]> {
  const rows = await prisma.faqEntry.findMany({ where: { isActive: true } });
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    qVariants: safeJsonArray(r.qVariants),
    a_ko: r.a_ko,
    a_en: r.a_en,
    tags: safeJsonArray(r.tags),
  }));
}

function safeJsonArray(s: string): string[] {
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

async function initFaqCache(): Promise<void> {
  if (faqCache && Date.now() - faqCacheInitializedAt < FAQ_CACHE_TTL) return;
  if (faqInitPromise) {
    await faqInitPromise;
    return;
  }

  faqInitPromise = (async () => {
    try {
      const entries = await loadFaqsFromDb();

      if (entries.length === 0) {
        console.warn("[faq-router] No active FAQ entries in DB — Tier 1/2 disabled");
        faqCache = [];
        faqCacheInitializedAt = Date.now();
        return;
      }

      const allQuestions: string[] = [];
      const questionMap: Array<{ entryIdx: number }> = [];

      entries.forEach((entry, entryIdx) => {
        entry.qVariants.forEach((q) => {
          allQuestions.push(q);
          questionMap.push({ entryIdx });
        });
      });

      const allEmbeddings: number[][] = [];
      for (let i = 0; i < allQuestions.length; i += EMBED_BATCH_SIZE) {
        const batch = allQuestions.slice(i, i + EMBED_BATCH_SIZE);
        const batchEmbeddings = await embedTexts(batch);
        allEmbeddings.push(...batchEmbeddings);
      }
      console.log(
        `[faq-router] Embedded ${allEmbeddings.length} questions across ${entries.length} FAQ entries`
      );

      const newCache: FaqEmbeddedEntry[] = entries.map((entry) => ({
        entry,
        qEmbeddings: [],
      }));
      allEmbeddings.forEach((embedding, i) => {
        const { entryIdx } = questionMap[i];
        newCache[entryIdx].qEmbeddings.push(embedding);
      });

      faqCache = newCache;
      faqCacheInitializedAt = Date.now();
    } catch (err) {
      console.error("[faq-router] Init failed:", err);
    } finally {
      faqInitPromise = null;
    }
  })();

  await faqInitPromise;
}

/** What `matchFaq` returns. `tier` decides how the caller should use it. */
export interface FaqMatch {
  tier: 1 | 2;
  entry: FaqEntryShape;
  similarity: number;
  answer: string;     // language-selected answer text
  matchedQuestion?: string;
}

function detectLang(text: string): "ko" | "en" {
  const hangul = (text.match(/[가-힯ᄀ-ᇿ㄰-㆏]/g) || []).length;
  const nonSpace = text.replace(/\s/g, "").length;
  return nonSpace > 0 && hangul / nonSpace > 0.2 ? "ko" : "en";
}

function pickAnswer(entry: FaqEntryShape, lang: "ko" | "en"): string {
  return lang === "ko" ? entry.a_ko : entry.a_en;
}

/**
 * Match query against FAQ pool.
 * Returns null when similarity < CONTEXT_THRESHOLD (caller should fall through to RAG).
 */
export async function matchFaq(query: string): Promise<FaqMatch | null> {
  const trimmedQuery = query.trim();
  const lang = detectLang(trimmedQuery);

  // Tier 0: exact string match
  await initFaqCache();
  if (faqCache && faqCache.length > 0) {
    for (const cached of faqCache) {
      if (cached.entry.qVariants.some((q) => q === trimmedQuery)) {
        console.log(`[faq-router] tier=1 (exact) slug=${cached.entry.slug} sim=1.000`);
        return {
          tier: 1,
          entry: cached.entry,
          similarity: 1.0,
          answer: pickAnswer(cached.entry, lang),
          matchedQuestion: trimmedQuery,
        };
      }
    }
  }

  if (!faqCache || faqCache.length === 0) return null;

  // Tier 1/2: semantic similarity
  let queryEmbedding: number[];
  try {
    queryEmbedding = await embedText(trimmedQuery);
  } catch {
    return null;
  }

  let bestScore = -1;
  let bestEntry: FaqEntryShape | null = null;
  let bestQuestion = "";

  for (const cached of faqCache) {
    cached.qEmbeddings.forEach((qEmb, qi) => {
      const score = cosineSimilarity(queryEmbedding, qEmb);
      if (score > bestScore) {
        bestScore = score;
        bestEntry = cached.entry;
        bestQuestion = cached.entry.qVariants[qi] ?? "";
      }
    });
  }

  if (!bestEntry || bestScore < CONTEXT_THRESHOLD) {
    console.log(`[faq-router] tier=3 sim=${bestScore.toFixed(3)} (below ${CONTEXT_THRESHOLD})`);
    return null;
  }

  const matched = bestEntry as FaqEntryShape;
  const tier: 1 | 2 = bestScore >= MATCH_THRESHOLD ? 1 : 2;
  console.log(
    `[faq-router] tier=${tier} slug=${matched.slug} sim=${bestScore.toFixed(3)}`
  );

  return {
    tier,
    entry: matched,
    similarity: bestScore,
    answer: pickAnswer(matched, lang),
    matchedQuestion: bestQuestion,
  };
}

export async function prewarmFaqCache(): Promise<void> {
  await initFaqCache();
}

export function invalidateFaqCache(): void {
  faqCache = null;
  faqCacheInitializedAt = 0;
}

export async function getFaqCount(): Promise<number> {
  if (faqCache) return faqCache.length;
  return prisma.faqEntry.count({ where: { isActive: true } });
}
