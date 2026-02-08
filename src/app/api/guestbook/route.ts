import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

export async function GET() {
  const entries = await prisma.guestbookEntry.findMany({
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(entries);
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const DAY_MS = 24 * 60 * 60 * 1000; // 24 hours
  const { success, remaining } = rateLimit(`guestbook:${ip}`, 3, DAY_MS);
  if (!success) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Maximum 3 messages per day.", remaining: 0 },
      { status: 429 }
    );
  }

  const body = await request.json();
  const { author, message } = body;

  if (!message) {
    return NextResponse.json({ error: "Message required" }, { status: 400 });
  }

  const entry = await prisma.guestbookEntry.create({
    data: {
      author: author || `guest_${Math.floor(Math.random() * 89) + 10}`,
      message,
    },
  });

  return NextResponse.json(entry, { status: 201 });
}
