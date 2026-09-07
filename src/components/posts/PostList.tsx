"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, ChevronRight, Home, X } from "lucide-react";
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

function readingTime(content: string) {
  const words = content.replace(/[#*`\[\]()!>_~|]/g, '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function excerpt(content: string, max = 160) {
  return content.replace(/[#*`\[\]()!>_~|]/g, '').replace(/\n+/g, ' ').trim().substring(0, max);
}

export default function PostList({
  posts,
  basePath,
  title,
}: {
  posts: PostItem[];
  basePath: string;
  title?: string;
}) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const { t } = useLanguage();

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    posts.forEach(post => {
      if (post.tags) {
        try {
          const parsedTags = JSON.parse(post.tags);
          if (Array.isArray(parsedTags)) parsedTags.forEach(tag => tagSet.add(tag));
        } catch { /* ignore */ }
      }
    });
    return Array.from(tagSet).sort();
  }, [posts]);

  const filteredPosts = useMemo(() => {
    if (!selectedTag) return posts;
    return posts.filter(post => {
      if (!post.tags) return false;
      try {
        const parsedTags = JSON.parse(post.tags);
        return Array.isArray(parsedTags) && parsedTags.includes(selectedTag);
      } catch { return false; }
    });
  }, [posts, selectedTag]);

  // Group by year then month
  const grouped = useMemo(() => {
    const map: Record<number, Record<number, PostItem[]>> = {};
    filteredPosts.forEach(post => {
      const d = new Date(post.createdAt);
      const y = d.getFullYear();
      const m = d.getMonth(); // 0-indexed
      if (!map[y]) map[y] = {};
      if (!map[y][m]) map[y][m] = [];
      map[y][m].push(post);
    });
    // Sort years desc, months desc
    return Object.entries(map)
      .sort(([a], [b]) => Number(b) - Number(a))
      .map(([year, months]) => ({
        year: Number(year),
        months: Object.entries(months)
          .sort(([a], [b]) => Number(b) - Number(a))
          .map(([month, items]) => ({
            month: Number(month),
            items,
          })),
      }));
  }, [filteredPosts]);

  const pageTitle = title || basePath;

  const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="animate-fadeIn">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-muted">
        <Link href="/" className="hover:text-foreground transition-colors flex items-center gap-1">
          <Home size={14} strokeWidth={1.5} />
          <span>{t.nav.home}</span>
        </Link>
        <ChevronRight size={14} strokeWidth={1.5} />
        <span className="text-foreground font-medium">{pageTitle}</span>
      </div>

      {/* Header */}
      <div className="mb-10 border-b border-border pb-6 flex items-end justify-between">
        <div>
          <h2 className="font-heading text-3xl md:text-4xl font-extrabold tracking-tight mb-1">
            {pageTitle}
          </h2>
          <p className="text-sm text-muted font-light">
            {filteredPosts.length} {filteredPosts.length === 1 ? t.insights.comment : t.insights.comments}
          </p>
        </div>
      </div>

      {/* Tag filter */}
      {allTags.length > 0 && (
        <div className="mb-10 flex flex-wrap gap-x-4 gap-y-2">
          <button
            onClick={() => setSelectedTag(null)}
            className={`editorial-label font-bold pb-0.5 cursor-pointer transition-colors ${
              selectedTag === null
                ? 'text-foreground border-b border-foreground'
                : 'text-muted hover:text-foreground'
            }`}
          >
            All
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`editorial-label pb-0.5 cursor-pointer transition-colors flex items-center gap-1 ${
                selectedTag === tag
                  ? 'text-foreground font-bold border-b border-foreground'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              #{tag}
              {selectedTag === tag && (
                <X size={10} strokeWidth={2} onClick={(e) => { e.stopPropagation(); setSelectedTag(null); }} />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Timeline feed */}
      {grouped.length === 0 && (
        <div className="py-24 text-center">
          <p className="text-muted text-lg">{t.insights.empty}</p>
        </div>
      )}

      {grouped.map(({ year, months }) => (
        <div key={year} className="mb-16">
          {/* Year label */}
          <div className="flex items-center gap-4 mb-8">
            <span className="font-heading text-xs font-bold tracking-[0.2em] text-muted uppercase">
              {year}
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {months.map(({ month, items }) => (
            <div key={month} className="mb-10">
              {/* Month label */}
              <div className="flex items-start gap-6 md:gap-12">
                <div className="w-10 md:w-14 shrink-0 pt-0.5">
                  <span className="editorial-label text-muted text-[11px] tracking-widest uppercase">
                    {MONTH_NAMES[month]}
                  </span>
                </div>

                {/* Posts in this month */}
                <div className="flex-1 min-w-0 space-y-10 border-l border-border pl-6 md:pl-10">
                  {items.map(post => {
                    const d = new Date(post.createdAt);
                    const day = String(d.getDate()).padStart(2, '0');
                    let postTags: string[] = [];
                    try {
                      const p = JSON.parse(post.tags ?? '[]');
                      if (Array.isArray(p)) postTags = p;
                    } catch { /* ignore */ }
                    const rt = readingTime(post.content);
                    const ex = excerpt(post.content);

                    return (
                      <article key={post.id} className="group">
                        <Link href={`${basePath}/${post.slug}`} className="block">
                          <div className="flex items-start gap-4 mb-3">
                            <span className="editorial-label text-muted text-[11px] tracking-wider tabular-nums shrink-0 pt-1">
                              {MONTH_NAMES[month].toUpperCase()} {day}
                            </span>
                            {post.locale && (
                              <span className="editorial-label text-muted/60 text-[10px] shrink-0 pt-1">
                                {post.locale.toUpperCase()}
                              </span>
                            )}
                          </div>

                          <h3 className="font-heading text-xl md:text-2xl font-bold mb-2 group-hover:underline underline-offset-8 decoration-1 tracking-tight leading-snug">
                            {post.title}
                          </h3>

                          {ex && (
                            <p className="text-secondary text-sm leading-relaxed mb-3 font-light max-w-2xl">
                              {ex}
                            </p>
                          )}

                          <div className="flex items-center gap-4 flex-wrap">
                            {postTags.length > 0 && (
                              <div className="flex gap-2">
                                {postTags.slice(0, 4).map(tag => (
                                  <span key={tag} className="editorial-label text-muted/70 text-[11px]">
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}
                            <span className="editorial-label text-muted/50 text-[11px] ml-auto">
                              {rt} min read
                            </span>
                            <div className="flex items-center gap-1.5 editorial-label text-foreground font-bold text-[11px]">
                              <span>{t.insights.readMore}</span>
                              <ArrowRight size={11} strokeWidth={2.5} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        </Link>
                      </article>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
