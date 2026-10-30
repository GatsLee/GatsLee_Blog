import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const postId = searchParams.get("postId");

  if (!postId) {
    // postId 없이 전체 댓글을 보는 건 어드민만
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
  const postId = body.postId;
  const author = typeof body.author === "string" ? body.author.trim() : "";
  const content = typeof body.content === "string" ? body.content.trim() : "";

  if (!postId || !author || !content || author.length > 40 || content.length > 2000) {
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
