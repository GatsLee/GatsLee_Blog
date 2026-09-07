"use client";

import Link from "next/link";
import { Printer, ArrowUpRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import type { ResumeData } from "@/data/resume";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="resume-section mb-8">
      <h2 className="editorial-label text-muted border-b border-border pb-2 mb-4">{title}</h2>
      {children}
    </section>
  );
}

export default function ResumeDoc({ ko, en }: { ko: ResumeData; en: ResumeData }) {
  const { locale } = useLanguage();
  const isKo = locale !== "en";
  const r = isKo ? ko : en;

  const L = isKo
    ? {
        summary: "요약",
        pmSkills: "핵심 역량 — 프로덕트",
        techSkills: "핵심 역량 — 기술",
        experience: "경험 / 프로젝트",
        stack: "기술 스택",
        education: "교육 / 활동",
        problem: "문제",
        action: "행동",
        result: "결과",
        viewCase: "케이스 스터디 보기",
        print: "PDF로 저장",
        emptyExp: "경험 항목이 비어 있습니다. 어드민 → 이력서 탭에서 채우세요.",
      }
    : {
        summary: "Summary",
        pmSkills: "Core Skills — Product",
        techSkills: "Core Skills — Technical",
        experience: "Experience / Projects",
        stack: "Stack",
        education: "Education",
        problem: "Problem",
        action: "Action",
        result: "Result",
        viewCase: "Read the case study",
        print: "Save as PDF",
        emptyExp: "No experience entries yet.",
      };

  return (
    <div className="max-w-3xl mx-auto px-6 md:px-12 py-16 animate-fadeIn">
      {/* Print button — hidden in the PDF itself */}
      <div className="no-print flex justify-end mb-8">
        <button
          onClick={() => window.print()}
          className="group inline-flex items-center gap-2 border border-border px-4 py-2.5 hover:border-foreground transition-colors cursor-pointer"
        >
          <Printer size={14} strokeWidth={1.5} className="text-muted group-hover:text-foreground transition-colors" />
          <span className="editorial-label text-foreground font-bold">{L.print}</span>
        </button>
      </div>

      <article className="resume-doc">
        {/* ── Header ── */}
        <header className="resume-section mb-10 pb-6 border-b-2 border-foreground">
          <h1 className="font-heading text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
            {r.name}
          </h1>
          <p className="text-lg text-foreground font-light mb-5">{r.headline}</p>
          <div className="flex flex-wrap gap-x-5 gap-y-1.5 font-mono text-xs text-muted">
            <a href={`mailto:${r.contact.email}`} data-print-url className="hover:text-foreground transition-colors">
              {r.contact.email}
            </a>
            <a href={`https://${r.contact.github}`} className="hover:text-foreground transition-colors">
              {r.contact.github}
            </a>
            <a href={`https://${r.contact.blog}`} className="hover:text-foreground transition-colors">
              {r.contact.blog}
            </a>
            {r.contact.linkedin && (
              <a href={`https://${r.contact.linkedin}`} className="hover:text-foreground transition-colors">
                {r.contact.linkedin}
              </a>
            )}
          </div>
        </header>

        {/* ── Summary — every bullet carries a number ── */}
        {r.summary.length > 0 && (
          <Section title={L.summary}>
            <ul className="space-y-2.5">
              {r.summary.map((s, i) => (
                <li key={i} className="flex gap-3">
                  <span className="text-accent shrink-0 font-bold">—</span>
                  <span className="text-secondary leading-relaxed font-light">{s}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* ── Core skills: PM first, tech second. The ordering is the positioning. ── */}
        <div className="grid md:grid-cols-2 gap-x-10">
          {r.pmSkills.length > 0 && (
            <Section title={L.pmSkills}>
              <ul className="space-y-2">
                {r.pmSkills.map((s, i) => (
                  <li key={i} className="text-sm text-secondary leading-relaxed font-light">
                    {s}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {r.techSkills.length > 0 && (
            <Section title={L.techSkills}>
              <ul className="space-y-2">
                {r.techSkills.map((s, i) => (
                  <li key={i} className="text-sm text-secondary leading-relaxed font-light">
                    {s}
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </div>

        {/* ── Experience — STAR blocks joined to /cases ── */}
        <Section title={L.experience}>
          {r.experience.length === 0 ? (
            <p className="text-sm text-muted/60 italic no-print">{L.emptyExp}</p>
          ) : (
            <div className="space-y-8">
              {r.experience.map((e, i) => (
                <div key={i} className="resume-section">
                  <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
                    <h3 className="font-heading text-lg font-bold tracking-tight">
                      {e.role}
                      {e.org && <span className="text-muted font-normal"> · {e.org}</span>}
                    </h3>
                    <span className="font-mono text-xs text-muted">{e.period}</span>
                  </div>

                  <dl className="space-y-2 text-sm">
                    {[
                      { k: L.problem, v: e.problem },
                      { k: L.action, v: e.action },
                      { k: L.result, v: e.result },
                    ]
                      .filter((x) => x.v)
                      .map((x) => (
                        <div key={x.k} className="flex gap-4">
                          <dt className="editorial-label text-muted shrink-0 w-16 pt-0.5">{x.k}</dt>
                          <dd className="text-secondary font-light flex-1 leading-relaxed">{x.v}</dd>
                        </div>
                      ))}
                  </dl>

                  {e.caseSlug && (
                    <Link
                      href={`/cases/${e.caseSlug}`}
                      data-print-url
                      className="group inline-flex items-center gap-1.5 mt-3 editorial-label text-foreground font-bold hover:opacity-70 transition-opacity"
                    >
                      <span>{L.viewCase}</span>
                      <ArrowUpRight
                        size={12}
                        strokeWidth={2}
                        className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                      />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* ── Stack — one line per category, not a chip wall ── */}
        {r.stack.length > 0 && (
          <Section title={L.stack}>
            <dl className="space-y-2.5">
              {r.stack.map((s, i) => (
                <div key={i} className="flex gap-4">
                  <dt className="editorial-label text-muted shrink-0 w-24 pt-0.5">{s.category}</dt>
                  <dd className="text-sm text-secondary font-light flex-1">{s.items}</dd>
                </div>
              ))}
            </dl>
          </Section>
        )}

        {/* ── Education ── */}
        {r.education.length > 0 && (
          <Section title={L.education}>
            <div className="space-y-4">
              {r.education.map((e, i) => (
                <div key={i} className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <span className="text-foreground font-medium">{e.title}</span>
                    <span className="text-muted"> · {e.org}</span>
                    {e.note && (
                      <div className="text-xs text-muted/70 mt-0.5 font-light">{e.note}</div>
                    )}
                  </div>
                  <span className="font-mono text-xs text-muted">{e.period}</span>
                </div>
              ))}
            </div>
          </Section>
        )}
      </article>
    </div>
  );
}
