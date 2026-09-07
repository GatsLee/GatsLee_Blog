"use client";

import Link from "next/link";
import { ArrowRight, Home, ChevronRight, Target } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { parseBeats, headlineMetric, VERDICT_LABEL } from "@/lib/case-study";

interface CasePost {
  id: number;
  title: string;
  slug: string;
  description: string;
  createdAt: string;
  tags: string;
  locale: string;
  caseBeats: string | null;
}

const STATUS_TAGS = ["shipped", "shelved", "in-flight"];

const STATUS_STYLE: Record<string, string> = {
  shipped: "bg-green-500/10 text-green-500 border-green-500/20",
  "in-flight": "bg-blue-500/10 text-blue-500 border-blue-500/20",
  shelved: "bg-amber-500/10 text-amber-500 border-amber-500/20",
};

const VERDICT_STYLE: Record<string, string> = {
  met: "text-green-500",
  partial: "text-amber-500",
  missed: "text-red-500",
};

export default function CaseList({ posts }: { posts: CasePost[] }) {
  const { locale, t } = useLanguage();
  const filtered = posts.filter((p) => p.locale === locale);
  const ko = locale === "ko";

  return (
    <div className="animate-fadeIn max-w-screen-2xl mx-auto px-6 md:px-12 py-16">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-muted">
        <Link href="/" className="hover:text-foreground transition-colors flex items-center gap-1">
          <Home size={14} strokeWidth={1.5} />
          <span>{t.nav.home}</span>
        </Link>
        <ChevronRight size={14} strokeWidth={1.5} />
        <span className="text-foreground font-medium">{ko ? "케이스 스터디" : "Case Studies"}</span>
      </div>

      {/* Header */}
      <div className="mb-12 border-b border-border pb-6">
        <h1 className="font-heading text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
          {ko ? "케이스 스터디" : "Case Studies"}
        </h1>
        <p className="text-secondary font-light">
          {ko
            ? "문제를 숫자로 정의하고, 가설을 세우고, 트레이드오프를 감수하고, 결과를 지표로 검증한 기록."
            : "Problems framed by a metric, hypotheses with pre-declared criteria, tradeoffs taken, outcomes measured."}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="py-24 text-center">
          <Target size={48} strokeWidth={1} className="mx-auto mb-4 text-muted opacity-30" />
          <p className="text-muted text-lg mb-2">
            {ko ? "아직 공개된 케이스가 없습니다." : "No case studies published yet."}
          </p>
          <p className="text-muted/60 text-sm">
            {ko
              ? "작성 중입니다 — 문제 정의부터 결과 검증까지 전체 기록으로 곧 올라옵니다."
              : "In progress — the full record, from problem framing to measured outcome."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filtered.map((post) => {
            const beats = parseBeats(post.caseBeats);
            const metric = beats ? headlineMetric(beats) : null;
            const verdict = beats?.outcome.verdictVsCriteria || "";
            let tags: string[] = [];
            try { tags = JSON.parse(post.tags); } catch { /* malformed tags — show none */ }
            const status = tags.find((x) => STATUS_TAGS.includes(x));
            const techTags = tags.filter((x) => !STATUS_TAGS.includes(x));
            const problem = beats?.problem.statement || post.description;

            return (
              <Link
                key={post.id}
                href={`/cases/${post.slug}`}
                className="group flex flex-col border border-border p-8 hover:border-foreground transition-all duration-300"
              >
                {/* The card leads with the metric, not the title. */}
                {metric && (
                  <div className="mb-5">
                    <div className="editorial-label text-muted mb-1.5">{metric.label}</div>
                    <div className="flex items-baseline gap-2.5 font-mono">
                      {metric.before && (
                        <>
                          <span className="text-muted text-lg line-through decoration-1 opacity-60">
                            {metric.before}
                          </span>
                          <span className="text-muted text-sm">→</span>
                        </>
                      )}
                      <span className="font-heading text-3xl font-extrabold tracking-tight text-foreground">
                        {metric.after || "—"}
                      </span>
                      {metric.delta && (
                        <span className="text-accent text-lg font-bold">{metric.delta}</span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-1.5 mb-4 flex-wrap">
                  {status && (
                    <span className={`editorial-label px-2 py-1 border ${STATUS_STYLE[status]}`}>
                      {status}
                    </span>
                  )}
                  {verdict && (
                    <span
                      className={`editorial-label px-2 py-1 border border-border ${VERDICT_STYLE[verdict]}`}
                    >
                      {ko ? VERDICT_LABEL[verdict].ko : VERDICT_LABEL[verdict].en}
                    </span>
                  )}
                  <time className="editorial-label text-muted ml-auto">
                    {new Date(post.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })}
                  </time>
                </div>

                <h3 className="font-heading text-xl font-bold tracking-tight text-foreground mb-3 group-hover:underline underline-offset-4 decoration-1">
                  {post.title}
                </h3>

                {problem && (
                  <p className="text-secondary text-sm leading-relaxed line-clamp-3 mb-5 font-light">
                    {problem}
                  </p>
                )}

                {techTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {techTags.slice(0, 5).map((tag) => (
                      <span
                        key={tag}
                        className="editorial-label text-muted px-2 py-0.5 border border-border"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2 editorial-label text-foreground font-bold mt-auto pt-2">
                  <span>{ko ? "케이스 읽기" : "Read case"}</span>
                  <ArrowRight
                    size={12}
                    strokeWidth={2}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
