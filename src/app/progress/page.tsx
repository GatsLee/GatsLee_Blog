"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Calendar } from "lucide-react";
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

export default function ProgressPage() {
  const [posts, setPosts] = useState<ProgressPost[]>([]);
  const [loading, setLoading] = useState(true);
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

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn">
      <div className="flex items-center justify-between mb-12">
        <h2 className="text-xl text-[#d4d4dc] font-bold flex items-center tracking-tight">
          <TrendingUp className="mr-2" size={20} /> Build Progress Timeline
        </h2>
        <span className="text-xs font-mono text-[#8888a0]">
          Development Journey
        </span>
      </div>

      {loading ? (
        <div className="text-[#8888a0] font-mono text-sm animate-pulse p-8 text-center">
          Loading progress...
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-[#22223a] border border-[#2e2e4a] rounded-lg p-12 text-center">
          <p className="text-[#5a5a72] font-mono text-sm">
            No progress entries yet. Start documenting your journey!
          </p>
        </div>
      ) : (
        <div className="relative">
          {/* Vertical Timeline Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-[#2e2e4a]" />

          {/* Timeline Items */}
          <div className="space-y-8">
            {posts.map((post, index) => (
              <div key={post.id} className="relative flex items-start gap-6">
                {/* Timeline Dot */}
                <div className="relative z-10 flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-[#22223a] border-4 border-[#d4a054] flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-[#d4a054] animate-pulse" />
                  </div>
                </div>

                {/* Content Card */}
                <Link
                  href={`/devlogs/${post.slug}`}
                  className="flex-1 bg-[#22223a] border border-[#2e2e4a] rounded-lg p-6 hover:border-[#d4a054] transition-all duration-300 hover:shadow-lg hover:shadow-[#d4a054]/10 group"
                >
                  {/* Date */}
                  <div className="flex items-center gap-2 text-xs text-[#8888a0] font-mono mb-3">
                    <Calendar size={12} />
                    <span>{new Date(post.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}</span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-[#d4d4dc] mb-3 group-hover:text-[#d4a054] transition-colors">
                    {post.title}
                  </h3>

                  {/* Summary */}
                  <p className="text-sm text-[#b0b0bc] leading-relaxed line-clamp-3">
                    {getSummary(post.content)}
                  </p>

                  {/* Read More Link */}
                  <div className="mt-4 text-xs text-[#d4a054] font-mono group-hover:underline">
                    Read full update →
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {/* Timeline End Indicator */}
          <div className="relative flex items-center gap-6 mt-8">
            <div className="relative z-10 flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-[#22223a] border-4 border-[#5a5a72] flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-[#5a5a72]" />
              </div>
            </div>
            <div className="flex-1 text-xs text-[#5a5a72] font-mono">
              Journey continues...
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
