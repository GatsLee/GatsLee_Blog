"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, ChevronLeft, Circle, Trash2, Upload, X } from "lucide-react";
import { uploadFile } from "@/lib/upload";
import { STAMPS, publishChecks, type ProductDetail, type ProductFeature, type ProductLink } from "@/lib/product";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";
import { useToast } from "@/components/admin/ui/Toast";
import { STAMP_TONE } from "./StampSelect";

export interface ProjectInitial {
  id: number;
  name: string;
  slug: string;
  type: string;
  stamp: string;
  periodStart: string;
  periodEnd: string;
  roles: string[];
  headcount: number;
  tagline: string;
  summary: string[];
  coverImage: string;
  useCase: string;
  audience: string;
  problemBody: string;
  features: ProductFeature[];
  links: ProductLink[];
  detail: ProductDetail;
  published: boolean;
  updatedAt: string;
  postIds: number[];
}

type PostOption = { id: number; title: string };

const SECTIONS = [
  { id: "basic", label: "기본 정보" },
  { id: "card", label: "목록 카드" },
  { id: "intro", label: "상세 도입" },
  { id: "audience", label: "주요 사용자" },
  { id: "problem", label: "문제와 가설" },
  { id: "features", label: "핵심 기능(화면)" },
  { id: "decisions", label: "핵심 결정" },
  { id: "links", label: "관련 글 · 링크" },
];

const TYPES = [
  { key: "app", label: "앱" },
  { key: "web", label: "웹" },
  { key: "agent", label: "에이전트" },
];

const pad = (n: number) => String(n).padStart(2, "0");
const savedText = (d: Date) => `${d.getMonth() + 1}월 ${d.getDate()}일 ${pad(d.getHours())}:${pad(d.getMinutes())}`;
const autoSlug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
const splitComma = (s: string) =>
  s
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
const isLink = (label: string) => (l: ProductLink) => new RegExp(label, "i").test(`${l.label} ${l.url}`);

const input =
  "h-11 w-full rounded-[10px] border border-border bg-background px-3.5 text-sm text-foreground outline-none placeholder:text-muted focus:border-brand";
const textarea =
  "w-full resize-y rounded-[10px] border border-border bg-background px-3.5 py-3 text-sm leading-6 text-foreground outline-none placeholder:text-muted focus:border-brand";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[13px] font-bold text-foreground">{label}</span>
      {children}
      {hint && <span className="text-xs text-secondary">{hint}</span>}
    </label>
  );
}

function Section({ id, title, desc, ia, children }: { id: string; title: string; desc: string; ia?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="flex scroll-mt-24 flex-col gap-5 rounded-3xl border border-border bg-background p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">{title}</h2>
          <p className="mt-1 text-[13px] text-secondary">{desc}</p>
        </div>
        {ia && <span className="rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-bold text-brand">{ia}</span>}
      </div>
      {children}
    </section>
  );
}

