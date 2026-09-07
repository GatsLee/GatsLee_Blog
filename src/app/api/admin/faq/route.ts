import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { invalidateFaqCache } from "@/lib/faq-router";

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await prisma.faqEntry.findMany({
    orderBy: [{ isActive: "desc" }, { updatedAt: "desc" }],
  });
  return Response.json(
    rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      qVariants: safeArr(r.qVariants),
      a_ko: r.a_ko,
      a_en: r.a_en,
      tags: safeArr(r.tags),
      isActive: r.isActive,
      source: r.source,
      promotedFromMessageId: r.promotedFromMessageId,
      upvotes: r.upvotes,
      downvotes: r.downvotes,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }))
  );
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { slug, qVariants, a_ko, a_en, tags, source, promotedFromMessageId } = body;

    if (!slug || typeof slug !== "string") {
      return Response.json({ error: "slug required" }, { status: 400 });
    }
    if (!Array.isArray(qVariants) || qVariants.length === 0 || qVariants.some((q) => typeof q !== "string" || !q.trim())) {
      return Response.json({ error: "qVariants must be a non-empty string array" }, { status: 400 });
    }
    if (!a_ko || !a_en) {
      return Response.json({ error: "a_ko and a_en required" }, { status: 400 });
    }

    const created = await prisma.faqEntry.create({
      data: {
        slug,
        qVariants: JSON.stringify(qVariants),
        a_ko,
        a_en,
        tags: JSON.stringify(Array.isArray(tags) ? tags : []),
        source: source || "manual",
        promotedFromMessageId: promotedFromMessageId ?? null,
        isActive: true,
      },
    });

    invalidateFaqCache();
    return Response.json({ id: created.id, slug: created.slug });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "create failed";
    if (msg.includes("Unique constraint")) {
      return Response.json({ error: "slug already exists" }, { status: 409 });
    }
    return Response.json({ error: msg }, { status: 500 });
  }
}

function safeArr(s: string): string[] {
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}
