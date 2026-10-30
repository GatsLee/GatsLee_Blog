import { prisma } from "@/lib/db";
import { qVariants } from "@/lib/chat-stats";
import FaqManager, { type FaqItem } from "@/components/admin/chatbot/FaqManager";

export const metadata = { title: "FAQ 관리" };

type SearchParams = Promise<{ id?: string }>;

// IA_AD_00401 FAQ 관리. ?id= 로 들어오면 그 FAQ(대화 상세에서 올린 후보 포함)를 연다
export default async function FaqPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const rows = await prisma.faqEntry.findMany({
    orderBy: [{ featured: "desc" }, { featuredOrder: "asc" }, { updatedAt: "desc" }],
    select: { id: true, qVariants: true, a_ko: true, a_en: true, isActive: true, source: true, featured: true, _count: { select: { clicks: true } } },
  });
  const items: FaqItem[] = rows.map((r) => {
    const [question = "", ...variants] = qVariants(r.qVariants);
    return { id: r.id, key: `faq-${r.id}`, question, variants, a_ko: r.a_ko, a_en: r.a_en, isActive: r.isActive, source: r.source, clicks: r._count.clicks };
  });
  const featuredKeys = rows.filter((r) => r.featured).map((r) => `faq-${r.id}`);

  return (
    <FaqManager
      initial={items}
      featuredKeys={featuredKeys}
      selectedKey={sp.id ? `faq-${sp.id}` : undefined}
    />
  );
}
