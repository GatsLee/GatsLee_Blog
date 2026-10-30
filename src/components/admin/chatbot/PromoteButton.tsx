"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/admin/ui/Toast";

// 대화의 첫 질문과 답을 FAQ 후보로 만든 뒤 FAQ 관리에서 연다
export default function PromoteButton({ question, answer, messageId }: { question: string; answer: string; messageId?: number }) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  const promote = async () => {
    setBusy(true);
    const res = await fetch("/api/admin/faq", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qVariants: [question.slice(0, 200)], a_ko: answer, source: "promoted", promotedFromMessageId: messageId ?? null }),
    }).catch(() => null);
    setBusy(false);
    if (!res?.ok) return toast({ ok: false, message: "후보로 올리지 못했어요." });
    const { id } = await res.json();
    toast({ ok: true, message: "FAQ 후보로 올렸어요. 답을 다듬고 저장하세요." });
    router.push(`/admin/chatbot/faq?id=${id}`);
  };

  return (
    <button
      type="button"
      onClick={promote}
      disabled={busy || !question || !answer}
      className="h-10 shrink-0 rounded-[10px] border border-border px-4 text-sm font-bold text-foreground hover:bg-surface disabled:opacity-50"
    >
      FAQ 후보로 올리기
    </button>
  );
}
