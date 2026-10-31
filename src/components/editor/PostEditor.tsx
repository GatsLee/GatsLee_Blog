"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, ChevronLeft, CircleDot, Folder, Globe, Link2, Tag, Trash2, X } from "lucide-react";
import "@blocknote/mantine/style.css";
import { filterSuggestionItems } from "@blocknote/core";
import { ko } from "@blocknote/core/locales";
import { SuggestionMenuController, getDefaultReactSlashMenuItems, useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import { uploadFile } from "@/lib/upload";
import { useTheme } from "@/context/ThemeContext";
import { TOPICS, isTopic, topicLabel } from "@/lib/topics";
import { POST_STATUSES, STATUS_LABEL, isPostStatus, type PostStatus } from "@/lib/post-status";
import { routeFor } from "@/lib/categories";
import TopicIcon from "@/components/common/TopicIcon";
import StatusBadge from "@/components/admin/ui/StatusBadge";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";
import { useToast } from "@/components/admin/ui/Toast";

export interface EditorPost {
  id: number;
  title: string;
  description: string;
  content: string;
  category: string;
  topic: string;
  status: string;
  tags: string;
  slug: string;
  locale: string;
  createdAt: string;
  updatedAt: string;
}

// 슬래시 메뉴는 디자인(IA_AD_0020301)의 항목·순서·그룹만 남긴다
const SLASH_ITEMS: { key: string; title: string; subtext: string; group: string; badge?: string }[] = [
  { key: "paragraph", title: "텍스트", subtext: "일반 문단으로 쓰기", group: "기본 블록" },
  { key: "heading", title: "제목 1", subtext: "큰 섹션 제목", group: "기본 블록", badge: "#" },
  { key: "heading_2", title: "제목 2", subtext: "중간 섹션 제목", group: "기본 블록", badge: "##" },
  { key: "heading_3", title: "제목 3", subtext: "작은 섹션 제목", group: "기본 블록", badge: "###" },
  { key: "bullet_list", title: "글머리 목록", subtext: "순서 없는 목록", group: "기본 블록", badge: "-" },
  { key: "numbered_list", title: "번호 목록", subtext: "순서 있는 목록", group: "기본 블록", badge: "1." },
  { key: "check_list", title: "체크 목록", subtext: "할 일 목록", group: "기본 블록", badge: "[]" },
  { key: "quote", title: "인용", subtext: "다른 글이나 말 인용", group: "기본 블록", badge: ">" },
  { key: "toggle_list", title: "토글", subtext: "펼치고 접는 블록", group: "고급" },
  { key: "code_block", title: "코드", subtext: "코드 블록", group: "고급", badge: "```" },
  { key: "table", title: "표", subtext: "행과 열로 정리", group: "고급" },
  { key: "image", title: "이미지", subtext: "업로드하거나 붙여넣기", group: "미디어" },
];

const dictionary = {
  ...ko,
  placeholders: { ...ko.placeholders, default: "/를 입력해 블록을 고르거나 바로 쓰세요", emptyDocument: "/를 입력해 블록을 고르거나 바로 쓰세요" },
};

const pad = (n: number) => String(n).padStart(2, "0");
// datetime-local 입력값은 로컬 시간 기준
const toLocalInput = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
const savedText = (d: Date) => `${d.getMonth() + 1}월 ${d.getDate()}일 ${pad(d.getHours())}:${pad(d.getMinutes())}`;
const autoSlug = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "");

function blockText(content: unknown): string {
  if (!Array.isArray(content)) return "";
  return content.map((s) => (s && typeof s === "object" && "text" in s ? String((s as { text: string }).text) : "")).join("");
}

