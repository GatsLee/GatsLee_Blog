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
}

export default function PostList({
  posts,
  basePath,
  directoryPath,
}: {
  posts: PostItem[];
  basePath: string;
  directoryPath: string;
}) {
  const { t } = useLanguage();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Extract all unique tags from posts
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    posts.forEach(post => {
      if (post.tags) {
        try {
          const parsedTags = JSON.parse(post.tags);
          if (Array.isArray(parsedTags)) {
            parsedTags.forEach(tag => tagSet.add(tag));
          }
        } catch {
          // Ignore invalid JSON
        }
      }
    });
    return Array.from(tagSet).sort();
  }, [posts]);

  // Filter posts by selected tag
  const filteredPosts = useMemo(() => {
    if (!selectedTag) return posts;
    return posts.filter(post => {
      if (!post.tags) return false;
      try {
        const parsedTags = JSON.parse(post.tags);
        return Array.isArray(parsedTags) && parsedTags.includes(selectedTag);
      } catch {
        return false;
      }
    });
  }, [posts, selectedTag]);

  return (
    <div className="animate-fadeIn max-w-7xl mx-auto">
      {/* Breadcrumb Navigation */}
      <div className="mb-6 flex items-center gap-2 text-sm text-muted">
        <Link href="/" className="hover:text-accent transition-colors flex items-center gap-1">
          <Home size={14} strokeWidth={1.5} />
          <span>{t("breadcrumb.root")}</span>
        </Link>
        <ChevronRight size={14} strokeWidth={1.5} />
        <span className="text-foreground font-medium">{directoryPath}</span>
      </div>

      {/* Header with Swiss typography */}
      <div className="mb-8">
        <h2
          className="text-3xl md:text-4xl text-foreground font-semibold tracking-tight mb-3"
          style={{ fontFamily: 'Archivo, sans-serif' }}
        >
          {directoryPath}
        </h2>
        <p className="text-sm text-muted font-medium">
          {filteredPosts.length} {filteredPosts.length === 1 ? 'Article' : 'Articles'}
        </p>
      </div>

      {/* Tag Filter */}
      {allTags.length > 0 && (
        <div className="mb-8 p-4 bg-surface border border-border rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs text-muted uppercase tracking-wider font-semibold">
              {t("filter.tags")}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all cursor-pointer ${
                selectedTag === null
                  ? 'bg-accent text-white'
                  : 'bg-hover text-foreground hover:bg-accent/10 border border-border'
              }`}
            >
              {t("filter.all")}
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedTag === tag
                    ? 'bg-accent text-white'
                    : 'bg-hover text-foreground hover:bg-accent/10 border border-border'
                }`}
              >
                #{tag}
                {selectedTag === tag && (
                  <X size={12} strokeWidth={2} onClick={(e) => { e.stopPropagation(); setSelectedTag(null); }} />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Minimal grid layout */}
      <div className="space-y-12">
        {filteredPosts.map((post) => {
          // Parse tags for display
          let postTags: string[] = [];
          if (post.tags) {
            try {
              const parsedTags = JSON.parse(post.tags);
              if (Array.isArray(parsedTags)) {
                postTags = parsedTags;
              }
            } catch {
              // Ignore invalid JSON
            }
          }

          return (
            <div key={post.id} className="group">
              <Link
                href={`${basePath}/${post.slug}`}
                className="block border-l-2 border-transparent hover:border-accent pl-8 py-4 transition-all duration-200 cursor-pointer"
              >
                {/* Date - Small, subtle */}
                <time className="text-xs text-muted uppercase tracking-wider font-medium block mb-3">
                  {new Date(post.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </time>

                {/* Title - Bold, Archivo font */}
                <h3
                  className="text-2xl md:text-3xl font-semibold text-foreground group-hover:text-accent transition-colors mb-4 tracking-tight"
                  style={{ fontFamily: 'Archivo, sans-serif' }}
                >
                  {post.title}
                </h3>

                {/* Excerpt - Clean, readable */}
                <p className="text-secondary text-base leading-relaxed line-clamp-2 mb-4 max-w-3xl">
                  {post.content}
                </p>

                {/* Tags */}
                {postTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {postTags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs font-medium bg-hover text-muted rounded border border-border"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Read more indicator */}
                <div className="flex items-center gap-2 text-sm text-muted group-hover:text-accent transition-colors font-medium">
                  <span>Read article</span>
                  <ArrowRight size={16} strokeWidth={2} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </div>
          );
        })}

        {filteredPosts.length === 0 && (
          <div className="py-24 text-center">
            <p className="text-muted text-lg">No articles found</p>
          </div>
        )}
      </div>
    </div>
  );
}
