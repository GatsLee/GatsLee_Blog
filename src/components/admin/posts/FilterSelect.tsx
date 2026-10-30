"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown } from "lucide-react";

export type FilterOption = { value: string; label: string; count?: number; href: string };

// 유닛_드롭다운 (IA_AD_00201 주제 · IA_AD_00202 정렬)
export default function FilterSelect({ label, value, options }: { label: string; value: string; options: FilterOption[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.value === value) ?? options[0];

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

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`flex h-10 w-[140px] items-center justify-between rounded-[10px] border bg-background px-3 text-[13px] text-foreground ${
          open ? "border-brand" : "border-border"
        }`}
      >
        <span className="truncate">{label ? `${label}: ${current.label}` : current.label}</span>
        <ChevronDown size={14} className="shrink-0 text-secondary" />
      </button>
      {open && (
        <ul role="listbox" className="absolute right-0 top-12 z-40 w-[180px] rounded-xl border border-border bg-background p-1.5 shadow-[0_12px_32px_rgba(24,25,27,0.12)]">
          {options.map((o) => (
            <li key={o.value}>
              <button
                type="button"
                role="option"
                aria-selected={o.value === current.value}
                onClick={() => {
                  setOpen(false);
                  router.push(o.href);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-[13px] hover:bg-surface ${
                  o.value === current.value ? "font-bold text-brand" : "text-foreground"
                }`}
              >
                {o.label}
                <span className="flex items-center gap-2 text-xs text-secondary">
                  {o.count !== undefined && o.count}
                  {o.value === current.value && <Check size={14} className="text-brand" />}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
