import { prisma } from "@/lib/db";

// 추천 질문 클릭 기록. 실패해도 대화에는 영향이 없다
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const id = typeof body.id === "number" ? body.id : NaN;
  if (Number.isNaN(id)) return Response.json({ ok: false }, { status: 400 });
  await prisma.faqClick.create({ data: { faqId: id } }).catch(() => null);
  return Response.json({ ok: true });
}
