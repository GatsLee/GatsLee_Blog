"use client";

import { Printer } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import type { ResumeData, ResumeEntry } from "@/data/resume";

// Jake's Resume(github.com/jakegut/resume) 형식. 섹션은 프로젝트 → 경력 → 교육 → 기술 순서. 11pt 본문, 0.5in 여백, 작은 대문자 섹션 제목 + 아래 실선,
// 항목은 두 줄(굵게 기관 · 기간 / 기울임 과정 · 장소) 뒤에 글머리 목록.
// 영어는 Times New Roman, 한국어는 Pretendard로 쓴다
const FONT = {
  en: '"Times New Roman", Times, "Liberation Serif", serif',
  ko: '"Pretendard", "Pretendard Variable", -apple-system, sans-serif',
};

function Section({ title, isKo, children }: { title: string; isKo: boolean; children: React.ReactNode }) {
  return (
    <section className="mt-[8pt]">
      <h2
        className={`border-b border-black pb-[1pt] text-[14.4pt] leading-tight [break-after:avoid] ${isKo ? "font-bold" : ""}`}
        style={isKo ? undefined : { fontVariant: "small-caps" }}
      >
        {title}
      </h2>
      <div className="mt-[3pt] flex flex-col gap-[4pt] pl-[0.15in]">{children}</div>
    </section>
  );
}

function Bullets({ items }: { items?: string[] }) {
  if (!items?.length) return null;
  return (
    <ul className="mt-[1pt] list-disc pl-[0.2in] text-[10pt] leading-[1.3]">
      {items.map((b, i) => (
        <li key={i} className="pl-[2pt]">
          {b}
        </li>
      ))}
    </ul>
  );
}

function Entry({ e }: { e: ResumeEntry }) {
  return (
    <div className="resume-section">
      <div className="flex items-baseline justify-between gap-4">
        <span className="font-bold">{e.title}</span>
        <span className="shrink-0">{e.period}</span>
      </div>
      <div className="flex items-baseline justify-between gap-4 text-[10pt] italic">
        <span>{e.subtitle}</span>
        {e.location && <span className="shrink-0">{e.location}</span>}
      </div>
      <Bullets items={e.bullets} />
    </div>
  );
}

export default function ResumeDoc({ ko, en }: { ko: ResumeData; en: ResumeData }) {
  const { locale, setLocale } = useLanguage();
  const isKo = locale !== "en";
  const r = isKo ? ko : en;
  const L = isKo
    ? { education: "교육", experience: "경력", projects: "프로젝트", skills: "기술", print: "PDF로 저장" }
    : { education: "Education", experience: "Experience", projects: "Projects", skills: "Technical Skills", print: "Save as PDF" };

  const links = [
    { label: r.contact.email, href: `mailto:${r.contact.email}` },
    r.contact.linkedin && { label: r.contact.linkedin, href: `https://${r.contact.linkedin}` },
    r.contact.github && { label: r.contact.github, href: `https://${r.contact.github}` },
    { label: r.contact.blog, href: `https://${r.contact.blog}` },
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <div className="mx-auto max-w-[calc(8.27in+48px)] px-6 pb-20 pt-10 print:max-w-none print:p-0">
      <div className="no-print mb-6 flex items-center justify-between gap-4">
        <div className="flex rounded-full border border-border p-1 text-sm" role="group" aria-label="이력서 언어">
          {(["ko", "en"] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLocale(l)}
              aria-pressed={locale === l}
              className={`rounded-full px-3.5 py-1.5 font-medium transition-colors ${locale === l ? "bg-brand text-white" : "text-secondary hover:text-foreground"}`}
            >
              {l === "ko" ? "한국어" : "English"}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-medium text-white transition-[filter] hover:brightness-110"
        >
          <Printer size={16} aria-hidden />
          {L.print}
        </button>
      </div>

      {/* 화면에서는 A4 종이처럼 보이고, 인쇄하면 종이 테두리 없이 @page 여백(0.5in)만 남는다 */}
      <article
        lang={isKo ? "ko" : "en"}
        className="resume-doc bg-white p-[0.5in] text-[11pt] leading-snug text-black shadow-[0_8px_32px_rgba(24,25,27,0.12)]"
        style={{ fontFamily: isKo ? FONT.ko : FONT.en }}
      >
        {/* header 태그는 글 인쇄 규칙(globals.css)이 숨기므로 div로 둔다 */}
        <div className="text-center">
          <h1 className={`text-[24.9pt] font-bold leading-tight ${isKo ? "" : "tracking-wide"}`} style={isKo ? undefined : { fontVariant: "small-caps" }}>
            {r.name}
          </h1>
          <p className="mt-[3pt] text-[10pt] leading-[1.4]">
            {links.map((l, i) => (
              <span key={l.href} className="whitespace-nowrap">
                {i > 0 && <span className="mx-[5pt]">|</span>}
                <a href={l.href} className="underline underline-offset-2">
                  {l.label}
                </a>
              </span>
            ))}
          </p>
        </div>

        <Section title={L.projects} isKo={isKo}>
          {r.projects.map((p, i) => (
            <div key={i} className="resume-section">
              <div className="flex items-baseline justify-between gap-4 text-[10pt]">
                <span>
                  <span className="font-bold">{p.name}</span>
                  <span className="mx-[5pt]">|</span>
                  <span>{p.team}</span>
                </span>
                <span className="shrink-0">{p.period}</span>
              </div>
              <Bullets items={p.bullets} />
            </div>
          ))}
        </Section>

        {r.experience.length > 0 && (
          <Section title={L.experience} isKo={isKo}>
            {r.experience.map((e, i) => (
              <Entry key={i} e={e} />
            ))}
          </Section>
        )}

        <Section title={L.education} isKo={isKo}>
          {r.education.map((e, i) => (
            <Entry key={i} e={e} />
          ))}
        </Section>

        <Section title={L.skills} isKo={isKo}>
          <p className="text-[10pt] leading-[1.45]">
            {r.skills.map((s) => (
              <span key={s.category} className="block">
                <span className="font-bold">{s.category}</span>: {s.items}
              </span>
            ))}
          </p>
        </Section>
      </article>
    </div>
  );
}
