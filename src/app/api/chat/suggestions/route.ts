import { prisma } from "@/lib/db";

// 챗봇 패널 추천 질문 (IA_CB_00101). 사용 중인 FAQ의 대표 질문 최대 5개
export async function GET() {
  try {
    const faqs = await prisma.faqEntry.findMany({
      where: { isActive: true },
      orderBy: { id: "asc" },
      take: 5,
      select: { qVariants: true },
    });
    const suggestions = faqs
      .map((f) => {
        try {
          return (JSON.parse(f.qVariants) as string[])[0];
        } catch {
          return null;
        }
      })
      .filter((q): q is string => Boolean(q));
    return Response.json({ suggestions });
  } catch {
    return Response.json({ suggestions: [] });
  }
}
