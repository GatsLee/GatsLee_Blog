import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      category: true,
      published: true,
      createdAt: true,
      tags: true,
      _count: { select: { comments: true } },
    },
  });

  return NextResponse.json(posts);
}
