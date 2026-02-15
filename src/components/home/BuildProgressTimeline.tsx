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
          {/* Horizontal Timeline Container */}
          <div className="flex items-center gap-4 overflow-x-auto pb-4">
            {/* Timeline Items */}
            {posts.map((post, index) => (
              <div key={post.id} className="flex items-center flex-shrink-0">
                {/* Progress Item */}
                <Link
                  href={`/devlogs/${post.slug}`}
                  className="group cursor-pointer flex flex-col items-center gap-2 min-w-[160px] max-w-[180px]"
                >
                  {/* Timeline Dot */}
                  <div className="relative">
                    {/* Glow effect for the first (latest) post */}
                    {index === 0 && (
                      <div className="absolute inset-0 rounded-full bg-accent/30 blur-md animate-pulse" />
                    )}
                    <div className={`relative w-10 h-10 rounded-full bg-surface flex items-center justify-center transition-all ${
                      index === 0
                        ? 'border-3 border-accent shadow-lg shadow-accent/50'
                        : 'border-2 border-border'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        index === 0 ? 'bg-accent animate-pulse' : 'bg-muted'
                      }`} />
                    </div>
                  </div>

                  {/* Title */}
                  <div className="text-center">
                    <h4 className={`text-xs font-semibold tracking-tight line-clamp-2 transition-colors ${
                      index === 0
                        ? 'text-accent'
                        : 'text-foreground group-hover:text-accent'
                    }`} style={{ fontFamily: 'Archivo, sans-serif' }}>
                      {post.title}
                    </h4>
                  </div>
                </Link>

                {/* Connecting Line */}
                {index < posts.length - 1 && (
                  <div className="w-8 h-0.5 bg-border flex-shrink-0 mx-2" />
                )}
              </div>
            ))}

            {/* End Indicator */}
            <div className="flex items-center flex-shrink-0 ml-2">
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-surface border-2 border-border flex items-center justify-center">
                  <ArrowRight size={16} strokeWidth={1.5} className="text-muted" />
                </div>
                <span className="text-xs text-muted whitespace-nowrap">More...</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
