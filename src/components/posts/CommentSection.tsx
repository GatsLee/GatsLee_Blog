"use client";

import { useState, useEffect } from "react";
import { MessageSquare } from "lucide-react";

interface Comment {
  id: number;
  author: string;
  content: string;
  createdAt: string;
}

export default function CommentSection({ postId }: { postId: number }) {
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
    <div className="mt-8 border-t border-[#2e2e4a] pt-8">
      <h3 className="text-lg font-bold text-[#d4d4dc] mb-6 flex items-center">
        <MessageSquare className="mr-2" size={18} />
        Comments ({comments.length})
      </h3>

      {/* Comment List */}
      <div className="space-y-4 mb-8">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="border-l-2 border-[#2e2e4a] pl-4 py-2"
          >
            <div className="flex items-baseline gap-3 mb-1">
              <span className="text-[#d4a054] text-xs font-bold font-mono">
                [{comment.author}]
              </span>
              <span className="text-[10px] text-[#5a5a72] font-mono">
                {new Date(comment.createdAt).toLocaleString()}
              </span>
            </div>
            <p className="text-[#b0b0bc] text-sm">{comment.content}</p>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-[#5a5a72] text-sm font-mono">No comments yet.</p>
        )}
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs text-[#8888a0] mb-2 font-mono uppercase">
            Name (optional)
          </label>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-full bg-[#1a1a2e] border border-[#2e2e4a] rounded p-3 text-[#d4d4dc] focus:border-[#d4a054] focus:outline-none transition-colors placeholder-[#3a3a52] text-sm"
            placeholder="guest"
          />
        </div>
        <div>
          <label className="block text-xs text-[#8888a0] mb-2 font-mono uppercase">
            Comment
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-24 bg-[#1a1a2e] border border-[#2e2e4a] rounded p-3 text-[#b0b0bc] focus:border-[#d4a054] focus:outline-none transition-colors font-mono text-sm placeholder-[#3a3a52]"
            placeholder="Leave a comment..."
          />
        </div>
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="bg-[#d4a054] hover:bg-[#c49544] text-[#1a1a2e] font-bold py-2 px-6 text-xs transition-colors uppercase tracking-wider rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Sending..." : "Submit"}
        </button>
      </form>
    </div>
  );
}
