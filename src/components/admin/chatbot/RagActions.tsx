"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";
import { useToast } from "@/components/admin/ui/Toast";

// 이 글 다시 색인
export function ReindexPost({ postId, disabled }: { postId: number; disabled?: boolean }) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const run = async () => {
    setBusy(true);
    const res = await fetch(`/api/admin/rag/${postId}`, { method: "POST" }).catch(() => null);
    setBusy(false);
    if (res?.ok) {
      toast({ ok: true, message: `다시 색인했어요. 청크 ${(await res.json()).chunks}개.` });
      router.refresh();
    } else toast({ ok: false, message: "색인하지 못했어요. 모델 서버를 확인해 주세요.", retry: run });
  };
  return (
    <button type="button" onClick={run} disabled={busy || disabled} className="h-10 shrink-0 rounded-[10px] border border-border px-4 text-sm font-bold text-foreground hover:bg-surface disabled:opacity-50">
      {busy ? "색인 중…" : "이 글 다시 색인"}
    </button>
  );
}

// 비공개 글 청크 정리
export function CleanupOrphans({ count }: { count: number }) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const run = async () => {
    setOpen(false);
    const res = await fetch("/api/admin/rag/cleanup", { method: "POST" }).catch(() => null);
    if (res?.ok) {
      toast({ ok: true, message: `청크 ${(await res.json()).deleted}개를 정리했어요.` });
      router.refresh();
    } else toast({ ok: false, message: "정리하지 못했어요." });
  };
  if (!count) return null;
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="rounded-full bg-[#fdecea] px-2 py-0.5 text-[11px] font-bold text-danger hover:opacity-80">
        정리
      </button>
      <ConfirmDialog
        open={open}
        title="비공개 글 청크를 지울까요?"
        description={`공개하지 않은 글에 남은 청크 ${count}개를 지웁니다. 챗봇이 이 내용을 근거로 답하지 않게 됩니다.`}
        confirmLabel="정리"
        onConfirm={run}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
