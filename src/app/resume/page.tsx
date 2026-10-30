import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getResumePdfs } from "@/lib/resume";
import { defaultResume, type ResumeData } from "@/data/resume";
import ResumeDoc from "./ResumeDoc";

// 올린 PDF 여부를 요청마다 확인한다
export const dynamic = "force-dynamic";

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
  // 이력서는 PDF로 바꿨다(D4). 올린 PDF가 있으면 그 파일로 보내고, 없으면 예전 페이지를 보여준다
  const pdf = await getResumePdfs();
  if (pdf.ko) redirect(pdf.ko.url);

  // Both locales are fetched server-side; the client component picks by language.
  const [ko, en] = await Promise.all([load("ko"), load("en")]);
  return <ResumeDoc ko={ko} en={en} />;
}
