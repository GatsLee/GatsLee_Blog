import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const items = await prisma.progressItem.findMany({
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
  });
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { title, description, category, completed, sortOrder } = body;

  if (!title || !category) {
    return NextResponse.json(
      { error: "title and category are required" },
      { status: 400 }
    );
  }

  try {
    const item = await prisma.progressItem.create({
      data: {
        title,
        description: description || "",
        category,
        completed: completed || false,
        sortOrder: sortOrder || 0,
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
