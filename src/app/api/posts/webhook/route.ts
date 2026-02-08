import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  // Validate API key
  const authHeader = request.headers.get("authorization");
  const apiKey = process.env.N8N_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 }
    );
  }

  if (!authHeader || authHeader !== `Bearer ${apiKey}`) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { title, content, category, tags } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Missing required fields: title, content" },
        { status: 400 }
      );
    }

    const slug = (title as string)
      .toLowerCase()
      .replace(/[^a-z0-9가-힣]+/g, "-")
      .replace(/^-|-$/g, "");

    // Ensure unique slug by appending timestamp if needed
    const existingPost = await prisma.post.findUnique({ where: { slug } });
    const finalSlug = existingPost
      ? `${slug}-${Date.now()}`
      : slug;

    const post = await prisma.post.create({
      data: {
        title,
        slug: finalSlug,
        content,
        category: category || "troubleshooting",
        tags: tags || "[]",
        published: true,
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create post";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
