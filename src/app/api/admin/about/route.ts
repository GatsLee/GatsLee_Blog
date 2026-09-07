import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { translations } from "@/i18n/translations";

function getDefaultAboutData(locale: string) {
  const t = locale === "en" ? translations.en : translations.ko;
  return {
    heroLabel: t.home.heroLabel,
    slogan: t.home.slogan,
    sloganSub: t.home.sloganSub,
    journey: t.home.journey,
    skills: t.about.skills,
    projects: t.about.projects,
    agents: t.about.agents,
    stats: t.about.stats,
  };
}

// GET: Fetch about page config for a locale
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get("locale") || "ko";

  try {
    const config = await prisma.siteConfig.findUnique({
      where: { key: `about_${locale}` },
    });

    if (!config) {
      // Return translations default so the editor shows current values
      return Response.json({ data: getDefaultAboutData(locale) });
    }

    return Response.json({ data: JSON.parse(config.value) });
  } catch {
    return Response.json({ data: getDefaultAboutData(locale) });
  }
}

// PUT: Save about page config (admin only)
export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { locale, data } = await request.json();
    if (!locale || !data) {
      return Response.json({ error: "locale and data required" }, { status: 400 });
    }

    await prisma.siteConfig.upsert({
      where: { key: `about_${locale}` },
      create: { key: `about_${locale}`, value: JSON.stringify(data) },
      update: { value: JSON.stringify(data) },
    });

    return Response.json({ success: true });
  } catch (e) {
    console.error("About save error:", e);
    return Response.json({ error: "Failed to save", detail: String(e) }, { status: 500 });
  }
}