// IA_AD_00203 글 작성 · 0020301 블록 메뉴 · 00204 글 수정 · 00206 필수값 오류
export default function PostEditor({ post }: { post: EditorPost | null }) {
  const router = useRouter();
  const toast = useToast();
  const { theme } = useTheme();

  const [id, setId] = useState<number | null>(post?.id ?? null);
  const [title, setTitle] = useState(post?.title ?? "");
  const [description, setDescription] = useState(post?.description ?? "");
  const [topic, setTopic] = useState(post?.topic ?? "");
  const [status, setStatus] = useState<PostStatus>(isPostStatus(post?.status) ? post.status : "draft");
  const [tags, setTags] = useState<string[]>(() => {
    try {
      return JSON.parse(post?.tags ?? "[]");
    } catch {
      return [];
    }
  });
  const [tagInput, setTagInput] = useState<string | null>(null);
  const [publishedAt, setPublishedAt] = useState(() => toLocalInput(post ? new Date(post.createdAt) : new Date()));
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(post));
  const [locale, setLocale] = useState(post?.locale ?? "ko");
  const category = post?.category ?? "journal";

  const [savedAt, setSavedAt] = useState<Date | null>(post ? new Date(post.updatedAt) : null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ title?: boolean; topic?: boolean }>({});
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [menu, setMenu] = useState<"topic" | "status" | null>(null);
  const [docVersion, setDocVersion] = useState(0);
  const loaded = useRef(false);
  // 처음 본문을 채우는 동안의 onChange는 수정으로 치지 않는다
  const ready = useRef(false);

  const editor = useCreateBlockNote({ dictionary, uploadFile: (file: File) => uploadFile(file) });

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    (async () => {
      const md = post?.content ?? "";
      if (md.trim()) editor.replaceBlocks(editor.document, await editor.tryParseMarkdownToBlocks(md));
      ready.current = true;
      setDocVersion((v) => v + 1);
    })();
  }, [editor, post]);

  // 입력 값이 바뀌면 저장 안 된 상태로 표시
  const touch = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    setDirty(true);
  };

  const save = useCallback(
    async (nextStatus: PostStatus) => {
      const missing = { title: !title.trim(), topic: !isTopic(topic) };
      // 발행할 때만 제목·주제를 요구한다. 초안은 비어 있어도 저장한다
      if (nextStatus === "published" && (missing.title || missing.topic)) {
        setErrors(missing);
        toast({ ok: false, message: missing.title ? "제목을 입력해야 발행할 수 있어요." : "주제를 골라야 발행할 수 있어요." });
        return null;
      }
      setErrors({});
      setSaving(true);
      try {
        const content = await editor.blocksToMarkdownLossy(editor.document);
        const body = {
          title: title.trim() || "제목 없음",
          description,
          content,
          category,
          topic,
          status: nextStatus,
          tags: JSON.stringify(tags),
          locale,
          createdAt: new Date(publishedAt).toISOString(),
          ...(slug.trim() && { slug: slug.trim() }),
        };
        const res = await fetch(id ? `/api/posts/${id}` : "/api/posts", {
          method: id ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error);
        setStatus(nextStatus);
        setSlug(data.slug);
        setSlugTouched(true);
        setSavedAt(new Date(data.updatedAt ?? Date.now()));
        setDirty(false);
        if (!id) {
          setId(data.id);
          // 새 글은 저장한 순간부터 수정 주소로 바꾼다. 다시 그리지 않도록 history만 바꾼다
          window.history.replaceState(null, "", `/write/edit/${data.id}`);
        }
        return data as { id: number; slug: string };
      } catch {
        toast({ ok: false, message: "저장하지 못했어요. 다시 시도해 주세요.", retry: () => save(nextStatus) });
        return null;
      } finally {
        setSaving(false);
      }
    },
    [title, topic, description, editor, category, tags, locale, publishedAt, slug, id, toast]
  );

  // 새 글은 발행하기, 이미 있는 글(또는 방금 발행한 글)은 지금 상태 그대로 업데이트
  const isUpdate = Boolean(id) && (Boolean(post) || status === "published");
  const primary = async () => {
    const saved = await save(isUpdate ? status : "published");
    if (saved) toast({ ok: true, message: isUpdate ? "업데이트했어요." : "포스트를 발행했어요." });
  };

  const preview = async () => {
    const win = window.open("about:blank", "_blank");
    const saved = dirty || !id ? await save(status) : { slug };
    if (saved && win) win.location.href = routeFor(category, saved.slug);
    else win?.close();
  };

  const remove = async () => {
    if (!id) return;
    const res = await fetch(`/api/posts/${id}`, { method: "DELETE" }).catch(() => null);
    setConfirmDelete(false);
    if (res?.ok) {
      setDirty(false);
      router.push("/admin/posts");
      router.refresh();
    } else toast({ ok: false, message: "삭제하지 못했어요.", retry: remove });
  };

  // ⌘S 저장, 저장 안 한 채 떠나면 경고
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        save(status).then((r) => r && toast({ ok: true, message: "저장했어요." }));
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
  }, [save, status, dirty, toast]);

  // 목차와 글 정보는 문서가 바뀔 때마다 다시 계산
  const { headings, chars } = useMemo(() => {
    void docVersion;
    const blocks = editor.document;
    const flat = (list: typeof blocks): typeof blocks => list.flatMap((b) => [b, ...flat(b.children)]);
    const all = flat(blocks);
    return {
      headings: all
        .filter((b) => b.type === "heading" && blockText(b.content).trim())
        .map((b) => ({ id: b.id, level: (b.props as { level?: number }).level ?? 1, text: blockText(b.content) })),
      chars: all.reduce((n, b) => n + blockText(b.content).replace(/\s/g, "").length, 0),
    };
  }, [editor, docVersion]);

  const slashItems = useMemo(
    () => async (query: string) => {
      const defaults = getDefaultReactSlashMenuItems(editor) as (ReturnType<typeof getDefaultReactSlashMenuItems>[number] & { key: string })[];
      const items = SLASH_ITEMS.flatMap((s) => {
        const item = defaults.find((d) => d.key === s.key);
        return item ? [{ ...item, title: s.title, subtext: s.subtext, group: s.group, badge: s.badge }] : [];
      });
      return filterSuggestionItems(items, query);
    },
    [editor]
  );

  const isEdit = Boolean(post);

  // 속성 메뉴는 바깥을 누르거나 Esc로 닫는다
  useEffect(() => {
    if (!menu) return;
    const close = (e: MouseEvent) => !(e.target as Element).closest?.("[data-prop-menu]") && setMenu(null);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(null);
    document.addEventListener("mousedown", close);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", close);
      window.removeEventListener("keydown", onKey);
    };
  }, [menu]);
  const saveState = saving ? "저장 중…" : dirty ? "저장 안 된 변경" : savedAt ? `저장됨 · ${savedText(savedAt)}` : "아직 저장 안 됨";
  const row = "flex min-h-9 items-center";
  const label = "flex w-[156px] shrink-0 items-center gap-2 text-sm text-secondary";
  const popover = "absolute left-0 top-9 z-40 w-[180px] rounded-xl border border-border bg-background p-1.5 shadow-[0_12px_32px_rgba(24,25,27,0.12)]";

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-background px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/admin/posts" aria-label="포스트 목록으로" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border text-foreground hover:bg-surface">
            <ChevronLeft size={16} />
          </Link>
          <span className="flex min-w-0 items-center gap-1.5 text-[13px]">
            <Link href="/admin/posts" className="text-secondary hover:text-foreground">
              포스트
            </Link>
            <span className="text-muted">/</span>
            <span className="truncate font-bold text-foreground">{title || (isEdit ? "제목 없음" : "새 포스트")}</span>
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span role="status" className={`mr-2 text-xs ${dirty ? "text-warning" : "text-secondary"}`}>
            {saveState}
          </span>
          {id && (
            <button type="button" aria-label="포스트 삭제" onClick={() => setConfirmDelete(true)} className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-border text-foreground hover:border-danger hover:text-danger">
              <Trash2 size={16} />
            </button>
          )}
          <button type="button" onClick={preview} disabled={saving} className="h-10 rounded-[10px] border border-border px-4 text-sm font-bold text-foreground hover:bg-surface disabled:opacity-60">
            미리보기
          </button>
          <button type="button" onClick={primary} disabled={saving} className="h-10 rounded-[10px] bg-brand px-4 text-sm font-bold text-white hover:opacity-90 disabled:opacity-60">
            {isUpdate ? "업데이트" : "발행하기"}
          </button>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1280px] gap-10 px-6">
        <nav aria-label="이 포스트의 목차" className="sticky top-16 hidden w-[200px] shrink-0 self-start pt-[280px] xl:block">
          <p className="text-sm font-bold text-foreground">이 포스트의 목차</p>
          {headings.length === 0 ? (
            <p className="mt-2 text-xs text-muted">제목 블록을 넣으면 여기에 보여요</p>
          ) : (
            <ul className="mt-2 flex flex-col gap-1.5">
              {headings.map((h) => (
                <li key={h.id} style={{ paddingLeft: (h.level - 1) * 12 }}>
                  <button
                    type="button"
                    onClick={() => document.querySelector(`[data-id="${h.id}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" })}
                    className="text-left text-[13px] text-brand hover:underline"
                  >
                    {h.text}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </nav>

        <main className="mx-auto w-full min-w-0 max-w-[720px] pb-40 pt-16">
          <input
            value={title}
            onChange={(e) => touch(setTitle)(e.target.value)}
            onBlur={() => !slugTouched && setSlug(autoSlug(title))}
            placeholder="제목"
            aria-label="제목"
            aria-invalid={errors.title}
            className={`w-full bg-transparent text-[40px] font-bold leading-[56px] text-foreground outline-none placeholder:text-muted ${
              errors.title ? "rounded-lg ring-2 ring-danger" : ""
            }`}
          />
          {errors.title && <p className="mt-1 text-xs text-danger">제목을 입력해 주세요.</p>}
          <input
            value={description}
            onChange={(e) => touch(setDescription)(e.target.value)}
            placeholder="한 줄 소개"
            aria-label="한 줄 소개"
            className="mt-4 w-full bg-transparent text-xl leading-8 text-secondary outline-none placeholder:text-muted"
          />

          <div className="mt-10 flex flex-col gap-0.5 border-b border-border pb-6">
            <div data-prop-menu className={`${row} relative`}>
              <span className={label}>
                <Folder size={16} /> 주제
              </span>
              <button
                type="button"
                aria-haspopup="listbox"
                onClick={() => setMenu(menu === "topic" ? null : "topic")}
                className={`flex h-8 items-center gap-1.5 rounded-lg px-2 text-sm hover:bg-surface ${errors.topic ? "ring-2 ring-danger" : ""}`}
              >
                {isTopic(topic) ? (
                  <>
                    <TopicIcon slug={topic} className="text-brand" />
                    <span className="font-medium text-foreground">{topicLabel(topic)}</span>
                  </>
                ) : (
                  <span className="text-muted">주제 고르기</span>
                )}
              </button>
              {errors.topic && <span className="ml-2 text-xs text-danger">발행하려면 주제를 골라 주세요.</span>}
              {menu === "topic" && (
                <ul role="listbox" className={`${popover} left-[156px]`}>
                  {TOPICS.map((t) => (
                    <li key={t.slug}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={topic === t.slug}
                        onClick={() => {
                          touch(setTopic)(t.slug);
                          setErrors((e) => ({ ...e, topic: false }));
                          setMenu(null);
                        }}
                        className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[13px] hover:bg-surface ${topic === t.slug ? "font-bold text-brand" : "text-foreground"}`}
                      >
                        <TopicIcon slug={t.slug} className="text-brand" />
                        {t.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div data-prop-menu className={`${row} relative`}>
              <span className={label}>
                <CircleDot size={16} /> 상태
              </span>
              <button type="button" aria-haspopup="listbox" onClick={() => setMenu(menu === "status" ? null : "status")} className="flex h-8 items-center rounded-lg px-2 hover:bg-surface">
                <StatusBadge status={status} />
              </button>
              {menu === "status" && (
                <ul role="listbox" className={`${popover} left-[156px]`}>
                  {POST_STATUSES.map((s) => (
                    <li key={s}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={status === s}
                        onClick={() => {
                          touch(setStatus)(s);
                          setMenu(null);
                        }}
                        className={`w-full rounded-lg px-3 py-2.5 text-left text-[13px] hover:bg-surface ${status === s ? "font-bold text-brand" : "text-foreground"}`}
                      >
                        {STATUS_LABEL[s]}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className={row}>
              <span className={label}>
                <Tag size={16} /> 태그
              </span>
              <div className="flex flex-wrap items-center gap-1.5 px-2 py-1">
                {tags.map((t) => (
                  <span key={t} className="group flex h-8 items-center gap-1 rounded-lg bg-brand px-3 text-sm font-medium text-white">
                    {t}
                    <button type="button" aria-label={`${t} 태그 빼기`} onClick={() => touch(setTags)(tags.filter((x) => x !== t))} className="opacity-60 hover:opacity-100">
                      <X size={12} />
                    </button>
                  </span>
                ))}
                {tagInput === null ? (
                  <button type="button" onClick={() => setTagInput("")} className="text-xs text-muted hover:text-brand">
                    + 추가
                  </button>
                ) : (
                  <input
                    autoFocus
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onBlur={() => setTagInput(null)}
                    onKeyDown={(e) => {
                      if (e.nativeEvent.isComposing) return;
                      if (e.key === "Enter" && tagInput.trim()) {
                        e.preventDefault();
                        if (!tags.includes(tagInput.trim())) touch(setTags)([...tags, tagInput.trim()]);
                        setTagInput("");
                      }
                      if (e.key === "Escape") setTagInput(null);
                    }}
                    placeholder="입력 후 Enter"
                    aria-label="태그 추가"
                    className="h-8 w-28 rounded-lg border border-border bg-background px-2 text-sm outline-none focus:border-brand"
                  />
                )}
              </div>
            </div>

            <label className={row}>
              <span className={label}>
                <Calendar size={16} /> 발행일
              </span>
              <input
                type="datetime-local"
                value={publishedAt}
                onChange={(e) => touch(setPublishedAt)(e.target.value)}
                className="h-8 rounded-lg bg-transparent px-2 text-sm text-foreground outline-none hover:bg-surface"
              />
            </label>

            <label className={row}>
              <span className={label}>
                <Link2 size={16} /> 주소
              </span>
              <span className="flex items-center px-2 text-sm text-foreground">
                {routeFor(category, "")}
                <input
                  value={slug}
                  onChange={(e) => {
                    touch(setSlug)(e.target.value);
                    setSlugTouched(true);
                  }}
                  placeholder="저장하면 자동으로 정해져요"
                  className="h-8 w-[320px] bg-transparent outline-none placeholder:text-muted"
                />
              </span>
            </label>

            <div className={row}>
              <span className={label}>
                <Globe size={16} /> 언어
              </span>
              <div className="flex gap-1 px-2">
                {[
                  { key: "ko", label: "한국어" },
                  { key: "en", label: "English" },
                ].map((l) => (
                  <button
                    key={l.key}
                    type="button"
                    aria-pressed={locale === l.key}
                    onClick={() => touch(setLocale)(l.key)}
                    className={`h-8 rounded-lg px-2.5 text-sm ${locale === l.key ? "bg-surface font-medium text-foreground" : "text-muted hover:text-foreground"}`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="post-editor mt-8">
            <BlockNoteView
              editor={editor}
              theme={theme}
              slashMenu={false}
              onChange={() => {
                setDocVersion((v) => v + 1);
                if (ready.current) setDirty(true);
              }}
            >
              <SuggestionMenuController triggerCharacter="/" getItems={slashItems} />
            </BlockNoteView>
          </div>
        </main>

        <aside className="sticky top-16 hidden w-[200px] shrink-0 self-start pt-[280px] xl:block">
          <p className="text-sm font-bold text-foreground">포스트 정보</p>
          <p className="mt-2 text-[13px] text-secondary">
            {chars.toLocaleString()}자 · 약 {Math.max(1, Math.ceil(chars / 500))}분
          </p>
          <p className="mt-1.5 text-xs text-muted">⌘S 저장 · / 블록 메뉴</p>
        </aside>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="포스트를 삭제할까요?"
        description="삭제한 포스트와 댓글은 되돌릴 수 없어요. 잠시 내리려면 상태를 숨김으로 바꾸세요."
        onConfirm={remove}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
