"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import CommentSection from "@/components/posts/CommentSection";

// IA_PD_002 접힌 댓글 · IA_PD_00202 펼침
export default function ProjectComments({ productId }: { productId: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-border">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-6 py-5 text-left text-xl font-bold text-foreground"
      >
        댓글
        <ChevronDown size={20} className={`text-brand transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-6 pb-6">
          <CommentSection productId={productId} hideHeading />
        </div>
      )}
    </div>
  );
}
