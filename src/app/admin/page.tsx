"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Settings, Trash2, Pencil, X, Check } from "lucide-react";
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

  return (
    <div className="max-w-6xl mx-auto animate-fadeIn">
      <h2 className="text-xl text-[#d4d4dc] mb-8 font-bold flex items-center tracking-tight">
        <Settings className="mr-2" size={20} /> {t("admin.title")}
      </h2>

      {/* Tab Bar */}
      <div className="flex space-x-1 mb-6 border-b border-[#2e2e4a]">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setEditingId(null); }}
            className={`px-4 py-2 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer ${
              activeTab === tab
                ? "text-[#d4a054] border-b-2 border-[#d4a054]"
                : "text-[#5a5a72] hover:text-[#8888a0]"
            }`}
          >
            {t(`admin.tab.${tab}` as keyof typeof import("@/lib/i18n").translations)}
          </button>
        ))}
      </div>

      {/* Posts Tab */}
      {activeTab === "posts" && (
        <div className="bg-[#22223a] border border-[#2e2e4a] rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2e2e4a] text-[#8888a0] text-xs font-mono uppercase">
                <th className="text-left p-4">{t("admin.posts.title")}</th>
                <th className="text-left p-4 hidden md:table-cell">{t("admin.posts.category")}</th>
                <th className="text-left p-4">{t("admin.posts.status")}</th>
                <th className="text-left p-4 hidden md:table-cell">{t("admin.posts.date")}</th>
                <th className="text-right p-4">{t("admin.posts.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-b border-[#2e2e4a]/50 hover:bg-[#1a1a2e] transition-colors">
                  <td className="p-4">
                    <span className="text-[#d4d4dc] font-medium">{post.title}</span>
                    <span className="text-[#5a5a72] text-xs ml-2">({post._count.comments})</span>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <span className="text-[#8888a0] text-xs font-mono">{post.category}</span>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleTogglePublish(post)}
                      className={`text-xs font-mono px-2 py-1 rounded cursor-pointer ${
                        post.published
                          ? "bg-[#d4a054]/20 text-[#d4a054]"
                          : "bg-[#e05555]/20 text-[#e05555]"
                      }`}
                    >
                      {post.published ? t("admin.posts.published") : t("admin.posts.draft")}
                    </button>
                  </td>
                  <td className="p-4 hidden md:table-cell text-[#5a5a72] text-xs font-mono">
                    {new Date(post.createdAt).toISOString().split("T")[0]}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/write/edit/${post.id}`}
                        className="text-[#8888a0] hover:text-[#d4a054] transition-colors"
                        title={t("admin.action.edit")}
                      >
                        <Pencil size={14} />
                      </Link>
                      <button
                        onClick={() => handleDelete("posts", post.id)}
                        className="text-[#8888a0] hover:text-[#e05555] transition-colors cursor-pointer"
                        title={t("admin.action.delete")}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {posts.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[#5a5a72] font-mono text-sm">
                    {t("admin.empty")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Comments Tab */}
      {activeTab === "comments" && (
        <div className="bg-[#22223a] border border-[#2e2e4a] rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2e2e4a] text-[#8888a0] text-xs font-mono uppercase">
                <th className="text-left p-4">{t("admin.comments.author")}</th>
                <th className="text-left p-4">{t("admin.comments.content")}</th>
                <th className="text-left p-4 hidden md:table-cell">{t("admin.comments.post")}</th>
                <th className="text-right p-4">{t("admin.posts.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {comments.map((comment) => (
                <tr key={comment.id} className="border-b border-[#2e2e4a]/50 hover:bg-[#1a1a2e] transition-colors">
                  <td className="p-4">
                    <span className="text-[#d4a054] text-xs font-mono">{comment.author}</span>
                  </td>
                  <td className="p-4">
                    {editingId === comment.id ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full bg-[#1a1a2e] border border-[#2e2e4a] rounded px-2 py-1 text-[#d4d4dc] text-sm focus:border-[#d4a054] focus:outline-none"
                        autoFocus
                      />
                    ) : (
                      <span className="text-[#b0b0bc] text-sm">{comment.content.slice(0, 80)}{comment.content.length > 80 ? "..." : ""}</span>
                    )}
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <span className="text-[#5a5a72] text-xs font-mono">{comment.post?.title?.slice(0, 30)}</span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {editingId === comment.id ? (
                        <>
                          <button
                            onClick={() => handleSaveEdit("comments", comment.id)}
                            className="text-[#d4a054] hover:text-[#c49544] transition-colors cursor-pointer"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={() => { setEditingId(null); setEditValue(""); }}
                            className="text-[#8888a0] hover:text-[#d4d4dc] transition-colors cursor-pointer"
                          >
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => { setEditingId(comment.id); setEditValue(comment.content); }}
                            className="text-[#8888a0] hover:text-[#d4a054] transition-colors cursor-pointer"
                            title={t("admin.action.edit")}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete("comments", comment.id)}
                            className="text-[#8888a0] hover:text-[#e05555] transition-colors cursor-pointer"
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
                  <td colSpan={4} className="p-8 text-center text-[#5a5a72] font-mono text-sm">
                    {t("admin.empty")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Guestbook Tab */}
      {activeTab === "guestbook" && (
        <div className="bg-[#22223a] border border-[#2e2e4a] rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2e2e4a] text-[#8888a0] text-xs font-mono uppercase">
                <th className="text-left p-4">{t("admin.guestbook.author")}</th>
                <th className="text-left p-4">{t("admin.guestbook.message")}</th>
                <th className="text-left p-4 hidden md:table-cell">{t("admin.posts.date")}</th>
                <th className="text-right p-4">{t("admin.posts.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {guestEntries.map((entry) => (
                <tr key={entry.id} className="border-b border-[#2e2e4a]/50 hover:bg-[#1a1a2e] transition-colors">
                  <td className="p-4">
                    <span className="text-[#d4a054] text-xs font-mono">{entry.author}</span>
                  </td>
                  <td className="p-4">
                    {editingId === entry.id ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full bg-[#1a1a2e] border border-[#2e2e4a] rounded px-2 py-1 text-[#d4d4dc] text-sm focus:border-[#d4a054] focus:outline-none"
                        autoFocus
                      />
                    ) : (
                      <span className="text-[#b0b0bc] text-sm">{entry.message.slice(0, 80)}{entry.message.length > 80 ? "..." : ""}</span>
                    )}
                  </td>
                  <td className="p-4 hidden md:table-cell text-[#5a5a72] text-xs font-mono">
                    {new Date(entry.createdAt).toISOString().split("T")[0]}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {editingId === entry.id ? (
                        <>
                          <button
                            onClick={() => handleSaveEdit("guestbook", entry.id)}
                            className="text-[#d4a054] hover:text-[#c49544] transition-colors cursor-pointer"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={() => { setEditingId(null); setEditValue(""); }}
                            className="text-[#8888a0] hover:text-[#d4d4dc] transition-colors cursor-pointer"
                          >
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => { setEditingId(entry.id); setEditValue(entry.message); }}
                            className="text-[#8888a0] hover:text-[#d4a054] transition-colors cursor-pointer"
                            title={t("admin.action.edit")}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete("guestbook", entry.id)}
                            className="text-[#8888a0] hover:text-[#e05555] transition-colors cursor-pointer"
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
                  <td colSpan={4} className="p-8 text-center text-[#5a5a72] font-mono text-sm">
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
