"use client";

import { useEffect } from "react";
import { Trash2 } from "lucide-react";

// IA_AD_00701 삭제 확인 모달
export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "삭제",
  busy = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-foreground/40 px-4" onMouseDown={onCancel}>
      <div
        role="alertdialog"
        aria-label={title}
        onMouseDown={(e) => e.stopPropagation()}
        className="flex w-full max-w-[440px] flex-col gap-4 rounded-[20px] bg-background p-7 shadow-[0_24px_48px_rgba(0,0,0,0.18)]"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#fdecec] text-danger">
          <Trash2 size={22} />
        </span>
        <p className="text-xl font-bold leading-7 text-foreground">{title}</p>
        <p className="text-sm leading-[22px] text-secondary">{description}</p>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="h-10 rounded-lg border border-border px-4 text-sm font-bold text-foreground">
            취소
          </button>
          <button type="button" disabled={busy} onClick={onConfirm} className="h-10 rounded-lg bg-danger px-4 text-sm font-bold text-white disabled:opacity-60">
            {busy ? "삭제 중…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
