import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Total messages & sessions
    const totalMessages = await prisma.chatMessage.count();

    const sessions = await prisma.chatMessage.groupBy({
      by: ["sessionId"],
      _count: { id: true },
      _max: { createdAt: true },
    });
    const totalSessions = sessions.length;

    // Today's sessions
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayMessages = await prisma.chatMessage.groupBy({
      by: ["sessionId"],
      where: { createdAt: { gte: todayStart } },
    });
    const todaySessions = todayMessages.length;

    // Top questions (user messages only, group by content)
    const userMessages = await prisma.chatMessage.findMany({
      where: { role: "user" },
      select: { content: true },
    });
    const questionCounts: Record<string, number> = {};
    for (const msg of userMessages) {
      const key = msg.content.trim().slice(0, 100);
      questionCounts[key] = (questionCounts[key] || 0) + 1;
    }
    const topQuestions = Object.entries(questionCounts)
      .map(([content, count]) => ({ content, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Recent sessions with first user message
    const recentSessions = await Promise.all(
      sessions
        .sort((a, b) => (b._max.createdAt?.getTime() || 0) - (a._max.createdAt?.getTime() || 0))
        .slice(0, 20)
        .map(async (s) => {
          const firstMsg = await prisma.chatMessage.findFirst({
            where: { sessionId: s.sessionId, role: "user" },
            orderBy: { createdAt: "asc" },
            select: { content: true, ip: true },
          });
          return {
            sessionId: s.sessionId,
            messageCount: s._count.id,
            lastActive: s._max.createdAt?.toISOString() || "",
            firstMessage: firstMsg?.content?.slice(0, 80) || "",
            ip: firstMsg?.ip || "",
          };
        })
    );

    return Response.json({
      totalSessions,
      totalMessages,
      todaySessions,
      topQuestions,
      recentSessions,
    });
  } catch (e) {
    return Response.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
