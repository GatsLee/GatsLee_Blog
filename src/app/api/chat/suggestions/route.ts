import { prisma } from "@/lib/db";

// 챗봇 패널 추천 질문 (IA_CB_00101). 대표 FAQ 5개의 대표 질문 (D7)
export async function GET() {
  try {
    const faqs = await prisma.faqEntry.findMany({
      where: { isActive: true, featured: true },
      orderBy: { featuredOrder: "asc" },
      take: 5,
      select: { id: true, qVariants: true },
    });
    const suggestions = faqs.flatMap((f) => {
      try {
        const question = (JSON.parse(f.qVariants) as string[])[0];
        return question ? [{ id: f.id, question }] : [];
      } catch {
        return [];
      }
    });
    return Response.json({ suggestions });
  } catch {
    return Response.json({ suggestions: [] });
  }
}
