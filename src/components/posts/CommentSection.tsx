"use client";

import { useState, useEffect } from "react";
import { MessageSquare } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface Comment {
  id: number;
  author: string;
  content: string;
  createdAt: string;
}

export default function CommentSection({ postId }: { postId: number }) {
  const { t } = useLanguage();
  const [comments, setComments] = useState<Comment[]>([]);
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/comments?postId=${postId}`)
      .then((r) => r.json())
      .then(setComments)
      .catch(() => {});
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          author: author || `guest_${Math.floor(Math.random() * 89) + 10}`,
          content,
        }),
      });

      if (res.ok) {
        const newComment = await res.json();
        setComments((prev) => [...prev, newComment]);
        setContent("");
      }
    } catch {
      // Handle error silently
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 border-t border-border pt-8">
      <h3 className="text-lg font-bold text-foreground mb-6 flex items-center">
        <MessageSquare className="mr-2" size={18} />
        {t.post.comments} ({comments.length})
      </h3>

      {/* Comment List */}
      <div className="space-y-4 mb-8">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="border-l-2 border-border pl-4 py-2"
          >
            <div className="flex items-baseline gap-3 mb-1">
              <span className="text-accent text-xs font-bold font-mono">
                [{comment.author}]
              </span>
              <span className="text-xs text-muted font-mono">
                {new Date(comment.createdAt).toLocaleString()}
              </span>
            </div>
            <p className="text-secondary text-sm">{comment.content}</p>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-muted text-sm font-mono">{t.post.noComments}</p>
        )}
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs text-muted mb-2 font-mono uppercase">
            {t.post.nameOptional}
          </label>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-full bg-surface border border-border rounded p-3 text-base text-foreground focus:border-accent focus:outline-none transition-colors placeholder-muted"
            placeholder="guest"
          />
        </div>
        <div>
          <label className="block text-xs text-muted mb-2 font-mono uppercase">
            {t.post.comments}
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-24 bg-surface border border-border rounded p-3 text-base text-secondary focus:border-accent focus:outline-none transition-colors font-mono placeholder-muted"
            placeholder={t.post.commentPlaceholder}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="bg-accent hover:bg-accent/90 text-white font-bold py-2.5 px-6 text-sm transition-colors uppercase tracking-wider rounded disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95"
        >
          {loading ? t.post.sending : t.post.submitComment}
        </button>
      </form>
    </div>
  );
}
