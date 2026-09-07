import { Suspense } from "react";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import CaseList from "./CaseList";

export const metadata: Metadata = {
  title: "케이스 스터디 | Gats Lee",
  description:
    "문제를 숫자로 정의하고, 가설을 세우고, 트레이드오프를 감수하고, 결과를 지표로 검증한 기록.",
};

export default async function CasesPage() {
  const posts = await prisma.post.findMany({
    where: { category: "case", published: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      createdAt: true,
      tags: true,
      locale: true,
      caseBeats: true,
    },
  });

  const serialized = posts.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
  }));

  return (
    <Suspense>
      <CaseList posts={serialized} />
    </Suspense>
  );
}
