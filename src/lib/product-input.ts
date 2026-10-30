import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { STAMPS, stageOfStamp } from "@/lib/product";

// 어드민 프로젝트 폼이 보내는 값 중 저장할 칸만 골라낸다
const TEXT = ["name", "slug", "tagline", "type", "periodStart", "periodEnd", "useCase", "audience", "coverImage", "problemBody", "flowEmbedUrl"] as const;
const JSON_FIELDS = ["roles", "summary", "links", "features", "detail", "stack", "evidence"] as const;

export function productData(body: Record<string, unknown>): Prisma.ProductUpdateInput {
  const data: Record<string, unknown> = {};
  for (const k of TEXT) if (typeof body[k] === "string") data[k] = (body[k] as string).trim();
  for (const k of JSON_FIELDS) if (body[k] !== undefined) data[k] = JSON.stringify(body[k]);
  if (typeof body.headcount === "number") data.headcount = Math.max(0, Math.round(body.headcount));
  if (typeof body.published === "boolean") data.published = body.published;
  if (typeof body.stamp === "string" && (STAMPS as readonly string[]).includes(body.stamp)) {
    data.stamp = body.stamp;
    data.stage = stageOfStamp(body.stamp);
  }
  if (typeof data.periodStart === "string") data.ongoing = !data.periodEnd;
  if (typeof data.type === "string" && !["app", "web", "agent"].includes(data.type)) delete data.type;
  if (typeof data.slug === "string") data.slug = (data.slug as string).toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, "");
  return data as Prisma.ProductUpdateInput;
}

// 관련 글 연결: 넘겨받은 글만 이 프로젝트를 가리키게 한다
export async function syncPosts(productId: number, postIds: unknown) {
  if (!Array.isArray(postIds)) return;
  const ids = postIds.filter((v): v is number => typeof v === "number");
  await prisma.$transaction([
    prisma.post.updateMany({ where: { productId, id: { notIn: ids } }, data: { productId: null } }),
    prisma.post.updateMany({ where: { id: { in: ids } }, data: { productId } }),
  ]);
}
