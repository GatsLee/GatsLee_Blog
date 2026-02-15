"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
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

const POSTS_PER_PAGE = 10;

export default function ProgressPage() {
  const [posts, setPosts] = useState<ProgressPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const { t } = useLanguage();

  useEffect(() => {
    // Fetch posts with category="progress"
    fetch("/api/posts?category=progress")
      .then((r) => r.json())
      .then((data) => {
        setPosts(data.filter((p: ProgressPost) => p.published));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Extract summary from content (first 150 characters)
  const getSummary = (content: string) => {
    const plainText = content.replace(/[#*`\[\]()!]/g, "").trim();
    return plainText.length > 150
      ? plainText.substring(0, 150) + "..."
      : plainText;
  };

  // Pagination
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const currentPosts = posts.slice(startIndex, endIndex);

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn">
      <div className="flex items-center justify-between mb-12">
        <h2 className="text-2xl md:text-3xl text-foreground font-semibold flex items-center tracking-tight" style={{ fontFamily: 'Archivo, sans-serif' }}>
          <TrendingUp className="mr-3 text-accent" size={24} strokeWidth={1.5} />
          Build Progress Timeline
        </h2>
        <span className="text-xs text-muted">
          {posts.length} {posts.length === 1 ? 'Entry' : 'Entries'}
        </span>
      </div>

      {loading ? (
        <div className="text-muted text-sm animate-pulse p-8 text-center">
          Loading progress...
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-surface border border-border rounded-lg p-12 text-center">
          <p className="text-muted text-sm">
            No progress entries yet. Start documenting your journey!
          </p>
        </div>
      ) : (
        <>
          <div className="relative">
            {/* Vertical Timeline Line */}
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />

            {/* Timeline Items */}
            <div className="space-y-8">
              {currentPosts.map((post, index) => (
                <div key={post.id} className="relative flex items-start gap-6">
                  {/* Timeline Dot */}
                  <div className="relative z-10 flex-shrink-0">
                    {/* Glow effect for the first (latest) post */}
                    {index === 0 && (
                      <div className="absolute inset-0 rounded-full bg-accent/30 blur-lg animate-pulse" />
                    )}
                    <div className={`relative w-10 h-10 rounded-full bg-surface flex items-center justify-center transition-all ${
                      index === 0
                        ? 'border-3 border-accent shadow-lg shadow-accent/50'
                        : 'border-2 border-border'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        index === 0 ? 'bg-accent' : 'bg-muted'
                      }`} />
                    </div>
                  </div>

                  {/* Content Card */}
                  <Link
                    href={`/devlogs/${post.slug}`}
                    className="flex-1 bg-surface border border-border rounded-lg p-6 hover:border-accent transition-all duration-300 hover:shadow-lg hover:shadow-accent/10 group cursor-pointer"
                  >
                    {/* Date - Emphasized */}
                    <div className="flex items-center gap-2 mb-4 bg-hover/50 rounded-md px-3 py-2 w-fit">
                      <Calendar size={14} strokeWidth={1.5} className="text-accent" />
                      <span className="text-sm font-semibold text-foreground">{new Date(post.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-semibold text-foreground mb-3 group-hover:text-accent transition-colors tracking-tight" style={{ fontFamily: 'Archivo, sans-serif' }}>
                      {post.title}
                    </h3>

                    {/* Summary */}
                    <p className="text-sm text-secondary leading-relaxed line-clamp-3">
                      {getSummary(post.content)}
                    </p>

                    {/* Read More Link */}
                    <div className="mt-4 text-xs text-accent group-hover:underline">
                      Read full update →
                    </div>
                  </Link>
                </div>
              ))}
            </div>

            {/* Timeline End Indicator - Only show on last page */}
            {currentPage === totalPages && (
              <div className="relative flex items-center gap-6 mt-8">
                <div className="relative z-10 flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-surface border-2 border-border flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-muted" />
                  </div>
                </div>
                <div className="flex-1 text-xs text-muted">
                  Journey continues...
                </div>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-12 pt-8 border-t border-border">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-surface border border-border rounded-lg hover:border-accent transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft size={16} strokeWidth={1.5} />
                Previous
              </button>

              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 text-sm font-medium rounded-lg transition-all cursor-pointer ${
                      currentPage === page
                        ? 'bg-accent text-white'
                        : 'bg-surface text-foreground border border-border hover:border-accent'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-surface border border-border rounded-lg hover:border-accent transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Next
                <ChevronRight size={16} strokeWidth={1.5} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
