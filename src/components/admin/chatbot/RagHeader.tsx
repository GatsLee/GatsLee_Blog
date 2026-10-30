"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import SubPageHeader from "@/components/admin/ui/SubPageHeader";
import { useToast } from "@/components/admin/ui/Toast";

type Job = { done: number; chunks: number; current: string; failed: string[] };

// IA_AD_00403 머리 + IA_AD_0040301 색인 중. 화면이 글마다 색인 API를 불러 진행을 보여준다
export default function RagHeader({ posts }: { posts: { id: number; title: string }[] }) {
  const router = useRouter();
  const toast = useToast();
  const [job, setJob] = useState<Job | null>(null);
  const stopped = useRef(false);

  useEffect(() => {
    if (!job) return;
    const onLeave = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, [job]);
  useEffect(
    () => () => {
      stopped.current = true;
    },
    []
  );

  const run = async () => {
    stopped.current = false;
    await fetch("/api/admin/rag/cleanup", { method: "POST" }).catch(() => null);
    const state: Job = { done: 0, chunks: 0, current: "", failed: [] };
    for (const p of posts) {
      if (stopped.current) return;
      state.current = p.title;
      setJob({ ...state });
      const res = await fetch(`/api/admin/rag/${p.id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ summary: true }) }).catch(() => null);
      if (res?.ok) state.chunks += (await res.json()).chunks ?? 0;
      else state.failed.push(p.title);
      state.done++;
      setJob({ ...state });
    }
    setJob(null);
    toast(
      state.failed.length
        ? { ok: false, message: `${state.failed.length}개 글을 색인하지 못했어요. 모델 서버를 확인해 주세요.` }
        : { ok: true, message: `${state.done}개 글을 다시 색인했어요. 청크 ${state.chunks}개.` }
    );
    router.refresh();
  };

  const pct = job ? Math.round((job.done / Math.max(1, posts.length)) * 100) : 0;

  return (
    <>
      <SubPageHeader parent={{ href: "/admin/chatbot", label: "AI 챗봇" }} title="RAG 관리" desc="챗봇이 답변 근거를 찾는 순서와, 글마다 어떤 청크로 나뉘었는지 확인합니다.">
        <button type="button" onClick={run} disabled={Boolean(job) || posts.length === 0} className="h-11 rounded-[10px] bg-brand px-5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50">
          {job ? "색인 중…" : "전체 다시 색인"}
        </button>
      </SubPageHeader>
      {job && (
        <section role="status" className="flex flex-col gap-3 rounded-3xl border border-brand/40 bg-brand-soft px-6 py-5">
          <div className="flex items-center justify-between gap-4">
            <p className="flex items-center gap-2 text-[15px] font-bold text-foreground">
              <Loader2 size={18} className="animate-spin text-brand" /> 전체 다시 색인 중
            </p>
            <p className="text-xs font-bold text-brand">
              {job.done} / {posts.length}개 글 · 청크 {job.chunks}개 만듦
            </p>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-background">
            <div className="h-full rounded-full bg-brand transition-[width]" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-xs text-secondary">지금 색인 중인 글: {job.current} · 이 화면을 닫으면 색인이 멈춥니다.</p>
        </section>
      )}
    </>
  );
}
