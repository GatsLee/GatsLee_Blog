import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { defaultResume } from "@/data/resume";

// GET: Fetch resume config for a locale (falls back to the checked-in default)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get("locale") || "ko";

  try {
    const config = await prisma.siteConfig.findUnique({
      where: { key: `resume_${locale}` },
    });
    if (!config) return Response.json({ data: defaultResume(locale) });
    return Response.json({ data: JSON.parse(config.value) });
  } catch {
    return Response.json({ data: defaultResume(locale) });
  }
}

// PUT: Save resume config (admin only)
export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { locale, data } = await request.json();
    if (!locale || !data) {
      return Response.json({ error: "locale and data required" }, { status: 400 });
    }

    await prisma.siteConfig.upsert({
      where: { key: `resume_${locale}` },
      create: { key: `resume_${locale}`, value: JSON.stringify(data) },
      update: { value: JSON.stringify(data) },
    });

    return Response.json({ success: true });
  } catch (e) {
    console.error("Resume save error:", e);
    return Response.json({ error: "Failed to save", detail: String(e) }, { status: 500 });
  }
}
