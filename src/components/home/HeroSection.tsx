"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import ScrollReveal from "@/components/home/ScrollReveal";

gsap.registerPlugin(ScrollTrigger);

// ─── TypewriterText ───────────────────────────────────────────────────────────
// "기술" → 파란 글로우, "삶" → 주황 글로우, 나머지 → 수평 그라데이션
const GLOW_SEGMENTS: Record<string, Array<{ from: number; to: number; type: "blue" | "orange" | "normal" }>> = {
  // "기술로 더 나은 삶을" (11 chars)
  ko: [
    { from: 0,  to: 2,  type: "blue" },   // 기술
    { from: 2,  to: 9,  type: "normal" }, // 로 더 나은
    { from: 9,  to: 10, type: "orange" }, // 삶
    { from: 10, to: 11, type: "normal" }, // 을
  ],
  // "Technology for a\nbetter life" (28 chars)
  en: [
    { from: 0,  to: 10, type: "blue" },   // Technology
    { from: 10, to: 24, type: "normal" }, //  for a\nbetter
    { from: 24, to: 28, type: "orange" }, // life
  ],
};

function TypewriterText({ text, className }: { text: string; className?: string }) {
  const { locale } = useLanguage();
  const ref = useRef<HTMLSpanElement>(null);
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!started || done) return;
    if (displayed.length >= text.length) { setDone(true); return; }
    const t = setTimeout(() => setDisplayed(text.slice(0, displayed.length + 1)), 52);
    return () => clearTimeout(t);
  }, [started, displayed, text, done]);

  const gradientStyle: React.CSSProperties = {
    background: "linear-gradient(90deg, var(--color-secondary) 0%, var(--color-foreground) 30%, var(--color-foreground) 70%, var(--color-secondary) 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  };

  const segments = GLOW_SEGMENTS[locale] ?? GLOW_SEGMENTS.ko;

  const rendered = segments.map((seg, i) => {
    if (seg.from >= displayed.length) return null;
    const chars = displayed.slice(seg.from, Math.min(seg.to, displayed.length));
    if (!chars) return null;

    if (seg.type === "blue") {
      return (
        <span
          key={i}
          style={{
            color: "var(--color-foreground)",
            WebkitTextFillColor: "var(--color-foreground)",
            animation: "blueGlowPulse 2.8s ease-in-out infinite",
          }}
        >
          {chars}
        </span>
      );
    }
    if (seg.type === "orange") {
      return (
        <span
          key={i}
          style={{
            color: "var(--color-foreground)",
            WebkitTextFillColor: "var(--color-foreground)",
            animation: "orangeGlowFadeIn 1.8s ease-in forwards, orangeGlowPulse 2.8s ease-in-out 1.8s infinite",
          }}
        >
          {chars}
        </span>
      );
    }
    // normal — gradient, handle \n
    return (
      <span key={i} style={gradientStyle}>
        {chars.split("\n").map((line, j) => (
          <span key={j}>{j > 0 && <br />}{line}</span>
        ))}
      </span>
    );
  });

  return (
    <>
      <style>{`
        @keyframes blueGlowPulse {
          0%, 100% {
            text-shadow:
              0 0 8px rgba(96,165,250,0.95),
              0 0 20px rgba(59,130,246,0.8),
              0 0 45px rgba(59,130,246,0.55),
              0 0 90px rgba(59,130,246,0.3);
          }
          50% {
            text-shadow:
              0 0 12px rgba(96,165,250,1),
              0 0 35px rgba(59,130,246,0.95),
              0 0 70px rgba(59,130,246,0.75),
              0 0 130px rgba(59,130,246,0.45),
              0 0 200px rgba(59,130,246,0.2);
          }
        }
        @keyframes orangeGlowFadeIn {
          0% { text-shadow: none; }
          100% {
            text-shadow:
              0 0 6px rgba(251,146,60,0.7),
              0 0 15px rgba(249,115,22,0.5),
              0 0 30px rgba(249,115,22,0.3),
              0 0 50px rgba(249,115,22,0.15);
          }
        }
        @keyframes orangeGlowPulse {
          0%, 100% {
            text-shadow:
              0 0 6px rgba(251,146,60,0.7),
              0 0 15px rgba(249,115,22,0.5),
              0 0 30px rgba(249,115,22,0.3),
              0 0 50px rgba(249,115,22,0.15);
          }
          50% {
            text-shadow:
              0 0 16px rgba(251,146,60,1),
              0 0 45px rgba(249,115,22,1),
              0 0 90px rgba(249,115,22,0.85),
              0 0 160px rgba(249,115,22,0.6),
              0 0 260px rgba(249,115,22,0.35),
              0 0 380px rgba(249,115,22,0.15);
          }
        }
      `}</style>
      <span ref={ref} className={className}>
        {rendered}
        {!done && (
          <span className="inline-block w-[3px] h-[0.75em] bg-foreground ml-1 align-middle animate-pulse" />
        )}
      </span>
    </>
  );
}

