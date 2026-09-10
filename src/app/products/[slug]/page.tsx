import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import ProductOverview from "./ProductOverview";
import ProductProblem from "./ProductProblem";
import ProductFeatures from "./ProductFeatures";
import ProductFlow from "./ProductFlow";
import {
  FEATURE_SECTION,
  parseEvidence,
  parseFeatures,
  parseLinks,
  parseStrings,
  productStage,
  productType,
} from "@/lib/product";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    select: { name: true, tagline: true, problemBody: true },
  });
  if (!product) return {};
  const description = product.tagline || product.problemBody.slice(0, 160).replace(/\n/g, " ");
  return {
    title: product.name,
    description,
    openGraph: { title: product.name, description, type: "article" },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });

  if (!product || !product.published) notFound();

  const type = productType(product.type);
  const section = FEATURE_SECTION[type];

  return (
    <div className="max-w-3xl mx-auto px-6 py-16 animate-fadeIn">
      <ProductOverview
        name={product.name}
        tagline={product.tagline}
        type={type}
        stage={productStage(product.stage)}
        stamp={product.stamp}
        periodStart={product.periodStart}
        periodEnd={product.periodEnd}
        ongoing={product.ongoing}
        roles={parseStrings(product.roles)}
        headcount={product.headcount}
        useCase={product.useCase}
        audience={product.audience}
        coverImage={product.coverImage}
        links={parseLinks(product.links)}
      />

      <ProductProblem body={product.problemBody} evidence={parseEvidence(product.evidence)} />

      <ProductFeatures
        type={type}
        features={parseFeatures(product.features)}
        flowUrl={product.flowEmbedUrl}
      />

      {/* 에이전트는 화면 흐름이 곧 서비스 플로우라 위 섹션에 흡수된다. */}
      {!section.flowInside && (
        <ProductFlow url={product.flowEmbedUrl} heading="요청이 어디를 지나는가" />
      )}
    </div>
  );
}
