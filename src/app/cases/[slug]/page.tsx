import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import CaseDetail from "./CaseDetail";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getCase(slug: string) {
  return prisma.post.findFirst({
    where: { slug, category: "case", published: true },
  });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getCase(slug);
  if (!post) return { title: "Not found" };
  return {
    title: `${post.title} | Case Study`,
    description: post.description,
  };
}

export default async function CasePage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getCase(slug);
  if (!post) notFound();

  return (
    <CaseDetail
      title={post.title}
      content={post.content}
      caseBeats={post.caseBeats}
      externalLinks={post.externalLinks}
      tags={post.tags}
      createdAt={post.createdAt.toISOString()}
    />
  );
}