// ─── BentoCard ────────────────────────────────────────────────────────────────
function BentoCard({
  num, theme, front, back, tag,
}: {
  num: string;
  theme: string;
  front: string;
  back: string;
  tag: string;
}) {
  const { locale } = useLanguage();
  const [open, setOpen] = useState(false);

  const toggleLabel = open
    ? locale === "ko" ? "접기" : "Collapse"
    : locale === "ko" ? "자세히" : "Read more";

  // Keyword size scales with viewport so 3 horizontal cards fit on mobile and stay impactful on desktop.
  const keywordSize = "clamp(24px, 5.5vw, 96px)";
  const strokeWidth = "1.5px";

  return (
    <div
      onClick={() => setOpen((o) => !o)}
      className="group bento-card relative cursor-pointer select-none border border-border hover:border-foreground transition-colors aspect-square flex flex-col p-4 md:p-7"
      style={{
        backgroundColor: "var(--color-surface)",
        filter:
          "drop-shadow(0 4px 24px rgba(0,0,0,0.07)) drop-shadow(0 1px 4px rgba(0,0,0,0.04))",
        ["--bento-stroke" as string]: strokeWidth,
      }}
    >
      <style>{`
        .bento-card .bento-keyword {
          -webkit-text-stroke: var(--bento-stroke, 1.5px) var(--color-foreground);
          -webkit-text-fill-color: transparent;
          color: transparent;
          transition: -webkit-text-fill-color 0.4s cubic-bezier(0.16, 1, 0.3, 1),
                      color 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .bento-card:hover .bento-keyword {
          -webkit-text-fill-color: var(--color-foreground);
          color: var(--color-foreground);
        }
      `}</style>
      {/* Header: num */}
      <div className="relative">
        <span className="editorial-label text-muted">{num}</span>
      </div>

      {/* Outline keyword — dominant brutalist hero */}
      <div className="relative flex-1 flex items-center justify-center py-6">
        <span
          className="bento-keyword font-heading font-extrabold leading-none tracking-[-0.04em] text-center"
          style={{ fontSize: keywordSize }}
        >
          {theme}
        </span>
      </div>

      {/* Expandable detail — quote + description + tag */}
      <div
        className={`relative overflow-hidden transition-all duration-500 ease-out ${
          open ? "max-h-[400px] opacity-100 mt-2" : "max-h-0 opacity-0 mt-0"
        }`}
      >
        <p className="font-heading font-bold leading-tight text-foreground mb-3 text-sm md:text-base">
          &ldquo;{front}&rdquo;
        </p>
        <p className="text-secondary leading-relaxed font-light mb-4 text-xs md:text-sm">
          {back}
        </p>
        <span className="editorial-label inline-block border border-border text-muted px-2 py-0.5 text-[10px]">
          {tag}
        </span>
      </div>

      {/* Toggle affordance */}
      <div className="relative flex items-center gap-1.5 mt-6 editorial-label text-muted text-[10px] group-hover:text-foreground transition-colors">
        <ChevronDown
          size={11}
          className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
        {toggleLabel}
      </div>
    </div>
  );
}

// ─── ArchNode ─────────────────────────────────────────────────────────────────
function ArchNode({ label, dashed }: { label: string; dashed?: boolean }) {
  return (
    <span
      className={`text-xs font-mono px-2.5 py-1 border ${
        dashed
          ? "border-dashed border-border text-muted"
          : "border-border text-secondary"
      }`}
    >
      {label}
    </span>
  );
}

