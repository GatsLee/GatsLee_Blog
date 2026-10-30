import { prisma } from "@/lib/db";

// 관련 글 후보: 공개 글 목록과 같은 범위의 한국어 글
export function postOptions() {
  return prisma.post.findMany({
    where: { locale: "ko", category: { in: ["journal", "build"] } },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true },
  });
}
