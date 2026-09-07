"use client";

import React, { useState, useRef } from 'react';
import { X, Plus, Link as LinkIcon, AlertTriangle } from 'lucide-react';
import { uploadFile } from '@/lib/upload';
import {
  CaseBeats,
  Metric,
  Decision,
  NotBuilt,
  RiceRow,
  Verdict,
  BEAT_KEYS,
  BEAT_LABEL,
  emptyBeats,
  emptyMetric,
  parseBeats,
  beatCompleteness,
  canCommit,
} from '@/lib/case-study';

// ─── Types ─────────────────────────────────────────────────────────────────

interface ExternalLink {
  label: string;
  url: string;
}

export interface CaseSaveData {
  title: string;
  category: string;
  content: string;
  slug?: string;
  description?: string;
  locale?: string;
  published?: boolean;
  tags?: string;
  externalLinks?: string;
  caseBeats?: string;
}

interface CaseStudyEditorProps {
  initialTitle?: string;
  initialContent?: string;
  initialCaseBeats?: string | null;
  initialExternalLinks?: string;
  initialLocale?: string;
  initialPublished?: boolean;
  initialTags?: string;
  initialDescription?: string;
  onSave: (data: CaseSaveData) => void;
  saving?: boolean;
}

const STATUS_OPTIONS = ['shipped', 'shelved', 'in-flight'] as const;

// ─── Shared field primitives ───────────────────────────────────────────────

const inputCls =
  'w-full px-3 py-2 bg-background card-border rounded text-sm text-foreground focus:outline-none focus:border-accent/50 transition-colors placeholder:text-muted/40';
const areaCls =
  'w-full px-4 py-3 bg-background card-border rounded-lg text-sm text-foreground resize-y focus:outline-none focus:border-accent/50 transition-colors placeholder:text-muted/40 leading-relaxed';

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-muted mb-1.5">{label}</label>
      {children}
      {hint && <p className="mt-1.5 text-[11px] text-muted/60 leading-relaxed">{hint}</p>}
    </div>
  );
}

/** Repeatable metric row — used by Problem, Hypothesis (criteria), and Outcome. */
function MetricRows({
  metrics,
  onChange,
  afterLabel = '이후',
}: {
  metrics: Metric[];
  onChange: (m: Metric[]) => void;
  afterLabel?: string;
}) {
  const set = (i: number, patch: Partial<Metric>) =>
    onChange(metrics.map((m, j) => (i === j ? { ...m, ...patch } : m)));

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr_1.2fr_auto] gap-1.5 text-[10px] font-mono uppercase tracking-wider text-muted/60 px-1">
        <span>지표</span>
        <span>이전</span>
        <span>{afterLabel}</span>
        <span>변화</span>
        <span>출처</span>
        <span />
      </div>
      {metrics.map((m, i) => (
        <div key={i} className="grid grid-cols-[1.4fr_1fr_1fr_1fr_1.2fr_auto] gap-1.5 items-center">
          <input className={inputCls} value={m.label} onChange={(e) => set(i, { label: e.target.value })} placeholder="전환율" />
          <input className={inputCls} value={m.before} onChange={(e) => set(i, { before: e.target.value })} placeholder="2.1%" />
          <input className={inputCls} value={m.after} onChange={(e) => set(i, { after: e.target.value })} placeholder="9.3%" />
          <input className={inputCls} value={m.delta} onChange={(e) => set(i, { delta: e.target.value })} placeholder="+7.2%p" />
          <input className={inputCls} value={m.source} onChange={(e) => set(i, { source: e.target.value })} placeholder="GA4" />
          <button
            onClick={() => onChange(metrics.filter((_, j) => j !== i))}
            className="p-1 text-muted hover:text-foreground transition-colors"
            aria-label="지표 삭제"
          >
            <X size={12} />
          </button>
        </div>
      ))}
      <button
        onClick={() => onChange([...metrics, emptyMetric()])}
        className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors"
      >
        <Plus size={14} />
        <span>지표 추가</span>
      </button>
    </div>
  );
}

