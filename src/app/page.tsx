import HomeContent from "@/components/home/HomeContent";
import { prisma } from "@/lib/db";
import { fetchRecentCommits } from "@/lib/github";
import type { GitCommit } from "@/lib/github";

async function getPinnedPost() {
  try {
    const post = await prisma.post.findFirst({
      where: { pinned: true, published: true },
      select: {
        title: true,
        slug: true,
        content: true,
        tags: true,
        githubRepo: true,
        createdAt: true,
      },
    });
    if (!post) return null;
    return { ...post, createdAt: post.createdAt.toISOString() };
  } catch {
    return null;
  }
}

async function getRecentProducts() {
  try {
    const posts = await prisma.post.findMany({
      where: { category: "product", published: true, locale: "ko" },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { id: true, title: true, slug: true, tags: true, locale: true },
    });
    return posts;
  } catch {
    return [];
  }
}

async function getBuildTimeline() {
  try {
    const posts = await prisma.post.findMany({
      where: { published: true, category: "build" },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        description: true,
        tags: true,
        relatedPosts: true,
        createdAt: true,
      },
    });
    return posts.map((p) => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
    }));
  } catch {
    return [];
  }
}

async function getRecentAgents() {
  try {
    const posts = await prisma.post.findMany({
      where: { category: "agent", published: true, locale: "ko" },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { id: true, title: true, slug: true, tags: true, locale: true },
    });
    return posts;
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [pinnedPost, products, agents, buildTimeline] = await Promise.all([
    getPinnedPost(),
    getRecentProducts(),
    getRecentAgents(),
    getBuildTimeline(),
  ]);

  let commits: GitCommit[] = [];
  if (pinnedPost?.githubRepo) {
    commits = await fetchRecentCommits(pinnedPost.githubRepo);
  }

  return (
    <HomeContent
      commits={commits}
      repoName={pinnedPost?.githubRepo ?? ""}
      pinnedPost={pinnedPost}
      products={products}
      agents={agents}
      buildTimeline={buildTimeline}
    />
  );
}
