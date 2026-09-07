"use client";

import { useState, useEffect } from "react";
import { Database, RefreshCw, Trash2, ChevronDown, Cpu, Layers } from "lucide-react";

interface PostStat {
  id: number;
  title: string;
  slug: string;
  category: string;
  chunks: number;
  lastIndexed: string | null;
}

interface ChunkItem {
  id: number;
  content: string;
  chunkIndex: number;
}

interface RAGData {
  totalChunks: number;
  indexedPosts: number;
  totalPosts: number;
  ollama: { available: boolean; chatModel: string; embedModel: string };
  posts: PostStat[];
}

export default function RAGManagementTab() {
  const [data, setData] = useState<RAGData | null>(null);
  const [loading, setLoading] = useState(true);
  const [indexing, setIndexing] = useState(false);
  const [indexingPostId, setIndexingPostId] = useState<number | null>(null);
  const [expandedPost, setExpandedPost] = useState<number | null>(null);
  const [chunks, setChunks] = useState<ChunkItem[]>([]);

  const fetchData = () => {
    setLoading(true);
    fetch("/api/admin/rag")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleFullReindex = async () => {
    setIndexing(true);
    try {
      const res = await fetch("/api/admin/rag", { method: "POST" });
      const result = await res.json();
      if (result.error) {
        alert(`Error: ${result.error}${result.detail ? ` — ${result.detail}` : ""}`);
      } else {
        alert(`Indexed ${result.indexed ?? 0} posts, ${result.chunks ?? 0} chunks`);
      }
      fetchData();
    } catch (e) {
      alert(`Indexing failed: ${e}`);
    } finally {
      setIndexing(false);
    }
  };

  const handlePostReindex = async (postId: number) => {
    setIndexingPostId(postId);
    try {
      const res = await fetch(`/api/admin/rag/${postId}`, { method: "POST" });
      const result = await res.json();
      if (result.error) {
        alert(`Error: ${result.error}`);
      } else {
        alert(`Created ${result.chunks ?? 0} chunks`);
      }
      fetchData();
    } catch {
      alert("Indexing failed");
    } finally {
      setIndexingPostId(null);
    }
  };

  const handlePostDelete = async (postId: number) => {
    await fetch(`/api/admin/rag/${postId}`, { method: "DELETE" });
    fetchData();
    if (expandedPost === postId) {
      setExpandedPost(null);
      setChunks([]);
    }
  };

  const handleClearAll = async () => {
    if (!confirm("Delete all chunks?")) return;
    await fetch("/api/admin/rag", { method: "DELETE" });
    fetchData();
  };

  const toggleChunks = async (postId: number) => {
    if (expandedPost === postId) {
      setExpandedPost(null);
      setChunks([]);
      return;
    }
    setExpandedPost(postId);
    try {
      const res = await fetch(`/api/admin/rag/${postId}`);
      const d = await res.json();
      setChunks(d.chunks || []);
    } catch {
      setChunks([]);
    }
  };

  if (loading) return <div className="text-muted text-sm py-8 text-center">Loading RAG data...</div>;
  if (!data) return <div className="text-muted text-sm py-8 text-center">Failed to load.</div>;

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="border border-border p-5">
          <div className="flex items-center gap-2 mb-2">
            <Layers size={16} className="text-muted" />
            <span className="editorial-label text-muted">Total Chunks</span>
          </div>
          <p className="text-3xl font-heading font-bold">{data.totalChunks}</p>
        </div>
        <div className="border border-border p-5">
          <div className="flex items-center gap-2 mb-2">
            <Database size={16} className="text-muted" />
            <span className="editorial-label text-muted">Indexed / Total Posts</span>
          </div>
          <p className="text-3xl font-heading font-bold">{data.indexedPosts} / {data.totalPosts}</p>
        </div>
        <div className="border border-border p-5">
          <div className="flex items-center gap-2 mb-2">
            <Cpu size={16} className="text-muted" />
            <span className="editorial-label text-muted">Chat Model</span>
          </div>
          <p className="text-sm font-mono">{data.ollama.chatModel || "—"}</p>
          <p className={`text-xs mt-1 ${data.ollama.available ? "text-green-500" : "text-red-500"}`}>
            {data.ollama.available ? "● Online" : "● Offline"}
          </p>
        </div>
        <div className="border border-border p-5">
          <div className="flex items-center gap-2 mb-2">
            <Database size={16} className="text-muted" />
            <span className="editorial-label text-muted">Embed Model</span>
          </div>
          <p className="text-sm font-mono">{data.ollama.embedModel || "—"}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleFullReindex}
          disabled={indexing}
          className="flex items-center gap-2 px-4 py-2 text-xs font-mono uppercase tracking-wider bg-foreground text-background rounded hover:opacity-80 disabled:opacity-50 cursor-pointer transition-opacity"
        >
          <RefreshCw size={14} className={indexing ? "animate-spin" : ""} />
          {indexing ? "Indexing..." : "Full Reindex"}
        </button>
        <button
          onClick={handleClearAll}
          className="flex items-center gap-2 px-4 py-2 text-xs font-mono uppercase tracking-wider border border-red-500/30 text-red-500 rounded hover:bg-red-500/10 cursor-pointer transition-colors"
        >
          <Trash2 size={14} />
          Clear All
        </button>
      </div>

      {/* Posts Table */}
      <div className="border border-border divide-y divide-border">
        <div className="grid grid-cols-12 px-4 py-2 editorial-label text-muted">
          <span className="col-span-5">Post</span>
          <span className="col-span-2">Category</span>
          <span className="col-span-2">Chunks</span>
          <span className="col-span-3 text-right">Actions</span>
        </div>
        {data.posts.map((post) => (
          <div key={post.id}>
            <div className="grid grid-cols-12 px-4 py-3 items-center text-sm">
              <span className="col-span-5 truncate font-medium">{post.title}</span>
              <span className="col-span-2 text-xs font-mono text-muted">{post.category}</span>
              <span className="col-span-2 font-mono">
                {post.chunks > 0 ? (
                  <span className="text-green-500">{post.chunks}</span>
                ) : (
                  <span className="text-muted">0</span>
                )}
              </span>
              <div className="col-span-3 flex items-center justify-end gap-2">
                <button
                  onClick={() => handlePostReindex(post.id)}
                  disabled={indexingPostId === post.id}
                  className="text-xs px-2 py-1 border border-border rounded hover:border-foreground transition-colors cursor-pointer disabled:opacity-50"
                >
                  {indexingPostId === post.id ? "..." : "Index"}
                </button>
                {post.chunks > 0 && (
                  <>
                    <button
                      onClick={() => toggleChunks(post.id)}
                      className="text-xs px-2 py-1 border border-border rounded hover:border-foreground transition-colors cursor-pointer"
                    >
                      <ChevronDown size={12} className={`transition-transform ${expandedPost === post.id ? "rotate-180" : ""}`} />
                    </button>
                    <button
                      onClick={() => handlePostDelete(post.id)}
                      className="text-xs px-2 py-1 text-red-500 border border-red-500/30 rounded hover:bg-red-500/10 transition-colors cursor-pointer"
                    >
                      <Trash2 size={12} />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Expanded chunks */}
            {expandedPost === post.id && (
              <div className="px-4 pb-3 space-y-1 bg-surface">
                {chunks.map((c) => (
                  <div key={c.id} className="text-xs text-secondary font-mono py-1 px-3 border-l-2 border-border">
                    <span className="text-muted mr-2">#{c.chunkIndex}</span>
                    {c.content.slice(0, 100)}{c.content.length > 100 ? "..." : ""}
                  </div>
                ))}
                {chunks.length === 0 && <p className="text-xs text-muted py-2">Loading...</p>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
