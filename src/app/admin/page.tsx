"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Settings, Trash2, Pencil, X, Check, FileText, MessageSquare, Users, Pin, ChevronLeft, ChevronRight } from "lucide-react";
import ChatAnalyticsTab from "@/components/admin/ChatAnalyticsTab";
import AboutEditorTab from "@/components/admin/AboutEditorTab";
import ResumeEditorTab from "@/components/admin/ResumeEditorTab";
import RAGManagementTab from "@/components/admin/RAGManagementTab";
import FaqManagementTab from "@/components/admin/FaqManagementTab";
import { CATEGORIES } from "@/lib/categories";

type Tab = "posts" | "comments" | "guestbook" | "chat" | "rag" | "faq" | "about" | "resume";

interface Post {
  id: number;
  title: string;
  slug: string;
  category: string;
  published: boolean;
  pinned: boolean;
  githubRepo: string;
  createdAt: string;
  _count: { comments: number };
}

interface Comment {
  id: number;
  author: string;
  content: string;
  createdAt: string;
  post: { title: string; slug: string };
}

interface GuestEntry {
  id: number;
  author: string;
  message: string;
  createdAt: string;
}

const POSTS_PER_PAGE = 10;

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("posts");
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [guestEntries, setGuestEntries] = useState<GuestEntry[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [postCategoryFilter, setPostCategoryFilter] = useState<string>("journal");
  const [editingGithubId, setEditingGithubId] = useState<number | null>(null);
  const [githubRepoValue, setGithubRepoValue] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);

  const tabLabels: Record<Tab, string> = { posts: "Posts", comments: "Comments", guestbook: "Guestbook", chat: "Chat", rag: "RAG", faq: "FAQ", about: "About", resume: "Resume" };

  useEffect(() => {
    if (activeTab === "posts") {
      fetch("/api/admin/posts")
        .then((r) => r.json())
        .then(setPosts)
        .catch(() => {});
    } else if (activeTab === "comments") {
      fetch("/api/comments")
        .then((r) => r.json())
        .then(setComments)
        .catch(() => {});
    } else {
      fetch("/api/guestbook")
        .then((r) => r.json())
        .then(setGuestEntries)
        .catch(() => {});
    }
  }, [activeTab]);

  // Reset page and selection when filter changes
  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds(new Set());
  }, [postCategoryFilter]);

  const filteredPosts = posts.filter(
    (post) => post.category === postCategoryFilter
  );
  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE));
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE + 1;
  const endIndex = Math.min(currentPage * POSTS_PER_PAGE, filteredPosts.length);

  const handleDelete = async (type: string, id: number) => {
    if (!confirm("Are you sure you want to delete this?")) return;

    const urlMap: Record<string, string> = {
      posts: `/api/posts/${id}`,
      comments: `/api/comments/${id}`,
      guestbook: `/api/guestbook/${id}`,
    };

    const res = await fetch(urlMap[type], { method: "DELETE" });
    if (res.ok) {
      if (type === "posts") {
        setPosts((prev) => prev.filter((p) => p.id !== id));
        setSelectedIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
      }
      if (type === "comments") setComments((prev) => prev.filter((c) => c.id !== id));
      if (type === "guestbook") setGuestEntries((prev) => prev.filter((e) => e.id !== id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Delete ${selectedIds.size} selected post(s)?`)) return;

    const ids = Array.from(selectedIds);
    for (const id of ids) {
      await fetch(`/api/posts/${id}`, { method: "DELETE" });
    }
    setPosts((prev) => prev.filter((p) => !selectedIds.has(p.id)));
    setSelectedIds(new Set());
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    const pageIds = paginatedPosts.map((p) => p.id);
    const allSelected = pageIds.every((id) => selectedIds.has(id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        pageIds.forEach((id) => next.delete(id));
      } else {
        pageIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const handleTogglePublish = async (post: Post) => {
    const res = await fetch(`/api/posts/${post.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !post.published }),
    });
    if (res.ok) {
      setPosts((prev) =>
        prev.map((p) => (p.id === post.id ? { ...p, published: !p.published } : p))
      );
    }
  };

  const handleTogglePin = async (post: Post) => {
    const newPinned = !post.pinned;
    const res = await fetch(`/api/posts/${post.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pinned: newPinned }),
    });
    if (res.ok) {
      setPosts((prev) =>
        prev.map((p) => ({ ...p, pinned: p.id === post.id ? newPinned : false }))
      );
    }
  };

  const handleSaveGithubRepo = async (id: number) => {
    const res = await fetch(`/api/posts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ githubRepo: githubRepoValue }),
    });
    if (res.ok) {
      setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, githubRepo: githubRepoValue } : p)));
      setEditingGithubId(null);
    }
  };

  const handleSaveEdit = async (type: "comments" | "guestbook", id: number) => {
    const urlMap = {
      comments: `/api/comments/${id}`,
      guestbook: `/api/guestbook/${id}`,
    };
    const bodyMap = {
      comments: { content: editValue },
      guestbook: { message: editValue },
    };

    const res = await fetch(urlMap[type], {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyMap[type]),
    });

    if (res.ok) {
      if (type === "comments") {
        setComments((prev) =>
          prev.map((c) => (c.id === id ? { ...c, content: editValue } : c))
        );
      } else {
        setGuestEntries((prev) =>
          prev.map((e) => (e.id === id ? { ...e, message: editValue } : e))
        );
      }
      setEditingId(null);
      setEditValue("");
    }
  };

  const tabs: Tab[] = ["posts", "comments", "guestbook", "chat", "rag", "faq", "about", "resume"];

  const getTabIcon = (tab: Tab) => {
    switch (tab) {
      case "posts": return <FileText size={16} />;
      case "comments": return <MessageSquare size={16} />;
      case "guestbook": return <Users size={16} />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-border">
        <h1 className="text-3xl text-foreground font-bold flex items-center tracking-tight mb-2">
          <Settings className="mr-3" size={28} strokeWidth={1.5} />
          Admin Dashboard
        </h1>
        <p className="text-sm text-muted ml-11">
          Manage your posts, comments, and guestbook entries
        </p>
      </div>

      {/* Tab Bar */}
      <div className="flex space-x-2 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setEditingId(null); }}
            className={`px-6 py-3 text-sm font-medium transition-all rounded-lg cursor-pointer flex items-center gap-2 ${
              activeTab === tab
                ? "bg-accent text-background shadow-lg shadow-accent/20 ring-2 ring-accent ring-offset-2 ring-offset-background"
                : "bg-surface text-muted card-border hover:border-accent hover:text-accent"
            }`}
          >
            {getTabIcon(tab)}
            {tabLabels[tab]}
          </button>
        ))}
      </div>

      {/* Posts Tab */}
      {activeTab === "posts" && (
        <>
          {/* Category Filter */}
          <div className="flex gap-3 mb-6 flex-wrap">
            {CATEGORIES.map((filter) => (
              <button
                key={filter}
                onClick={() => { setPostCategoryFilter(filter); setCurrentPage(1); }}
                className={`px-5 py-2.5 text-xs font-medium uppercase tracking-wider transition-all rounded-lg cursor-pointer ${
                  postCategoryFilter === filter
                    ? "bg-accent text-background shadow-md ring-2 ring-accent ring-offset-2 ring-offset-background"
                    : "bg-background text-muted card-border hover:border-accent hover:text-accent"
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>

          {/* Bulk Actions */}
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-3 mb-4 p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
              <span className="text-sm text-foreground font-medium">{selectedIds.size} selected</span>
              <button onClick={handleBulkDelete} className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/20 transition-colors cursor-pointer">
                <Trash2 size={13} /> Delete Selected
              </button>
              <button onClick={() => setSelectedIds(new Set())} className="text-xs text-muted hover:text-foreground transition-colors cursor-pointer">Clear</button>
            </div>
          )}

          <div className="bg-background card-border rounded-xl overflow-hidden shadow-lg overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="border-b border-border text-muted text-xs font-mono uppercase bg-background">
                  <th className="p-4 w-10">
                    <input type="checkbox" checked={paginatedPosts.length > 0 && paginatedPosts.every((p) => selectedIds.has(p.id))} onChange={toggleSelectAll} className="accent-accent cursor-pointer" />
                  </th>
                  <th className="text-left p-4">Title</th>
                  <th className="text-left p-4 hidden md:table-cell">Category</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4 hidden md:table-cell">Date</th>
                  <th className="text-right p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPosts.map((post) => (
                  <tr key={post.id} className={`border-b border-border/50 hover:bg-surface transition-colors ${selectedIds.has(post.id) ? 'bg-accent/5' : ''}`}>
                    <td className="p-4">
                      <input type="checkbox" checked={selectedIds.has(post.id)} onChange={() => toggleSelect(post.id)} className="accent-accent cursor-pointer" />
                    </td>
                    <td className="p-4">
                      <span className="text-foreground font-medium">{post.title}</span>
                      <span className="text-secondary text-xs ml-2">({post._count.comments})</span>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <span className="text-muted text-xs font-mono bg-surface px-2 py-1 rounded">{post.category}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleTogglePublish(post)} className={`text-xs font-mono px-3 py-1.5 rounded cursor-pointer transition-all ${post.published ? "bg-accent/20 text-accent border border-accent/30" : "bg-red-500/20 text-red-500 border border-red-500/30"}`}>
                          {post.published ? "Published" : "Draft"}
                        </button>
                        <button onClick={() => handleTogglePin(post)} title={post.pinned ? "Unpin" : "Pin"} className={`p-1.5 rounded cursor-pointer transition-all ${post.pinned ? "text-amber-400 bg-amber-400/10" : "text-muted hover:text-amber-400 hover:bg-amber-400/10"}`}>
                          <Pin size={12} strokeWidth={post.pinned ? 2.5 : 1.5} />
                        </button>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell text-secondary text-xs font-mono">
                      {new Date(post.createdAt).toISOString().split("T")[0]}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/write/edit/${post.id}`} className="text-muted hover:text-accent transition-colors p-2 hover:bg-surface rounded" title="Edit">
                          <Pencil size={14} />
                        </Link>
                        <button onClick={() => handleDelete("posts", post.id)} className="text-muted hover:text-red-500 transition-colors cursor-pointer p-2 hover:bg-surface rounded" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredPosts.length === 0 && (
                  <tr><td colSpan={6} className="p-12 text-center text-secondary font-mono text-sm">No posts found</td></tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {filteredPosts.length > POSTS_PER_PAGE && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                <span className="text-xs text-muted font-mono">{startIndex}–{endIndex} of {filteredPosts.length}</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1.5 rounded text-muted hover:text-foreground hover:bg-hover disabled:opacity-30 cursor-pointer transition-colors">
                    <ChevronLeft size={14} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button key={page} onClick={() => setCurrentPage(page)} className={`w-7 h-7 text-xs font-mono rounded cursor-pointer transition-colors ${page === currentPage ? "bg-accent text-background" : "text-muted hover:text-foreground hover:bg-hover"}`}>
                      {page}
                    </button>
                  ))}
                  <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1.5 rounded text-muted hover:text-foreground hover:bg-hover disabled:opacity-30 cursor-pointer transition-colors">
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Comments Tab */}
      {activeTab === "comments" && (
        <div className="bg-background card-border rounded-xl overflow-hidden shadow-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted text-xs font-mono uppercase bg-background">
                <th className="text-left p-4">Author</th>
                <th className="text-left p-4">Content</th>
                <th className="text-left p-4 hidden md:table-cell">Post</th>
                <th className="text-right p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {comments.map((comment) => (
                <tr key={comment.id} className="border-b border-border/50 hover:bg-surface transition-colors">
                  <td className="p-4">
                    <span className="text-accent text-xs font-mono bg-accent/10 px-2 py-1 rounded">{comment.author}</span>
                  </td>
                  <td className="p-4">
                    {editingId === comment.id ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full bg-background card-border rounded px-3 py-2 text-foreground text-sm focus:border-accent focus:outline-none"
                        autoFocus
                      />
                    ) : (
                      <span className="text-secondary text-sm">{comment.content.slice(0, 80)}{comment.content.length > 80 ? "..." : ""}</span>
                    )}
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <span className="text-secondary text-xs font-mono">{comment.post?.title?.slice(0, 30)}</span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {editingId === comment.id ? (
                        <>
                          <button
                            onClick={() => handleSaveEdit("comments", comment.id)}
                            className="text-accent hover:text-accent/90 transition-colors cursor-pointer p-2 hover:bg-surface rounded"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={() => { setEditingId(null); setEditValue(""); }}
                            className="text-muted hover:text-foreground transition-colors cursor-pointer p-2 hover:bg-surface rounded"
                          >
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => { setEditingId(comment.id); setEditValue(comment.content); }}
                            className="text-muted hover:text-accent transition-colors cursor-pointer p-2 hover:bg-surface rounded"
                            title="Edit"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete("comments", comment.id)}
                            className="text-muted hover:text-red-500 transition-colors cursor-pointer p-2 hover:bg-surface rounded"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {comments.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-secondary font-mono text-sm">
                    No items found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Guestbook Tab */}
      {activeTab === "guestbook" && (
        <div className="bg-background card-border rounded-xl overflow-hidden shadow-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted text-xs font-mono uppercase bg-background">
                <th className="text-left p-4">Author</th>
                <th className="text-left p-4">Message</th>
                <th className="text-left p-4 hidden md:table-cell">Date</th>
                <th className="text-right p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {guestEntries.map((entry) => (
                <tr key={entry.id} className="border-b border-border/50 hover:bg-surface transition-colors">
                  <td className="p-4">
                    <span className="text-accent text-xs font-mono bg-accent/10 px-2 py-1 rounded">{entry.author}</span>
                  </td>
                  <td className="p-4">
                    {editingId === entry.id ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full bg-background card-border rounded px-3 py-2 text-foreground text-sm focus:border-accent focus:outline-none"
                        autoFocus
                      />
                    ) : (
                      <span className="text-secondary text-sm">{entry.message.slice(0, 80)}{entry.message.length > 80 ? "..." : ""}</span>
                    )}
                  </td>
                  <td className="p-4 hidden md:table-cell text-secondary text-xs font-mono">
                    {new Date(entry.createdAt).toISOString().split("T")[0]}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {editingId === entry.id ? (
                        <>
                          <button
                            onClick={() => handleSaveEdit("guestbook", entry.id)}
                            className="text-accent hover:text-accent/90 transition-colors cursor-pointer p-2 hover:bg-surface rounded"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={() => { setEditingId(null); setEditValue(""); }}
                            className="text-muted hover:text-foreground transition-colors cursor-pointer p-2 hover:bg-surface rounded"
                          >
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => { setEditingId(entry.id); setEditValue(entry.message); }}
                            className="text-muted hover:text-accent transition-colors cursor-pointer p-2 hover:bg-surface rounded"
                            title="Edit"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete("guestbook", entry.id)}
                            className="text-muted hover:text-red-500 transition-colors cursor-pointer p-2 hover:bg-surface rounded"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {guestEntries.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-secondary font-mono text-sm">
                    No items found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Chat Analytics Tab */}
      {activeTab === "chat" && <ChatAnalyticsTab />}

      {/* RAG Management Tab */}
      {activeTab === "rag" && <RAGManagementTab />}

      {/* FAQ Management Tab */}
      {activeTab === "faq" && <FaqManagementTab />}

      {/* About Editor Tab */}
      {activeTab === "about" && <AboutEditorTab />}

      {activeTab === "resume" && <ResumeEditorTab />}
    </div>
  );
}
