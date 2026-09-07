import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { sessionId, messageIndex, rating } = await request.json();

    if (!sessionId || messageIndex == null || !["up", "down"].includes(rating)) {
      return Response.json({ error: "Invalid feedback" }, { status: 400 });
    }

    // Store feedback as a special ChatMessage with role "feedback"
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    await prisma.chatMessage.create({
      data: {
        sessionId,
        role: "feedback",
        content: JSON.stringify({ messageIndex, rating }),
        ip,
      },
    });

    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}
