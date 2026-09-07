"use client";

import React, { useState, useEffect, useRef } from "react";
import { Tag, X, Search, Link2, ChevronDown } from "lucide-react";

interface RelatedPost {
  id: number;
  title: string;
  category: string;
  slug: string;
}

interface BuildEditorProps {
  initialTitle?: string;
  initialDescription?: string;
  initialTags?: string;
  initialRelatedPosts?: string;
  initialPublished?: boolean;
  initialCreatedAt?: string;
  onSave: (data: {
    title: string;
    category: string;
    content: string;
    slug?: string;
    description?: string;
    published?: boolean;
    tags?: string;
    relatedPosts?: string;
    createdAt?: string;
  }) => void;
  saving?: boolean;
}

function toLocalDate(iso?: string): string {
  const d = iso ? new Date(iso) : new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function BuildEditor({
  initialTitle = "",
  initialDescription = "",
  initialTags = "[]",
  initialRelatedPosts = "[]",
  initialPublished = true,
  initialCreatedAt,
  onSave,
  saving = false,
}: BuildEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [published, setPublished] = useState(initialPublished);
  const [dateStr, setDateStr] = useState(() => toLocalDate(initialCreatedAt));

  // Tags
  const [tags, setTags] = useState<string[]>(() => {
    try { return JSON.parse(initialTags); } catch { return []; }
  });
  const [tagInput, setTagInput] = useState("");

  // Related post (single)
  const [selectedPostId, setSelectedPostId] = useState<number | null>(() => {
    try {
      const ids = JSON.parse(initialRelatedPosts);
      return Array.isArray(ids) && ids.length > 0 ? ids[0] : null;
    } catch { return null; }
  });
  const [allPosts, setAllPosts] = useState<RelatedPost[]>([]);
  const [postSearch, setPostSearch] = useState("");
  const [showPostDropdown, setShowPostDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch all posts for the related posts selector
  useEffect(() => {
    fetch("/api/admin/posts")
      .then((r) => r.json())
      .then((posts: RelatedPost[]) => {
        setAllPosts(posts.filter((p) => p.category !== "build"));
      })
      .catch(() => {});
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowPostDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      setTags((prev) => [...prev, t]);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const selectPost = (id: number) => {
    setSelectedPostId((prev) => (prev === id ? null : id));
    setShowPostDropdown(false);
  };

  const filteredPosts = allPosts.filter(
    (p) =>
      p.title.toLowerCase().includes(postSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(postSearch.toLowerCase())
  );

  const selectedPost = allPosts.find((p) => p.id === selectedPostId) ?? null;

  const handleSave = () => {
    if (!title.trim()) return;
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/-{2,}/g, "-")
      .replace(/^-|-$/g, "") || `build-${Date.now()}`;
    onSave({
      title,
      category: "build",
      content: description,
      slug,
      description,
      published,
      tags: JSON.stringify(tags),
      relatedPosts: JSON.stringify(selectedPostId ? [selectedPostId] : []),
      createdAt: new Date(dateStr).toISOString(),
    });
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background text-foreground">
      {/* Toolbar */}
      <div className="h-10 border-b border-border flex items-center justify-between px-6 bg-surface shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] text-muted tracking-widest uppercase">
            BUILD <span className="mx-1 font-light opacity-40">/</span> EDITOR
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPublished((p) => !p)}
            className="flex items-center gap-2 px-3 py-1 rounded text-[11px] font-medium transition-colors"
          >
            <div className={`w-2 h-2 rounded-full ${published ? "bg-green-500" : "bg-orange-400"}`} />
            <span className={published ? "text-green-500" : "text-orange-400"}>
              {published ? "Public" : "Draft"}
            </span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !title.trim()}
            className="ml-1 bg-foreground hover:bg-foreground/90 text-background font-bold h-7 px-4 text-[11px] uppercase tracking-widest rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "COMMIT"}
          </button>
        </div>
      </div>

      {/* Editor body */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-8 pt-12 pb-8 space-y-8">
          {/* Title */}
          <input
            className="w-full bg-transparent outline-none text-3xl font-bold text-foreground tracking-tight placeholder-muted/25"
            style={{ fontFamily: "'Manrope', 'Pretendard', sans-serif" }}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Build title"
            autoComplete="off"
          />

          {/* Date */}
          <div>
            <label className="text-xs text-muted uppercase tracking-wider font-semibold mb-2 block">
              Date
            </label>
            <input
              type="date"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              className="bg-surface card-border rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none focus:border-accent"
            />
          </div>

          {/* Summary */}
          <div>
            <label className="text-xs text-muted uppercase tracking-wider font-semibold mb-2 block">
              Summary
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What was built or accomplished..."
              rows={4}
              className="w-full bg-surface card-border rounded-lg px-4 py-3 text-sm text-foreground placeholder-muted/40 focus:outline-none focus:border-accent resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="text-xs text-muted uppercase tracking-wider font-semibold mb-2 block">
              Tags
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 px-2 py-1 text-xs font-mono bg-accent/10 text-accent card-border rounded"
                >
                  <Tag size={10} />
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-0.5 hover:text-red-400 transition-colors cursor-pointer"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); addTag(); }
                }}
                placeholder="Add tag..."
                className="flex-1 bg-surface card-border rounded px-3 py-2 text-sm text-foreground placeholder-muted/40 focus:outline-none focus:border-accent"
              />
              <button
                onClick={addTag}
                disabled={!tagInput.trim()}
                className="px-3 py-2 text-xs font-medium bg-surface card-border rounded hover:border-accent hover:text-accent transition-colors disabled:opacity-30 cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>

          {/* Related Post (single) */}
          <div>
            <label className="text-xs text-muted uppercase tracking-wider font-semibold mb-2 block">
              Related Post
            </label>

            {/* Selected post */}
            {selectedPost && (
              <div className="flex items-center justify-between px-3 py-2 bg-surface card-border rounded-lg mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <Link2 size={12} className="text-accent shrink-0" />
                  <span className="text-sm text-foreground truncate">{selectedPost.title}</span>
                  <span className="text-[10px] font-mono text-muted bg-background px-1.5 py-0.5 rounded shrink-0">
                    {selectedPost.category}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedPostId(null)}
                  className="text-muted hover:text-red-400 transition-colors p-1 cursor-pointer shrink-0"
                >
                  <X size={12} />
                </button>
              </div>
            )}

            {/* Post search dropdown */}
            {!selectedPost && (
              <div className="relative" ref={dropdownRef}>
                <div
                  className="flex items-center gap-2 px-3 py-2 bg-surface card-border rounded-lg cursor-pointer hover:border-accent transition-colors"
                  onClick={() => setShowPostDropdown((p) => !p)}
                >
                  <Search size={14} className="text-muted" />
                  <input
                    value={postSearch}
                    onChange={(e) => { setPostSearch(e.target.value); setShowPostDropdown(true); }}
                    onClick={(e) => { e.stopPropagation(); setShowPostDropdown(true); }}
                    placeholder="Search posts to link..."
                    className="flex-1 bg-transparent text-sm text-foreground placeholder-muted/40 focus:outline-none"
                  />
                  <ChevronDown size={14} className={`text-muted transition-transform ${showPostDropdown ? "rotate-180" : ""}`} />
                </div>

                {showPostDropdown && (
                  <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-surface card-border rounded-lg shadow-xl max-h-48 overflow-y-auto">
                    {filteredPosts.length === 0 ? (
                      <div className="px-3 py-4 text-xs text-muted text-center">No posts found</div>
                    ) : (
                      filteredPosts.map((post) => (
                        <button
                          key={post.id}
                          onClick={() => selectPost(post.id)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-hover transition-colors cursor-pointer"
                        >
                          <span className="text-sm text-foreground truncate flex-1">{post.title}</span>
                          <span className="text-[10px] font-mono text-muted bg-background px-1.5 py-0.5 rounded shrink-0">
                            {post.category}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
