import { prisma } from "@/lib/db";
import InsightsList from "./InsightsList";

export default async function InsightsPage() {
  const posts = await prisma.post.findMany({
    where: {
      category: { in: ["devlog", "troubleshooting"] },
      published: true,
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      category: true,
      content: true,
      createdAt: true,
      tags: true,
      locale: true,
      translationKey: true,
    },
  });

  const serialized = posts.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
  }));

  return <InsightsList posts={serialized} />;
}