function Segmented<T extends string>({ value, options, onChange }: { value: T; options: { key: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="flex w-fit gap-0.5 rounded-[10px] bg-[#eef1f8] p-[3px]">
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          aria-pressed={value === o.key}
          onClick={() => onChange(o.key)}
          className={`h-9 rounded-lg px-4 text-[13px] ${value === o.key ? "bg-background font-bold text-brand shadow-sm" : "font-medium text-secondary"}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// 이미지 올리기 칸. multiple이면 여러 장을 쌓는다
function ImageDrop({ urls, onChange, ratio, multiple = false }: { urls: string[]; onChange: (urls: string[]) => void; ratio: "4:3" | "16:9"; multiple?: boolean }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const add = async (files: FileList | null) => {
    const list = Array.from(files ?? []).filter((f) => f.type.startsWith("image/"));
    if (!list.length) return;
    setBusy(true);
    try {
      const uploaded = await Promise.all((multiple ? list : list.slice(0, 1)).map((f) => uploadFile(f)));
      onChange(multiple ? [...urls, ...uploaded] : uploaded);
    } catch {
      toast({ ok: false, message: "이미지를 올리지 못했어요." });
    } finally {
      setBusy(false);
    }
  };

  const aspect = ratio === "4:3" ? "aspect-[4/3]" : "aspect-video";
  return (
    <div className="flex flex-col gap-3">
      {urls.length > 0 && (
        <div className={`grid gap-3 ${multiple ? "grid-cols-2" : ""}`}>
          {urls.map((u) => (
            <div key={u} className={`relative ${aspect} overflow-hidden rounded-xl border border-border bg-surface`}>
              <Image src={u} alt="" fill sizes="480px" className="object-cover" />
              <button
                type="button"
                aria-label="이미지 빼기"
                onClick={() => onChange(urls.filter((x) => x !== u))}
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-foreground/70 text-white hover:bg-foreground"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
      {(multiple || urls.length === 0) && (
        <button
          type="button"
          disabled={busy}
          onClick={() => ref.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            add(e.dataTransfer.files);
          }}
          className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border-[1.5px] border-dashed ${urls.length ? "py-6" : `${aspect} max-h-[280px] w-full`} ${
            dragging ? "border-brand bg-brand-soft" : "border-[#b9c6ea] bg-surface-2"
          } disabled:opacity-60`}
        >
          <Upload size={20} className="text-brand" />
          <span className="text-[13px] font-medium text-brand">{busy ? "올리는 중…" : "이미지를 끌어오거나 클릭해 올리세요"}</span>
          <span className="text-xs text-secondary">{ratio} 비율 · PNG, JPG, WebP</span>
        </button>
      )}
      <input ref={ref} type="file" accept="image/png,image/jpeg,image/webp" multiple={multiple} className="hidden" onChange={(e) => add(e.target.files)} />
    </div>
  );
}

function RepeatCard({ index, label, onRemove, children }: { index?: number; label?: string; onRemove: () => void; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-surface-2 p-5">
      <div className="flex items-center justify-between">
        {index !== undefined ? (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">{index}</span>
        ) : (
          <span className="text-sm font-bold text-foreground">{label}</span>
        )}
        <button type="button" onClick={onRemove} className="text-xs text-muted hover:text-danger">
          삭제
        </button>
      </div>
      {children}
    </div>
  );
}

function AddButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="h-11 rounded-[10px] border border-border text-sm font-bold text-brand hover:border-brand">
      + {children}
    </button>
  );
}

