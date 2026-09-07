import { prisma } from "@/lib/db";
import { MATCH_THRESHOLD, CONTEXT_THRESHOLD } from "@/lib/faq-router";

const OLLAMA_URL = process.env.OLLAMA_URL || "http://host.docker.internal:11434";

export async function GET() {
  try {
    const tagsRes = await fetch(`${OLLAMA_URL}/api/tags`, { signal: AbortSignal.timeout(3000) });
    if (!tagsRes.ok) {
      return Response.json({ available: false, error: "Ollama unreachable" });
    }

    const tags = await tagsRes.json();
    const models = (tags.models || []).map((m: { name: string }) => m.name);

    const hasEmbedModel = models.some(
      (n: string) => n.startsWith("bge-m3") || n.startsWith("nomic-embed-text")
    );
    const embedModelName =
      models.find((n: string) => n.startsWith("bge-m3") || n.startsWith("nomic-embed-text")) || null;
    const chatModel = models.find((n: string) =>
      n.startsWith("qwen") || n.startsWith("llama") || n.startsWith("gemma") || n.startsWith("mistral")
    );

    const [chunksCount, faqCount] = await Promise.all([
      prisma.postChunk.count(),
      prisma.faqEntry.count({ where: { isActive: true } }),
    ]);

    return Response.json({
      available: hasEmbedModel && !!chatModel && chunksCount > 0,
      model: chatModel || null,
      embedModel: embedModelName,
      chunksCount,
      faqCount,
      tierThresholds: {
        match: MATCH_THRESHOLD,    // Tier 1 cutoff
        context: CONTEXT_THRESHOLD, // Tier 2 cutoff
      },
    });
  } catch {
    return Response.json({ available: false, error: "Status check failed" });
  }
}
