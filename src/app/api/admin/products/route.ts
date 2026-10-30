import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { productData, syncPosts } from "@/lib/product-input";

// IA_AD_00301 새 프로젝트 저장
export async function POST(request: NextRequest) {
  if (!(await getSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const data = productData(body);
  if (!data.name) return NextResponse.json({ error: "프로젝트 이름을 입력해 주세요." }, { status: 400 });

  let slug = (data.slug as string) || `project-${Date.now()}`;
  if (await prisma.product.findUnique({ where: { slug } })) slug = `${slug}-${Date.now()}`;
  const last = await prisma.product.aggregate({ _max: { sortOrder: true } });

  const product = await prisma.product.create({
    data: {
      ...(data as object),
      name: data.name as string,
      type: (data.type as string) ?? "web",
      slug,
      published: body.published === true,
      sortOrder: (last._max.sortOrder ?? -1) + 1,
    },
  });
  await syncPosts(product.id, body.postIds);
  return NextResponse.json(product, { status: 201 });
}
