"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Link2, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { routeFor } from "@/lib/categories";
import type { BuildTimelineItem } from "@/components/home/HomeContent";

interface BuildProgressProps {
  timeline: BuildTimelineItem[];
}

interface RelatedPostInfo {
  id: number;
  title: string;
  slug: string;
  category: string;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default function BuildProgress({ timeline }: BuildProgressProps) {
  const { t } = useLanguage();
  const [relatedPostsMap, setRelatedPostsMap] = useState<Record<number, RelatedPostInfo>>({});
  const [selectedItem, setSelectedItem] = useState<BuildTimelineItem | null>(null);

  useEffect(() => {
    const allIds = new Set<number>();
    timeline.forEach((item) => {
      try {
        const ids: number[] = JSON.parse(item.relatedPosts);
        ids.forEach((id) => allIds.add(id));
      } catch { /* ignore */ }
    });
    if (allIds.size === 0) return;

    fetch("/api/posts")
      .then((r) => r.json())
      .then((posts: RelatedPostInfo[]) => {
        const map: Record<number, RelatedPostInfo> = {};
        posts.forEach((p) => { if (allIds.has(p.id)) map[p.id] = p; });
        setRelatedPostsMap(map);
      })
      .catch(() => {});
  }, [timeline]);

  if (timeline.length === 0) {
    return (
      <div>
        <h2 className="font-heading text-3xl md:text-4xl font-extrabold tracking-tight mb-4">{t.home.buildProgress}</h2>
        <p className="editorial-label text-muted">No build history yet.</p>
      </div>
    );
  }

  const getRelatedPost = (item: BuildTimelineItem): RelatedPostInfo | undefined => {
    try {
      const ids: number[] = JSON.parse(item.relatedPosts);
      if (ids.length > 0) return relatedPostsMap[ids[0]];
    } catch { /* ignore */ }
    return undefined;
  };

  const getTags = (item: BuildTimelineItem): string[] => {
    try { return JSON.parse(item.tags); } catch { return []; }
  };

  return (
    <div>
      <div className="mb-12 flex items-end justify-between border-b border-border pb-6">
        <div>
          <h2 className="font-heading text-3xl md:text-4xl font-extrabold tracking-tight">{t.home.buildProgress}</h2>
          <p className="text-secondary mt-2 text-base font-light">Development milestones and updates.</p>
        </div>
      </div>

      <div className="space-y-0">
        {timeline.map((item) => (
          <button
            key={item.id}
            onClick={() => setSelectedItem(item)}
            className="w-full text-left group border-b border-border py-5 md:py-6 flex items-center gap-4 md:gap-12 hover:bg-hover transition-colors cursor-pointer px-2 -mx-2"
          >
            <span className="editorial-label text-muted shrink-0 md:w-36">
              {formatDate(item.createdAt)}
            </span>
            <h4 className="font-heading text-base md:text-lg font-bold tracking-tight text-foreground flex-1 truncate">
              {item.title}
            </h4>
            <span className="text-muted text-xs shrink-0">→</span>
          </button>
        ))}
      </div>

      {/* Modal — portal to body to escape ScrollReveal's stacking context */}
      {selectedItem && createPortal(
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="w-full max-w-lg mx-4 border border-border p-6 md:p-8 max-h-[80vh] overflow-y-auto"
            style={{ backgroundColor: "var(--color-background)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <span className="editorial-label text-muted block mb-2">
                  {formatDate(selectedItem.createdAt)}
                </span>
                <h3 className="font-heading text-xl md:text-2xl font-extrabold tracking-tight">
                  {selectedItem.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1 text-muted hover:text-foreground transition-colors cursor-pointer shrink-0 ml-4"
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            {selectedItem.description && (
              <p className="text-sm text-secondary leading-relaxed font-light mb-4">
                {selectedItem.description}
              </p>
            )}

            {getTags(selectedItem).length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {getTags(selectedItem).slice(0, 3).map((tag) => (
                  <span key={tag} className="editorial-label text-muted px-2 py-1 border border-border">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {(() => {
              const rp = getRelatedPost(selectedItem);
              if (!rp) return null;
              return (
                <Link
                  href={routeFor(rp.category, rp.slug)}
                  className="inline-flex items-center gap-2 editorial-label text-foreground font-bold hover:opacity-60 transition-opacity mt-2"
                  onClick={() => setSelectedItem(null)}
                >
                  <Link2 size={12} strokeWidth={2} />
                  <span>{rp.title}</span>
                </Link>
              );
            })()}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
