import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { invalidateFaqCache } from "@/lib/faq-router";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const idNum = parseInt(id, 10);
  if (isNaN(idNum)) return Response.json({ error: "invalid id" }, { status: 400 });

  try {
    const body = await req.json();
    const data: Record<string, unknown> = {};

    if (typeof body.slug === "string") data.slug = body.slug;
    if (Array.isArray(body.qVariants)) {
      if (body.qVariants.length === 0 || body.qVariants.some((q: unknown) => typeof q !== "string")) {
        return Response.json({ error: "qVariants invalid" }, { status: 400 });
      }
      data.qVariants = JSON.stringify(body.qVariants);
    }
    if (typeof body.a_ko === "string") data.a_ko = body.a_ko;
    if (typeof body.a_en === "string") data.a_en = body.a_en;
    if (Array.isArray(body.tags)) data.tags = JSON.stringify(body.tags);
    if (typeof body.isActive === "boolean") data.isActive = body.isActive;

    if (Object.keys(data).length === 0) {
      return Response.json({ error: "no fields to update" }, { status: 400 });
    }

    await prisma.faqEntry.update({ where: { id: idNum }, data });
    invalidateFaqCache();
    return Response.json({ ok: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "update failed";
    return Response.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const idNum = parseInt(id, 10);
  if (isNaN(idNum)) return Response.json({ error: "invalid id" }, { status: 400 });

  try {
    await prisma.faqEntry.delete({ where: { id: idNum } });
    invalidateFaqCache();
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "delete failed" }, { status: 500 });
  }
}
