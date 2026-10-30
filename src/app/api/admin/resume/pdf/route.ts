import { NextRequest, NextResponse } from "next/server";
import { writeFile, unlink } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getResumePdfs, resumeKey, type ResumeLocale } from "@/lib/resume";

const MAX_SIZE = 10 * 1024 * 1024;
const isLocale = (v: unknown): v is ResumeLocale => v === "ko" || v === "en";

// IA_AD_005 이력서 모달
export async function GET() {
  if (!(await getSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await getResumePdfs());
}

export async function POST(request: NextRequest) {
  if (!(await getSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const form = await request.formData();
  const locale = form.get("locale");
  const file = form.get("file");
  if (!isLocale(locale) || !(file instanceof File)) {
    return NextResponse.json({ error: "언어와 파일이 필요해요." }, { status: 400 });
  }
  if (file.size > MAX_SIZE) return NextResponse.json({ error: "10MB 이하 PDF만 올릴 수 있어요." }, { status: 413 });
  const buffer = Buffer.from(await file.arrayBuffer());
  // 확장자나 MIME만 믿지 않고 PDF 서명을 확인한다
  if (buffer.subarray(0, 5).toString("latin1") !== "%PDF-") {
    return NextResponse.json({ error: "PDF 파일이 아니에요." }, { status: 415 });
  }

  const filename = `resume-${locale}-${Date.now()}.pdf`;
  await writeFile(path.join(process.cwd(), "public", "uploads", filename), buffer);
  const previous = (await getResumePdfs())[locale];
  const value = { url: `/uploads/${filename}`, name: file.name || filename, size: file.size, uploadedAt: new Date().toISOString() };
  await prisma.siteConfig.upsert({
    where: { key: resumeKey(locale) },
    create: { key: resumeKey(locale), value: JSON.stringify(value) },
    update: { value: JSON.stringify(value) },
  });
  if (previous) await unlink(path.join(process.cwd(), "public", previous.url)).catch(() => {});
  return NextResponse.json(value, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  if (!(await getSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const locale = request.nextUrl.searchParams.get("locale");
  if (!isLocale(locale)) return NextResponse.json({ error: "언어가 필요해요." }, { status: 400 });
  const current = (await getResumePdfs())[locale];
  await prisma.siteConfig.deleteMany({ where: { key: resumeKey(locale) } });
  if (current) await unlink(path.join(process.cwd(), "public", current.url)).catch(() => {});
  return NextResponse.json({ ok: true });
}
