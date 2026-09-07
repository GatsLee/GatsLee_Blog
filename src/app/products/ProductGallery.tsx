"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
    <span className={`editorial-label px-2 py-1 border ${colorMap[status] || "text-muted border-border"}`}>
      {labels[status] || status}
    </span>
  );
}

function TypeBadge({ category, labels }: { category: string; labels: Record<string, string> }) {
  return (
    <span className="editorial-label px-2 py-0.5 border border-border text-muted">
      {labels[category] ?? category}
    </span>
  );
}

export default function ProductGallery({ posts }: { posts: ProductPost[] }) {
  const { locale, t } = useLanguage();
  const searchParams = useSearchParams();
  const initialType = searchParams.get("type");
  const [activeTab, setActiveTab] = useState<"all" | "product" | "agent">(
    initialType === "product" || initialType === "agent" ? initialType : "all"
  );

  const localeFiltered = posts.filter((p) => p.locale === locale);
  const filtered = activeTab === "all"
    ? localeFiltered
    : localeFiltered.filter((p) => p.category === activeTab);

  const productCount = localeFiltered.filter((p) => p.category === "product").length;
  const agentCount = localeFiltered.filter((p) => p.category === "agent").length;

  const statusLabels: Record<string, string> = {
    planning: t.products.status.planning,
    developing: t.products.status.developing,
    deployed: t.products.status.deployed,
  };

  const typeLabels: Record<string, string> = {
    product: t.products.typeProduct,
    agent: t.products.typeAgent,
  };

  const tabs: { key: "all" | "product" | "agent"; label: string; count: number }[] = [
    { key: "all", label: t.products.filterAll ?? "All", count: localeFiltered.length },
    { key: "product", label: t.products.typeProduct, count: productCount },
    { key: "agent", label: t.products.typeAgent, count: agentCount },
  ];

  return (
    <div className="animate-fadeIn max-w-screen-2xl mx-auto px-6 md:px-12 py-16">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-muted">
        <Link href="/" className="hover:text-foreground transition-colors flex items-center gap-1">
          <Home size={14} strokeWidth={1.5} />
          <span>{t.nav.home}</span>
        </Link>
        <ChevronRight size={14} strokeWidth={1.5} />
        <span className="text-foreground font-medium">{t.products.title}</span>
      </div>

      {/* Header */}
      <div className="mb-12 border-b border-border pb-6">
        <h1 className="font-heading text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
          {t.products.title}
        </h1>
        <p className="text-secondary font-light">{t.products.subtitle}</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 mb-12">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`editorial-label font-bold pb-1 transition-colors cursor-pointer ${
              activeTab === tab.key
                ? "text-foreground border-b border-foreground"
                : "text-muted hover:text-foreground"
            }`}
          >
            {tab.label} <span className="text-muted ml-1">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="py-24 text-center">
          <Package size={48} strokeWidth={1} className="mx-auto mb-4 text-muted opacity-30" />
          <p className="text-muted text-lg">{t.products.empty}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                className="group block border border-transparent hover:border-border p-6 transition-all duration-400 cursor-pointer"
              >
                {/* Status + type + date */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1.5">
                    {status && <StatusBadge status={status} labels={statusLabels} />}
                    <TypeBadge category={post.category} labels={typeLabels} />
                  </div>
                  <time className="editorial-label text-muted">
                    {new Date(post.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </time>
                </div>

                {/* Title */}
                <h3 className="font-heading text-lg font-bold tracking-tight text-foreground mb-3 group-hover:underline underline-offset-4 decoration-1">
                  {post.title}
                </h3>

                {/* Excerpt */}
                <p className="text-secondary text-sm leading-relaxed line-clamp-3 mb-4 font-light">
                  {excerpt}
                </p>

                {/* Tech tags */}
                {techTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {techTags.slice(0, 5).map((tag) => (
                      <span key={tag} className="editorial-label text-muted px-2 py-0.5 border border-border">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* View link */}
                <div className="flex items-center gap-2 editorial-label text-foreground font-bold mt-auto">
                  <span>{t.products.viewDetail}</span>
                  <ArrowRight size={12} strokeWidth={2} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
