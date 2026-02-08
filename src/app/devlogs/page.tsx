import { prisma } from "@/lib/db";
import PostList from "@/components/posts/PostList";

export default async function DevLogsPage() {
  const posts = await prisma.post.findMany({
    where: { category: "devlog", published: true },
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
        directoryPath="/var/www/dev_logs"
      />
    </div>
  );
}
