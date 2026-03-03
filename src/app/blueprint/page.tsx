import { prisma } from "@/lib/db";
import BlueprintContent from "./BlueprintContent";

export default async function BlueprintPage() {
  const posts = await prisma.post.findMany({
    where: { category: "blueprint", published: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      content: true,
      createdAt: true,
      tags: true,
    },
  });

  const serialized = posts.map((p) => {
    let parsedTags: string[] = [];
    try {
      parsedTags = JSON.parse(p.tags);
    } catch {
      /* ignore */
    }
    return {
      ...p,
      createdAt: p.createdAt.toISOString(),
      parsedTags,
    };
  });

  const manifesto =
    serialized.find((p) =>
      p.parsedTags.some((t: string) => t.toLowerCase() === "manifesto")
    ) || null;

  const principles = serialized
    .filter((p) => p.parsedTags.some((t: string) => t.toLowerCase() === "principle"))
    .slice(0, 3);

  const milestones = serialized.filter((p) =>
    p.parsedTags.some((t: string) => t.toLowerCase() === "milestone")
  );

  return <BlueprintContent manifesto={manifesto} principles={principles} milestones={milestones} />;
}
