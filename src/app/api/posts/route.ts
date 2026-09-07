import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const locale = searchParams.get("locale"); // optional: "ko" | "en"

  const where: Record<string, unknown> = { published: true };
  if (category) where.category = category;
  if (locale) where.locale = locale;

  const posts = await prisma.post.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      category: true,
      content: true,
      createdAt: true,
      published: true,
      tags: true,
      locale: true,
      translationKey: true,
    },
  });

  return NextResponse.json(posts);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title, slug, content, category, tags, locale, translationKey,
      coverImage, description, published, buildProgress, relatedPosts,
      demoVideo, demoImages, externalLinks, targetAudience, purpose, expectedEffect,
      caseBeats,
      createdAt,
    } = body;

    if (!title || !category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let postSlug =
      slug ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/-{2,}/g, "-")
        .replace(/^-|-$/g, "") ||
      `post-${Date.now()}`;

    // Ensure slug uniqueness
    const existing = await prisma.post.findUnique({ where: { slug: postSlug } });
    if (existing) {
      postSlug = `${postSlug}-${Date.now()}`;
    }

    const post = await prisma.post.create({
      data: {
        title,
        slug: postSlug,
        content: content || "",
        category,
        tags: tags || "[]",
        locale: locale || "ko",
        translationKey: translationKey || null,
        coverImage: coverImage || "",
        description: description || "",
        published: published !== undefined ? published : true,
        buildProgress: typeof buildProgress === 'number' ? buildProgress : 0,
        relatedPosts: relatedPosts || "[]",
        demoVideo: demoVideo || null,
        demoImages: demoImages || null,
        externalLinks: externalLinks || null,
        targetAudience: targetAudience || null,
        purpose: purpose || null,
        expectedEffect: expectedEffect || null,
        caseBeats: caseBeats || null,
        ...(createdAt ? { createdAt: new Date(createdAt) } : {}),
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create post";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
