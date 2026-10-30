import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { invalidateFaqCache } from "@/lib/faq-router";

// IA_AD_00401 대표 FAQ 순서 저장. 넘겨받은 순서대로 최대 5개만 대표로 둔다
export async function PUT(req: Request) {
  if (!(await getSession())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const ids: number[] = Array.isArray(body.ids) ? body.ids.filter((v: unknown): v is number => typeof v === "number").slice(0, 5) : [];
  await prisma.$transaction([
    prisma.faqEntry.updateMany({ where: { id: { notIn: ids } }, data: { featured: false, featuredOrder: 0 } }),
    ...ids.map((id, i) => prisma.faqEntry.update({ where: { id }, data: { featured: true, featuredOrder: i + 1 } })),
  ]);
  invalidateFaqCache();
  return Response.json({ ok: true });
}
