"use client";

import Link from "next/link";
import { Home, ChevronRight, ExternalLink, Ban } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import {
  parseBeats,
  headlineMetric,
  BEAT_KEYS,
  BEAT_LABEL,
  VERDICT_LABEL,
  type Metric,
} from "@/lib/case-study";

interface CaseDetailProps {
  title: string;
  content: string;
  caseBeats: string | null;
  externalLinks: string | null;
  tags: string;
  createdAt: string;
}

const VERDICT_STYLE: Record<string, string> = {
  met: "bg-green-500/10 text-green-500 border-green-500/30",
  partial: "bg-amber-500/10 text-amber-500 border-amber-500/30",
  missed: "bg-red-500/10 text-red-500 border-red-500/30",
};

/** before → after → delta cards. Reused by Problem, Hypothesis, and Outcome. */
function MetricStrip({ metrics }: { metrics: Metric[] }) {
  const shown = metrics.filter((m) => m.label.trim());
  if (shown.length === 0) return null;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {shown.map((m, i) => (
        <div key={i} className="border border-border p-5">
          <div className="editorial-label text-muted mb-3">{m.label}</div>
          <div className="flex items-baseline gap-2 font-mono mb-2">
            {m.before && (
              <>
                <span className="text-muted text-base line-through decoration-1 opacity-60">
                  {m.before}
                </span>
                <span className="text-muted text-xs">→</span>
              </>
            )}
            <span className="font-heading text-2xl font-extrabold tracking-tight text-foreground">
              {m.after || "—"}
            </span>
          </div>
          {m.delta && <div className="text-accent font-bold text-sm font-mono">{m.delta}</div>}
          {m.source && (
            <div className="editorial-label text-muted/60 mt-3 pt-3 border-t border-border">
              {m.source}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function BeatSection({
  index,
  keyName,
  ko,
  children,
}: {
  index: number;
  keyName: (typeof BEAT_KEYS)[number];
  ko: boolean;
  children: React.ReactNode;
}) {
  return (
    <section id={keyName} className="scroll-mt-24 border-t border-border pt-10 mb-14">
      <h2 className="editorial-label text-muted mb-6">
        {String(index).padStart(2, "0")} — {ko ? BEAT_LABEL[keyName].ko : BEAT_LABEL[keyName].en}
      </h2>
      <div className="space-y-6">{children}</div>
    </section>
  );
}

function Prose({ children }: { children: string }) {
  return (
    <p className="text-secondary leading-relaxed font-light whitespace-pre-line">{children}</p>
  );
}

export default function CaseDetail({
  title,
  content,
  caseBeats,
  externalLinks,
  tags,
  createdAt,
}: CaseDetailProps) {
  const { locale, t } = useLanguage();
  const ko = locale === "ko";
  const b = parseBeats(caseBeats);

  let links: { label: string; url: string }[] = [];
  try { links = JSON.parse(externalLinks || "[]"); } catch { /* malformed — show none */ }
  let tagList: string[] = [];
  try { tagList = JSON.parse(tags || "[]"); } catch { /* malformed — show none */ }

  // No beats: fall back to plain markdown so a half-authored case still renders.
  if (!b) {
    return (
      <article className="max-w-3xl mx-auto px-6 md:px-12 py-16 animate-fadeIn">
        <h1 className="font-heading text-4xl font-extrabold tracking-tight mb-8">{title}</h1>
        <MarkdownRenderer content={content} />
      </article>
    );
  }

  const headline = headlineMetric(b);
  const verdict = b.outcome.verdictVsCriteria;
  const notBuilt = b.decisions.notBuilt.filter((n) => n.item.trim());
  const decisions = b.decisions.decisions.filter((d) => d.title.trim());
  const priorities = b.decisions.priorities.filter((p) => p.item.trim());
  const sc = b.decisions.stakeholderConflict;
  const criteria = b.hypothesis.successCriteria.filter((m) => m.label.trim());

  return (
    <div className="animate-fadeIn max-w-screen-2xl mx-auto px-6 md:px-12 py-16">
      <div className="mb-8 flex items-center gap-2 text-sm text-muted">
        <Link href="/" className="hover:text-foreground transition-colors flex items-center gap-1">
          <Home size={14} strokeWidth={1.5} />
          <span>{t.nav.home}</span>
        </Link>
        <ChevronRight size={14} strokeWidth={1.5} />
        <Link href="/cases" className="hover:text-foreground transition-colors">
          {ko ? "케이스 스터디" : "Case Studies"}
        </Link>
      </div>

      <div className="flex gap-12">
        {/* Left rail — beat anchors */}
        <nav className="hidden xl:block w-44 shrink-0">
          <div className="sticky top-28 space-y-2">
            {BEAT_KEYS.map((k, i) => (
              <a
                key={k}
                href={`#${k}`}
                className="block editorial-label text-muted hover:text-foreground transition-colors"
              >
                {String(i + 1).padStart(2, "0")} {ko ? BEAT_LABEL[k].ko : BEAT_LABEL[k].en}
              </a>
            ))}
          </div>
        </nav>

        <article className="flex-1 min-w-0 max-w-3xl">
          {/* ── TL;DR strip — a recruiter who reads only this has the case ── */}
          <header className="mb-14">
            <div className="editorial-label text-muted mb-5 flex flex-wrap items-center gap-x-3 gap-y-1">
              {b.context.myRole && <span className="text-foreground">{b.context.myRole}</span>}
              {b.context.period && (
                <>
                  <span className="opacity-30">·</span>
                  <span>{b.context.period}</span>
                </>
              )}
              {b.context.team && (
                <>
                  <span className="opacity-30">·</span>
                  <span>{b.context.team}</span>
                </>
              )}
            </div>

            <h1 className="font-heading text-3xl md:text-4xl font-extrabold tracking-tight mb-6">
              {title}
            </h1>

            {b.problem.statement && (
              <p className="text-xl md:text-2xl leading-snug text-foreground font-light mb-8">
                {b.problem.statement}
              </p>
            )}

            {headline && (
              <div className="flex flex-wrap items-baseline gap-4 border-y border-border py-6">
                <span className="editorial-label text-muted">{headline.label}</span>
                <div className="flex items-baseline gap-3 font-mono">
                  {headline.before && (
                    <>
                      <span className="text-muted text-2xl line-through decoration-1 opacity-60">
                        {headline.before}
                      </span>
                      <span className="text-muted">→</span>
                    </>
                  )}
                  <span className="font-heading text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
                    {headline.after || "—"}
                  </span>
                  {headline.delta && (
                    <span className="text-accent text-2xl font-bold">{headline.delta}</span>
                  )}
                </div>
                {verdict && (
                  <span
                    className={`editorial-label px-2.5 py-1 border ml-auto ${VERDICT_STYLE[verdict]}`}
                  >
                    {ko ? VERDICT_LABEL[verdict].ko : VERDICT_LABEL[verdict].en}
                  </span>
                )}
              </div>
            )}
          </header>

          {/* ── 01 CONTEXT ── */}
          <BeatSection index={1} keyName="context" ko={ko}>
            <dl className="grid grid-cols-2 gap-x-8 gap-y-5">
              {[
                { k: ko ? "제품" : "Product", v: b.context.product },
                { k: ko ? "기간" : "Period", v: b.context.period },
                { k: ko ? "팀 구성" : "Team", v: b.context.team },
                { k: ko ? "내 역할" : "My role", v: b.context.myRole },
              ]
                .filter((x) => x.v)
                .map((x) => (
                  <div key={x.k}>
                    <dt className="editorial-label text-muted mb-1.5">{x.k}</dt>
                    <dd className="text-foreground">{x.v}</dd>
                  </div>
                ))}
            </dl>

            {b.context.iOwned.filter(Boolean).length > 0 && (
              <div className="pt-2">
                <div className="editorial-label text-muted mb-3">
                  {ko ? "내가 소유한 것" : "What I owned"}
                </div>
                <ul className="space-y-2">
                  {b.context.iOwned.filter(Boolean).map((item, i) => (
                    <li key={i} className="flex gap-3 text-secondary font-light">
                      <span className="text-accent shrink-0">—</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </BeatSection>

          {/* ── 02 PROBLEM ── */}
          <BeatSection index={2} keyName="problem" ko={ko}>
            {b.problem.statement && <Prose>{b.problem.statement}</Prose>}
            <MetricStrip metrics={b.problem.metrics} />
            {b.problem.evidence && (
              <div className="border-l-2 border-border pl-5">
                <div className="editorial-label text-muted mb-2">{ko ? "근거" : "Evidence"}</div>
                <Prose>{b.problem.evidence}</Prose>
              </div>
            )}
          </BeatSection>

          {/* ── 03 HYPOTHESIS — the criteria render as a signed contract ── */}
          <BeatSection index={3} keyName="hypothesis" ko={ko}>
            {b.hypothesis.statement && <Prose>{b.hypothesis.statement}</Prose>}

            {criteria.length > 0 && (
              <div className="border-2 border-foreground p-6">
                <div className="flex items-baseline justify-between mb-5 pb-4 border-b border-border">
                  <span className="editorial-label text-foreground font-bold">
                    {ko ? "사전 선언한 성공 기준" : "Pre-declared success criteria"}
                  </span>
                  {b.hypothesis.declaredOn && (
                    <span className="editorial-label text-muted font-mono">
                      {ko ? "선언" : "Declared"} {b.hypothesis.declaredOn}
                    </span>
                  )}
                </div>
                <ul className="space-y-3">
                  {criteria.map((m, i) => (
                    <li key={i} className="flex items-baseline gap-3 font-mono text-sm">
                      <span className="text-muted min-w-[9rem]">{m.label}</span>
                      {m.before && <span className="text-muted opacity-60">{m.before} →</span>}
                      <span className="text-foreground font-bold">{m.after || "—"}</span>
                      {m.delta && <span className="text-accent">{m.delta}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </BeatSection>

          {/* ── 04 DECISIONS ── */}
          <BeatSection index={4} keyName="decisions" ko={ko}>
            {decisions.map((d, i) => (
              <div key={i} className="border border-border p-6">
                <h3 className="font-heading text-lg font-bold tracking-tight mb-4">{d.title}</h3>
                <dl className="space-y-3 text-sm">
                  {[
                    { k: ko ? "검토한 선택지" : "Options", v: d.options },
                    { k: ko ? "선택" : "Chose", v: d.chose },
                    { k: ko ? "이유" : "Because", v: d.because },
                    { k: ko ? "트레이드오프" : "Tradeoff", v: d.tradeoff },
                  ]
                    .filter((x) => x.v)
                    .map((x) => (
                      <div key={x.k} className="flex gap-4">
                        <dt className="editorial-label text-muted shrink-0 w-28 pt-0.5">{x.k}</dt>
                        <dd className="text-secondary font-light flex-1">{x.v}</dd>
                      </div>
                    ))}
                </dl>
              </div>
            ))}

            {/* The heaviest block on the page. Nothing else on a Korean PM
                portfolio does this — so it carries the most weight. */}
            {notBuilt.length > 0 && (
              <div className="border-2 border-foreground bg-surface/40 p-8">
                <div className="flex items-center gap-2.5 mb-6">
                  <Ban size={16} strokeWidth={2} className="text-foreground" />
                  <h3 className="font-heading text-xl font-extrabold tracking-tight">
                    {ko ? "만들지 않기로 한 것" : "What I chose not to build"}
                  </h3>
                </div>
                <ul className="space-y-5">
                  {notBuilt.map((n, i) => (
                    <li key={i} className="grid md:grid-cols-[1fr_2fr] gap-2 md:gap-6">
                      <span className="font-mono text-foreground line-through decoration-1 decoration-muted">
                        {n.item}
                      </span>
                      <span className="text-secondary font-light text-sm leading-relaxed">
                        {n.why}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {priorities.length > 0 && (
              <div>
                <div className="editorial-label text-muted mb-3">
                  {ko ? "우선순위" : "Prioritization"} · {b.decisions.framework}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm font-mono border border-border">
                    <thead>
                      <tr className="border-b border-border bg-surface/50">
                        <th className="text-left editorial-label text-muted p-3">
                          {ko ? "항목" : "Item"}
                        </th>
                        <th className="text-right editorial-label text-muted p-3">R</th>
                        <th className="text-right editorial-label text-muted p-3">I</th>
                        <th className="text-right editorial-label text-muted p-3">C</th>
                        <th className="text-right editorial-label text-muted p-3">E</th>
                        <th className="text-right editorial-label text-muted p-3">
                          {ko ? "점수" : "Score"}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {priorities.map((p, i) => (
                        <tr key={i} className="border-b border-border last:border-0">
                          <td className="p-3 text-foreground">{p.item}</td>
                          <td className="p-3 text-right text-secondary">{p.r}</td>
                          <td className="p-3 text-right text-secondary">{p.i}</td>
                          <td className="p-3 text-right text-secondary">{p.c}</td>
                          <td className="p-3 text-right text-secondary">{p.e}</td>
                          <td className="p-3 text-right text-foreground font-bold">{p.score}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {(sc.who || sc.tension || sc.resolution) && (
              <div className="border border-border p-6">
                <div className="editorial-label text-muted mb-5">
                  {ko ? "이해관계자 충돌" : "Stakeholder conflict"}
                </div>
                <dl className="space-y-3 text-sm">
                  {[
                    { k: ko ? "대상" : "Who", v: sc.who },
                    { k: ko ? "갈등" : "Tension", v: sc.tension },
                    { k: ko ? "해결" : "Resolution", v: sc.resolution },
                  ]
                    .filter((x) => x.v)
                    .map((x) => (
                      <div key={x.k} className="flex gap-4">
                        <dt className="editorial-label text-muted shrink-0 w-24 pt-0.5">{x.k}</dt>
                        <dd className="text-secondary font-light flex-1">{x.v}</dd>
                      </div>
                    ))}
                </dl>
              </div>
            )}

            {b.decisions.prdExcerpt && (
              <div>
                <div className="editorial-label text-muted mb-3">
                  {ko ? "PRD 발췌" : "PRD excerpt"}
                </div>
                <div className="border border-border p-6">
                  <MarkdownRenderer content={b.decisions.prdExcerpt} />
                </div>
              </div>
            )}

            {b.decisions.wireframes.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {b.decisions.wireframes.map((url, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={url}
                    alt={`${ko ? "와이어프레임" : "Wireframe"} ${i + 1}`}
                    className="w-full border border-border"
                  />
                ))}
              </div>
            )}
          </BeatSection>

          {/* ── 05 OUTCOME ── */}
          <BeatSection index={5} keyName="outcome" ko={ko}>
            <MetricStrip metrics={b.outcome.metrics} />

            {verdict && (
              <div className={`border-2 p-6 ${VERDICT_STYLE[verdict]}`}>
                <div className="editorial-label mb-2 opacity-70">
                  {ko ? "사전 기준 대비" : "Against the pre-declared criteria"}
                </div>
                <div className="font-heading text-2xl font-extrabold tracking-tight">
                  {ko ? VERDICT_LABEL[verdict].ko : VERDICT_LABEL[verdict].en}
                </div>
              </div>
            )}

            {b.outcome.proxyNote && (
              <div className="border-l-2 border-border pl-5">
                <div className="editorial-label text-muted mb-2">
                  {ko ? "지표 주석" : "On the metrics"}
                </div>
                <Prose>{b.outcome.proxyNote}</Prose>
              </div>
            )}
          </BeatSection>

          {/* ── 06 REFLECTION ── */}
          <BeatSection index={6} keyName="reflection" ko={ko}>
            {[
              { k: ko ? "배운 것" : "What I learned", v: b.reflection.learned },
              { k: ko ? "실패한 실험" : "Failed experiments", v: b.reflection.failedExperiments },
              { k: ko ? "다음엔" : "Next time", v: b.reflection.nextTime },
            ]
              .filter((x) => x.v)
              .map((x) => (
                <div key={x.k}>
                  <div className="editorial-label text-muted mb-2">{x.k}</div>
                  <Prose>{x.v}</Prose>
                </div>
              ))}
          </BeatSection>

          {/* ── Long form ── */}
          {content.trim() && (
            <details className="border-t border-border pt-10 mb-14 group">
              <summary className="editorial-label text-muted cursor-pointer hover:text-foreground transition-colors list-none flex items-center gap-2">
                <ChevronRight
                  size={14}
                  strokeWidth={2}
                  className="group-open:rotate-90 transition-transform"
                />
                {ko ? "전체 기록" : "Full write-up"}
              </summary>
              <div className="mt-8">
                <MarkdownRenderer content={content} />
              </div>
            </details>
          )}

          {/* ── Engineering evidence — subordinate, cited, one click away ── */}
          {links.length > 0 && (
            <section className="border-t border-border pt-10">
              <h2 className="editorial-label text-muted mb-5">
                {ko ? "엔지니어링 증거" : "Engineering evidence"}
              </h2>
              <div className="flex flex-wrap gap-3">
                {links.map((l, i) => (
                  <Link
                    key={i}
                    href={l.url}
                    target={l.url.startsWith("http") ? "_blank" : undefined}
                    className="group inline-flex items-center gap-2 border border-border px-4 py-2.5 hover:border-foreground transition-colors"
                  >
                    <span className="editorial-label text-foreground font-bold">{l.label}</span>
                    <ExternalLink
                      size={12}
                      strokeWidth={2}
                      className="text-muted group-hover:text-foreground transition-colors"
                    />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Footer meta */}
          <div className="flex flex-wrap items-center gap-2 mt-14 pt-6 border-t border-border">
            {tagList.map((tag) => (
              <span
                key={tag}
                className="editorial-label text-muted px-2 py-0.5 border border-border"
              >
                {tag}
              </span>
            ))}
            <time className="editorial-label text-muted ml-auto">
              {new Date(createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </time>
          </div>
        </article>
      </div>
    </div>
  );
}
