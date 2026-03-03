"use client";

import Link from "next/link";
import { Package, ArrowRight, Home, ChevronRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface ProductPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  createdAt: string;
  tags: string;
  locale: string;
  category: string;
}

const STATUS_TAGS = ["planning", "developing", "deployed"];

function getStatusAndTechTags(tagsJson: string): { status: string | null; techTags: string[] } {
  try {
    const tags: string[] = JSON.parse(tagsJson);
    const status = tags.find((t) => STATUS_TAGS.includes(t.toLowerCase())) || null;
    const techTags = tags.filter((t) => !STATUS_TAGS.includes(t.toLowerCase()));
    return { status, techTags };
  } catch {
    return { status: null, techTags: [] };
  }
}

function StatusBadge({ status, labels }: { status: string; labels: Record<string, string> }) {
  const colorMap: Record<string, string> = {
    planning: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    developing: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    deployed: "bg-green-500/10 text-green-500 border-green-500/20",
  };
  return (
    <span
      className={`text-[10px] font-mono uppercase px-2 py-1 rounded border ${colorMap[status] || "bg-muted/10 text-muted border-border"}`}
    >
      {labels[status] || status}
    </span>
  );
}

function TypeBadge({ category, labels }: { category: string; labels: Record<string, string> }) {
  const styles: Record<string, string> = {
    product: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    agent: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  };
  return (
    <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${styles[category] ?? "bg-muted/10 text-muted border-border"}`}>
      {labels[category] ?? category}
    </span>
  );
}

export default function ProductGallery({ posts }: { posts: ProductPost[] }) {
  const { locale, t } = useLanguage();

  const filtered = posts.filter((p) => p.locale === locale);

  const statusLabels: Record<string, string> = {
    planning: t.products.status.planning,
    developing: t.products.status.developing,
    deployed: t.products.status.deployed,
  };

  const typeLabels: Record<string, string> = {
    product: t.products.typeProduct,
    agent: t.products.typeAgent,
  };

  return (
    <div className="animate-fadeIn max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-muted">
        <Link href="/" className="hover:text-accent transition-colors flex items-center gap-1">
          <Home size={14} strokeWidth={1.5} />
          <span>{t.nav.home}</span>
        </Link>
        <ChevronRight size={14} strokeWidth={1.5} />
        <span className="text-foreground font-medium">{t.products.title}</span>
      </div>

      {/* Header */}
      <div className="mb-10">
        <h1
          className="text-3xl md:text-4xl text-foreground font-semibold tracking-tight mb-2"
          style={{ fontFamily: "Archivo, sans-serif" }}
        >
          {t.products.title}
        </h1>
        <p className="text-sm text-muted">{t.products.subtitle}</p>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="py-24 text-center">
          <Package size={48} strokeWidth={1} className="mx-auto mb-4 text-muted opacity-30" />
          <p className="text-muted text-lg">{t.products.empty}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((post) => {
            const { status, techTags } = getStatusAndTechTags(post.tags);
            const excerpt =
              post.content
                .replace(/[#*`\[\]()!]/g, "")
                .trim()
                .substring(0, 120) + "...";
            return (
              <Link
                key={post.id}
                href={`/products/${post.slug}`}
                className="group bg-surface card-border rounded-lg p-6 hover:border-accent transition-all duration-200 cursor-pointer flex flex-col"
              >
                {/* Status badge + type badge + date */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1.5">
                    {status && <StatusBadge status={status} labels={statusLabels} />}
                    <TypeBadge category={post.category} labels={typeLabels} />
                  </div>
                  <time className="text-[10px] text-muted font-mono">
                    {new Date(post.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </time>
                </div>


                {/* Title */}
                <h3
                  className="text-lg font-semibold text-foreground group-hover:text-accent transition-colors mb-3 tracking-tight"
                  style={{ fontFamily: "Archivo, sans-serif" }}
                >
                  {post.title}
                </h3>

                {/* Excerpt */}
                <p className="text-secondary text-sm leading-relaxed line-clamp-3 mb-4 flex-1">
                  {excerpt}
                </p>

                {/* Tech tags */}
                {techTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {techTags.slice(0, 5).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 text-[10px] font-mono bg-hover text-muted rounded card-border"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* View link */}
                <div className="flex items-center gap-1 text-xs text-muted group-hover:text-accent transition-colors font-medium mt-auto">
                  <span>{t.products.viewDetail}</span>
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
