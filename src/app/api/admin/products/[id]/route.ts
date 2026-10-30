import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { productData, syncPosts } from "@/lib/product-input";

type Params = { params: Promise<{ id: string }> };

// IA_AD_00302 진행 단계 변경 · IA_AD_00303 프로젝트 수정
export async function PUT(request: NextRequest, { params }: Params) {
  if (!(await getSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = parseInt((await params).id);
  const body = await request.json().catch(() => ({}));
  try {
    const product = await prisma.product.update({ where: { id }, data: productData(body) });
    await syncPosts(id, body.postIds);
    return NextResponse.json(product);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json({ error: "이미 쓰고 있는 주소예요." }, { status: 409 });
    }
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return NextResponse.json({ error: "프로젝트를 찾지 못했어요." }, { status: 404 });
    }
    throw e;
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  if (!(await getSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = parseInt((await params).id);
  // 연결된 글은 productId가 SetNull, 댓글은 스키마 규칙을 따른다
  await prisma.product.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ success: true });
}
