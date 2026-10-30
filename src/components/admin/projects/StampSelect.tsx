"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown } from "lucide-react";
import { STAMPS } from "@/lib/product";
import { useToast } from "@/components/admin/ui/Toast";

export const STAMP_TONE: Record<string, string> = {
  "기획 완료": "bg-[#fff4e5] text-warning",
  "개발 중": "bg-brand-soft text-brand",
  "운영 중": "bg-[#e6f7ee] text-success",
  "배포됨": "bg-[#e6f7ee] text-success",
};

// 유닛_도장 선택 (IA_AD_00302). 고르면 바로 저장된다
export default function StampSelect({ id, name, stamp }: { id: number; name: string; stamp: string }) {
  const router = useRouter();
  const toast = useToast();
  const [value, setValue] = useState(stamp);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", close);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const choose = async (next: string) => {
    setOpen(false);
    if (next === value) return;
    const before = value;
    setValue(next);
    const res = await fetch(`/api/admin/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stamp: next }),
    }).catch(() => null);
    if (res?.ok) {
      toast({ ok: true, message: `${name} 진행 단계를 바꿨어요: ${next}` });
      router.refresh();
    } else {
      setValue(before);
      toast({ ok: false, message: "진행 단계를 바꾸지 못했어요.", retry: () => choose(next) });
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`진행 단계: ${value || "없음"}`}
        onClick={() => setOpen((v) => !v)}
        className={`flex h-8 items-center gap-1 rounded-full border bg-background py-1 pl-1 pr-2 ${open ? "border-brand" : "border-border"}`}
      >
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${STAMP_TONE[value] ?? "bg-[#eef0f3] text-secondary"}`}>{value || "단계 없음"}</span>
        <ChevronDown size={14} className="text-secondary" />
      </button>
      {open && (
        <div className="absolute right-0 top-10 z-40 w-[220px] rounded-xl border border-border bg-background p-1.5 shadow-[0_12px_32px_rgba(24,25,27,0.12)]">
          <p className="px-3 pb-1 pt-2 text-[11px] font-medium text-secondary">진행 단계</p>
          <ul role="listbox">
            {STAMPS.map((s) => (
              <li key={s}>
                <button
                  type="button"
                  role="option"
                  aria-selected={s === value}
                  onClick={() => choose(s)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm ${
                    s === value ? "bg-brand-soft font-bold text-brand" : "text-foreground hover:bg-surface"
                  }`}
                >
                  {s}
                  {s === value && <Check size={14} />}
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-1 border-t border-border px-3 pb-1.5 pt-2.5 text-[11px] leading-4 text-muted">고르면 바로 저장되고 공개 화면에도 반영됩니다.</p>
        </div>
      )}
    </div>
  );
}
