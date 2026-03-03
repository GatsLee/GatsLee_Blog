"use client";

import Link from "next/link";
import {
  Home,
  ChevronRight,
  ChevronDown,
  Database,
  Clock,
  Network,
  Cpu,
  Globe,
  Code2,
  Map,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { useEffect, useRef, useState, ElementType } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BlueprintPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  createdAt: string;
  parsedTags: string[];
}

// ─── ScrollReveal ──────────────────────────────────────────────────────────────

function ScrollReveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
}) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.unobserve(el);
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    obs.observe(el);
    return () => obs.unobserve(el);
  }, []);

  const hidden: Record<string, string> = {
    up: "opacity-0 translate-y-8",
    down: "opacity-0 -translate-y-8",
    left: "opacity-0 translate-x-8",
    right: "opacity-0 -translate-x-8",
    none: "opacity-0",
  };

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out will-change-[opacity,transform] ${
        visible ? "opacity-100 translate-y-0 translate-x-0" : hidden[direction]
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// ─── RoadmapItem ───────────────────────────────────────────────────────────────

type RoadmapStatus = "now" | "next" | "later";

const STATUS_CONFIG: Record<
  RoadmapStatus,
  {
    dot: string;
    ring: string;
    ping: boolean;
    label: string;
    badge: string;
    card: string;
    title: string;
  }
> = {
  now: {
    dot: "bg-accent",
    ring: "ring-accent/20",
    ping: true,
    label: "NOW",
    badge: "bg-accent/10 text-accent",
    card: "border-border shadow-sm hover:shadow-md",
    title: "text-foreground font-bold",
  },
  next: {
    dot: "bg-blue-400",
    ring: "ring-blue-400/20",
    ping: false,
    label: "NEXT",
    badge: "bg-blue-500/10 text-blue-400",
    card: "border-border shadow-sm hover:shadow-md",
    title: "text-foreground font-semibold",
  },
  later: {
    dot: "bg-border",
    ring: "ring-transparent",
    ping: false,
    label: "LATER",
    badge: "card-border text-muted",
    card: "border-dashed border-border",
    title: "text-muted font-medium",
  },
};

function RoadmapItem({
  status,
  title,
  content,
  isLast,
}: {
  status: RoadmapStatus;
  title: string;
  content: string;
  isLast: boolean;
}) {
  const [open, setOpen] = useState(false);
  const cfg = STATUS_CONFIG[status];

  return (
    <div className="relative pl-10 sm:pl-16 pb-10 group">
      {/* vertical line */}
      {!isLast && (
        <div className="absolute left-[19px] sm:left-[31px] top-8 bottom-0 w-px bg-border" />
      )}

      {/* node dot */}
      <div
        className={`absolute left-4 sm:left-7 top-2 w-3 h-3 rounded-full ${cfg.dot} ring-4 ${cfg.ring} z-10`}
      >
        {cfg.ping && (
          <div className="absolute inset-0 rounded-full bg-accent animate-ping opacity-50" />
        )}
      </div>

      {/* card */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`w-full text-left bg-surface border rounded-lg p-5 transition-all duration-200 ${cfg.card} cursor-pointer`}
      >
        <div className="flex justify-between items-start gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <span
              className={`text-[10px] font-mono font-bold tracking-widest px-2 py-0.5 rounded ${cfg.badge}`}
            >
              {cfg.label}
            </span>
            <h4 className={`text-base tracking-tight ${cfg.title}`}>{title}</h4>
          </div>
          <ChevronDown
            size={16}
            className={`text-muted mt-0.5 flex-shrink-0 transition-transform duration-300 ${
              open ? "rotate-180" : ""
            }`}
          />
        </div>

        {/* accordion content */}
        <div
          className={`overflow-hidden transition-all duration-500 ease-in-out ${
            open ? "max-h-[600px] opacity-100 mt-4" : "max-h-0 opacity-0"
          }`}
        >
          <div className="pt-3 border-t border-border text-left">
            <MarkdownRenderer content={content} />
          </div>
        </div>
      </button>
    </div>
  );
}

// ─── Principle icon pool ───────────────────────────────────────────────────────

const ICONS: ElementType[] = [Database, Clock, Network, Cpu, Globe, Code2];

function stripMarkdown(text: string, limit = 120): string {
  return text
    .replace(/#{1,6}\s/g, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/\[(.+?)\]\(.+?\)/g, "$1")
    .replace(/!\[.*?\]\(.+?\)/g, "")
    .replace(/^[-*>]\s/gm, "")
    .replace(/\n+/g, " ")
    .trim()
    .slice(0, limit);
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function BlueprintContent({
  manifesto,
  principles,
  milestones,
}: {
  manifesto: BlueprintPost | null;
  principles: BlueprintPost[];
  milestones: BlueprintPost[];
}) {
  const { t } = useLanguage();

  const nowCount = milestones.filter((m) => m.parsedTags.includes("now")).length;
  const isEmpty = !manifesto && principles.length === 0 && milestones.length === 0;

  return (
    <div className="animate-fadeIn max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <div className="mb-10 flex items-center gap-2 text-sm text-muted">
        <Link
          href="/"
          className="hover:text-accent transition-colors flex items-center gap-1"
        >
          <Home size={14} strokeWidth={1.5} />
          <span>{t.nav.home}</span>
        </Link>
        <ChevronRight size={14} strokeWidth={1.5} />
        <span className="text-foreground font-medium">{t.blueprint.title}</span>
      </div>

      {/* ── Section 1: Vision / Manifesto ─────────────────────────────────── */}
      <section className="mb-24">
        <ScrollReveal delay={0}>
          <div className="mb-4">
            <span className="text-accent font-mono text-[11px] font-bold tracking-widest uppercase">
              // {t.blueprint.manifesto}
            </span>
          </div>

          <h1
            className={`text-4xl md:text-5xl font-extrabold text-foreground tracking-tighter leading-[1.1] mb-10 ${
              !manifesto ? "opacity-30" : ""
            }`}
            style={{ fontFamily: "Archivo, sans-serif" }}
          >
            {manifesto ? manifesto.title : t.blueprint.title}
          </h1>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Manifesto body */}
          <div className="lg:col-span-8">
            <ScrollReveal delay={100}>
              {manifesto ? (
                <MarkdownRenderer content={manifesto.content} />
              ) : (
                <p className="text-muted text-sm font-mono">
                  Create a post: category=<code>blueprint</code>, tag=<code>manifesto</code>
                </p>
              )}
            </ScrollReveal>
          </div>

          {/* Status widget */}
          <div className="lg:col-span-4">
            <ScrollReveal direction="left" delay={200} className="h-full">
              <div className="bg-surface card-border rounded-lg p-6 sticky top-24">
                <div className="flex items-center justify-between mb-5">
                  <span className="text-[10px] font-mono font-bold text-muted tracking-widest uppercase">
                    Blueprint Status
                  </span>
                  <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                </div>
                <div className="space-y-3">
                  {[
                    { label: "Phase", value: "ACTIVE", accent: true },
                    { label: "Milestones", value: String(milestones.length), accent: false },
                    { label: "In Progress", value: String(nowCount), accent: false },
                    { label: "Principles", value: String(principles.length), accent: false },
                  ].map(({ label, value, accent }) => (
                    <div key={label} className="flex justify-between items-center text-sm">
                      <span className="text-muted">{label}</span>
                      <span
                        className={`font-mono font-medium text-xs tracking-wider ${
                          accent ? "text-accent" : "text-foreground"
                        }`}
                      >
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── Section 2: Core Principles ────────────────────────────────────── */}
      {principles.length > 0 && (
        <section className="mb-24">
          <ScrollReveal delay={0}>
            <div className="flex justify-between items-end mb-8 border-b border-border pb-4">
              <h2
                className="text-xl font-bold tracking-tight text-foreground"
                style={{ fontFamily: "Archivo, sans-serif" }}
              >
                {t.blueprint.principles}
              </h2>
              <span className="text-[10px] font-mono text-muted tracking-widest">
                {principles.length} / 3
              </span>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {principles.map((p, i) => {
              const Icon = ICONS[i % ICONS.length];
              const desc = stripMarkdown(p.content);
              return (
                <ScrollReveal key={p.id} delay={i * 120} className="h-full">
                  <div className="h-full bg-surface card-border rounded-lg p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent/30 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] group relative overflow-hidden">
                    {/* ghost icon */}
                    <div className="absolute top-0 right-0 p-4 opacity-[0.04] transform translate-x-3 -translate-y-3 group-hover:scale-110 transition-transform duration-500">
                      <Icon size={72} />
                    </div>
                    <div className="w-9 h-9 rounded-md bg-surface card-border flex items-center justify-center mb-5 group-hover:border-accent/40 group-hover:text-accent transition-colors">
                      <Icon size={16} />
                    </div>
                    <h3
                      className="text-base font-bold text-foreground mb-2 tracking-tight"
                      style={{ fontFamily: "Archivo, sans-serif" }}
                    >
                      {p.title}
                    </h3>
                    <p className="text-sm text-muted leading-relaxed">
                      {desc}
                      {p.content.length > 120 ? "…" : ""}
                    </p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Section 3: Milestones Pipeline ────────────────────────────────── */}
      {milestones.length > 0 && (
        <section className="mb-10">
          <ScrollReveal delay={0}>
            <div className="mb-10">
              <span className="text-blue-400 font-mono text-[11px] font-bold tracking-widest uppercase">
                // {t.blueprint.pipeline}
              </span>
              <h2
                className="text-2xl font-bold tracking-tight text-foreground mt-2"
                style={{ fontFamily: "Archivo, sans-serif" }}
              >
                {t.blueprint.milestones}
              </h2>
            </div>
          </ScrollReveal>

          <div className="max-w-3xl">
            {milestones.map((ms, i) => {
              const status: RoadmapStatus = ms.parsedTags.includes("now")
                ? "now"
                : ms.parsedTags.includes("next")
                ? "next"
                : "later";
              return (
                <ScrollReveal key={ms.id} delay={80 + i * 80} direction="right">
                  <RoadmapItem
                    status={status}
                    title={ms.title}
                    content={ms.content}
                    isLast={i === milestones.length - 1}
                  />
                </ScrollReveal>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Empty state ────────────────────────────────────────────────────── */}
      {isEmpty && (
        <div className="py-24 text-center">
          <Map size={48} strokeWidth={1} className="mx-auto mb-4 text-muted opacity-30" />
          <p className="text-muted text-lg">{t.blueprint.empty}</p>
        </div>
      )}
    </div>
  );
}
