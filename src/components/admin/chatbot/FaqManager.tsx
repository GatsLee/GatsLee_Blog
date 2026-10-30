"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Trash2, X } from "lucide-react";
import Switch from "@/components/admin/ui/Switch";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";
import { useToast } from "@/components/admin/ui/Toast";
import SubPageHeader from "@/components/admin/ui/SubPageHeader";

export interface FaqItem {
  id: number | null;
  key: string;
  question: string;
  variants: string[];
  a_ko: string;
  a_en: string;
  isActive: boolean;
  source: string;
  clicks: number;
}

const MAX = 5;

const textarea =
  "w-full resize-y rounded-[10px] border border-border bg-background px-3.5 py-3 text-sm leading-6 text-foreground outline-none placeholder:text-muted focus:border-brand";

// IA_AD_00401 FAQ 관리 · 0040101 후보 추가
export default function FaqManager({
  initial,
  featuredKeys,
  selectedKey,
}: {
  initial: FaqItem[];
  featuredKeys: string[];
  selectedKey?: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [items, setItems] = useState<FaqItem[]>(initial);
  const [featured, setFeatured] = useState<string[]>(featuredKeys);
  const [selected, setSelected] = useState<string>(selectedKey ?? featuredKeys[0] ?? initial[0]?.key ?? "");
  const [dirty, setDirty] = useState<Set<string>>(() => new Set());
  const [orderDirty, setOrderDirty] = useState(false);
  const [variantInput, setVariantInput] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState<FaqItem | null>(null);

  const byKey = useMemo(() => new Map(items.map((i) => [i.key, i])), [items]);
  const featuredItems = featured.map((k) => byKey.get(k)).filter((x): x is FaqItem => Boolean(x));
  const candidates = items.filter((i) => !featured.includes(i.key));
  const current = byKey.get(selected);
  const changed = dirty.size > 0 || orderDirty;

  useEffect(() => {
    const onLeave = (e: BeforeUnloadEvent) => {
      if (changed) e.preventDefault();
    };
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, [changed]);

  const update = (key: string, patch: Partial<FaqItem>) => {
    setItems((list) => list.map((i) => (i.key === key ? { ...i, ...patch } : i)));
    setDirty((d) => new Set(d).add(key));
  };
  const promote = (key: string) => {
    setFeatured((f) => (f.length >= MAX || f.includes(key) ? f : [...f, key]));
    setOrderDirty(true);
  };
  const demote = (key: string) => {
    setFeatured((f) => f.filter((k) => k !== key));
    setOrderDirty(true);
  };
  const addCandidate = () => {
    const key = `new-${Date.now()}`;
    setItems((list) => [{ id: null, key, question: "", variants: [], a_ko: "", a_en: "", isActive: true, source: "manual", clicks: 0 }, ...list]);
    setDirty((d) => new Set(d).add(key));
    setSelected(key);
  };

  const remove = async () => {
    const target = removing;
    setRemoving(null);
    if (!target) return;
    if (target.id !== null) {
      const res = await fetch(`/api/admin/faq/${target.id}`, { method: "DELETE" }).catch(() => null);
      if (!res?.ok) return toast({ ok: false, message: "삭제하지 못했어요." });
    }
    setItems((list) => list.filter((i) => i.key !== target.key));
    setFeatured((f) => f.filter((k) => k !== target.key));
    setDirty((d) => {
      const n = new Set(d);
      n.delete(target.key);
      return n;
    });
    if (selected === target.key) setSelected(featured[0] ?? "");
    toast({ ok: true, message: "후보를 삭제했어요." });
  };

  const save = async () => {
    const invalid = items.find((i) => dirty.has(i.key) && (!i.question.trim() || !i.a_ko.trim()));
    if (invalid) {
      setSelected(invalid.key);
      return toast({ ok: false, message: "대표 질문과 한국어 답변을 채워 주세요." });
    }
    setSaving(true);
    try {
      const ids = new Map(items.map((i) => [i.key, i.id]));
      for (const i of items.filter((x) => dirty.has(x.key))) {
        const body = { qVariants: [i.question.trim(), ...i.variants], a_ko: i.a_ko, a_en: i.a_en, isActive: i.isActive, source: i.source };
        const res = await fetch(i.id === null ? "/api/admin/faq" : `/api/admin/faq/${i.id}`, {
          method: i.id === null ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error();
        if (i.id === null) ids.set(i.key, (await res.json()).id);
      }
      if (orderDirty || items.some((i) => i.id === null && featured.includes(i.key))) {
        const res = await fetch("/api/admin/faq/featured", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: featured.map((k) => ids.get(k)).filter((v) => typeof v === "number") }),
        });
        if (!res.ok) throw new Error();
      }
      setItems((list) => list.map((i) => ({ ...i, id: ids.get(i.key) ?? i.id })));
      setDirty(new Set());
      setOrderDirty(false);
      toast({ ok: true, message: "FAQ를 저장했어요. 챗봇에 바로 반영됩니다." });
      router.refresh();
    } catch {
      toast({ ok: false, message: "저장하지 못했어요. 다시 시도해 주세요.", retry: save });
    } finally {
      setSaving(false);
    }
  };

  const rowBtn = "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-foreground hover:border-brand hover:text-brand disabled:text-muted disabled:hover:border-border";
  const featuredIndex = current ? featured.indexOf(current.key) : -1;

  return (
    <>
      <SubPageHeader parent={{ href: "/admin/chatbot", label: "AI 챗봇" }} title="FAQ" desc="최대 5개. 챗봇 패널의 추천 질문이자, 비슷한 질문에 바로 답하는 기준입니다.">
        <button type="button" onClick={save} disabled={saving || !changed} className="h-11 rounded-[10px] bg-brand px-5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50">
          {saving ? "저장 중…" : "저장"}
        </button>
      </SubPageHeader>
      <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-start">
        <div className="flex flex-col gap-4 lg:w-[380px] lg:shrink-0">
          <section className="flex flex-col gap-2 rounded-3xl border border-border bg-background p-5">
            <div className="mb-1 flex items-center justify-between">
              <h2 className="text-[17px] font-bold text-foreground">FAQ 목록</h2>
              <span className="rounded-full bg-surface px-2.5 py-1 text-xs font-bold text-secondary">
                {featured.length} / {MAX}
              </span>
            </div>
            {featuredItems.length === 0 && <p className="py-6 text-center text-sm text-secondary">후보에서 위 화살표로 올려 주세요.</p>}
            {featuredItems.map((f, i) => (
              <div
                key={f.key}
                className={`flex items-center gap-3 rounded-2xl border px-3 py-3 ${selected === f.key ? "border-brand" : "border-transparent hover:bg-surface"}`}
              >
                <button type="button" onClick={() => setSelected(f.key)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">{i + 1}</span>
                  <span className={`min-w-0 flex-1 truncate text-sm font-bold ${f.isActive ? "text-foreground" : "text-muted"}`}>{f.question || "새 질문"}</span>
                  <span className="shrink-0 text-xs text-secondary">클릭 {f.clicks}회</span>
                </button>
                <button type="button" aria-label={`${f.question} 후보로 내리기`} onClick={() => demote(f.key)} className={rowBtn}>
                  <ArrowDown size={16} />
                </button>
              </div>
            ))}
          </section>

          <section className="flex flex-col gap-2 rounded-3xl border border-border bg-background p-5">
            <div className="mb-1 flex items-center justify-between">
              <h2 className="text-[17px] font-bold text-foreground">후보</h2>
              <button type="button" onClick={addCandidate} className="h-10 rounded-[10px] border border-border px-4 text-sm font-bold text-foreground hover:bg-surface">
                후보 추가
              </button>
            </div>
            {candidates.length === 0 && <p className="py-6 text-center text-sm text-secondary">후보가 없어요.</p>}
            <ul className="max-h-[480px] overflow-y-auto">
              {candidates.map((c) => (
                <li key={c.key} className={`flex items-center gap-2 border-b border-border px-1 py-3 last:border-0 ${selected === c.key ? "rounded-xl bg-brand-soft" : ""}`}>
                  <button type="button" onClick={() => setSelected(c.key)} className="min-w-0 flex-1 truncate px-2 text-left text-sm text-foreground">
                    {c.question || <span className="text-muted">새 후보</span>}
                  </button>
                  <button
                    type="button"
                    aria-label={`${c.question} FAQ로 올리기`}
                    title={featured.length >= MAX ? "FAQ가 5개라 올릴 수 없어요" : "FAQ로 올리기"}
                    disabled={featured.length >= MAX}
                    onClick={() => promote(c.key)}
                    className={rowBtn}
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button type="button" aria-label={`${c.question} 삭제`} onClick={() => setRemoving(c)} className={`${rowBtn} hover:!border-danger hover:!text-danger`}>
                    <Trash2 size={15} />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {current ? (
          <section className="flex flex-1 flex-col gap-5 rounded-3xl border border-border bg-background p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[20px] font-bold text-foreground">{featuredIndex >= 0 ? `${featuredIndex + 1}번 FAQ` : current.id === null ? "새 후보" : "후보"}</h2>
                <p className="mt-1 text-xs text-secondary">
                  클릭 {current.clicks}회 · 출처 {current.source}
                </p>
              </div>
              <label className="flex items-center gap-2 text-xs text-secondary">
                {current.isActive ? "사용 중" : "쉬는 중"}
                <Switch checked={current.isActive} onChange={(v) => update(current.key, { isActive: v })} label="사용" />
              </label>
            </div>

            <label className="flex flex-col gap-2">
              <span className="text-[13px] font-bold text-foreground">대표 질문</span>
              <input
                value={current.question}
                onChange={(e) => update(current.key, { question: e.target.value })}
                placeholder="예: Gats Lee가 누구인가요?"
                className="h-12 rounded-[10px] border border-border bg-background px-3.5 text-[15px] text-foreground outline-none placeholder:text-muted focus:border-brand"
              />
              <span className="text-xs text-secondary">챗봇 패널에 추천 질문으로 보이는 문장입니다.</span>
            </label>

            <div className="flex flex-col gap-2">
              <span className="text-[13px] font-bold text-foreground">변형 질문</span>
              <div className="flex flex-wrap gap-2">
                {current.variants.map((v) => (
                  <span key={v} className="flex h-9 items-center gap-2 rounded-full border border-border bg-surface-2 px-3.5 text-[13px] text-foreground">
                    {v}
                    <button type="button" aria-label={`${v} 빼기`} onClick={() => update(current.key, { variants: current.variants.filter((x) => x !== v) })} className="text-muted hover:text-danger">
                      <X size={12} />
                    </button>
                  </span>
                ))}
                {variantInput === null ? (
                  <button type="button" onClick={() => setVariantInput("")} className="h-9 rounded-full border border-dashed border-brand px-3.5 text-[13px] text-brand">
                    + 추가
                  </button>
                ) : (
                  <input
                    autoFocus
                    value={variantInput}
                    onChange={(e) => setVariantInput(e.target.value)}
                    onBlur={() => setVariantInput(null)}
                    onKeyDown={(e) => {
                      if (e.nativeEvent.isComposing) return;
                      if (e.key === "Enter" && variantInput.trim()) {
                        e.preventDefault();
                        if (!current.variants.includes(variantInput.trim())) update(current.key, { variants: [...current.variants, variantInput.trim()] });
                        setVariantInput("");
                      }
                      if (e.key === "Escape") setVariantInput(null);
                    }}
                    placeholder="입력 후 Enter"
                    aria-label="변형 질문 추가"
                    className="h-9 w-48 rounded-full border border-brand bg-background px-3.5 text-[13px] outline-none"
                  />
                )}
              </div>
              <span className="text-xs text-secondary">이 문장들과 비슷한 질문이 들어오면 아래 답을 씁니다.</span>
            </div>

            <label className="flex flex-col gap-2">
              <span className="text-[13px] font-bold text-foreground">답변 (한국어)</span>
              <textarea className={textarea} rows={4} value={current.a_ko} onChange={(e) => update(current.key, { a_ko: e.target.value })} />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-[13px] font-bold text-foreground">답변 (English)</span>
              <textarea className={textarea} rows={4} value={current.a_en} onChange={(e) => update(current.key, { a_en: e.target.value })} placeholder="비우면 한국어 답을 씁니다." />
            </label>

            {featuredIndex >= 0 && (
              <button type="button" onClick={() => demote(current.key)} className="self-end text-xs text-muted hover:text-danger">
                FAQ에서 빼기
              </button>
            )}
          </section>
        ) : (
          <p className="flex-1 rounded-3xl border border-border bg-background py-16 text-center text-sm text-secondary">왼쪽에서 FAQ를 고르세요.</p>
        )}
      </div>

      <ConfirmDialog
        open={removing !== null}
        title="후보를 삭제할까요?"
        description={
          <>
            <b className="text-foreground">{removing?.question || "새 후보"}</b>
            <br />
            삭제하면 이 질문으로 들어오던 답변 매칭도 사라져요.
          </>
        }
        onConfirm={remove}
        onCancel={() => setRemoving(null)}
      />
    </>
  );
}
