import Link from "next/link";
import { Search } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { routeFor } from "@/lib/categories";
import { FAQ_TIERS, GEN_TIERS, TIER_LABEL, sessionRows } from "@/lib/chat-stats";
import SubPageHeader from "@/components/admin/ui/SubPageHeader";
import AdminPager from "@/components/admin/ui/AdminPager";
import PromoteButton from "@/components/admin/chatbot/PromoteButton";

export const metadata = { title: "대화" };

const PER_PAGE = 10;

type SearchParams = Promise<{ q?: string; filter?: string; page?: string; session?: string }>;

const FILTERS = [
  { key: undefined, label: "전체", where: null },
  { key: "faq", label: "FAQ로 답함", where: { role: "assistant", tier: { in: FAQ_TIERS } } },
  { key: "gen", label: "생성 답변", where: { role: "assistant", tier: { in: GEN_TIERS } } },
  { key: "feedback", label: "피드백 있음", where: { feedback: { in: ["up", "down"] } } },
] as const satisfies readonly { key: string | undefined; label: string; where: Prisma.ChatMessageWhereInput | null }[];

const pad = (n: number) => String(n).padStart(2, "0");
const when = (d: Date) => `${d.getMonth() + 1}월 ${d.getDate()}일 ${pad(d.getHours())}:${pad(d.getMinutes())}`;
const sec = (ms: number | null) => (ms === null ? null : `${(ms / 1000).toFixed(1)}초`);

// 조건에 맞는 세션 id. 조건이 없으면 null(전체)
async function matchingSessions(where: Prisma.ChatMessageWhereInput | null, q: string): Promise<string[] | null> {
  const sets: Set<string>[] = [];
  if (where) {
    const rows = await prisma.chatMessage.findMany({ where, distinct: ["sessionId"], select: { sessionId: true } });
    sets.push(new Set(rows.map((r) => r.sessionId)));
  }
  if (q) {
    const rows = await prisma.chatMessage.findMany({ where: { role: "user", content: { contains: q } }, distinct: ["sessionId"], select: { sessionId: true } });
    sets.push(new Set(rows.map((r) => r.sessionId)));
  }
  if (!sets.length) return null;
  return [...sets[0]].filter((id) => sets.every((s) => s.has(id)));
}

