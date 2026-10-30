"use client";

import { useEffect, useState } from "react";

type Note = { n: string; html: string; top: number };

// D1 여백 각주. remark-gfm이 글 끝에 모은 각주를 넓은 화면에서는 본문 참조 높이에 맞춰 오른쪽 여백으로 옮긴다.
// 좁은 화면에서는 아무것도 그리지 않고 글 끝 각주를 그대로 둔다.
export default function MarginFootnotes({ articleId }: { articleId: string }) {
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    const article = document.getElementById(articleId);
    if (!article) return;
    const layout = () => {
      const base = article.getBoundingClientRect().top;
      let lastBottom = 0;
      const next: Note[] = [];
      article.querySelectorAll<HTMLAnchorElement>("a[data-footnote-ref]").forEach((ref) => {
        const id = ref.getAttribute("href")?.slice(1);
        const li = id ? document.getElementById(id) : null;
        if (!li) return;
        const clone = li.cloneNode(true) as HTMLElement;
        clone.querySelectorAll("[data-footnote-backref]").forEach((b) => b.remove());
        const top = Math.max(ref.getBoundingClientRect().top - base, lastBottom);
        lastBottom = top + 96; // 각주끼리 겹치지 않게 최소 간격
        next.push({ n: ref.textContent ?? "", html: clone.innerHTML, top });
      });
      setNotes(next);
    };
    const raf = requestAnimationFrame(layout);
    window.addEventListener("resize", layout);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", layout);
    };
  }, [articleId]);

  if (notes.length === 0) return null;
  return (
    <div className="relative h-full">
      {notes.map((note) => (
        <div key={note.n} className="absolute left-0 right-0 flex gap-2.5 pl-3" style={{ top: note.top }}>
          <span className="text-sm font-medium leading-[23px] text-brand">{note.n})</span>
          <div className="text-sm leading-[23px] text-secondary [&_a]:text-brand [&_p]:m-0" dangerouslySetInnerHTML={{ __html: note.html }} />
        </div>
      ))}
    </div>
  );
}
