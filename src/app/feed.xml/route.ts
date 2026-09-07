import { prisma } from "@/lib/db";
import { routeFor } from "@/lib/categories";

export const dynamic = "force-dynamic";

const BASE_URL = "https://blog.gatslee.com";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      title: true,
      slug: true,
      category: true,
      description: true,
      content: true,
      createdAt: true,
    },
  });

  const items = posts
    .map((post) => {
      const link = `${BASE_URL}${routeFor(post.category, post.slug)}`;
      const description =
        post.description || post.content.slice(0, 200).replace(/\n/g, " ");

      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${escapeXml(description)}</description>
      <pubDate>${post.createdAt.toUTCString()}</pubDate>
      <category>${escapeXml(post.category)}</category>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Gats Lab</title>
    <link>${BASE_URL}</link>
    <description>문제를 숫자로 정의하고 시스템으로 해결하는 기록. 케이스 스터디, AI 에이전트, 프로덕트 기획.</description>
    <language>ko</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
