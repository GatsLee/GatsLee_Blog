import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { parseDetail, parseFeatures, parseLinks, parseStrings } from "@/lib/product";
import ProjectForm from "@/components/admin/projects/ProjectForm";
import { ToastProvider } from "@/components/admin/ui/Toast";
import { postOptions } from "../data";

export const metadata = { title: "프로젝트 수정" };

type Params = Promise<{ id: string }>;

// IA_AD_00303 프로젝트 수정
export default async function EditProjectPage({ params }: { params: Params }) {
  const id = parseInt((await params).id);
  const [p, posts] = await Promise.all([
    Number.isNaN(id) ? null : prisma.product.findUnique({ where: { id }, include: { posts: { select: { id: true } } } }),
    postOptions(),
  ]);
  if (!p) notFound();

  return (
    <ToastProvider>
      <ProjectForm
        posts={posts}
        initial={{
          id: p.id,
          name: p.name,
          slug: p.slug,
          type: p.type,
          stamp: p.stamp,
          periodStart: p.periodStart,
          periodEnd: p.periodEnd,
          roles: parseStrings(p.roles),
          headcount: p.headcount,
          tagline: p.tagline,
          summary: parseStrings(p.summary),
          coverImage: p.coverImage,
          useCase: p.useCase,
          audience: p.audience,
          problemBody: p.problemBody,
          features: parseFeatures(p.features),
          links: parseLinks(p.links),
          detail: parseDetail(p.detail),
          published: p.published,
          updatedAt: p.updatedAt.toISOString(),
          postIds: p.posts.map((x) => x.id),
        }}
      />
    </ToastProvider>
  );
}