function Beat({
  index,
  keyName,
  done,
  children,
}: {
  index: number;
  keyName: (typeof BEAT_KEYS)[number];
  done: boolean;
  children: React.ReactNode;
}) {
  return (
    <section id={`beat-${keyName}`} className="mb-10 scroll-mt-4">
      <div className="flex items-center gap-2.5 mb-4">
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${done ? 'bg-accent' : 'bg-muted/30'}`}
          aria-label={done ? '작성됨' : '비어 있음'}
        />
        <h3 className="text-[10px] font-bold text-muted tracking-widest uppercase">
          {String(index).padStart(2, '0')} {BEAT_LABEL[keyName].en}
          <span className="ml-1.5 font-normal opacity-50">{BEAT_LABEL[keyName].ko}</span>
        </h3>
      </div>
      <div className="space-y-5">{children}</div>
      <div className="w-full h-px bg-border mt-10" />
    </section>
  );
}

// ─── CaseStudyEditor ───────────────────────────────────────────────────────

export default function CaseStudyEditor({
  initialTitle = '',
  initialContent = '',
  initialCaseBeats = null,
  initialExternalLinks = '[]',
  initialLocale = 'ko',
  initialPublished = true,
  initialTags = '[]',
  initialDescription = '',
  onSave,
  saving = false,
}: CaseStudyEditorProps) {
  const parsedInitialTags: string[] = (() => {
    try { return JSON.parse(initialTags); } catch { return []; }
  })();
  const initialStatus =
    parsedInitialTags.find((t) => (STATUS_OPTIONS as readonly string[]).includes(t)) || 'shipped';
  const initialTechTags = parsedInitialTags.filter(
    (t) => !(STATUS_OPTIONS as readonly string[]).includes(t)
  );
  const parsedInitialLinks: ExternalLink[] = (() => {
    try { return JSON.parse(initialExternalLinks); } catch { return []; }
  })();

  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [beats, setBeats] = useState<CaseBeats>(() => parseBeats(initialCaseBeats) ?? emptyBeats());
  const [externalLinks, setExternalLinks] = useState<ExternalLink[]>(parsedInitialLinks);
  const [locale, setLocale] = useState(initialLocale);
  const [published, setPublished] = useState(initialPublished);
  const [status, setStatus] = useState(initialStatus);
  const [techTags, setTechTags] = useState<string[]>(initialTechTags);
  const [tagInput, setTagInput] = useState('');
  const [description, setDescription] = useState(initialDescription);

  const [uploading, setUploading] = useState(false);
  const wireframeInputRef = useRef<HTMLInputElement>(null);

  const { filled, total, missing } = beatCompleteness(beats);
  const gate = canCommit(beats);

  // Typed patch helpers — keep the nested setState calls readable.
  const patch = <K extends keyof CaseBeats>(key: K, value: Partial<CaseBeats[K]>) =>
    setBeats((b) => ({ ...b, [key]: { ...(b[key] as object), ...value } } as CaseBeats));

  const handleWireframeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) urls.push(await uploadFile(file));
      patch('decisions', { wireframes: [...beats.decisions.wireframes, ...urls] });
    } catch {
      alert('와이어프레임 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
      if (wireframeInputRef.current) wireframeInputRef.current.value = '';
    }
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !techTags.includes(tag)) setTechTags((prev) => [...prev, tag]);
    setTagInput('');
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert('제목이 비어 있습니다.');
      return;
    }
    // The one hard gate. Everything else is a soft warning.
    if (!gate.ok) {
      alert(gate.reason);
      document.getElementById('beat-decisions')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    if (missing.length > 0) {
      const names = missing.map((k) => BEAT_LABEL[k].ko).join(', ');
      if (!confirm(`아직 비어 있는 beat: ${names}\n\n이대로 저장할까요?`)) return;
    }

    const autoSlug =
      title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-{2,}/g, '-').replace(/^-|-$/g, '') ||
      `case-${Date.now()}`;

    onSave({
      title,
      category: 'case',
      content,
      slug: autoSlug,
      // Fall back to the problem statement — the SEO description should lead with
      // the metric-framed problem, not a generic blurb.
      description: description.trim() || beats.problem.statement.slice(0, 160),
      locale,
      published,
      tags: JSON.stringify([status, ...techTags]),
      externalLinks: JSON.stringify(externalLinks.filter((l) => l.label.trim() && l.url.trim())),
      caseBeats: JSON.stringify(beats),
    });
  };

  const d = beats.decisions;

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background text-foreground">

      {/* ── Toolbar ────────────────────────────────────────────────────── */}
      <div className="h-10 border-b border-border flex items-center justify-between px-6 bg-surface shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] text-muted tracking-widest uppercase">
            POST <span className="mx-1 font-light opacity-40">/</span> CASE STUDY
          </span>
          {uploading && <span className="text-[11px] text-accent font-mono animate-pulse">Uploading…</span>}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-muted font-mono mr-1">
            {saving ? 'Saving...' : published ? 'Public' : 'Draft'}
          </span>
          <button
            onClick={() => setLocale((l) => (l === 'ko' ? 'en' : 'ko'))}
            className="px-2 h-7 text-[11px] font-medium font-mono text-muted hover:text-foreground hover:bg-hover rounded transition-colors"
            title="Post language"
          >
            {locale === 'ko' ? '한' : 'EN'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving || uploading}
            className="ml-1 bg-foreground hover:bg-foreground/90 text-background font-bold h-7 px-4 text-[11px] uppercase tracking-widest rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'COMMIT'}
          </button>
        </div>
      </div>

      {/* ── Main area ──────────────────────────────────────────────────── */}
      <main className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-16 pt-12 pb-8">

            <input
              className="w-full bg-transparent outline-none text-4xl md:text-[2.75rem] font-bold text-foreground tracking-tight mb-6 placeholder-muted/25"
              style={{ fontFamily: "'Manrope', 'Pretendard', sans-serif" }}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="케이스 스터디 제목"
              autoComplete="off"
            />

            <button
              onClick={() => setPublished((p) => !p)}
              className="flex items-center gap-2 px-3 py-1.5 card-border rounded-md text-sm hover:bg-hover transition-colors mb-8"
            >
              <div className={`w-2 h-2 rounded-full ${published ? 'bg-accent' : 'bg-muted/40'}`} />
              <span className="text-foreground text-xs font-medium">{published ? 'Public' : 'Draft'}</span>
            </button>

            <div className="w-full h-px bg-border mb-10" />

            {/* ── 01 CONTEXT ─────────────────────────────────────────── */}
            <Beat index={1} keyName="context" done={!missing.includes('context')}>
              <div className="grid grid-cols-2 gap-4">
                <Field label="제품 / 프로젝트">
                  <input className={inputCls} value={beats.context.product}
                    onChange={(e) => patch('context', { product: e.target.value })}
                    placeholder="AIOps Agent" />
                </Field>
                <Field label="기간">
                  <input className={inputCls} value={beats.context.period}
                    onChange={(e) => patch('context', { period: e.target.value })}
                    placeholder="2026.03 – 2026.06" />
                </Field>
                <Field label="팀 구성">
                  <input className={inputCls} value={beats.context.team}
                    onChange={(e) => patch('context', { team: e.target.value })}
                    placeholder="1인 (기획·개발·운영)" />
                </Field>
                <Field label="내 역할">
                  <input className={inputCls} value={beats.context.myRole}
                    onChange={(e) => patch('context', { myRole: e.target.value })}
                    placeholder="Product Owner" />
                </Field>
              </div>

              <Field
                label="내가 소유한 것"
                hint="'참여했다'가 아니라 '내가 결정했다'로 쓰세요. 팀 프로젝트에서 읽는 사람이 가장 궁금해하는 건 당신이 뭘 결정했느냐입니다."
              >
                <div className="space-y-2">
                  {beats.context.iOwned.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        className={inputCls}
                        value={item}
                        onChange={(e) =>
                          patch('context', {
                            iOwned: beats.context.iOwned.map((x, j) => (i === j ? e.target.value : x)),
                          })
                        }
                        placeholder="문제 정의와 성공 지표 설정"
                      />
                      <button
                        onClick={() =>
                          patch('context', { iOwned: beats.context.iOwned.filter((_, j) => j !== i) })
                        }
                        className="p-1 text-muted hover:text-foreground transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => patch('context', { iOwned: [...beats.context.iOwned, ''] })}
                    className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors"
                  >
                    <Plus size={14} />
                    <span>항목 추가</span>
                  </button>
                </div>
              </Field>
            </Beat>

            {/* ── 02 PROBLEM ─────────────────────────────────────────── */}
            <Beat index={2} keyName="problem" done={!missing.includes('problem')}>
              <Field
                label="문제 진술"
                hint="'검색이 안 좋았다' ❌ → '검색 결과 클릭률 12%p 하락 (2월 대비)' ✅ — 숫자 없으면 문제가 아니라 불평입니다."
              >
                <textarea
                  className={areaCls}
                  rows={3}
                  value={beats.problem.statement}
                  onChange={(e) => patch('problem', { statement: e.target.value })}
                  placeholder="지표 → 원인 → 문제 순으로."
                />
              </Field>

              <Field label="문제를 뒷받침하는 지표">
                <MetricRows
                  metrics={beats.problem.metrics}
                  onChange={(metrics) => patch('problem', { metrics })}
                  afterLabel="현재"
                />
              </Field>

              <Field label="근거" hint="이 문제가 진짜라는 걸 어떻게 알았나요? 유저 인터뷰, CS 티켓, 로그, 퍼널 분석.">
                <textarea
                  className={areaCls}
                  rows={2}
                  value={beats.problem.evidence}
                  onChange={(e) => patch('problem', { evidence: e.target.value })}
                  placeholder="CS 티켓 800건 중 62%가 동일 항목. 유저 인터뷰 5건에서 반복 언급."
                />
              </Field>
            </Beat>

            {/* ── 03 HYPOTHESIS ──────────────────────────────────────── */}
            <Beat index={3} keyName="hypothesis" done={!missing.includes('hypothesis')}>
              <Field label="가설">
                <textarea
                  className={areaCls}
                  rows={2}
                  value={beats.hypothesis.statement}
                  onChange={(e) => patch('hypothesis', { statement: e.target.value })}
                  placeholder="X를 하면 Y 때문에 Z 지표가 개선될 것이다."
                />
              </Field>

              <Field
                label="사전 선언한 성공 기준"
                hint="성공 기준을 지금 못 적으면, 나중에 결과를 정당화하게 됩니다. 이건 사후에 위조가 가장 어려운 beat이고, 그래서 가장 값이 나갑니다."
              >
                <MetricRows
                  metrics={beats.hypothesis.successCriteria}
                  onChange={(successCriteria) => patch('hypothesis', { successCriteria })}
                  afterLabel="목표"
                />
              </Field>

              <Field label="선언 시점" hint="결과를 알기 전에 정했다는 근거. 커밋 날짜, 문서 작성일, 스프린트 시작일.">
                <input
                  className={inputCls}
                  value={beats.hypothesis.declaredOn}
                  onChange={(e) => patch('hypothesis', { declaredOn: e.target.value })}
                  placeholder="2026.03.14"
                />
              </Field>
            </Beat>

            {/* ── 04 DECISIONS ───────────────────────────────────────── */}
            <Beat index={4} keyName="decisions" done={!missing.includes('decisions')}>
              {/* Decisions */}
              <Field label="의사결정" hint="선택지를 나열하고, 무엇을 골랐고, 무엇을 포기했는지.">
                <div className="space-y-3">
                  {d.decisions.map((dec, i) => {
                    const set = (p: Partial<Decision>) =>
                      patch('decisions', {
                        decisions: d.decisions.map((x, j) => (i === j ? { ...x, ...p } : x)),
                      });
                    return (
                      <div key={i} className="p-4 card-border rounded-lg space-y-2 bg-surface/30">
                        <div className="flex items-center gap-2">
                          <input className={inputCls} value={dec.title}
                            onChange={(e) => set({ title: e.target.value })}
                            placeholder="결정: LLM 앞단에 ML 게이트를 둘 것인가" />
                          <button
                            onClick={() =>
                              patch('decisions', { decisions: d.decisions.filter((_, j) => j !== i) })
                            }
                            className="p-1 text-muted hover:text-foreground transition-colors"
                          >
                            <X size={12} />
                          </button>
                        </div>
                        <input className={inputCls} value={dec.options}
                          onChange={(e) => set({ options: e.target.value })}
                          placeholder="검토한 선택지: 전량 LLM 호출 / ML 사전 필터 / 룰 기반" />
                        <input className={inputCls} value={dec.chose}
                          onChange={(e) => set({ chose: e.target.value })} placeholder="선택: ML 사전 필터" />
                        <input className={inputCls} value={dec.because}
                          onChange={(e) => set({ because: e.target.value })}
                          placeholder="이유: 알림의 89%가 반복 패턴 — LLM이 필요 없었음" />
                        <input className={inputCls} value={dec.tradeoff}
                          onChange={(e) => set({ tradeoff: e.target.value })}
                          placeholder="트레이드오프: 신규 패턴은 초기에 놓침 (재학습 주기 도입으로 완화)" />
                      </div>
                    );
                  })}
                  <button
                    onClick={() =>
                      patch('decisions', {
                        decisions: [
                          ...d.decisions,
                          { title: '', options: '', chose: '', because: '', tradeoff: '' },
                        ],
                      })
                    }
                    className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors"
                  >
                    <Plus size={14} />
                    <span>의사결정 추가</span>
                  </button>
                </div>
              </Field>

              {/* NOT BUILT — the hard gate */}
              <div
                className={`p-4 rounded-lg border ${
                  gate.ok ? 'border-border bg-surface/30' : 'border-amber-500/50 bg-amber-500/5'
                }`}
              >
                <div className="flex items-start gap-2 mb-3">
                  {!gate.ok && <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />}
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">
                      만들지 않기로 한 것 <span className="text-amber-500">*</span>
                    </label>
                    <p className="text-[11px] text-muted/70 leading-relaxed">
                      이게 없으면 케이스 스터디가 아니라 자랑입니다. 한국 PM 포트폴리오에서 이걸 쓰는
                      사람이 거의 없어서, 그 자체가 차별점이 됩니다. <strong>비어 있으면 저장이 막힙니다.</strong>
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  {d.notBuilt.map((n, i) => {
                    const set = (p: Partial<NotBuilt>) =>
                      patch('decisions', {
                        notBuilt: d.notBuilt.map((x, j) => (i === j ? { ...x, ...p } : x)),
                      });
                    return (
                      <div key={i} className="flex items-center gap-2">
                        <input className={inputCls} value={n.item}
                          onChange={(e) => set({ item: e.target.value })}
                          placeholder="벡터 DB 도입" />
                        <input className={inputCls} value={n.why}
                          onChange={(e) => set({ why: e.target.value })}
                          placeholder="이유: 문서 200개 규모에선 인메모리 코사인이 더 빠르고 운영비가 0" />
                        <button
                          onClick={() =>
                            patch('decisions', { notBuilt: d.notBuilt.filter((_, j) => j !== i) })
                          }
                          className="p-1 text-muted hover:text-foreground transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    );
                  })}
                  <button
                    onClick={() =>
                      patch('decisions', { notBuilt: [...d.notBuilt, { item: '', why: '' }] })
                    }
                    className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors"
                  >
                    <Plus size={14} />
                    <span>항목 추가</span>
                  </button>
                </div>
              </div>

              {/* Prioritization */}
              <Field label="우선순위 프레임워크">
                <div className="flex gap-1.5 mb-3">
                  {(['none', 'RICE', 'ICE'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => patch('decisions', { framework: f })}
                      className={`px-2.5 py-1.5 text-[10px] font-mono uppercase rounded card-border transition-all ${
                        d.framework === f
                          ? 'bg-accent/10 text-accent'
                          : 'bg-hover text-muted hover:bg-accent/10'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                {d.framework !== 'none' && (
                  <div className="space-y-2">
                    {d.priorities.map((p, i) => {
                      const set = (patchRow: Partial<RiceRow>) =>
                        patch('decisions', {
                          priorities: d.priorities.map((x, j) => (i === j ? { ...x, ...patchRow } : x)),
                        });
                      return (
                        <div key={i} className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_auto] gap-1.5">
                          <input className={inputCls} value={p.item}
                            onChange={(e) => set({ item: e.target.value })} placeholder="항목" />
                          <input className={inputCls} value={p.r}
                            onChange={(e) => set({ r: e.target.value })} placeholder="R" />
                          <input className={inputCls} value={p.i}
                            onChange={(e) => set({ i: e.target.value })} placeholder="I" />
                          <input className={inputCls} value={p.c}
                            onChange={(e) => set({ c: e.target.value })} placeholder="C" />
                          <input className={inputCls} value={p.e}
                            onChange={(e) => set({ e: e.target.value })} placeholder="E" />
                          <input className={inputCls} value={p.score}
                            onChange={(e) => set({ score: e.target.value })} placeholder="점수" />
                          <button
                            onClick={() =>
                              patch('decisions', { priorities: d.priorities.filter((_, j) => j !== i) })
                            }
                            className="p-1 text-muted hover:text-foreground transition-colors"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      );
                    })}
                    <button
                      onClick={() =>
                        patch('decisions', {
                          priorities: [...d.priorities, { item: '', r: '', i: '', c: '', e: '', score: '' }],
                        })
                      }
                      className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors"
                    >
                      <Plus size={14} />
                      <span>행 추가</span>
                    </button>
                  </div>
                )}
              </Field>

              {/* Stakeholder conflict */}
              <Field
                label="이해관계자 충돌"
                hint="크로스펑셔널 영향력의 증거. 엔지니어 포트폴리오에는 절대 없는 항목입니다."
              >
                <div className="space-y-2">
                  <input className={inputCls} value={d.stakeholderConflict.who}
                    onChange={(e) =>
                      patch('decisions', {
                        stakeholderConflict: { ...d.stakeholderConflict, who: e.target.value },
                      })
                    }
                    placeholder="대상: 인프라 담당 / 디자이너 / 영업" />
                  <input className={inputCls} value={d.stakeholderConflict.tension}
                    onChange={(e) =>
                      patch('decisions', {
                        stakeholderConflict: { ...d.stakeholderConflict, tension: e.target.value },
                      })
                    }
                    placeholder="갈등: 무엇과 무엇이 부딪혔나" />
                  <input className={inputCls} value={d.stakeholderConflict.resolution}
                    onChange={(e) =>
                      patch('decisions', {
                        stakeholderConflict: { ...d.stakeholderConflict, resolution: e.target.value },
                      })
                    }
                    placeholder="해결: 어떤 근거로 어떻게 조율했나" />
                </div>
              </Field>

              {/* PRD excerpt */}
              <Field label="PRD 발췌" hint="문서 전체가 아니라 핵심 스펙 3줄. 읽는 사람은 PRD를 읽고 싶은 게 아니라 당신이 PRD를 쓸 줄 아는지 보고 싶은 겁니다.">
                <textarea
                  className={`${areaCls} font-mono text-xs`}
                  rows={6}
                  value={d.prdExcerpt}
                  onChange={(e) => patch('decisions', { prdExcerpt: e.target.value })}
                  placeholder={'- 스펙 1 …\n- 스펙 2 …\n- 스펙 3 …'}
                />
              </Field>

              {/* Wireframes */}
              <Field label="와이어프레임 / 다이어그램">
                <div className="grid grid-cols-2 gap-3">
                  {d.wireframes.map((url, i) => (
                    <div key={i} className="relative group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Wireframe ${i + 1}`} className="w-full h-32 object-cover rounded-lg card-border" />
                      <button
                        onClick={() =>
                          patch('decisions', { wireframes: d.wireframes.filter((_, j) => j !== i) })
                        }
                        className="absolute top-1 right-1 bg-background/80 text-muted hover:text-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => wireframeInputRef.current?.click()}
                    disabled={uploading}
                    className="h-32 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center text-muted hover:bg-hover hover:border-accent/40 transition-colors bg-background gap-1 text-xs"
                  >
                    <Plus size={16} />
                    <span>{uploading ? 'Uploading…' : '이미지 추가'}</span>
                  </button>
                </div>
              </Field>
            </Beat>

            {/* ── 05 OUTCOME ─────────────────────────────────────────── */}
            <Beat index={5} keyName="outcome" done={!missing.includes('outcome')}>
              {/* Side-by-side with the pre-declared criteria — the second forcing device.
                  You physically cannot forget the number you committed to. */}
              <div className="p-4 card-border rounded-lg bg-surface/30">
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted/60 mb-2">
                  사전 선언한 기준 (03에서 가져옴)
                </div>
                {beats.hypothesis.successCriteria.filter((m) => m.label.trim()).length === 0 ? (
                  <p className="text-xs text-muted/50 italic">
                    03에 성공 기준이 비어 있습니다. 먼저 채우세요 — 결과부터 쓰면 결과에 맞춰 기준을 쓰게 됩니다.
                  </p>
                ) : (
                  <ul className="space-y-1">
                    {beats.hypothesis.successCriteria
                      .filter((m) => m.label.trim())
                      .map((m, i) => (
                        <li key={i} className="text-xs font-mono text-muted">
                          {m.label}: {m.before || '?'} → <span className="text-foreground">{m.after || '?'}</span>
                          {m.delta && <span className="text-accent"> ({m.delta})</span>}
                        </li>
                      ))}
                  </ul>
                )}
              </div>

              <Field label="실제 결과">
                <MetricRows
                  metrics={beats.outcome.metrics}
                  onChange={(metrics) => patch('outcome', { metrics })}
                  afterLabel="실제"
                />
              </Field>

              <Field label="사전 기준 대비 판정" hint="'미달'을 정직하게 쓰는 게 어떤 성공담보다 값이 높습니다. 면접에서 무너지지 않는 유일한 방법이기도 합니다.">
                <div className="flex gap-1.5">
                  {([
                    { v: 'met', ko: '기준 충족', cls: 'bg-green-500/10 text-green-500' },
                    { v: 'partial', ko: '부분 충족', cls: 'bg-amber-500/10 text-amber-500' },
                    { v: 'missed', ko: '미달', cls: 'bg-red-500/10 text-red-500' },
                  ] as { v: Verdict; ko: string; cls: string }[]).map((o) => (
                    <button
                      key={o.v}
                      onClick={() => patch('outcome', { verdictVsCriteria: o.v })}
                      className={`px-3 py-1.5 text-[11px] font-mono rounded card-border transition-all ${
                        beats.outcome.verdictVsCriteria === o.v
                          ? o.cls
                          : 'bg-hover text-muted hover:bg-accent/10'
                      }`}
                    >
                      {o.ko}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="지표 주석" hint="프록시 지표 OK — 배포 리드타임, 티켓 수, 재작업 횟수. NDA로 실제 숫자를 못 쓰면 여기 적으세요.">
                <textarea
                  className={areaCls}
                  rows={2}
                  value={beats.outcome.proxyNote}
                  onChange={(e) => patch('outcome', { proxyNote: e.target.value })}
                  placeholder="매출은 공개 불가 — 대신 스프린트 사이클 2주 → 1.5주로 대체 측정."
                />
              </Field>
            </Beat>

            {/* ── 06 REFLECTION ──────────────────────────────────────── */}
            <Beat index={6} keyName="reflection" done={!missing.includes('reflection')}>
              <Field label="배운 것">
                <textarea
                  className={areaCls}
                  rows={3}
                  value={beats.reflection.learned}
                  onChange={(e) => patch('reflection', { learned: e.target.value })}
                  placeholder="이 프로젝트가 끝나고 나서 다르게 생각하게 된 것."
                />
              </Field>

              <Field
                label="실패한 실험"
                hint="실패한 실험을 최소 1개 쓰세요. 없으면 실험을 안 한 겁니다. 하이라이트 릴은 검증 불가능해서 신뢰를 못 얻습니다."
              >
                <textarea
                  className={areaCls}
                  rows={3}
                  value={beats.reflection.failedExperiments}
                  onChange={(e) => patch('reflection', { failedExperiments: e.target.value })}
                  placeholder="처음엔 X를 시도했지만 Y 때문에 실패. 그래서 Z로 선회."
                />
              </Field>

              <Field label="다음엔">
                <textarea
                  className={areaCls}
                  rows={2}
                  value={beats.reflection.nextTime}
                  onChange={(e) => patch('reflection', { nextTime: e.target.value })}
                  placeholder="같은 문제를 다시 만나면 무엇을 먼저 할 것인가."
                />
              </Field>
            </Beat>

            {/* ── Long form ──────────────────────────────────────────── */}
            <section className="mb-8">
              <h3 className="text-[10px] font-bold text-muted tracking-widest mb-2 uppercase">
                전체 기록 <span className="font-normal opacity-50">Long form</span>
              </h3>
              <p className="text-[11px] text-muted/60 mb-4 leading-relaxed">
                beat가 스캔을 담당하고, 여기가 깊이를 담당합니다. 상세 페이지에서 접힌 채로 렌더됩니다.
              </p>
              <textarea
                className={`${areaCls} font-mono text-xs`}
                rows={14}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="전체 서술 (Markdown 지원)…"
              />
            </section>

            {/* ── Engineering evidence links ─────────────────────────── */}
            <section className="mb-8">
              <h3 className="text-[10px] font-bold text-muted tracking-widest mb-2 uppercase">
                엔지니어링 증거 <span className="font-normal opacity-50">Links</span>
              </h3>
              <p className="text-[11px] text-muted/60 mb-4 leading-relaxed">
                코드·인프라·저널 링크. 상세 페이지 하단에 붙습니다 — 기술 증거는 지우지 않고 판단의 근거로 종속시킵니다.
              </p>
              <div className="space-y-2 mb-3">
                {externalLinks.map((link, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <LinkIcon size={13} className="text-muted shrink-0" />
                    <input
                      value={link.label}
                      onChange={(e) => {
                        const u = [...externalLinks];
                        u[i] = { ...u[i], label: e.target.value };
                        setExternalLinks(u);
                      }}
                      placeholder="GitHub"
                      className="w-32 px-3 py-2 bg-background card-border rounded text-xs text-foreground focus:outline-none focus:border-accent/50 transition-colors placeholder:text-muted/40"
                    />
                    <input
                      value={link.url}
                      onChange={(e) => {
                        const u = [...externalLinks];
                        u[i] = { ...u[i], url: e.target.value };
                        setExternalLinks(u);
                      }}
                      placeholder="/products/aiops-agent 또는 https://…"
                      className="flex-1 px-3 py-2 bg-background card-border rounded text-xs text-foreground focus:outline-none focus:border-accent/50 transition-colors placeholder:text-muted/40"
                    />
                    <button
                      onClick={() => setExternalLinks((prev) => prev.filter((_, j) => j !== i))}
                      className="p-1 text-muted hover:text-foreground transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setExternalLinks((prev) => [...prev, { label: '', url: '' }])}
                className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors"
              >
                <Plus size={14} />
                <span>링크 추가</span>
              </button>
            </section>
          </div>
        </div>

        {/* ── Right sidebar ──────────────────────────────────────────── */}
        <aside className="w-[300px] border-l border-border bg-surface/50 flex flex-col overflow-y-auto shrink-0">
          <div className="p-5">
            {/* Completeness meter */}
            <div className="mb-6">
              <div className="flex items-baseline justify-between mb-2">
                <h3 className="text-[10px] font-bold text-muted tracking-widest uppercase">Beats</h3>
                <span className="font-mono text-xs text-foreground">
                  {filled} <span className="text-muted/50">/ {total}</span>
                </span>
              </div>
              <div className="flex gap-1 mb-3">
                {BEAT_KEYS.map((k) => (
                  <a
                    key={k}
                    href={`#beat-${k}`}
                    title={BEAT_LABEL[k].ko}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      missing.includes(k) ? 'bg-muted/25 hover:bg-muted/40' : 'bg-accent'
                    }`}
                  />
                ))}
              </div>
              {missing.length > 0 && (
                <ul className="space-y-0.5">
                  {missing.map((k) => (
                    <li key={k}>
                      <a
                        href={`#beat-${k}`}
                        className="text-[11px] text-muted hover:text-foreground transition-colors"
                      >
                        · {BEAT_LABEL[k].ko} 비어 있음
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {!gate.ok && (
              <div className="mb-6 p-3 rounded border border-amber-500/40 bg-amber-500/5">
                <div className="flex items-start gap-1.5">
                  <AlertTriangle size={12} className="text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-amber-500/90 leading-relaxed">
                    &lsquo;만들지 않기로 한 것&rsquo;이 비어 저장이 막혀 있습니다.
                  </p>
                </div>
              </div>
            )}

            <h3 className="text-[10px] font-bold text-muted tracking-widest mb-5 uppercase">
              Page Settings
            </h3>

            <div className="mb-5">
              <label className="block text-xs text-muted mb-2">Status</label>
              <div className="flex gap-1.5">
                {STATUS_OPTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className={`px-2.5 py-1.5 text-[10px] font-mono uppercase rounded card-border transition-all ${
                      status === s
                        ? s === 'shipped'
                          ? 'bg-green-500/10 text-green-500'
                          : s === 'in-flight'
                          ? 'bg-blue-500/10 text-blue-500'
                          : 'bg-amber-500/10 text-amber-500'
                        : 'bg-hover text-muted hover:bg-accent/10'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-xs text-muted mb-2">Tech Tags</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {techTags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 px-2 py-1 text-[10px] font-mono bg-hover text-muted rounded card-border"
                  >
                    {tag}
                    <button
                      onClick={() => setTechTags((prev) => prev.filter((t) => t !== tag))}
                      className="hover:text-foreground"
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); addTag(); }
                }}
                placeholder="Add tag + Enter"
                className="w-full px-3 py-2 bg-background card-border rounded text-xs text-foreground focus:outline-none focus:border-accent/50 transition-colors placeholder:text-muted/40"
              />
            </div>

            <div className="mb-5">
              <label className="block text-xs text-muted mb-2">SEO Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="비우면 문제 진술이 들어갑니다."
                rows={3}
                className="w-full px-3 py-2 bg-background card-border rounded text-xs text-muted resize-none focus:outline-none focus:border-accent/50 transition-colors placeholder:text-muted/40"
              />
            </div>
          </div>
        </aside>
      </main>

      {/* ── Bottom status bar ────────────────────────────────────────── */}
      <div className="h-9 border-t border-border flex items-center justify-between px-6 bg-surface shrink-0">
        <div className="flex items-center gap-4 text-[11px] text-muted font-mono">
          <span>Beats: {filled}/{total}</span>
          <span className="opacity-30">•</span>
          <span>Not-built: {d.notBuilt.filter((n) => n.item.trim()).length}</span>
          <span className="opacity-30">•</span>
          <span>Chars: {content.replace(/\s/g, '').length}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-muted font-mono">
          <div className={`w-1.5 h-1.5 rounded-full ${gate.ok ? 'bg-accent animate-pulse' : 'bg-amber-500'}`} />
          <span>{gate.ok ? 'Ready' : 'Blocked'}</span>
        </div>
      </div>

      <input
        ref={wireframeInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleWireframeUpload}
      />
    </div>
  );
}