// ─── ProjectShowcase ──────────────────────────────────────────────────────────
interface ArchLayer { label: string; nodes: string[] }
interface ProjectData {
  num: string;
  name: string;
  tagline: string;
  status: "live" | "building" | "planned";
  statusLabel: string;
  description: string;
  metrics?: { value: string; label: string }[];
  architecture: ArchLayer[];
  link?: string;
}

const STATUS_BADGE: Record<string, string> = {
  live: "border-foreground text-foreground",
  building: "border-secondary text-secondary",
  planned: "border-border text-muted border-dashed",
};

function ProjectShowcase({ project, index }: { project: ProjectData; index: number }) {
  const [open, setOpen] = useState(false);
  const isDashed = project.status === "planned";

  return (
    <ScrollReveal delay={index * 0.08} y={24}>
      <div className="py-12 first:pt-0">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
          <div>
            <span className="editorial-label text-muted block mb-3">{project.num}</span>
            <h3 className="font-heading text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-2">
              {project.name}
            </h3>
            <p className="text-secondary font-light text-base">{project.tagline}</p>
          </div>
          <span className={`editorial-label border px-3 py-1.5 self-start shrink-0 ${STATUS_BADGE[project.status]}`}>
            {project.statusLabel}
          </span>
        </div>

        {/* Description */}
        <p className="text-secondary leading-relaxed font-light max-w-2xl mb-8">
          {project.description}
        </p>

        {/* Metrics — real usage numbers */}
        {project.metrics && project.metrics.length > 0 && (
          <div className="flex flex-wrap gap-x-10 gap-y-6 mb-10">
            {project.metrics.map((m) => (
              <div key={m.label} className="flex flex-col">
                <span className="font-heading text-2xl md:text-3xl font-extrabold tracking-tight text-foreground leading-none">
                  {m.value}
                </span>
                <span className="editorial-label text-muted mt-2 text-[10px]">{m.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Architecture — collapsible */}
        <div className="mb-6">
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-2 editorial-label text-muted hover:text-foreground transition-colors cursor-pointer mb-4"
          >
            <ChevronDown
              size={14}
              className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}
            />
            ARCHITECTURE
          </button>
          <div className={`overflow-hidden transition-all duration-500 ${open ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"}`}>
            <div className="flex flex-col gap-3 pl-1">
              {project.architecture.map((layer) => (
                <div key={layer.label} className="flex items-start gap-4">
                  <span className="editorial-label text-muted w-24 shrink-0 pt-1 text-[10px]">
                    {layer.label}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {layer.nodes.map((node) => (
                      <ArchNode key={node} label={node} dashed={isDashed} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-12 border-b border-border/50 last:border-0" />
      </div>
    </ScrollReveal>
  );
}

// ─── Project data ─────────────────────────────────────────────────────────────
const PROJECTS: Record<"ko" | "en", ProjectData[]> = {
  ko: [
    {
      num: "01",
      name: "홈서버 인프라",
      tagline: "실제로 돌아가는 24/7 운영 환경",
      status: "live",
      statusLabel: "운영 중",
      description:
        "클라우드 비용 없이 모든 걸 셀프호스팅하려 시작했지만, 진짜 배움은 그 다음이었습니다. 실제 트래픽이 들어오고, 실제 장애가 나고, 실제 병목을 디버깅합니다. 지금 이 블로그와 챗봇이 그 위에서 돌아갑니다.",
      metrics: [
        { value: "24/7", label: "무중단 운영" },
        { value: "10+", label: "Docker 컨테이너" },
        { value: "80%", label: "API 비용 절감 (AIOps)" },
        { value: "~$5–10/월", label: "운영 비용 (클라우드 대비 ~10x)" },
      ],
      architecture: [
        { label: "진입점", nodes: ["Cloudflared", "NGINX (Reverse Proxy)"] },
        { label: "서비스", nodes: ["Blog (Next.js)", "API (FastAPI)", "n8n (워크플로우)"] },
        { label: "AI", nodes: ["Ollama (LLM)", "AIOps Agent", "Blog Agent", "Alfred"] },
        { label: "데이터", nodes: ["PostgreSQL", "Redis", "ChromaDB"] },
        { label: "모니터링", nodes: ["Prometheus", "Grafana"] },
      ],
    },
    {
      num: "02",
      name: "Calyx",
      tagline: "도메인별 AI 에이전트 구독 캘린더",
      status: "building",
      statusLabel: "개발 중",
      description:
        "더 건강하게 살고 싶은 사람들을 위한 AI 에이전트 캘린더. 운동·식단·여행·문화 각각의 전담 에이전트가 패턴을 학습해, 수동적인 제안을 넘어 먼저 일정을 재조정합니다.",
      architecture: [
        { label: "클라이언트", nodes: ["iOS (SwiftUI)", "Apple Watch"] },
        { label: "에이전트", nodes: ["Focus (base)", "Wellness", "Fitness", "Diet", "Culture", "Travel"] },
        { label: "백엔드", nodes: ["FastAPI", "HealthKit Bridge", "CoreML"] },
        { label: "인프라", nodes: ["Cloud API", "PostgreSQL", "Redis"] },
      ],
    },
    {
      num: "03",
      name: "Alfred",
      tagline: "로컬 우선 개인 지식 아카이빙 에이전트",
      status: "planned",
      statusLabel: "기획 중",
      description:
        "에이전틱 AI 시대의 로컬 아카이빙 에이전트 — 외부 서비스에 의존하지 않고 개인 데이터를 내 통제 아래 둡니다. 문서·노트·대화 로그를 로컬 LLM으로 분류·색인해 자연어로 검색합니다.",
      architecture: [
        { label: "입력", nodes: ["문서 / PDF", "노트", "웹 클리핑", "대화 로그"] },
        { label: "처리", nodes: ["로컬 LLM 분류", "임베딩 생성", "메타데이터 추출"] },
        { label: "저장", nodes: ["Vector DB (ChromaDB)", "Structured DB (PostgreSQL)"] },
        { label: "검색", nodes: ["RAG 엔진", "자연어 질의"] },
      ],
    },
    {
      num: "04",
      name: "Bookear",
      tagline: "컴퓨터 비전 기반 온디바이스 독서 단어장",
      status: "planned",
      statusLabel: "기획 중",
      description:
        "원서를 읽다 모르는 단어를 만나면 페이지를 촬영하는 것만으로 바로 찾아봅니다. Vision Framework와 CoreML이 텍스트 인식과 단어 검색을 전부 기기 안에서 처리해 외부 서버가 필요 없습니다.",
      architecture: [
        { label: "클라이언트", nodes: ["iOS Camera", "SwiftUI"] },
        { label: "비전", nodes: ["Vision Framework (OCR)", "CoreML (온디바이스)"] },
        { label: "저장", nodes: ["Core Data (로컬 단어장)"] },
        { label: "출력", nodes: ["단어 뜻", "발음", "예문"] },
      ],
    },
  ],
  en: [
    {
      num: "01",
      name: "Home Server Infrastructure",
      tagline: "24/7 AI service operation environment",
      status: "live",
      statusLabel: "Live",
      description:
        "I started this to self-host everything without cloud costs, but the real lesson came after: real traffic arrives, real outages happen, real bottlenecks get debugged. This blog and its chatbot run on it right now.",
      metrics: [
        { value: "24/7", label: "uptime" },
        { value: "10+", label: "Docker containers" },
        { value: "80%", label: "API cost cut (AIOps)" },
        { value: "~$5–10/mo", label: "running cost (~10x cheaper than cloud)" },
      ],
      architecture: [
        { label: "Ingress", nodes: ["Cloudflared", "NGINX (Reverse Proxy)"] },
        { label: "Services", nodes: ["Blog (Next.js)", "API (FastAPI)", "n8n (Workflow)"] },
        { label: "AI", nodes: ["Ollama (LLM)", "AIOps Agent", "Blog Agent", "Alfred"] },
        { label: "Data", nodes: ["PostgreSQL", "Redis", "ChromaDB"] },
        { label: "Monitoring", nodes: ["Prometheus", "Grafana"] },
      ],
    },
    {
      num: "02",
      name: "Calyx",
      tagline: "AI agent subscription calendar by domain",
      status: "building",
      statusLabel: "In Development",
      description:
        "An AI agent calendar built for people who want to live healthier. Dedicated agents for fitness, diet, travel, and culture learn your patterns and go beyond passive suggestions — proactively rescheduling your life.",
      architecture: [
        { label: "Client", nodes: ["iOS (SwiftUI)", "Apple Watch"] },
        { label: "Agents", nodes: ["Focus (base)", "Wellness", "Fitness", "Diet", "Culture", "Travel"] },
        { label: "Backend", nodes: ["FastAPI", "HealthKit Bridge", "CoreML"] },
        { label: "Infra", nodes: ["Cloud API", "PostgreSQL", "Redis"] },
      ],
    },
    {
      num: "03",
      name: "Alfred",
      tagline: "Local-first personal knowledge archiving agent",
      status: "planned",
      statusLabel: "Planned",
      description:
        "A local archiving agent for the agentic AI era — keeping personal data under your control without relying on external services. Classifies and indexes documents, notes, and conversation logs with a local LLM for natural language retrieval.",
      architecture: [
        { label: "Input", nodes: ["Documents / PDF", "Notes", "Web Clipping", "Chat Logs"] },
        { label: "Process", nodes: ["Local LLM Classification", "Embedding Generation", "Metadata Extraction"] },
        { label: "Storage", nodes: ["Vector DB (ChromaDB)", "Structured DB (PostgreSQL)"] },
        { label: "Search", nodes: ["RAG Engine", "Natural Language Query"] },
      ],
    },
    {
      num: "04",
      name: "Bookear",
      tagline: "On-device reading vocabulary app with Computer Vision",
      status: "planned",
      statusLabel: "Planned",
      description:
        "When you encounter an unknown word while reading a foreign book, just photograph the page to look it up instantly. Vision Framework and CoreML handle text recognition and word search entirely on-device — no external server required.",
      architecture: [
        { label: "Client", nodes: ["iOS Camera", "SwiftUI"] },
        { label: "Vision", nodes: ["Vision Framework (OCR)", "CoreML (on-device)"] },
        { label: "Storage", nodes: ["Core Data (local vocabulary)"] },
        { label: "Output", nodes: ["Word definitions", "Pronunciation", "Example sentences"] },
      ],
    },
  ],
};

// ─── JourneyTimeline ─────────────────────────────────────────────────────────
type JourneyItem = { num: string; title: string; desc: string; sub?: string };

function JourneyTimeline({ items }: { items: JourneyItem[] }) {
  const [active, setActive] = useState<number | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const nodesRef = useRef<(HTMLDivElement | null)[]>([]);
  const connectorsRef = useRef<(HTMLDivElement | null)[]>([]);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const mobileLineRef = useRef<HTMLDivElement>(null);
  const mobileNodesRef = useRef<(HTMLDivElement | null)[]>([]);
  const mobileCardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const line = lineRef.current;
    if (!line) return;

    const lineDur = 1.4;
    const n = items.length;

    gsap.set(line, { scaleX: 0, transformOrigin: "left center" });
    nodesRef.current.forEach((el) => el && gsap.set(el, { opacity: 0, scale: 0, transformOrigin: "center center" }));
    connectorsRef.current.forEach((el) => el && gsap.set(el, { scaleY: 0, transformOrigin: "top center" }));
    cardsRef.current.forEach((el) => el && gsap.set(el, { opacity: 0, y: 20 }));

    // Mobile: vertical line draws top → bottom, nodes/cards reveal in sequence.
    if (mobileLineRef.current) gsap.set(mobileLineRef.current, { scaleY: 0, transformOrigin: "top center" });
    mobileNodesRef.current.forEach((el) => el && gsap.set(el, { opacity: 0, scale: 0, transformOrigin: "center center" }));
    mobileCardsRef.current.forEach((el) => el && gsap.set(el, { opacity: 0, y: 20 }));

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 78%",
        once: true,
      },
    });

    // Line draws from 0% to position of last node (~66.67% of container)
    // Node i is at i * (100%/n); line reaches node i when scaleX = i/(n-1)
    // → t_i = (i / (n-1)) * lineDur
    tl.to(line, { scaleX: 1, duration: lineDur, ease: "power2.inOut" }, 0);

    items.forEach((_, i) => {
      const t = (i / (n - 1)) * lineDur;
      tl.to(nodesRef.current[i], { opacity: 1, scale: 1, duration: 0.25, ease: "back.out(2.5)" }, t);
      tl.to(connectorsRef.current[i], { scaleY: 1, duration: 0.4, ease: "power2.out" }, t + 0.1);
      tl.to(cardsRef.current[i], { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, t + 0.2);
    });

    // Mobile timeline: same staggered reveal, flowing downward.
    tl.to(mobileLineRef.current, { scaleY: 1, duration: lineDur, ease: "power2.inOut" }, 0);
    items.forEach((_, i) => {
      const t = (i / (n - 1)) * lineDur;
      tl.to(mobileNodesRef.current[i], { opacity: 1, scale: 1, duration: 0.25, ease: "back.out(2.5)" }, t);
      tl.to(mobileCardsRef.current[i], { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, t + 0.15);
    });

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, []); // remounts via renderKey on locale change

  return (
    <div ref={sectionRef}>
      {/* ── Desktop ── */}
      <div className="hidden md:block">
        <div className="relative flex">
          {/* Horizontal line: spans to center of last node */}
          <div
            ref={lineRef}
            className="absolute top-[5px] left-0 h-px bg-foreground/40"
            style={{ width: `calc(${((items.length - 1) / items.length) * 100}% + 5.5px)` }}
          />
          {items.map((item, i) => (
            <div key={item.num} className="flex-1 relative">
              {/* Node */}
              <div
                ref={(el) => { nodesRef.current[i] = el; }}
                className="w-[11px] h-[11px] rounded-full bg-foreground relative z-10"
              />
              {/* Vertical connector */}
              <div
                ref={(el) => { connectorsRef.current[i] = el; }}
                className="w-px h-8 bg-border ml-[5px]"
              />
              {/* Card */}
              <div
                ref={(el) => { cardsRef.current[i] = el; }}
                className="pr-8"
              >
                <button
                  className="w-full text-left cursor-pointer group"
                  onClick={() => setActive(active === i ? null : i)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="editorial-label text-muted">{item.num}</span>
                    <ChevronDown
                      size={11}
                      className={`text-muted transition-transform duration-300 ${active === i ? "rotate-180" : ""}`}
                    />
                  </div>
                  <h3 className="font-heading text-xl md:text-2xl font-bold text-foreground mb-3 group-hover:opacity-70 transition-opacity">
                    {item.title}
                  </h3>
                  <p className="text-sm text-secondary font-light leading-relaxed">
                    &ldquo;{item.desc}&rdquo;
                  </p>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-500 ease-out ${
                    active === i ? "max-h-32 opacity-100 mt-4" : "max-h-0 opacity-0"
                  }`}
                >
                  {item.sub && (
                    <div className="flex flex-wrap gap-1.5">
                      {item.sub.split(" · ").map((s) => (
                        <span key={s} className="text-xs font-mono text-muted border border-border px-2 py-0.5">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Mobile: vertical timeline ── */}
      <div className="md:hidden relative">
        <div
          ref={mobileLineRef}
          className="absolute left-[5px] top-0 bottom-0 w-px bg-gradient-to-b from-foreground/50 via-foreground/25 to-transparent"
        />
        {items.map((item, i) => (
          <div
            key={item.num}
            ref={(el) => { mobileCardsRef.current[i] = el; }}
            className="relative pl-8 pb-10 last:pb-0"
          >
            <div
              ref={(el) => { mobileNodesRef.current[i] = el; }}
              className="absolute left-0 top-[3px] w-[11px] h-[11px] rounded-full bg-foreground z-10"
            />
            <button
              className="w-full text-left cursor-pointer"
              onClick={() => setActive(active === i ? null : i)}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="editorial-label text-muted">{item.num}</span>
                <ChevronDown
                  size={11}
                  className={`text-muted transition-transform duration-300 ${active === i ? "rotate-180" : ""}`}
                />
              </div>
              <h3 className="font-heading text-lg font-bold text-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-secondary font-light leading-relaxed">&ldquo;{item.desc}&rdquo;</p>
            </button>
            <div
              className={`overflow-hidden transition-all duration-500 ease-out ${
                active === i ? "max-h-32 opacity-100 mt-3" : "max-h-0 opacity-0"
              }`}
            >
              {item.sub && (
                <div className="flex flex-wrap gap-1.5">
                  {item.sub.split(" · ").map((s) => (
                    <span key={s} className="text-xs font-mono text-muted border border-border px-2 py-0.5">{s}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
interface HeroSectionProps {
  dbData?: { ko: Record<string, unknown>; en: Record<string, unknown> };
}

export default function HeroSection({ dbData }: HeroSectionProps = {}) {
  const { t, locale } = useLanguage();
  const dbAbout = dbData?.[locale as "ko" | "en"] as Record<string, unknown> | undefined;
  const journey = (dbAbout?.journey as typeof t.home.journey | undefined)?.length
    ? (dbAbout!.journey as typeof t.home.journey)
    : t.home.journey;
  const about = dbAbout?.skills
    ? { ...t.about, ...(dbAbout as Partial<typeof t.about>) }
    : t.about;

  const [renderKey, setRenderKey] = useState(0);
  useEffect(() => { setRenderKey((k) => k + 1); }, [locale]);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const onResize = () => { clearTimeout(timer); timer = setTimeout(() => setRenderKey((k) => k + 1), 300); };
    window.addEventListener("resize", onResize);
    return () => { clearTimeout(timer); window.removeEventListener("resize", onResize); };
  }, []);

  const mission = about.mission;
  const interests = about.interests;
  const approach = about.approach;
  const projects = PROJECTS[locale as "ko" | "en"] ?? PROJECTS.ko;

  return (
    <div key={renderKey} className="relative">
      <div className="relative max-w-screen-2xl mx-auto px-6 md:px-12">

      {/* ── [1] Mission ───────────────────────────────────────────────────── */}
      <section className="pt-28 md:pt-44 pb-24 md:pb-40 text-center">
        <h1 className="font-heading text-6xl md:text-8xl lg:text-[108px] font-extrabold tracking-[-0.04em] leading-[0.9]">
          <TypewriterText text={mission.text} />
        </h1>
        {"subtitle" in mission && mission.subtitle && (
          <ScrollReveal>
            <p className="mt-10 max-w-2xl mx-auto text-secondary font-light leading-relaxed text-base md:text-lg">
              {mission.subtitle}
            </p>
          </ScrollReveal>
        )}
      </section>

      {/* ── [2] Interests — 3D flip cards ────────────────────────────────── */}
      <section className="pt-8 pb-20 md:pt-10 md:pb-28">
        <ScrollReveal>
          <h2 className="font-heading text-3xl md:text-4xl font-extrabold tracking-tight mb-10">
            {interests.title}
          </h2>
        </ScrollReveal>
        <div className="grid grid-cols-3 gap-2 md:gap-4 items-start">
          {(interests.items as unknown as Array<{ num: string; theme: string; front: string; back: string; tag: string; status: string }>).map((item, i) => (
            <ScrollReveal key={item.num} delay={i * 0.08}>
              <BentoCard {...item} />
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ── [3] Journey ─────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28">
        <ScrollReveal>
          <h2 className="font-heading text-3xl md:text-4xl font-extrabold tracking-tight mb-16">
            {locale === "ko" ? "여기까지의 여정, 앞으로의 길" : "The Journey So Far, The Road Ahead"}
          </h2>
        </ScrollReveal>
        <JourneyTimeline items={journey as unknown as JourneyItem[]} />
      </section>

      {/* ── [4] Approach — how I work ─────────────────────────────────────── */}
      <section className="py-20 md:py-28">
        <ScrollReveal>
          <h2 className="font-heading text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
            {approach.title}
          </h2>
          <p className="text-secondary font-light mb-12">{approach.subtitle}</p>
        </ScrollReveal>
        <div className="grid md:grid-cols-3 gap-8 md:gap-10">
          {approach.items.map((item, i) => (
            <ScrollReveal key={item.title} delay={i * 0.08}>
              <div className="border-t border-foreground/20 pt-5">
                <span className="editorial-label text-muted block mb-3">{`0${i + 1}`}</span>
                <h3 className="font-heading text-xl font-bold text-foreground mb-3">{item.title}</h3>
                <p className="text-secondary leading-relaxed font-light text-sm">{item.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ── [5] Projects Showcase ─────────────────────────────────────────── */}
      <section className="py-20 md:py-28">
        <ScrollReveal>
          <h2 className="font-heading text-3xl md:text-4xl font-extrabold tracking-tight mb-16">
            {locale === "ko" ? "실제로 돌아가는 것" : "What's Actually Running"}
          </h2>
        </ScrollReveal>
        <div>
          {projects.map((proj, i) => (
            <ProjectShowcase key={proj.num} project={proj} index={i} />
          ))}
        </div>
      </section>

      </div>
    </div>
  );
}
