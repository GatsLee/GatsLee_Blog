import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { routeFor } from "@/lib/categories";

// 헤더 검색(IA_SY_002). 공개된 한국어 글과 공개 프로젝트에서 제목·요약을 찾는다.
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 1) return Response.json({ posts: [], products: [] });
  const term = q.slice(0, 50);

  const [posts, products] = await Promise.all([
    prisma.post.findMany({
      where: {
        published: true,
        locale: "ko",
        OR: [{ title: { contains: term } }, { description: { contains: term } }],
      },
      select: { title: true, slug: true, category: true, description: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.product.findMany({
      where: {
        published: true,
        OR: [{ name: { contains: term } }, { tagline: { contains: term } }],
      },
      select: { name: true, slug: true, tagline: true },
      orderBy: { sortOrder: "asc" },
      take: 4,
    }),
  ]);

  return Response.json({
    posts: posts.map((p) => ({ title: p.title, summary: p.description, href: routeFor(p.category, p.slug) })),
    products: products.map((p) => ({ title: p.name, summary: p.tagline, href: `/products/${p.slug}` })),
  });
}
