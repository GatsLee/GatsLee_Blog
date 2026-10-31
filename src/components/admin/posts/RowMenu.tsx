"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";
import { useToast } from "@/components/admin/ui/Toast";

// IA_AD_00205 행 메뉴. 편집 · 미리보기 · 숨기기(숨김이면 다시 발행) · 삭제
export default function RowMenu({ id, title, status, previewHref }: { id: number; title: string; status: string; previewHref: string }) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const setStatus = async (next: "hidden" | "published") => {
    setOpen(false);
    const res = await fetch(`/api/posts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    }).catch(() => null);
    if (res?.ok) {
      toast({ ok: true, message: next === "hidden" ? "포스트를 숨겼어요." : "포스트를 다시 발행했어요." });
      router.refresh();
    } else {
      toast({ ok: false, message: "상태를 바꾸지 못했어요.", retry: () => setStatus(next) });
    }
  };

  const remove = async () => {
    setBusy(true);
    const res = await fetch(`/api/posts/${id}`, { method: "DELETE" }).catch(() => null);
    setBusy(false);
    setConfirming(false);
    if (res?.ok) {
      toast({ ok: true, message: "포스트를 삭제했어요." });
      router.refresh();
    } else {
      toast({ ok: false, message: "삭제하지 못했어요.", retry: remove });
    }
  };

  const item = "block w-full rounded-lg px-3 py-2.5 text-left text-[13px] font-medium hover:bg-surface";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={`${title} 메뉴`}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-secondary hover:bg-surface"
      >
        <MoreHorizontal size={18} />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-9 z-40 w-[180px] rounded-xl border border-border bg-background p-1.5 shadow-[0_12px_32px_rgba(24,25,27,0.12)]">
          <Link role="menuitem" href={`/write/edit/${id}`} className={`${item} text-foreground`}>
            편집
          </Link>
          <a role="menuitem" href={previewHref} target="_blank" rel="noopener noreferrer" className={`${item} text-foreground`}>
            미리보기
          </a>
          {status === "hidden" ? (
            <button role="menuitem" type="button" onClick={() => setStatus("published")} className={`${item} text-foreground`}>
              다시 발행
            </button>
          ) : (
            status === "published" && (
              <button role="menuitem" type="button" onClick={() => setStatus("hidden")} className={`${item} text-foreground`}>
                숨기기
              </button>
            )
          )}
          <div className="my-1 border-t border-border" />
          <button
            role="menuitem"
            type="button"
            onClick={() => {
              setOpen(false);
              setConfirming(true);
            }}
            className={`${item} text-danger`}
          >
            삭제
          </button>
        </div>
      )}
      <ConfirmDialog
        open={confirming}
        busy={busy}
        title="포스트를 삭제할까요?"
        description={
          <>
            <b className="text-foreground">{title}</b>
            <br />
            삭제한 포스트와 댓글은 되돌릴 수 없어요. 잠시 내리려면 숨기기를 쓰세요.
          </>
        }
        onConfirm={remove}
        onCancel={() => setConfirming(false)}
      />
    </div>
  );
}
