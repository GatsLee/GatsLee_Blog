"use client";

import { useState, useEffect } from "react";
import { dotDate } from "@/lib/format";

interface Comment {
  id: number;
  author: string;
  content: string;
  createdAt: string;
}

// 글쓴이가 단 댓글에 붙는 표시
const AUTHOR_NAMES = ["이준열", "Gats Lee", "gatslee"];

// IA_PS_002 댓글 0 · IA_PS_00201 댓글 있음 · IA_PS_00202 등록 오류 · IA_PD_00202 프로젝트 댓글
export default function CommentSection({
  postId,
  productId,
  hideHeading = false,
}: {
  postId?: number;
  productId?: number;
  // 접이식 상자 안에서는 상자 머리가 제목 역할을 한다
  hideHeading?: boolean;
}) {
  const target = postId ? { postId } : { productId };
  const query = postId ? `postId=${postId}` : `productId=${productId}`;
  const [comments, setComments] = useState<Comment[]>([]);
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/comments?${query}`)
      .then((r) => r.json())
      .then(setComments)
      .catch(() => {});
  }, [query]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...target,
          author: author.trim() || `guest_${Math.floor(Math.random() * 89) + 10}`,
          content,
        }),
      });
      if (res.ok) {
        const created = await res.json();
        setComments((prev) => [...prev, created]);
        setContent("");
      } else if (res.status === 429) {
        setError("댓글을 너무 자주 남겼어요. 1분 뒤에 다시 시도해 주세요.");
      } else {
        setError("댓글을 등록하지 못했어요. 내용을 확인하고 다시 시도해 주세요.");
      }
    } catch {
      setError("네트워크 문제로 댓글을 등록하지 못했어요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="print:hidden">
      {!hideHeading && <h2 className="text-[26px] font-bold leading-[38px] text-foreground">댓글 {comments.length}</h2>}
      <p className="mt-1 text-base leading-[26px] text-secondary">궁금한 점이나 다른 경험이 있다면 남겨주세요.</p>

      {comments.length > 0 && (
        <ul className="mt-6 border-t border-border">
          {comments.map((c) => (
            <li key={c.id} className="border-b border-border py-4">
              <div className="flex items-center gap-2">
                <span className="text-[15px] font-bold text-foreground">{c.author}</span>
                {AUTHOR_NAMES.includes(c.author) && (
                  <span className="rounded-md bg-brand-soft px-1.5 py-0.5 text-[11px] font-bold text-brand">글쓴이</span>
                )}
                <span className="text-[13px] text-muted">{dotDate(c.createdAt)}</span>
              </div>
              <p className="mt-1.5 whitespace-pre-wrap text-base leading-[26px] text-foreground">{c.content}</p>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="댓글을 입력하세요."
          rows={4}
          maxLength={2000}
          className="w-full resize-y rounded-lg border border-border bg-background p-4 text-base text-foreground outline-none placeholder:text-secondary focus:border-brand"
        />
        <div className="flex items-center justify-between gap-3">
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="이름 (선택)"
            maxLength={40}
            className="h-10 w-40 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none placeholder:text-secondary focus:border-brand"
          />
          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="h-10 rounded-lg bg-brand px-4 text-sm font-medium text-white disabled:opacity-40"
          >
            {loading ? "등록 중…" : "댓글 등록"}
          </button>
        </div>
        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}
      </form>
    </section>
  );
}
