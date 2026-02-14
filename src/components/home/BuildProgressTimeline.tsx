"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Calendar, ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";

interface ProgressPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  createdAt: string;
  published: boolean;
}

export default function BuildProgressTimeline() {
  const [posts, setPosts] = useState<ProgressPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    fetch("/api/posts?category=progress")
      .then((r) => r.json())
      .then((data) => {
        // Show only latest 5 entries on home page
        setPosts(data.filter((p: ProgressPost) => p.published).slice(0, 5));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getSummary = (content: string) => {
    const plainText = content.replace(/[#*`\[\]()!]/g, "").trim();
    return plainText.length > 100
      ? plainText.substring(0, 100) + "..."
      : plainText;
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-6 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <TrendingUp className="text-accent" size={20} strokeWidth={1.5} />
          <h3
            className="text-xs uppercase tracking-[0.2em] text-muted font-semibold"
            style={{ fontFamily: 'Archivo, sans-serif' }}
          >
            BUILD PROGRESS
          </h3>
        </div>
        <Link
          href="/progress"
          className="text-xs text-accent hover:underline font-medium flex items-center gap-1"
        >
          View All
          <ArrowRight size={12} strokeWidth={2} />
        </Link>
      </div>

      {/* Timeline */}
      {loading ? (
        <div className="text-muted text-sm animate-pulse py-8 text-center">
          Loading progress...
        </div>
      ) : posts.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-muted text-sm">
            No progress entries yet. Start documenting your journey!
          </p>
        </div>
      ) : (
        <div className="relative">
          {/* Vertical Timeline Line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

          {/* Timeline Items */}
          <div className="space-y-6">
            {posts.map((post) => (
              <div key={post.id} className="relative flex items-start gap-4">
                {/* Timeline Dot */}
                <div className="relative z-10 flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-surface border-4 border-accent flex items-center justify-center transition-colors">
                    <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  </div>
                </div>

                {/* Content Card */}
                <Link
                  href={`/devlogs/${post.slug}`}
                  className="flex-1 group cursor-pointer"
                >
                  {/* Date */}
                  <div className="flex items-center gap-2 text-xs text-muted mb-2">
                    <Calendar size={10} strokeWidth={1.5} />
                    <span>{new Date(post.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}</span>
                  </div>

                  {/* Title */}
                  <h4 className="text-base font-semibold text-foreground mb-2 group-hover:text-accent transition-colors tracking-tight" style={{ fontFamily: 'Archivo, sans-serif' }}>
                    {post.title}
                  </h4>

                  {/* Summary */}
                  <p className="text-xs text-secondary leading-relaxed line-clamp-2">
                    {getSummary(post.content)}
                  </p>
                </Link>
              </div>
            ))}
          </div>

          {/* Timeline End Indicator */}
          <div className="relative flex items-center gap-4 mt-6">
            <div className="relative z-10 flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-surface border-4 border-border-strong flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-muted" />
              </div>
            </div>
            <div className="flex-1 text-xs text-muted">
              Journey continues...
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
