import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/db";
import { countStates, getIndexStates, type IndexState } from "@/lib/rag-status";
import RagHeader from "@/components/admin/chatbot/RagHeader";
import SearchTest from "@/components/admin/chatbot/SearchTest";
import { CleanupOrphans, ReindexPost } from "@/components/admin/chatbot/RagActions";

export const metadata = { title: "RAG 관리" };

type SearchParams = Promise<{ state?: string; post?: string; more?: string }>;

// 검색 흐름 5단계 (src/lib/rag.ts 기준). 코드가 바뀌면 같이 고친다
const PIPELINE = [
  { title: "글 나누기", body: "빈 줄로 문단을 나누고, 1000자가 넘으면 문장 단위로 다시 나눕니다. 50자 미만은 버리고 앞에 글 제목을 붙입니다.", tag: "chunkPost" },
  { title: "임베딩", body: "청크마다 1024차원 벡터를 만듭니다.", tag: "bge-m3" },
  { title: "두 방식으로 찾기", body: "질문과 의미가 가까운 청크 20개, 단어가 겹치는 청크 20개를 따로 찾습니다.", tag: "벡터 + BM25" },
  { title: "순위 합치기", body: "두 순위를 하나로 합칩니다. 양쪽에서 모두 높으면 앞으로 옵니다.", tag: "RRF k=60" },
  { title: "고르기", body: "한 글에서 최대 2개, 모두 5개를 골라 모델에 넘깁니다.", tag: "top 5" },
];

const STATE_TABS: { key?: IndexState; label: string }[] = [
  { label: "전체" },
  { key: "stale", label: "수정됨" },
  { key: "missing", label: "미색인" },
  { key: "orphan", label: "비공개 남음" },
];

const STATE_TONE: Record<IndexState, string> = {
  fresh: "bg-[#e6f7ee] text-success",
  stale: "bg-[#fff4e5] text-warning",
  missing: "bg-[#eef0f3] text-secondary",
  orphan: "bg-[#fdecea] text-danger",
};
const STATE_SHORT: Record<IndexState, string> = { fresh: "최신", stale: "수정됨", missing: "미색인", orphan: "비공개 남음" };

const LIST_SIZE = 8;
const monthDay = (d: Date) => `${d.getMonth() + 1}월 ${d.getDate()}일`;
const stripPrefix = (s: string) => s.replace(/^\[Post: [^\]]*\]\s*/, "");

