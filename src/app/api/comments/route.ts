import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const postId = searchParams.get("postId");

  if (!postId) {
    // No postId — return all comments (for admin dashboard)
    const comments = await prisma.comment.findMany({
      orderBy: { createdAt: "desc" },
      include: { post: { select: { title: true, slug: true } } },
    });
    return NextResponse.json(comments);
  }

  const comments = await prisma.comment.findMany({
    where: { postId: parseInt(postId) },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(comments);
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { success } = rateLimit(`comment:${ip}`, 5, 60000);
  if (!success) {
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });
  }

  const body = await request.json();
  const { postId, author, content } = body;

  if (!postId || !author || !content) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const comment = await prisma.comment.create({
    data: {
      postId: parseInt(postId),
      author,
      content,
    },
  });

  return NextResponse.json(comment, { status: 201 });
}
