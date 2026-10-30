import { prisma } from "@/lib/db";

// 이력서 PDF (DECISIONS D4). SiteConfig resume_pdf_ko / resume_pdf_en에 파일 정보를 둔다
export type ResumeLocale = "ko" | "en";
export interface ResumePdf {
  url: string;
  name: string;
  size: number;
  uploadedAt: string;
}

export const resumeKey = (locale: ResumeLocale) => `resume_pdf_${locale}`;

export async function getResumePdfs(): Promise<Record<ResumeLocale, ResumePdf | null>> {
  const rows = await prisma.siteConfig
    .findMany({ where: { key: { in: [resumeKey("ko"), resumeKey("en")] } } })
    .catch(() => []);
  const read = (locale: ResumeLocale) => {
    const row = rows.find((r) => r.key === resumeKey(locale));
    if (!row) return null;
    try {
      return JSON.parse(row.value) as ResumePdf;
    } catch {
      return null;
    }
  };
  return { ko: read("ko"), en: read("en") };
}
