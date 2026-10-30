"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, Upload, X } from "lucide-react";
import type { ResumeLocale, ResumePdf } from "@/lib/resume";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";

export type ResumeState = Record<ResumeLocale, ResumePdf | null>;

const LANGS: { key: ResumeLocale; label: string; tag: string }[] = [
  { key: "ko", label: "한국어", tag: "KOR" },
  { key: "en", label: "English", tag: "EN" },
];

function sizeText(bytes: number) {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)}MB` : `${Math.max(1, Math.round(bytes / 1024))}KB`;
}

// 유닛_이력서버튼 + IA_AD_005 이력서 모달 (업로드 오류 IA_AD_00501)
export default function ResumeModal({ initial }: { initial: ResumeState }) {
  const [files, setFiles] = useState<ResumeState>(initial);
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<ResumeLocale>("ko");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const current = files[lang];

  const upload = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) return setMessage({ ok: false, text: "10MB 이하 PDF만 올릴 수 있어요." });
    if (!file.name.toLowerCase().endsWith(".pdf")) return setMessage({ ok: false, text: "PDF 파일만 올릴 수 있어요." });
    setBusy(true);
    setMessage(null);
    const form = new FormData();
    form.append("locale", lang);
    form.append("file", file);
    try {
      const res = await fetch("/api/admin/resume/pdf", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setFiles((f) => ({ ...f, [lang]: data }));
      setMessage({ ok: true, text: "새 PDF로 바꿨어요. 헤더의 이력서 버튼이 이 파일을 엽니다." });
    } catch (e) {
      setMessage({ ok: false, text: e instanceof Error && e.message ? e.message : "올리지 못했어요. 다시 시도해 주세요." });
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setConfirming(false);
    if (!current) return;
    const res = await fetch(`/api/admin/resume/pdf?locale=${lang}`, { method: "DELETE" });
    if (res.ok) {
      setFiles((f) => ({ ...f, [lang]: null }));
      setMessage({ ok: true, text: "삭제했어요." });
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2.5 rounded-xl border border-border bg-background px-3 py-2.5 text-left hover:border-brand"
      >
        <FileText size={18} className="text-secondary" />
        <span className="flex-1 text-sm font-medium text-foreground">이력서</span>
        {LANGS.map((l) => (
          <span
            key={l.key}
            className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${files[l.key] ? "bg-[#e6f7ee] text-success" : "bg-[#eef0f3] text-muted"}`}
          >
            {l.tag}
          </span>
        ))}
      </button>

      {open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-foreground/40 px-4" onMouseDown={() => setOpen(false)}>
          <div
            role="dialog"
            aria-label="이력서"
            onMouseDown={(e) => e.stopPropagation()}
            className="flex w-full max-w-[560px] flex-col gap-5 rounded-[20px] bg-background p-6 shadow-[0_24px_48px_rgba(24,25,27,0.18)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xl font-bold leading-7 text-foreground">이력서</p>
                <p className="mt-1 text-[13px] text-secondary">블로그 헤더의 이력서 버튼을 누르면 이 PDF가 새 탭에서 열립니다.</p>
              </div>
              <button type="button" aria-label="닫기" onClick={() => setOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-lg text-secondary hover:bg-surface">
                <X size={18} />
              </button>
            </div>

            <div className="flex w-fit gap-0.5 rounded-[10px] bg-[#eef1f8] p-[3px]">
              {LANGS.map((l) => (
                <button
                  key={l.key}
                  type="button"
                  onClick={() => {
                    setLang(l.key);
                    setMessage(null);
                  }}
                  className={`h-9 rounded-lg px-3.5 text-[13px] ${lang === l.key ? "bg-background font-bold text-brand shadow-sm" : "font-medium text-secondary"}`}
                >
                  {l.label}
                </button>
              ))}
            </div>

            {current ? (
              <div className="flex items-center gap-3 rounded-xl bg-surface-2 p-3.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-brand-soft text-[11px] font-bold text-brand">PDF</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-foreground">{current.name}</span>
                  <span className="block text-xs text-secondary">
                    {new Date(current.uploadedAt).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })} 올림 · {sizeText(current.size)}
                  </span>
                </span>
                <a href={current.url} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-brand">
                  새 탭에서 보기
                </a>
                <button type="button" onClick={() => setConfirming(true)} className="text-xs font-medium text-muted hover:text-danger">
                  삭제
                </button>
              </div>
            ) : (
              <p className="rounded-xl bg-surface-2 p-3.5 text-sm text-secondary">아직 올린 PDF가 없어요. 지금은 예전 이력서 페이지가 보입니다.</p>
            )}

            <button
              type="button"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                upload(e.dataTransfer.files[0]);
              }}
              className={`flex flex-col items-center gap-1.5 rounded-xl border-[1.5px] border-dashed py-7 ${
                dragging ? "border-brand bg-brand-soft" : "border-[#b9c6ea] bg-surface-2"
              } disabled:opacity-60`}
            >
              <Upload size={22} className="text-brand" />
              <span className="text-[13px] font-medium text-brand">{busy ? "올리는 중…" : current ? "새 PDF를 끌어오거나 클릭해 올리세요" : "PDF를 끌어오거나 클릭해 올리세요"}</span>
              <span className="text-xs text-secondary">최대 10MB{current ? " · 올리면 지금 파일을 대신합니다" : ""}</span>
            </button>
            <input ref={inputRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={(e) => upload(e.target.files?.[0])} />

            {message && (
              <p role="status" className={`text-sm ${message.ok ? "text-success" : "text-danger"}`}>
                {message.text}
              </p>
            )}

            <ConfirmDialog
              open={confirming}
              title={`${LANGS.find((l) => l.key === lang)!.label} 이력서를 삭제할까요?`}
              description="삭제하면 헤더의 이력서 버튼이 예전 이력서 페이지를 엽니다."
              onConfirm={remove}
              onCancel={() => setConfirming(false)}
            />

            <div className="flex justify-end">
              <button type="button" onClick={() => setOpen(false)} className="h-10 rounded-lg border border-border px-4 text-sm font-bold text-foreground">
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
