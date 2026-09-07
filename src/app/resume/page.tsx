import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { defaultResume, type ResumeData } from "@/data/resume";
import ResumeDoc from "./ResumeDoc";

export const metadata: Metadata = {
  title: "이력서 | Gats Lee",
  description: "문제를 숫자로 정의하고 시스템으로 해결하는 Technical PM — 이준열 이력서.",
};

async function load(locale: string): Promise<ResumeData> {
  try {
    const config = await prisma.siteConfig.findUnique({
      where: { key: `resume_${locale}` },
    });
    if (config) return JSON.parse(config.value) as ResumeData;
  } catch {
    /* fall through to the checked-in default */
  }
  return defaultResume(locale);
}

export default async function ResumePage() {
  // Both locales are fetched server-side; the client component picks by language.
  const [ko, en] = await Promise.all([load("ko"), load("en")]);
  return <ResumeDoc ko={ko} en={en} />;
}