// IA_AD_00403 RAG 관리 · 0040301 색인 중 · 0040302 검색 테스트 빈 결과
export default async function RagPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const [index, publishedPosts, totalChunks] = await Promise.all([
    getIndexStates(),
    prisma.post.findMany({ where: { published: true }, orderBy: { createdAt: "desc" }, select: { id: true, title: true } }),
    prisma.postChunk.count(),
  ]);
  const states = countStates(index);
  const orphanChunks = index.filter((p) => p.state === "orphan").reduce((n, p) => n + p.chunks, 0);
  const indexedPublic = states.fresh + states.stale;

  // 손볼 것이 먼저 보이게: 수정됨 → 미색인 → 비공개 남음 → 최신
  const order: IndexState[] = ["stale", "missing", "orphan", "fresh"];
  const filtered = index.filter((p) => !sp.state || p.state === sp.state).sort((a, b) => order.indexOf(a.state) - order.indexOf(b.state));
  const shown = sp.more ? filtered : filtered.slice(0, LIST_SIZE);
  const selected = index.find((p) => String(p.postId) === sp.post) ?? shown[0];

  const chunks = selected
    ? await prisma.postChunk.findMany({ where: { postId: selected.postId }, orderBy: { chunkIndex: "asc" }, select: { id: true, chunkIndex: true, content: true } })
    : [];
  const avg = chunks.length ? Math.round(chunks.reduce((n, c) => n + stripPrefix(c.content).length, 0) / chunks.length) : 0;

  const href = (patch: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries({ state: sp.state, post: sp.post, more: sp.more, ...patch })) if (v) p.set(k, v);
    const s = p.toString();
    return s ? `/admin/chatbot/rag?${s}` : "/admin/chatbot/rag";
  };

  const kpis = [
    { label: "공개 글 색인", value: `${indexedPublic} / ${publishedPosts.length}`, sub: `미색인 ${states.missing}개`, badge: null },
    { label: "청크", value: totalChunks.toLocaleString(), sub: `글당 평균 ${indexedPublic ? Math.round((totalChunks - orphanChunks) / indexedPublic) : 0}개`, badge: null },
    { label: "비공개 글 청크", value: orphanChunks.toLocaleString(), sub: `${states.orphan}개 글 · 정리 필요`, badge: <CleanupOrphans count={orphanChunks} /> },
    {
      label: "색인 후 수정",
      value: String(states.stale),
      sub: "다시 색인 권장",
      badge: states.stale ? <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-bold text-brand">권장</span> : null,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <RagHeader posts={publishedPosts} />

      <section className="flex flex-col gap-4 rounded-3xl border border-border bg-background p-6">
        <div>
          <h2 className="text-[17px] font-bold text-foreground">검색이 돌아가는 순서</h2>
          <p className="mt-1 text-xs text-secondary">src/lib/rag.ts 기준</p>
        </div>
        <ol className="flex flex-col gap-3 lg:flex-row lg:items-stretch">
          {PIPELINE.map((s, i) => (
            <li key={s.title} className="flex flex-1 items-center gap-3">
              {i > 0 && <ArrowRight size={16} className="hidden shrink-0 text-muted lg:block" />}
              <div className="flex h-full flex-1 flex-col gap-2 rounded-2xl bg-surface-2 p-4">
                <p className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-xs text-white">{i + 1}</span>
                  {s.title}
                </p>
                <p className="flex-1 text-xs leading-5 text-secondary">{s.body}</p>
                <span className="w-fit rounded-md bg-background px-2 py-1 text-[11px] text-secondary">{s.tag}</span>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <div className="grid gap-4 md:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="flex flex-col gap-1.5 rounded-[20px] border border-border bg-background px-[18px] py-4">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-secondary">{k.label}</span>
              {k.badge}
            </div>
            <span className="text-[28px] font-bold leading-9 text-foreground">{k.value}</span>
            <span className="text-[11px] text-secondary">{k.sub}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <section className="flex flex-col gap-3 rounded-3xl border border-border bg-background p-5 lg:w-[380px] lg:shrink-0">
          <h2 className="text-[17px] font-bold text-foreground">글별 색인 상태</h2>
          <nav aria-label="색인 상태" className="flex flex-wrap gap-1">
            {STATE_TABS.map((t) => {
              const active = (sp.state ?? undefined) === t.key;
              const count = t.key ? states[t.key] : index.length;
              return (
                <Link
                  key={t.label}
                  href={href({ state: t.key, post: undefined, more: undefined })}
                  aria-current={active ? "page" : undefined}
                  className={`flex h-8 items-center gap-1 rounded-lg px-2.5 text-xs ${active ? "bg-brand-soft font-bold text-brand" : "font-medium text-secondary hover:bg-surface"}`}
                >
                  {t.label}
                  <span className={active ? "text-brand" : "text-muted"}>{count}</span>
                </Link>
              );
            })}
          </nav>
          {shown.length === 0 ? (
            <p className="py-10 text-center text-sm text-secondary">해당하는 글이 없어요.</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {shown.map((p) => (
                <li key={p.postId}>
                  <Link
                    href={href({ post: String(p.postId) })}
                    aria-current={selected?.postId === p.postId ? "true" : undefined}
                    className={`flex flex-col gap-1.5 rounded-2xl border px-3 py-3 ${selected?.postId === p.postId ? "border-brand" : "border-transparent hover:bg-surface"}`}
                  >
                    <span className="truncate text-sm font-medium text-foreground">{p.title}</span>
                    <span className="flex items-center gap-2 text-xs text-secondary">
                      <span className={`rounded-md px-1.5 py-0.5 text-[11px] font-bold ${STATE_TONE[p.state]}`}>{STATE_SHORT[p.state]}</span>
                      {p.chunks ? `청크 ${p.chunks}` : "청크 없음"}
                      {p.indexedAt && ` · ${monthDay(p.indexedAt)} 색인`}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {!sp.more && filtered.length > LIST_SIZE && (
            <Link href={href({ more: "1" })} className="text-xs font-medium text-brand">
              {filtered.length}개 중 {LIST_SIZE}개 · 더 보기
            </Link>
          )}
        </section>

        <section className="flex min-w-0 flex-1 flex-col gap-4 rounded-3xl border border-border bg-background p-6">
          {!selected ? (
            <p className="py-16 text-center text-sm text-secondary">왼쪽에서 글을 고르세요.</p>
          ) : (
            <>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="truncate text-xl font-bold text-foreground">{selected.title}</h2>
                  <p className="mt-1 text-xs text-secondary">
                    {chunks.length ? `청크 ${chunks.length}개 · 평균 ${avg}자` : "청크 없음"}
                    {selected.indexedAt && ` · ${monthDay(selected.indexedAt)} 색인`}
                    {selected.state === "stale" && " · 이후 글 수정됨"}
                    {selected.state === "orphan" && " · 공개되지 않은 글"}
                  </p>
                </div>
                <ReindexPost postId={selected.postId} disabled={selected.state === "orphan"} />
              </div>
              {chunks.length > 0 && (
                <>
                  <p className="rounded-xl bg-surface-2 px-4 py-2.5 text-xs text-secondary">모든 청크 앞에는 [Post: 글 제목]이 붙어 저장됩니다. 아래에서는 생략해 보여줍니다.</p>
                  <ol className="flex flex-col gap-2">
                    {chunks.map((c) => {
                      const text = stripPrefix(c.content);
                      // 코드 블록 울타리(```)가 홀수면 블록 중간에서 잘린 청크다
                      const split = ((text.match(/```/g) ?? []).length % 2) === 1;
                      return (
                        <li key={c.id} className={`flex gap-4 rounded-xl border px-4 py-3 ${split ? "border-[#f0d7a8] bg-[#fffaf0]" : "border-border"}`}>
                          <span className="w-12 shrink-0 text-xs">
                            <span className="block font-bold text-brand">#{c.chunkIndex}</span>
                            <span className="text-muted">{text.length}자</span>
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="line-clamp-2 text-[13px] leading-5 text-foreground">{text}</span>
                            {split && <span className="mt-1.5 inline-block rounded-md bg-[#fff4e5] px-1.5 py-0.5 text-[11px] font-bold text-warning">코드 블록이 둘로 나뉨</span>}
                          </span>
                        </li>
                      );
                    })}
                  </ol>
                </>
              )}
            </>
          )}
        </section>
      </div>

      <SearchTest />
    </div>
  );
}
