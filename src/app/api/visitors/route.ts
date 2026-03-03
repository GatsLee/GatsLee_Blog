import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const total = await prisma.pageView.count();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayCount = await prisma.pageView.count({
    where: { createdAt: { gte: today } },
  });

  return NextResponse.json({ total, today: todayCount });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const path = typeof body.path === "string" ? body.path : "/";

  await prisma.pageView.create({ data: { path } });

  const total = await prisma.pageView.count();
  return NextResponse.json({ total }, { status: 201 });
}