// IA_AD_00301 프로젝트 작성 · IA_AD_00303 프로젝트 수정
export default function ProjectForm({ initial, posts }: { initial: ProjectInitial | null; posts: PostOption[] }) {
  const router = useRouter();
  const toast = useToast();
  const d = initial?.detail ?? {};

  const [id, setId] = useState(initial?.id ?? null);
  const [published, setPublished] = useState(initial?.published ?? false);
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial));
  const [type, setType] = useState(initial?.type ?? "web");
  const [stamp, setStamp] = useState(initial?.stamp && (STAMPS as readonly string[]).includes(initial.stamp) ? initial.stamp : "기획 완료");
  const [periodStart, setPeriodStart] = useState(initial?.periodStart ?? "");
  const [periodEnd, setPeriodEnd] = useState(initial?.periodEnd ?? "");
  const [roles, setRoles] = useState((initial?.roles ?? []).join(", "));
  const [headcount, setHeadcount] = useState(String(initial?.headcount ?? 1));
  const [tagline, setTagline] = useState(initial?.tagline ?? "");
  const [summary, setSummary] = useState(initial?.summary.join(" ") ?? "");
  const [cover, setCover] = useState(initial?.coverImage ? [initial.coverImage] : []);
  const [useCase, setUseCase] = useState(initial?.useCase ?? "");
  const [headline, setHeadline] = useState(d.headline ?? "");
  const [intro, setIntro] = useState(d.intro ?? "");
  const [gallery, setGallery] = useState(d.gallery ?? []);
  const [audiences, setAudiences] = useState(d.audiences?.length ? d.audiences : initial?.audience ? [{ who: "", gain: initial.audience }] : [{ who: "", gain: "" }]);
  const [problem, setProblem] = useState({ summary: d.problem?.summary ?? "", body: d.problem?.body ?? initial?.problemBody ?? "" });
  const [hypothesis, setHypothesis] = useState({ summary: d.hypothesis?.summary ?? "", body: d.hypothesis?.body ?? "", metrics: (d.hypothesis?.metrics ?? []).join(", ") });
  const [features, setFeatures] = useState<ProductFeature[]>(initial?.features.length ? initial.features : [{ label: "", sub: "", body: "", shots: [] }]);
  const [decisions, setDecisions] = useState(d.decisions?.length ? d.decisions : [{ title: "", body: "", why: "", so: "" }]);
  const [postIds, setPostIds] = useState<number[]>(initial?.postIds ?? []);
  const [postQuery, setPostQuery] = useState("");
  const [github, setGithub] = useState(initial?.links.find(isLink("github"))?.url ?? "");
  const [figma, setFigma] = useState(initial?.links.find(isLink("figma"))?.url ?? "");
  const otherLinks = useMemo(() => (initial?.links ?? []).filter((l) => !isLink("github")(l) && !isLink("figma")(l)), [initial]);

  const [savedAt, setSavedAt] = useState(initial ? new Date(initial.updatedAt) : null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [active, setActive] = useState("basic");

  // 어떤 값이든 바뀌면 저장 안 됨 표시
  const firstRender = useRef(true);
  const values = [name, slug, type, stamp, periodStart, periodEnd, roles, headcount, tagline, summary, cover, useCase, headline, intro, gallery, audiences, problem, hypothesis, features, decisions, postIds, github, figma];
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setDirty(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, values);

  const checks = publishChecks({
    name,
    slug: slug || autoSlug(name),
    tagline,
    summary: [summary],
    coverImage: cover[0] ?? "",
    problemSummary: problem.summary,
    hypothesisSummary: hypothesis.summary,
    featureCount: features.filter((f) => f.label.trim()).length,
  });
  const ready = checks.every((c) => c.ok);

  const payload = () => ({
    name,
    slug: slug || autoSlug(name),
    type,
    stamp,
    periodStart,
    periodEnd,
    roles: splitComma(roles),
    headcount: parseInt(headcount) || 0,
    tagline,
    summary: summary.trim() ? [summary.trim()] : [],
    coverImage: cover[0] ?? "",
    useCase,
    audience: "",
    problemBody: problem.body,
    features: features.filter((f) => f.label.trim()),
    links: [...(github ? [{ label: "GitHub", url: github }] : []), ...(figma ? [{ label: "Figma", url: figma }] : []), ...otherLinks],
    detail: {
      headline,
      intro,
      gallery,
      audiences: audiences.filter((a) => a.who.trim() || a.gain.trim()),
      problem,
      hypothesis: { summary: hypothesis.summary, body: hypothesis.body, metrics: splitComma(hypothesis.metrics) },
      decisions: decisions.filter((x) => x.title.trim()),
    } satisfies ProductDetail,
    postIds,
  });

  const save = useCallback(
    async (publish?: boolean) => {
      if (!name.trim()) {
        toast({ ok: false, message: "프로젝트 이름을 입력해 주세요." });
        document.getElementById("basic")?.scrollIntoView({ behavior: "smooth" });
        return null;
      }
      const nextPublished = publish ?? published;
      // 비공개 → 공개로 바꿀 때만 막는다. 이미 공개된 프로젝트는 채우는 중에도 저장할 수 있어야 한다
      if (nextPublished && !published && !ready) {
        toast({ ok: false, message: "공개 전 확인 항목을 모두 채워야 공개할 수 있어요." });
        return null;
      }
      setSaving(true);
      try {
        const res = await fetch(id ? `/api/admin/products/${id}` : "/api/admin/products", {
          method: id ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload(), published: nextPublished }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error);
        setPublished(data.published);
        setSlug(data.slug);
        setSlugTouched(true);
        setSavedAt(new Date(data.updatedAt));
        setDirty(false);
        if (!id) {
          setId(data.id);
          window.history.replaceState(null, "", `/admin/projects/${data.id}`);
        }
        return data as { slug: string };
      } catch (e) {
        toast({ ok: false, message: e instanceof Error && e.message ? e.message : "저장하지 못했어요." });
        return null;
      } finally {
        setSaving(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id, published, ready, ...values]
  );

  // ⌘S 저장, 저장 안 한 채 떠나면 경고
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        save().then((r) => r && toast({ ok: true, message: "저장했어요." }));
      }
    };
    const onLeave = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("beforeunload", onLeave);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("beforeunload", onLeave);
    };
  }, [save, dirty, toast]);

  // 입력 순서 표시: 화면 위쪽에 걸친 섹션을 활성으로
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-80px 0px -70% 0px" }
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  const primary = async () => {
    const isUpdate = Boolean(id) && published;
    const saved = await save(true);
    if (saved) toast({ ok: true, message: isUpdate ? "업데이트했어요." : "프로젝트를 공개했어요." });
  };

  const preview = async () => {
    const win = window.open("about:blank", "_blank");
    const saved = dirty || !id ? await save() : { slug };
    if (saved && win) win.location.href = `/products/${saved.slug}`;
    else win?.close();
  };

  const remove = async () => {
    if (!id) return;
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" }).catch(() => null);
    setConfirmDelete(false);
    if (res?.ok) {
      setDirty(false);
      router.push("/admin/projects");
      router.refresh();
    } else toast({ ok: false, message: "삭제하지 못했어요." });
  };

  const patch = <T,>(list: T[], i: number, v: Partial<T>) => list.map((x, j) => (j === i ? { ...x, ...v } : x));
  const linked = posts.filter((p) => postIds.includes(p.id));
  const candidates = postQuery.trim() ? posts.filter((p) => !postIds.includes(p.id) && p.title.toLowerCase().includes(postQuery.trim().toLowerCase())).slice(0, 6) : [];
  const saveState = saving ? "저장 중…" : dirty ? "저장 안 된 변경" : savedAt ? `저장됨 · ${savedText(savedAt)}` : "아직 저장하지 않음";

  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-background px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/admin/projects" aria-label="프로젝트 목록으로" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border text-foreground hover:bg-surface">
            <ChevronLeft size={16} />
          </Link>
          <span className="flex min-w-0 items-center gap-1.5 text-[13px]">
            <Link href="/admin/projects" className="text-secondary hover:text-foreground">
              프로젝트
            </Link>
            <span className="text-muted">/</span>
            <span className="truncate font-bold text-foreground">{name || (initial ? "이름 없음" : "새 프로젝트")}</span>
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span role="status" className={`mr-2 text-xs ${dirty ? "text-warning" : "text-secondary"}`}>
            {saveState}
          </span>
          {id && (
            <button type="button" aria-label="프로젝트 삭제" onClick={() => setConfirmDelete(true)} className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-border text-foreground hover:border-danger hover:text-danger">
              <Trash2 size={16} />
            </button>
          )}
          <button type="button" onClick={preview} disabled={saving} className="h-10 rounded-[10px] border border-border bg-background px-4 text-sm font-bold text-foreground hover:bg-surface disabled:opacity-60">
            미리보기
          </button>
          <button type="button" onClick={primary} disabled={saving} className="h-10 rounded-[10px] bg-brand px-4 text-sm font-bold text-white hover:opacity-90 disabled:opacity-60">
            {id && published ? "업데이트" : "공개하기"}
          </button>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1280px] gap-8 px-6 py-10">
        <nav aria-label="입력 순서" className="sticky top-24 hidden w-[160px] shrink-0 self-start xl:block">
          <p className="mb-3 text-sm font-bold text-foreground">입력 순서</p>
          <ol className="flex flex-col gap-1">
            {SECTIONS.map((s, i) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] ${active === s.id ? "bg-brand-soft font-bold text-brand" : "text-secondary hover:text-foreground"}`}
                >
                  <span className="w-3 text-xs">{i + 1}</span>
                  {s.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <Section id="basic" title="기본 정보" desc="프로젝트 목록과 상세에 함께 쓰입니다.">
            <Field label="프로젝트 이름">
              <input className={input} value={name} onChange={(e) => setName(e.target.value)} onBlur={() => !slugTouched && setSlug(autoSlug(name))} placeholder="예: Gats Blog" />
            </Field>
            <Field label="주소" hint="이름을 쓰면 자동으로 채워집니다. 바꾸면 기존 링크가 끊깁니다.">
              <input
                className={input}
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setSlugTouched(true);
                }}
                placeholder="gats-blog"
              />
            </Field>
            <Field label="유형" hint='목록 필터에서는 앱·웹이 "서비스", 에이전트가 "에이전트"로 묶입니다.'>
              <Segmented value={type} options={TYPES} onChange={setType} />
            </Field>
            <Field label="진행 단계" hint="목록과 상세의 상태 라벨로 보입니다.">
              <Segmented value={stamp} options={STAMPS.map((s) => ({ key: s, label: s }))} onChange={setStamp} />
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="시작">
                <input className={input} value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} placeholder="2026.04" />
              </Field>
              <Field label="종료">
                <input className={input} value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} placeholder='비우면 "진행 중"으로 표시' />
              </Field>
              <Field label="역할" hint="쉼표로 구분합니다.">
                <input className={input} value={roles} onChange={(e) => setRoles(e.target.value)} placeholder="기획, 개발" />
              </Field>
              <Field label="참여 인원">
                <input className={input} type="number" min={1} value={headcount} onChange={(e) => setHeadcount(e.target.value)} />
              </Field>
            </div>
          </Section>

          <Section id="card" title="목록 카드" desc="프로젝트 목록에 보이는 정보입니다." ia="IA_PD_001">
            <Field label="한 줄 소개" hint="목록과 상세 상단에 굵게 보입니다.">
              <input className={input} value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="예: 직접 운영하는 블로그와 AI 검색" />
            </Field>
            <Field label="두 줄 설명" hint="두 줄을 넘으면 목록에서 잘립니다.">
              <textarea className={textarea} rows={3} value={summary} onChange={(e) => setSummary(e.target.value)} />
            </Field>
            <Field label="대표 이미지">
              <ImageDrop urls={cover} onChange={setCover} ratio="4:3" />
            </Field>
          </Section>

          <Section id="intro" title="상세 도입" desc="프로젝트 상세 첫 화면입니다." ia="IA_PD_002">
            <Field label="분류 라벨">
              <input className={input} value={useCase} onChange={(e) => setUseCase(e.target.value)} placeholder="예: 블로그 · 콘텐츠" />
            </Field>
            <Field label="헤드라인">
              <textarea className={textarea} rows={2} value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="비우면 한 줄 소개를 씁니다." />
            </Field>
            <Field label="소개">
              <textarea className={textarea} rows={3} value={intro} onChange={(e) => setIntro(e.target.value)} placeholder="비우면 두 줄 설명을 씁니다." />
            </Field>
            <Field label="대표 시각 자료" hint="여러 장을 올리면 상세 상단에서 슬라이드로 넘겨 봅니다.">
              <ImageDrop urls={gallery} onChange={setGallery} ratio="16:9" multiple />
            </Field>
          </Section>

          <Section id="audience" title="주요 사용자" desc="상세 도입 오른쪽 카드에 보입니다." ia="IA_PD_002">
            {audiences.map((a, i) => (
              <RepeatCard key={i} label={`사용자 ${i + 1}`} onRemove={() => setAudiences(audiences.filter((_, j) => j !== i))}>
                <Field label="누구인가">
                  <input className={input} value={a.who} onChange={(e) => setAudiences(patch(audiences, i, { who: e.target.value }))} placeholder="예: 함께 일할 기획자를 찾는 분" />
                </Field>
                <Field label="무엇을 얻는가">
                  <textarea className={textarea} rows={3} value={a.gain} onChange={(e) => setAudiences(patch(audiences, i, { gain: e.target.value }))} placeholder="이 사용자가 프로젝트에서 무엇을 확인할 수 있는지 적어 주세요." />
                </Field>
              </RepeatCard>
            ))}
            <AddButton onClick={() => setAudiences([...audiences, { who: "", gain: "" }])}>사용자 추가</AddButton>
          </Section>

          <Section id="problem" title="문제와 가설" desc="상세 본문의 첫 섹션입니다." ia="IA_PD_002">
            <div className="flex flex-col gap-4 rounded-2xl bg-surface-2 p-5">
              <span className="text-sm font-bold text-foreground">문제 정의</span>
              <Field label="요약">
                <input className={input} value={problem.summary} onChange={(e) => setProblem({ ...problem, summary: e.target.value })} placeholder="한 문장으로 적어 주세요." />
              </Field>
              <Field label="설명">
                <textarea className={textarea} rows={3} value={problem.body} onChange={(e) => setProblem({ ...problem, body: e.target.value })} placeholder="누가 어떤 상황에서 불편을 겪는지 적어 주세요." />
              </Field>
            </div>
            <div className="flex flex-col gap-4 rounded-2xl bg-surface-2 p-5">
              <span className="text-sm font-bold text-foreground">가설</span>
              <Field label="요약">
                <input className={input} value={hypothesis.summary} onChange={(e) => setHypothesis({ ...hypothesis, summary: e.target.value })} placeholder="예: 목적에 맞게 경로를 나누면 더 쉽게 찾을 것이다." />
              </Field>
              <Field label="설명">
                <textarea className={textarea} rows={3} value={hypothesis.body} onChange={(e) => setHypothesis({ ...hypothesis, body: e.target.value })} placeholder="가설의 근거를 적어 주세요." />
              </Field>
              <Field label="확인할 지표" hint="쉼표로 구분합니다.">
                <input className={input} value={hypothesis.metrics} onChange={(e) => setHypothesis({ ...hypothesis, metrics: e.target.value })} placeholder="예: 탐색 성공률, 탐색 시간" />
              </Field>
            </div>
          </Section>

          <Section id="features" title="핵심 기능(화면)" desc="기능마다 화면 한 장과 보충 각주를 붙입니다." ia="IA_PD_002">
            {features.map((f, i) => (
              <RepeatCard key={i} index={i + 1} onRemove={() => setFeatures(features.filter((_, j) => j !== i))}>
                <Field label="기능 이름">
                  <input className={input} value={f.label} onChange={(e) => setFeatures(patch(features, i, { label: e.target.value }))} placeholder="예: 주제별 글 탐색" />
                </Field>
                <ImageDrop urls={f.shots ?? []} onChange={(shots) => setFeatures(patch(features, i, { shots }))} ratio="16:9" />
                <Field label="각주" hint="본문 각주와 같은 번호 체계를 씁니다.">
                  <input className={input} value={f.sub} onChange={(e) => setFeatures(patch(features, i, { sub: e.target.value }))} placeholder="선택. 화면 오른쪽 여백에 붙는 보충 설명" />
                </Field>
              </RepeatCard>
            ))}
            <AddButton onClick={() => setFeatures([...features, { label: "", sub: "", body: "", shots: [] }])}>기능 추가</AddButton>
          </Section>

          <Section id="decisions" title="핵심 결정" desc="선택한 이유와 확인할 방법을 함께 남깁니다." ia="IA_PD_002">
            {decisions.map((x, i) => (
              <RepeatCard key={i} index={i + 1} onRemove={() => setDecisions(decisions.filter((_, j) => j !== i))}>
                <Field label="결정">
                  <input className={input} value={x.title} onChange={(e) => setDecisions(patch(decisions, i, { title: e.target.value }))} placeholder="예: 관심 주제와 일상을 나눴습니다." />
                </Field>
                <Field label="설명">
                  <textarea className={textarea} rows={2} value={x.body} onChange={(e) => setDecisions(patch(decisions, i, { body: e.target.value }))} placeholder="무엇을 어떻게 구성했는지 적어 주세요." />
                </Field>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="왜?">
                    <textarea className={textarea} rows={3} value={x.why} onChange={(e) => setDecisions(patch(decisions, i, { why: e.target.value }))} placeholder="이렇게 결정한 이유" />
                  </Field>
                  <Field label="그래서?">
                    <textarea className={textarea} rows={3} value={x.so} onChange={(e) => setDecisions(patch(decisions, i, { so: e.target.value }))} placeholder="어떻게 확인할지" />
                  </Field>
                </div>
              </RepeatCard>
            ))}
            <AddButton onClick={() => setDecisions([...decisions, { title: "", body: "", why: "", so: "" }])}>결정 추가</AddButton>
          </Section>

          <Section id="links" title="관련 글 · 링크" desc="상세 하단 관련 글과 상단 아이콘 링크입니다." ia="IA_PD_002">
            <Field label="관련 글" hint='연결한 글은 프로젝트 목록의 "연결된 글" 수에 반영됩니다.'>
              <div className="relative">
                <input className={input} value={postQuery} onChange={(e) => setPostQuery(e.target.value)} placeholder="글 제목으로 검색해 연결" />
                {candidates.length > 0 && (
                  <ul className="absolute left-0 right-0 top-12 z-20 rounded-xl border border-border bg-background p-1.5 shadow-[0_12px_32px_rgba(24,25,27,0.12)]">
                    {candidates.map((p) => (
                      <li key={p.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setPostIds([...postIds, p.id]);
                            setPostQuery("");
                          }}
                          className="w-full truncate rounded-lg px-3 py-2.5 text-left text-sm text-foreground hover:bg-surface"
                        >
                          {p.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Field>
            {linked.length > 0 && (
              <ul className="flex flex-col gap-2">
                {linked.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 rounded-xl bg-surface-2 px-4 py-3 text-sm text-foreground">
                    <span className="truncate">{p.title}</span>
                    <button type="button" aria-label={`${p.title} 연결 끊기`} onClick={() => setPostIds(postIds.filter((x) => x !== p.id))} className="text-muted hover:text-danger">
                      <X size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="GitHub">
                <input className={input} value={github} onChange={(e) => setGithub(e.target.value)} placeholder="https://github.com/…" />
              </Field>
              <Field label="Figma">
                <input className={input} value={figma} onChange={(e) => setFigma(e.target.value)} placeholder="https://figma.com/…" />
              </Field>
            </div>
          </Section>
        </div>

        <aside className="sticky top-24 hidden w-[300px] shrink-0 flex-col gap-4 self-start lg:flex">
          <div className="flex flex-col gap-3 rounded-3xl border border-border bg-background p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-foreground">목록 미리보기</p>
              <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-bold text-brand">IA_PD_001</span>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-surface">
              {cover[0] ? <Image src={cover[0]} alt="" fill sizes="300px" className="object-cover" /> : <span className="absolute inset-0 flex items-center justify-center text-xs text-muted">대표 이미지 · 4:3</span>}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-brand">{type === "agent" ? "에이전트" : "서비스"}</span>
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${STAMP_TONE[stamp]}`}>{stamp}</span>
            </div>
            <p className="text-lg font-bold text-foreground">{name || "프로젝트 이름"}</p>
            <p className="text-sm font-medium text-foreground">{tagline || "한 줄 소개"}</p>
            <p className="line-clamp-2 text-[13px] leading-5 text-secondary">{summary || "두 줄 설명이 여기에 보입니다."}</p>
          </div>
          <div className="flex flex-col gap-3 rounded-3xl border border-border bg-background p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-foreground">공개 전 확인</p>
              <span className={`text-xs font-bold ${ready ? "text-success" : "text-secondary"}`}>
                {checks.filter((c) => c.ok).length} / {checks.length}
              </span>
            </div>
            <ul className="flex flex-col gap-2">
              {checks.map((c) => (
                <li key={c.label} className={`flex items-center gap-2 text-[13px] ${c.ok ? "text-foreground" : "text-secondary"}`}>
                  {c.ok ? <CheckCircle2 size={16} className="text-success" /> : <Circle size={16} className="text-muted" />}
                  {c.label}
                </li>
              ))}
            </ul>
            <p className="text-xs leading-5 text-secondary">
              {ready
                ? `필수 항목을 모두 채웠습니다. ${id && published ? "업데이트하면" : "공개하면"} 공개 화면에 바로 반영됩니다.`
                : id && published
                  ? "공개 중이지만 비어 있는 항목이 있어요. 채운 만큼 업데이트할 수 있습니다."
                  : "모두 채우면 공개할 수 있어요. ⌘S로 언제든 비공개로 저장할 수 있습니다."}
            </p>
          </div>
        </aside>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="프로젝트를 삭제할까요?"
        description="삭제하면 프로젝트 댓글도 함께 지워지고, 연결된 글은 연결만 풀립니다. 되돌릴 수 없어요."
        onConfirm={remove}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
