import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

/**
 * Promotion candidates for the FAQ pool.
 * Returns:
 *   - frequentQuestions: top N user messages by repetition (last 30 days)
 *   - upvotedAssistantMessages: assistant responses paired with their user query
 *     (👍/👎 stored as ChatMessage role="feedback" with content JSON {messageIndex, rating})
 *
 * The admin can review these and click "Promote to FAQ" — that creates a FaqEntry
 * with source="promoted" and promotedFromMessageId pointing to the assistant message.
 */
export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const since = new Date();
  since.setDate(since.getDate() - 30);

  // Top user questions in the last 30 days
  const userMessages = await prisma.chatMessage.findMany({
    where: { role: "user", createdAt: { gte: since } },
    select: { content: true },
  });
  const counts: Record<string, number> = {};
  for (const m of userMessages) {
    const key = m.content.trim().slice(0, 200);
    counts[key] = (counts[key] || 0) + 1;
  }
  const frequentQuestions = Object.entries(counts)
    .map(([content, count]) => ({ content, count }))
    .filter((q) => q.count >= 2)
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  // Already-existing FAQ slugs to flag duplicates client-side
  const existing = await prisma.faqEntry.findMany({ select: { slug: true, qVariants: true } });
  const existingQuestions = new Set<string>();
  for (const e of existing) {
    try {
      const arr = JSON.parse(e.qVariants);
      if (Array.isArray(arr)) arr.forEach((q: unknown) => typeof q === "string" && existingQuestions.add(q.trim()));
    } catch {
      // skip
    }
  }

  // Upvoted assistant messages — find feedback rows, look up the paired assistant content
  const feedbackRows = await prisma.chatMessage.findMany({
    where: { role: "feedback", createdAt: { gte: since } },
    select: { sessionId: true, content: true, createdAt: true, id: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  type Upvoted = {
    feedbackId: number;
    sessionId: string;
    rating: "up" | "down";
    userQuery: string;
    assistantAnswer: string;
    assistantMessageId: number;
    createdAt: string;
  };
  const upvotedAssistantMessages: Upvoted[] = [];

  for (const fb of feedbackRows) {
    let payload: { messageIndex?: number; rating?: "up" | "down" } | null = null;
    try {
      payload = JSON.parse(fb.content);
    } catch {
      continue;
    }
    if (!payload || payload.rating !== "up" || typeof payload.messageIndex !== "number") continue;

    // Get all messages in the session in order, then locate the assistant message at index.
    const sessionMessages = await prisma.chatMessage.findMany({
      where: { sessionId: fb.sessionId, role: { in: ["user", "assistant"] } },
      orderBy: { createdAt: "asc" },
      select: { id: true, role: true, content: true },
    });

    const assistantMsg = sessionMessages[payload.messageIndex];
    if (!assistantMsg || assistantMsg.role !== "assistant") continue;

    // Pair with the immediately preceding user message
    let userMsg: { content: string } | null = null;
    for (let i = payload.messageIndex - 1; i >= 0; i--) {
      if (sessionMessages[i].role === "user") {
        userMsg = sessionMessages[i];
        break;
      }
    }
    if (!userMsg) continue;

    upvotedAssistantMessages.push({
      feedbackId: fb.id,
      sessionId: fb.sessionId,
      rating: "up",
      userQuery: userMsg.content,
      assistantAnswer: assistantMsg.content,
      assistantMessageId: assistantMsg.id,
      createdAt: fb.createdAt.toISOString(),
    });
  }

  return Response.json({
    frequentQuestions: frequentQuestions.map((q) => ({
      ...q,
      alreadyInFaq: existingQuestions.has(q.content),
    })),
    upvotedAssistantMessages,
  });
}
