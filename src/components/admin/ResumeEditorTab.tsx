"use client";

import { useState, useEffect } from "react";
import { Save, Plus, Trash2, ChevronDown, ExternalLink } from "lucide-react";
import type { ResumeData, ResumeExperience } from "@/data/resume";

function Section({
  title,
  hint,
  children,
  defaultOpen = true,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-surface cursor-pointer"
      >
        <div className="text-left">
          <span className="font-heading text-sm font-bold">{title}</span>
          {hint && <p className="text-[11px] text-muted/70 mt-0.5">{hint}</p>}
        </div>
        <ChevronDown
          size={16}
          className={`text-muted transition-transform shrink-0 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="px-4 py-4 space-y-3">{children}</div>}
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  multiline = false,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  placeholder?: string;
}) {
  const cls =
    "w-full bg-background border border-border px-3 py-2 text-sm text-foreground rounded focus:border-foreground outline-none placeholder:text-muted/40";
  return (
    <div>
      <label className="editorial-label text-muted block mb-1">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={2}
          placeholder={placeholder}
          className={cls}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cls}
        />
      )}
    </div>
  );
}

/** Editable list of plain strings (summary bullets, skill lines). */
function StringList({
  items,
  onChange,
  placeholder,
  addLabel,
}: {
  items: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  addLabel: string;
}) {
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2">
          <textarea
            value={item}
            onChange={(e) => onChange(items.map((x, j) => (i === j ? e.target.value : x)))}
            rows={2}
            placeholder={placeholder}
            className="flex-1 bg-background border border-border px-3 py-2 text-sm text-foreground rounded focus:border-foreground outline-none placeholder:text-muted/40"
          />
          <button
            onClick={() => onChange(items.filter((_, j) => j !== i))}
            className="p-2 text-muted hover:text-red-500 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button
        onClick={() => onChange([...items, ""])}
        className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors"
      >
        <Plus size={14} />
        <span>{addLabel}</span>
      </button>
    </div>
  );
}

const DEFAULT_DATA: ResumeData = {
  name: "",
  headline: "",
  contact: { email: "", github: "", blog: "", linkedin: "" },
  summary: [],
  pmSkills: [],
  techSkills: [],
  experience: [],
  stack: [],
  education: [],
};

export default function ResumeEditorTab() {
  const [locale, setLocale] = useState<"ko" | "en">("ko");
  const [data, setData] = useState<ResumeData>(DEFAULT_DATA);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/resume?locale=${locale}`);
        const json = await res.json();
        if (!cancelled) setData(json.data ? { ...DEFAULT_DATA, ...json.data } : DEFAULT_DATA);
      } catch {
        if (!cancelled) setData(DEFAULT_DATA);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [locale]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/admin/resume", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, data }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      /* ignore — the save button reverts and the user can retry */
    } finally {
      setSaving(false);
    }
  };

  const set = <K extends keyof ResumeData>(key: K, value: ResumeData[K]) =>
    setData((prev) => ({ ...prev, [key]: value }));

  const setExp = (i: number, patch: Partial<ResumeExperience>) =>
    set("experience", data.experience.map((e, j) => (i === j ? { ...e, ...patch } : e)));

  if (loading) {
    return <p className="text-muted font-mono text-sm animate-pulse py-8">Loading…</p>;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          {(["ko", "en"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLocale(l)}
              className={`px-3 py-1.5 text-xs font-mono uppercase rounded border transition-colors ${
                locale === l
                  ? "bg-foreground text-background border-foreground"
                  : "border-border text-muted hover:text-foreground"
              }`}
            >
              {l}
            </button>
          ))}
          <a
            href="/resume"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-3 flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors"
          >
            <ExternalLink size={12} />
            <span>미리보기 · PDF</span>
          </a>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-foreground text-background px-4 py-2 text-xs font-bold uppercase tracking-widest rounded disabled:opacity-50"
        >
          <Save size={14} />
          <span>{saving ? "Saving…" : saved ? "Saved" : "Save"}</span>
        </button>
      </div>

      <Section title="헤더" hint="한 줄 포지셔닝은 이 사이트에서 가장 중요한 문장입니다.">
        <Input label="이름" value={data.name} onChange={(v) => set("name", v)} />
        <Input
          label="한 줄 포지셔닝"
          value={data.headline}
          onChange={(v) => set("headline", v)}
          placeholder="문제를 숫자로 정의하고 시스템으로 해결하는 Technical PM"
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="이메일"
            value={data.contact.email}
            onChange={(v) => set("contact", { ...data.contact, email: v })}
          />
          <Input
            label="GitHub"
            value={data.contact.github}
            onChange={(v) => set("contact", { ...data.contact, github: v })}
            placeholder="github.com/GatsLee"
          />
          <Input
            label="블로그"
            value={data.contact.blog}
            onChange={(v) => set("contact", { ...data.contact, blog: v })}
            placeholder="blog.gatslee.com"
          />
          <Input
            label="LinkedIn"
            value={data.contact.linkedin ?? ""}
            onChange={(v) => set("contact", { ...data.contact, linkedin: v })}
          />
        </div>
      </Section>

      <Section title="요약" hint="최대 3불릿. 각 불릿에 반드시 숫자가 들어가야 합니다.">
        <StringList
          items={data.summary}
          onChange={(v) => set("summary", v)}
          placeholder="AI 에이전트 3개를 홈서버에서 24/7 운영 — 컨테이너 10개, 가동률 99% 이상."
          addLabel="불릿 추가"
        />
      </Section>

      <Section title="핵심 역량 — 프로덕트" hint="기술보다 먼저 옵니다. 순서 자체가 포지셔닝입니다.">
        <StringList
          items={data.pmSkills}
          onChange={(v) => set("pmSkills", v)}
          placeholder="문제 정의 — 지표에서 출발하는 문제 프레이밍 (퍼널·코호트·AARRR)"
          addLabel="역량 추가"
        />
      </Section>

      <Section title="핵심 역량 — 기술">
        <StringList
          items={data.techSkills}
          onChange={(v) => set("techSkills", v)}
          placeholder="AI/LLM — RAG 파이프라인, 임베딩, 로컬 LLM 서빙 (Ollama)"
          addLabel="역량 추가"
        />
      </Section>

      <Section
        title="경험 / 프로젝트"
        hint="STAR + 케이스 슬러그. 이력서가 색인이고, 케이스가 증명입니다."
      >
        <div className="space-y-4">
          {data.experience.map((e, i) => (
            <div key={i} className="border border-border p-4 space-y-3 bg-surface/30">
              <div className="flex items-center justify-between">
                <span className="editorial-label text-muted">#{i + 1}</span>
                <button
                  onClick={() => set("experience", data.experience.filter((_, j) => j !== i))}
                  className="p-1 text-muted hover:text-red-500 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Input label="역할" value={e.role} onChange={(v) => setExp(i, { role: v })} />
                <Input label="조직" value={e.org} onChange={(v) => setExp(i, { org: v })} />
                <Input label="기간" value={e.period} onChange={(v) => setExp(i, { period: v })} />
              </div>
              <Input
                label="문제 (숫자로)"
                value={e.problem}
                onChange={(v) => setExp(i, { problem: v })}
                multiline
                placeholder="LLM API 호출 비용이 월 예산의 3배 — 알림 1건마다 LLM을 호출하고 있었음"
              />
              <Input
                label="행동"
                value={e.action}
                onChange={(v) => setExp(i, { action: v })}
                multiline
                placeholder="알림 패턴을 분석해 89%가 반복형임을 확인하고, LLM 앞단에 ML 게이트를 설계"
              />
              <Input
                label="결과 (숫자로)"
                value={e.result}
                onChange={(v) => setExp(i, { result: v })}
                multiline
                placeholder="API 비용 80% 절감, 탐지 정확도는 유지 (사전 선언 임계치 15% 이내)"
              />
              <Input
                label="케이스 슬러그 (선택)"
                value={e.caseSlug ?? ""}
                onChange={(v) => setExp(i, { caseSlug: v })}
                placeholder="aiops-cost-reduction → /cases/aiops-cost-reduction 로 링크됩니다"
              />
            </div>
          ))}
          <button
            onClick={() =>
              set("experience", [
                ...data.experience,
                { role: "", org: "", period: "", problem: "", action: "", result: "", caseSlug: "" },
              ])
            }
            className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors"
          >
            <Plus size={14} />
            <span>경험 추가</span>
          </button>
        </div>
      </Section>

      <Section title="기술 스택" hint="카테고리별 한 줄. 칩 30개 벽은 엔지니어 이력서로 읽힙니다.">
        <div className="space-y-2">
          {data.stack.map((s, i) => (
            <div key={i} className="flex items-start gap-2">
              <input
                value={s.category}
                onChange={(e) =>
                  set("stack", data.stack.map((x, j) => (i === j ? { ...x, category: e.target.value } : x)))
                }
                placeholder="AI / ML"
                className="w-32 bg-background border border-border px-3 py-2 text-sm text-foreground rounded focus:border-foreground outline-none placeholder:text-muted/40"
              />
              <input
                value={s.items}
                onChange={(e) =>
                  set("stack", data.stack.map((x, j) => (i === j ? { ...x, items: e.target.value } : x)))
                }
                placeholder="Ollama, RAG, 임베딩·벡터 검색, BM25/FTS5"
                className="flex-1 bg-background border border-border px-3 py-2 text-sm text-foreground rounded focus:border-foreground outline-none placeholder:text-muted/40"
              />
              <button
                onClick={() => set("stack", data.stack.filter((_, j) => j !== i))}
                className="p-2 text-muted hover:text-red-500 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <button
            onClick={() => set("stack", [...data.stack, { category: "", items: "" }])}
            className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors"
          >
            <Plus size={14} />
            <span>카테고리 추가</span>
          </button>
        </div>
      </Section>

      <Section title="교육 / 활동">
        <div className="space-y-3">
          {data.education.map((e, i) => {
            const setEdu = (patch: Partial<(typeof data.education)[number]>) =>
              set("education", data.education.map((x, j) => (i === j ? { ...x, ...patch } : x)));
            return (
              <div key={i} className="border border-border p-3 space-y-2 bg-surface/30">
                <div className="flex items-center justify-between">
                  <span className="editorial-label text-muted">#{i + 1}</span>
                  <button
                    onClick={() => set("education", data.education.filter((_, j) => j !== i))}
                    className="p-1 text-muted hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Input label="과정" value={e.title} onChange={(v) => setEdu({ title: v })} />
                  <Input label="기관" value={e.org} onChange={(v) => setEdu({ org: v })} />
                  <Input label="기간" value={e.period} onChange={(v) => setEdu({ period: v })} />
                </div>
                <Input label="비고" value={e.note ?? ""} onChange={(v) => setEdu({ note: v })} />
              </div>
            );
          })}
          <button
            onClick={() =>
              set("education", [...data.education, { title: "", org: "", period: "", note: "" }])
            }
            className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors"
          >
            <Plus size={14} />
            <span>항목 추가</span>
          </button>
        </div>
      </Section>
    </div>
  );
}
