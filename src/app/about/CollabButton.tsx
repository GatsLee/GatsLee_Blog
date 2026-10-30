"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, X } from "lucide-react";

const EMAIL = "naanthonylee@gmail.com";

// IA_AB_00102 협업 제안 모달. 폼 대신 메일로 받는다
export default function CollabButton() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-[100px] w-[100px] shrink-0 flex-col justify-between rounded-2xl bg-background p-3 text-left text-sm font-medium leading-[22px] text-foreground hover:ring-2 hover:ring-brand"
      >
        협업 제안은
        <br />
        여기로
        <ArrowUpRight size={22} className="self-end text-brand" />
      </button>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/45 px-4" onMouseDown={() => setOpen(false)}>
          <div
            role="dialog"
            aria-label="협업 제안"
            onMouseDown={(e) => e.stopPropagation()}
            className="w-full max-w-[480px] rounded-[20px] bg-background p-7 shadow-[0_24px_48px_rgba(0,0,0,0.18)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[22px] font-bold leading-[30px] text-foreground">협업 제안</p>
                <p className="mt-1 text-sm leading-[22px] text-secondary">
                  함께 만들고 싶은 서비스가 있다면 메일로 알려 주세요. 보통 이틀 안에 답장합니다.
                </p>
              </div>
              <button type="button" aria-label="닫기" onClick={() => setOpen(false)} className="text-secondary">
                <X size={20} />
              </button>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-surface-2 px-4 py-3.5">
              <span className="flex-1 text-[15px] font-medium text-foreground">{EMAIL}</span>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(EMAIL).then(() => setCopied(true))}
                className="text-[13px] font-bold text-brand"
              >
                {copied ? "복사했어요" : "복사"}
              </button>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setOpen(false)} className="h-10 rounded-lg border border-border px-4 text-sm font-bold text-foreground">
                닫기
              </button>
              <a href={`mailto:${EMAIL}?subject=${encodeURIComponent("[협업 제안] ")}`} className="inline-flex h-10 items-center rounded-lg bg-brand px-4 text-sm font-bold text-white">
                메일 쓰기
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
