import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");

  if (!sessionId || sessionId.length < 10) {
    return Response.json({ messages: [] });
  }

  try {
    const messages = await prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: "asc" },
      select: { role: true, content: true },
    });

    return Response.json({ messages });
  } catch {
    return Response.json({ messages: [] });
  }
}
