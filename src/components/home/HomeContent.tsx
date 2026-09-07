"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import ChatWidget from "@/components/home/ChatWidget";
import BuildProgress from "@/components/home/BuildProgress";
import MetricsPanel from "@/components/home/MetricsPanel";
import LiveWorkforcePanel from "@/components/home/LiveWorkforcePanel";
import ScrollReveal from "@/components/home/ScrollReveal";
import ServerDiagramModal from "@/components/home/ServerDiagramModal";
import { useLanguage } from "@/context/LanguageContext";
import type { GitCommit } from "@/lib/github";

// ── Typing animation ───────────────────────────────────────────────────────
// The first signal a recruiter reads. Leads with the product axis, not the
// engineering one — the technical proof lives further down the page.
const TYPING_TEXTS = {
  ko: ["AI 서비스 기획", "Technical PM", "Product Builder"],
  en: ["AI Service Planning", "Technical PM", "Product Builder"],
};
const TYPE_SPEED = 100;
const ERASE_SPEED = 70;
const TOTAL_CYCLE = 5000;

function TypingText() {
  const { locale } = useLanguage();
  const texts = useMemo(
    () => TYPING_TEXTS[locale as "ko" | "en"] ?? TYPING_TEXTS.ko,
    [locale]
  );

  const [displayed, setDisplayed] = useState("");
  const [textIndex, setTextIndex] = useState(0);
  const [phase, setPhase] = useState<"typing" | "holding" | "erasing">("typing");
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    const current = texts[textIndex];

    if (phase === "typing") {
      if (charIndex < current.length) {
        const t = setTimeout(() => {
          setDisplayed(current.slice(0, charIndex + 1));
          setCharIndex((c) => c + 1);
        }, TYPE_SPEED);
        return () => clearTimeout(t);
      } else {
        setPhase("holding");
      }
    }

    if (phase === "holding") {
      const holdTime = Math.max(
        TOTAL_CYCLE - current.length * TYPE_SPEED - current.length * ERASE_SPEED,
        500
      );
      const t = setTimeout(() => setPhase("erasing"), holdTime);
      return () => clearTimeout(t);
    }

    if (phase === "erasing") {
      if (charIndex > 0) {
        const t = setTimeout(() => {
          setDisplayed(current.slice(0, charIndex - 1));
          setCharIndex((c) => c - 1);
        }, ERASE_SPEED);
        return () => clearTimeout(t);
      } else {
        setTextIndex((i) => (i + 1) % texts.length);
        setPhase("typing");
      }
    }
  }, [phase, charIndex, textIndex, texts]);

  const cursorVisible = phase === "typing" || phase === "erasing";

  return (
    <span className="editorial-label font-bold text-foreground">
      {displayed}
      <span
        className={`inline-block w-px h-3 bg-foreground ml-0.5 align-middle transition-opacity ${
          cursorVisible ? "animate-pulse opacity-100" : "opacity-0"
        }`}
        aria-hidden="true"
      />
    </span>
  );
}

interface PostCard {
  id: number;
  title: string;
  slug: string;
  tags: string;
  locale: string;
}

interface PinnedPost {
  title: string;
  slug: string;
  content: string;
  tags: string;
  githubRepo: string;
  createdAt: string;
}

export interface BuildTimelineItem {
  id: number;
  title: string;
  slug: string;
  category: string;
  description: string;
  tags: string;
  relatedPosts: string;
  createdAt: string;
}

interface HomeContentProps {
  commits: GitCommit[];
  repoName: string;
  pinnedPost: PinnedPost | null;
  products: PostCard[];
  agents: PostCard[];
  buildTimeline: BuildTimelineItem[];
}

