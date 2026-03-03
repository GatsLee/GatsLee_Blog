"use client";

import Link from "next/link";
import { ArrowRight, Crosshair } from "lucide-react";
import HeroSection from "@/components/home/HeroSection";
import BuildProgress from "@/components/home/BuildProgress";
import MetricsPanel from "@/components/home/MetricsPanel";
import LiveWorkforcePanel from "@/components/home/LiveWorkforcePanel";
import { useLanguage } from "@/context/LanguageContext";
import type { GitCommit } from "@/lib/github";

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

interface HomeContentProps {
  commits: GitCommit[];
  repoName: string;
  pinnedPost: PinnedPost | null;
  products: PostCard[];
  agents: PostCard[];
}

export default function HomeContent({ commits, repoName, pinnedPost, products, agents }: HomeContentProps) {
  const { t } = useLanguage();

  const excerpt = pinnedPost
    ? pinnedPost.content
        .replace(/[#*`\[\]()!]/g, "")
        .trim()
        .substring(0, 200) + "..."
    : "";

  return (
    <div className="max-w-7xl mx-auto animate-fadeIn space-y-8">
      {/* [1] Hero Section */}
      <HeroSection />

      {/* [2] Build Progress + Infrastructure Status */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BuildProgress commits={commits} repoName={repoName} pinnedTitle={pinnedPost?.title} />
        <MetricsPanel />
      </section>

      {/* [3] Live Workforce — Products & Agents */}
      <LiveWorkforcePanel products={products} agents={agents} />

      {/* [4] Key Focus Project */}
      {pinnedPost && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Crosshair size={16} className="text-accent" />
            <h2
              className="text-xs uppercase tracking-[0.2em] text-muted font-semibold"
              style={{ fontFamily: "Archivo, sans-serif" }}
            >
              {t.home.keyProject}
            </h2>
          </div>
          <Link
            href={`/products/${pinnedPost.slug}`}
            className="group block bg-surface card-border rounded-lg p-8 hover:border-accent transition-all duration-200 cursor-pointer"
          >
            <h3
              className="text-xl md:text-2xl font-semibold text-foreground group-hover:text-accent transition-colors mb-3 tracking-tight"
              style={{ fontFamily: "Archivo, sans-serif" }}
            >
              {pinnedPost.title}
            </h3>
            <p className="text-secondary text-sm leading-relaxed mb-4 max-w-3xl">
              {excerpt}
            </p>
            <div className="flex items-center gap-2 text-sm text-accent font-medium">
              <span>{t.home.viewProduct}</span>
              <ArrowRight
                size={16}
                strokeWidth={2}
                className="group-hover:translate-x-1 transition-transform"
              />
            </div>
          </Link>
        </section>
      )}
    </div>
  );
}
