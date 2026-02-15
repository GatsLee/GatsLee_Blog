"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Settings, Trash2, Pencil, X, Check, FileText, MessageSquare, Users } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

type Tab = "posts" | "comments" | "guestbook";

interface Post {
  id: number;
  title: string;
  slug: string;
  category: string;
  published: boolean;
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

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("posts");
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [guestEntries, setGuestEntries] = useState<GuestEntry[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [postCategoryFilter, setPostCategoryFilter] = useState<string>("all");
  const { t } = useLanguage();

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

  const handleDelete = async (type: string, id: number) => {
    if (!confirm(t("admin.confirm.delete"))) return;

    const urlMap: Record<string, string> = {
      posts: `/api/posts/${id}`,
      comments: `/api/comments/${id}`,
      guestbook: `/api/guestbook/${id}`,
    };

    const res = await fetch(urlMap[type], { method: "DELETE" });
    if (res.ok) {
      if (type === "posts") setPosts((prev) => prev.filter((p) => p.id !== id));
      if (type === "comments") setComments((prev) => prev.filter((c) => c.id !== id));
      if (type === "guestbook") setGuestEntries((prev) => prev.filter((e) => e.id !== id));
    }
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

  const tabs: Tab[] = ["posts", "comments", "guestbook"];

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
          {t("admin.title")}
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
                ? "bg-accent text-background shadow-lg shadow-accent/20"
                : "bg-surface text-muted border border-border hover:border-accent hover:text-accent"
            }`}
          >
            {getTabIcon(tab)}
            {t(`admin.tab.${tab}` as keyof typeof import("@/lib/i18n").translations)}
          </button>
        ))}
      </div>

      {/* Posts Tab */}
      {activeTab === "posts" && (
        <>
          {/* Category Filter Buttons */}
          <div className="flex gap-3 mb-6">
            {["all", "devlog", "troubleshooting", "progress"].map((filter) => (
              <button
                key={filter}
                onClick={() => setPostCategoryFilter(filter)}
                className={`px-5 py-2.5 text-xs font-medium uppercase tracking-wider transition-all rounded-lg ${
                  postCategoryFilter === filter
                    ? "bg-accent text-background shadow-md"
                    : "bg-background text-muted border border-border hover:border-accent hover:text-accent"
                }`}
              >
                {filter === "all" ? "All Posts" : filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>

          <div className="bg-background border border-border rounded-xl overflow-hidden shadow-lg">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted text-xs font-mono uppercase bg-background">
                  <th className="text-left p-4">{t("admin.posts.title")}</th>
                  <th className="text-left p-4 hidden md:table-cell">{t("admin.posts.category")}</th>
                  <th className="text-left p-4">{t("admin.posts.status")}</th>
                  <th className="text-left p-4 hidden md:table-cell">{t("admin.posts.date")}</th>
                  <th className="text-right p-4">{t("admin.posts.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {posts
                  .filter((post) => postCategoryFilter === "all" || post.category === postCategoryFilter)
                  .map((post) => (
                    <tr key={post.id} className="border-b border-border/50 hover:bg-surface transition-colors">
                      <td className="p-4">
                        <span className="text-foreground font-medium">{post.title}</span>
                        <span className="text-secondary text-xs ml-2">({post._count.comments})</span>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <span className="text-muted text-xs font-mono bg-surface px-2 py-1 rounded">{post.category}</span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleTogglePublish(post)}
                          className={`text-xs font-mono px-3 py-1.5 rounded cursor-pointer transition-all ${
                            post.published
                              ? "bg-accent/20 text-accent border border-accent/30"
                              : "bg-red-500/20 text-red-500 border border-red-500/30"
                          }`}
                        >
                          {post.published ? t("admin.posts.published") : t("admin.posts.draft")}
                        </button>
                      </td>
                      <td className="p-4 hidden md:table-cell text-secondary text-xs font-mono">
                        {new Date(post.createdAt).toISOString().split("T")[0]}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/write/edit/${post.id}`}
                            className="text-muted hover:text-accent transition-colors p-2 hover:bg-surface rounded"
                            title={t("admin.action.edit")}
                          >
                            <Pencil size={14} />
                          </Link>
                          <button
                            onClick={() => handleDelete("posts", post.id)}
                            className="text-muted hover:text-red-500 transition-colors cursor-pointer p-2 hover:bg-surface rounded"
                            title={t("admin.action.delete")}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                {posts
                  .filter((post) => postCategoryFilter === "all" || post.category === postCategoryFilter)
                  .length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-secondary font-mono text-sm">
                        {postCategoryFilter === "all" ? t("admin.empty") : `No ${postCategoryFilter} posts found.`}
                      </td>
                    </tr>
                  )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Comments Tab - Similar updates */}
      {activeTab === "comments" && (
        <div className="bg-background border border-border rounded-xl overflow-hidden shadow-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted text-xs font-mono uppercase bg-background">
                <th className="text-left p-4">{t("admin.comments.author")}</th>
                <th className="text-left p-4">{t("admin.comments.content")}</th>
                <th className="text-left p-4 hidden md:table-cell">{t("admin.comments.post")}</th>
                <th className="text-right p-4">{t("admin.posts.actions")}</th>
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
                        className="w-full bg-background border border-border rounded px-3 py-2 text-foreground text-sm focus:border-accent focus:outline-none"
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
                            title={t("admin.action.edit")}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete("comments", comment.id)}
                            className="text-muted hover:text-red-500 transition-colors cursor-pointer p-2 hover:bg-surface rounded"
                            title={t("admin.action.delete")}
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
                    {t("admin.empty")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Guestbook Tab - Similar updates */}
      {activeTab === "guestbook" && (
        <div className="bg-background border border-border rounded-xl overflow-hidden shadow-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted text-xs font-mono uppercase bg-background">
                <th className="text-left p-4">{t("admin.guestbook.author")}</th>
                <th className="text-left p-4">{t("admin.guestbook.message")}</th>
                <th className="text-left p-4 hidden md:table-cell">{t("admin.posts.date")}</th>
                <th className="text-right p-4">{t("admin.posts.actions")}</th>
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
                        className="w-full bg-background border border-border rounded px-3 py-2 text-foreground text-sm focus:border-accent focus:outline-none"
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
                            title={t("admin.action.edit")}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete("guestbook", entry.id)}
                            className="text-muted hover:text-red-500 transition-colors cursor-pointer p-2 hover:bg-surface rounded"
                            title={t("admin.action.delete")}
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
                    {t("admin.empty")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