// IA_AD_00402 대화 상세
export default async function ConversationsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const filter = FILTERS.find((f) => f.key === sp.filter) ?? FILTERS[0];

  const [allIds, counts] = await Promise.all([
    matchingSessions(filter.where, q),
    Promise.all(
      FILTERS.map(async (f) => {
        const ids = await matchingSessions(f.where, q);
        if (ids) return ids.length;
        return (await prisma.chatMessage.findMany({ distinct: ["sessionId"], select: { sessionId: true } })).length;
      })
    ),
  ]);
  const total = counts[FILTERS.indexOf(filter)];
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const page = Math.min(totalPages, Math.max(1, parseInt(sp.page ?? "1") || 1));
  const rows = await sessionRows({ skip: (page - 1) * PER_PAGE, take: PER_PAGE, sessionIds: allIds ?? undefined });

  const selectedId = sp.session ?? rows[0]?.sessionId;
  const messages = selectedId
    ? await prisma.chatMessage.findMany({ where: { sessionId: selectedId }, orderBy: { createdAt: "asc" } })
    : [];
  const chunkIds = [...new Set(messages.flatMap((m) => (m.role === "assistant" ? (JSON.parse(m.chunkIds || "[]") as number[]) : [])))];
  const chunks = chunkIds.length
    ? await prisma.postChunk.findMany({ where: { id: { in: chunkIds } }, select: { id: true, postTitle: true, postSlug: true, postCategory: true } })
    : [];
  const sourcesOf = (raw: string) => {
    const ids = JSON.parse(raw || "[]") as number[];
    const seen = new Map<string, { title: string; href: string }>();
    for (const c of chunks.filter((c) => ids.includes(c.id))) seen.set(c.postSlug, { title: c.postTitle, href: routeFor(c.postCategory, c.postSlug) });
    return [...seen.values()];
  };

  const firstUser = messages.find((m) => m.role === "user");
  const firstAnswer = messages.find((m) => m.role === "assistant");

  const href = (patch: Record<string, string | number | undefined>) => {
    const p = new URLSearchParams();
    const merged = { q: q || undefined, filter: filter.key, page: page > 1 ? page : undefined, session: sp.session, ...patch };
    for (const [k, v] of Object.entries(merged)) if (v !== undefined && v !== "") p.set(k, String(v));
    const s = p.toString();
    return s ? `/admin/chatbot/conversations?${s}` : "/admin/chatbot/conversations";
  };

  return (
    <div className="flex flex-col gap-6">
      <SubPageHeader parent={{ href: "/admin/chatbot", label: "AI 챗봇" }} title="대화" desc="방문자 대화와 답변마다 어떤 경로로, 어떤 글을 근거로 답했는지 확인합니다." />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <section className="flex flex-col gap-3 rounded-3xl border border-border bg-background p-4 lg:w-[380px] lg:shrink-0">
          <form action="/admin/chatbot/conversations" className="flex h-11 items-center gap-2 rounded-[10px] border border-border px-3 focus-within:border-brand">
            {filter.key && <input type="hidden" name="filter" value={filter.key} />}
            <input name="q" defaultValue={q} placeholder="질문 검색" aria-label="질문 검색" className="min-w-0 flex-1 bg-transparent text-[13px] text-foreground outline-none placeholder:text-muted" />
            <button type="submit" aria-label="검색">
              <Search size={16} className="text-secondary" />
            </button>
          </form>
          <nav aria-label="대화 필터" className="flex flex-wrap gap-1">
            {FILTERS.map((f, i) => {
              const active = f === filter;
              return (
                <Link
                  key={f.label}
                  href={href({ filter: f.key, page: undefined, session: undefined })}
                  aria-current={active ? "page" : undefined}
                  className={`flex h-8 items-center gap-1 rounded-lg px-2.5 text-xs ${active ? "bg-brand-soft font-bold text-brand" : "font-medium text-secondary hover:bg-surface"}`}
                >
                  {f.label}
                  <span className={active ? "text-brand" : "text-muted"}>{counts[i]}</span>
                </Link>
              );
            })}
          </nav>
          {rows.length === 0 ? (
            <p className="py-12 text-center text-sm text-secondary">{q || filter.key ? "조건에 맞는 대화가 없어요." : "아직 대화가 없어요."}</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {rows.map((r) => {
                const tier = TIER_LABEL[r.firstTier];
                const active = r.sessionId === selectedId;
                return (
                  <li key={r.sessionId}>
                    <Link
                      href={href({ session: r.sessionId })}
                      aria-current={active ? "true" : undefined}
                      className={`flex flex-col gap-1.5 rounded-2xl border px-3 py-3 ${active ? "border-brand" : "border-transparent hover:bg-surface"}`}
                    >
                      <span className="truncate text-sm font-medium text-foreground">{r.question || "(질문 없음)"}</span>
                      <span className="flex items-center gap-2 text-xs text-secondary">
                        {tier && <span className={`rounded-md px-1.5 py-0.5 text-[11px] font-bold ${tier.tone}`}>{tier.label}</span>}
                        메시지 {r.messages} · {when(r.lastAt)}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
          <div className="flex flex-col items-center gap-2 pt-1">
            <span className="text-xs text-secondary">{total > 0 ? `${total}개 중 ${(page - 1) * PER_PAGE + 1}–${Math.min(total, page * PER_PAGE)}` : ""}</span>
            <AdminPager page={page} totalPages={totalPages} hrefFor={(n) => href({ page: n, session: undefined })} />
          </div>
        </section>

        <section className="flex min-w-0 flex-1 flex-col rounded-3xl border border-border bg-background p-6">
          {messages.length === 0 ? (
            <p className="py-16 text-center text-sm text-secondary">왼쪽에서 대화를 고르세요.</p>
          ) : (
            <>
              <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
                <div className="min-w-0">
                  <h2 className="truncate text-xl font-bold text-foreground">{firstUser?.content ?? "(질문 없음)"}</h2>
                  <p className="mt-1 text-xs text-secondary">
                    {when(messages[0].createdAt)} · 메시지 {messages.length} · 세션 {selectedId?.slice(0, 6)}
                  </p>
                </div>
                <PromoteButton question={firstUser?.content ?? ""} answer={firstAnswer?.content ?? ""} messageId={firstAnswer?.id} />
              </div>
              <ol className="flex max-h-[760px] flex-col gap-5 overflow-y-auto py-5 pr-2">
                {messages.map((m) =>
                  m.role === "user" ? (
                    <li key={m.id} className="self-end rounded-2xl bg-brand px-4 py-3 text-[15px] leading-6 text-white md:max-w-[70%]">
                      {m.content}
                    </li>
                  ) : (
                    <li key={m.id} className="flex flex-col gap-2 md:max-w-[85%]">
                      <p className="whitespace-pre-line rounded-2xl bg-surface px-4 py-3 text-[15px] leading-6 text-foreground">{m.content}</p>
                      <p className="flex flex-wrap items-center gap-2 text-xs text-secondary">
                        {TIER_LABEL[m.tier] ? (
                          <span className={`rounded-md px-1.5 py-0.5 text-[11px] font-bold ${TIER_LABEL[m.tier].tone}`}>{TIER_LABEL[m.tier].label}</span>
                        ) : (
                          <span className="text-muted">경로 기록 없음</span>
                        )}
                        {sec(m.ttftMs) && <span>첫 글자 {sec(m.ttftMs)}</span>}
                        {sec(m.totalMs) && <span>· 전체 {sec(m.totalMs)}</span>}
                        <span className={m.feedback ? "text-foreground" : "text-muted"}>
                          {m.feedback === "up" ? "좋아요" : m.feedback === "down" ? "싫어요" : "피드백 없음"}
                        </span>
                      </p>
                      {sourcesOf(m.chunkIds).length > 0 && (
                        <p className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="text-secondary">근거</span>
                          {sourcesOf(m.chunkIds).map((s) => (
                            <Link key={s.href} href={s.href} target="_blank" className="rounded-md border border-brand/40 px-2 py-1 text-brand hover:bg-brand-soft">
                              {s.title}
                            </Link>
                          ))}
                        </p>
                      )}
                    </li>
                  )
                )}
              </ol>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
