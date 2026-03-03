"use client";

import Link from "next/link";
import { ArrowRight, Box, Bot } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface PostCard {
  id: number;
  title: string;
  slug: string;
  tags: string;
  locale: string;
}

interface LiveWorkforcePanelProps {
  products: PostCard[];
  agents: PostCard[];
}

const STATUS_TAGS = ["planning", "developing", "deployed"];

function getStatus(tagsJson: string): string | null {
  try {
    const tags: string[] = JSON.parse(tagsJson);
    return tags.find((t) => STATUS_TAGS.includes(t.toLowerCase())) ?? null;
  } catch {
    return null;
  }
}

function StatusDot({ status }: { status: string | null }) {
  const colors: Record<string, string> = {
    planning: "bg-amber-500",
    developing: "bg-blue-500",
    deployed: "bg-green-500",
  };
  return (
    <span
      className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${colors[status ?? ""] ?? "bg-muted"}`}
    />
  );
}

function CardRow({ post }: { post: PostCard }) {
  const status = getStatus(post.tags);
  return (
    <Link
      href={`/products/${post.slug}`}
      className="flex items-center gap-2.5 py-2 group"
    >
      <StatusDot status={status} />
      <span className="text-xs text-foreground group-hover:text-accent transition-colors truncate flex-1 font-mono">
        {post.title}
      </span>
      <ArrowRight size={10} strokeWidth={2} className="text-muted group-hover:text-accent transition-colors shrink-0" />
    </Link>
  );
}

export default function LiveWorkforcePanel({ products, agents }: LiveWorkforcePanelProps) {
  const { t } = useLanguage();

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <Box size={16} className="text-accent" strokeWidth={1.5} />
        <h2
          className="text-xs uppercase tracking-[0.2em] text-muted font-semibold"
          style={{ fontFamily: "Archivo, sans-serif" }}
        >
          {t.home.workforce}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Products */}
        <div className="bg-surface card-border rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Box size={12} strokeWidth={1.5} className="text-blue-400" />
              <span className="text-[10px] uppercase tracking-[0.15em] text-muted font-semibold">
                {t.home.workforceProducts}
              </span>
            </div>
            <Link href="/products" className="text-[10px] text-muted hover:text-accent transition-colors font-mono">
              {t.home.seeAll}
            </Link>
          </div>
          <div className="divide-y divide-border">
            {products.length === 0 ? (
              <p className="text-xs text-muted font-mono py-2">No products yet.</p>
            ) : (
              products.map((p) => <CardRow key={p.id} post={p} />)
            )}
          </div>
        </div>

        {/* Agents */}
        <div className="bg-surface card-border rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bot size={12} strokeWidth={1.5} className="text-purple-400" />
              <span className="text-[10px] uppercase tracking-[0.15em] text-muted font-semibold">
                {t.home.workforceAgents}
              </span>
            </div>
            <Link href="/products" className="text-[10px] text-muted hover:text-accent transition-colors font-mono">
              {t.home.seeAll}
            </Link>
          </div>
          <div className="divide-y divide-border">
            {agents.length === 0 ? (
              <p className="text-xs text-muted font-mono py-2">No agents yet.</p>
            ) : (
              agents.map((a) => <CardRow key={a.id} post={a} />)
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