export default function HomeContent({ commits, repoName, pinnedPost, products, agents, buildTimeline }: HomeContentProps) {
  const { t, locale } = useLanguage();
  const { theme } = useTheme();
  const [showDiagram, setShowDiagram] = useState(false);

  const pawnSrc = theme === "dark" ? "/white_pawn.ico" : "/black_pawn.ico";

  return (
    <div>
      <ChatWidget initialMessage="" defaultOpen={false} />

      {/* [1] Hero — 자기소개 (left) + 메트릭스 박스 (right) */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/Basement_Server_Pixelized_Image.png"
            alt="Home Server"
            fill
            className="object-cover opacity-30"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>
        <div className="relative max-w-screen-2xl mx-auto px-6 md:px-12 py-24 md:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left: thesis + numbers */}
            <div className="lg:col-span-7">
              <div className="flex items-center gap-3 mb-6">
                <Image src={pawnSrc} alt="GATS LAB" width={24} height={24} />
                <TypingText key={locale} />
              </div>
              <h1 className="font-heading text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-[1.1]">
                {t.home.heroTitle}
              </h1>
              <p className="text-secondary text-base md:text-lg leading-relaxed max-w-xl font-light mb-8">
                {t.home.heroSubtitle}
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/cases"
                  className="group inline-flex items-center gap-2 border border-foreground bg-foreground text-background px-5 py-3 editorial-label font-bold hover:opacity-85 transition-opacity"
                >
                  <span>{t.home.aboutLink}</span>
                  <ArrowRight size={14} strokeWidth={2} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/resume"
                  className="inline-flex items-center gap-2 border border-border px-5 py-3 editorial-label text-foreground font-bold hover:border-foreground transition-colors"
                >
                  <span>{t.home.aboutLinkSecondary}</span>
                </Link>
              </div>
            </div>

            {/* Right: the numbers, where the CPU gauge used to be */}
            <div className="lg:col-span-5">
              <div className="divide-y divide-border border-y border-border">
                {t.home.heroStats.map((s) => (
                  <div key={s.label} className="flex items-baseline gap-5 py-6">
                    <span className="font-heading text-4xl md:text-5xl font-extrabold tracking-tight text-foreground min-w-[5rem]">
                      {s.value}
                    </span>
                    <span className="text-secondary font-light">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* [2] Live telemetry — kept as proof, demoted below the fold.
          The hybrid bet: don't delete the engineering evidence, subordinate it. */}
      <ScrollReveal delay={0.1}>
        <section className="max-w-screen-2xl mx-auto px-6 md:px-12 py-16 md:py-20 border-t border-border">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
            <div className="lg:col-span-5">
              <h2 className="editorial-label text-muted mb-3">
                {locale === "ko" ? "직접 만들고 직접 운영합니다" : "Built and operated by me"}
              </h2>
              <p className="text-secondary font-light leading-relaxed">
                {locale === "ko"
                  ? "이 블로그와 RAG 챗봇은 집에 있는 GPU 서버 위에서 돌아갑니다. 아래는 지금 이 순간의 실제 서버 상태입니다 — 기획한 것을 끝까지 굴려본 사람만 아는 것들이 있어서요."
                  : "This blog and its RAG chatbot run on a GPU server in my apartment. Below is that server, right now — because shipping and operating what you planned teaches things that planning alone doesn't."}
              </p>
            </div>
            <div className="lg:col-span-7">
              <div
                className="group border border-border p-6 bg-background/80 backdrop-blur-sm cursor-pointer hover:border-foreground transition-colors relative"
                onClick={() => setShowDiagram(true)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setShowDiagram(true); }}
                aria-label="View server structure diagram"
              >
                <MetricsPanel />
                <span className="editorial-label text-muted text-[10px] absolute bottom-3 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  VIEW STRUCTURE →
                </span>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* [3] 빌드 로그 | 진행 중인 프로젝트 (2-column) */}
      <ScrollReveal delay={0.1}>
        <section className="max-w-screen-2xl mx-auto px-6 md:px-12 py-16 md:py-24 border-t border-border">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Left: Build Log */}
            <div>
              <BuildProgress timeline={buildTimeline} />
            </div>

            {/* Right: Portfolio (Products & Agents) */}
            <div>
              <LiveWorkforcePanel products={products} agents={agents} />
            </div>
          </div>
        </section>
      </ScrollReveal>

      {showDiagram && <ServerDiagramModal onClose={() => setShowDiagram(false)} />}
    </div>
  );
}
