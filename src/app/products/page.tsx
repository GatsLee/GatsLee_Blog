import { prisma } from "@/lib/db";
import ProductGallery from "./ProductGallery";

export default async function ProductsPage() {
  const posts = await prisma.post.findMany({
    where: { category: { in: ["product", "agent"] }, published: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      content: true,
      createdAt: true,
      tags: true,
      locale: true,
      category: true,
    },
  });

  const serialized = posts.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
  }));

  return <ProductGallery posts={serialized} />;
}
