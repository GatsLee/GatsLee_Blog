"use client";

import { useState } from "react";
import { Check, Link2, Printer } from "lucide-react";

// 글 상세 작성일 옆 링크 복사 · 인쇄(PDF 저장)
export default function PostTools() {
  const [copied, setCopied] = useState(false);
  const btn = "group relative flex h-10 w-10 items-center justify-center rounded-lg text-foreground hover:bg-surface";
  return (
    <div className="flex print:hidden">
      <button
        type="button"
        aria-label="링크 복사"
        className={btn}
        onClick={() =>
          navigator.clipboard.writeText(window.location.href).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
          })
        }
      >
        {copied ? <Check size={20} className="text-success" /> : <Link2 size={20} strokeWidth={1.8} />}
      </button>
      <button type="button" aria-label="인쇄·PDF 저장" className={btn} onClick={() => window.print()}>
        <Printer size={20} strokeWidth={1.8} />
      </button>
    </div>
  );
}
