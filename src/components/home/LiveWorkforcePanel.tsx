"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
    <span className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${colors[status ?? ""] ?? "bg-muted"}`} />
  );
}

function CardRow({ post }: { post: PostCard }) {
  const status = getStatus(post.tags);
  return (
    <Link
      href={`/products/${post.slug}`}
      className="flex items-center gap-3 py-4 border-b border-border group transition-colors hover:bg-hover px-2 -mx-2"
    >
      <StatusDot status={status} />
      <span className="text-sm text-foreground group-hover:text-foreground transition-colors truncate flex-1 font-medium">
        {post.title}
      </span>
      {status && (
        <span className="editorial-label text-muted shrink-0">{status}</span>
      )}
      <ArrowRight
        size={14}
        strokeWidth={1.5}
        className="text-muted group-hover:translate-x-1 transition-transform shrink-0"
      />
    </Link>
  );
}

export default function LiveWorkforcePanel({ products, agents }: LiveWorkforcePanelProps) {
  const { t } = useLanguage();

  return (
    <div>
      <div className="mb-12 flex items-end justify-between border-b border-border pb-6">
        <div>
          <h2 className="font-heading text-3xl md:text-4xl font-extrabold tracking-tight">{t.home.workforce}</h2>
          <p className="text-secondary mt-2 text-base font-light">Active products and agents.</p>
        </div>
        <Link href="/products" className="editorial-label font-bold text-foreground hover:opacity-60 transition-opacity">
          {t.home.seeAll}
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        {/* Products */}
        <div>
          <h3 className="editorial-label font-bold text-foreground mb-4">{t.home.workforceProducts}</h3>
          {products.length === 0 ? (
            <p className="editorial-label text-muted">No products yet.</p>
          ) : (
            <div>
              {products.map((p) => <CardRow key={p.id} post={p} />)}
            </div>
          )}
        </div>

        {/* Agents */}
        <div>
          <h3 className="editorial-label font-bold text-foreground mb-4">{t.home.workforceAgents}</h3>
          {agents.length === 0 ? (
            <p className="editorial-label text-muted">No agents yet.</p>
          ) : (
            <div>
              {agents.map((a) => <CardRow key={a.id} post={a} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
