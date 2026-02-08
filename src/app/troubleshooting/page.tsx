import { prisma } from "@/lib/db";
import PostList from "@/components/posts/PostList";

export default async function TroubleshootingPage() {
  const posts = await prisma.post.findMany({
    where: { category: "troubleshooting", published: true },
    orderBy: { createdAt: "desc" },
  });

  const serialized = posts.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
  }));

  return (
    <div className="max-w-5xl mx-auto">
      <PostList
        posts={serialized}
        basePath="/devlogs"
        directoryPath="/var/www/troubleshoot"
      />
    </div>
  );
}
