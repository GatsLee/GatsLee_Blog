"use client";

import { useState, useMemo } from "react";
import PostList from "@/components/posts/PostList";
import { useLanguage } from "@/context/LanguageContext";

interface PostItem {
  id: number;
  title: string;
  slug: string;
  category: string;
  content: string;
  createdAt: string;
  tags?: string;
  locale?: string;
  translationKey?: string | null;
}

type CategoryFilter = "all" | "devlog" | "troubleshooting";

export default function InsightsList({ posts }: { posts: PostItem[] }) {
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const { t } = useLanguage();

  const filteredPosts = useMemo(() => {
    if (categoryFilter === "all") return posts;
    return posts.filter((p) => p.category === categoryFilter);
  }, [posts, categoryFilter]);

  const filters: { key: CategoryFilter; label: string }[] = [
    { key: "all", label: t.insights.filterAll },
    { key: "devlog", label: t.insights.filterDev },
    { key: "troubleshooting", label: t.insights.filterTroubleshooting },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Category filter chips */}
      <div className="mb-6 flex gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setCategoryFilter(f.key)}
            className={`px-4 py-2 text-xs font-medium rounded-full transition-all cursor-pointer ${
              categoryFilter === f.key
                ? "bg-accent text-white"
                : "bg-hover text-foreground hover:bg-accent/10 card-border"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <PostList posts={filteredPosts} basePath="/insights" title={t.insights.title} />
    </div>
  );
}
