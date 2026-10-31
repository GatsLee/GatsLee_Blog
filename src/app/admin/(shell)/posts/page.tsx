import Link from "next/link";
import { Search } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { TOPICS, isTopic, topicLabel } from "@/lib/topics";
import { POST_STATUSES, STATUS_LABEL, isPostStatus } from "@/lib/post-status";
import { routeFor } from "@/lib/categories";
import TopicIcon from "@/components/common/TopicIcon";
import StatusBadge from "@/components/admin/ui/StatusBadge";
import FilterSelect from "@/components/admin/posts/FilterSelect";
import RowMenu from "@/components/admin/posts/RowMenu";
import AdminPager from "@/components/admin/ui/AdminPager";

export const metadata = { title: "포스트 관리" };

const PER_PAGE = 10;

const SORTS = [
  { value: "updated", label: "최근 수정순", orderBy: { updatedAt: "desc" } },
  { value: "published", label: "최근 발행순", orderBy: { createdAt: "desc" } },
  { value: "oldest", label: "오래된 순", orderBy: { createdAt: "asc" } },
  { value: "title", label: "제목순", orderBy: { title: "asc" } },
] as const satisfies readonly { value: string; label: string; orderBy: Prisma.PostOrderByWithRelationInput }[];

type SearchParams = Promise<{ status?: string; topic?: string; q?: string; sort?: string; page?: string }>;

// 공개 글 목록(IA_PS_001)과 같은 범위: 한국어 journal·build
const SCOPE: Prisma.PostWhereInput = { locale: "ko", category: { in: ["journal", "build"] } };

const monthDay = (d: Date) => `${d.getMonth() + 1}월 ${d.getDate()}일`;

// IA_AD_002 글 관리 · 00201 주제 필터 · 00202 정렬 · 00205 행 메뉴
export default async function AdminPostsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const status = isPostStatus(sp.status) ? sp.status : undefined;
  const topic = isTopic(sp.topic) ? sp.topic : undefined;
  const q = sp.q?.trim() ?? "";
  const sort = SORTS.find((s) => s.value === sp.sort) ?? SORTS[0];

  const href = (patch: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams();
    const merged = { status, topic, q: q || undefined, sort: sort.value === "updated" ? undefined : sort.value, ...patch };
    for (const [k, v] of Object.entries(merged)) if (v !== undefined && v !== "" && !(k === "page" && String(v) === "1")) params.set(k, String(v));
    const s = params.toString();
    return s ? `/admin/posts?${s}` : "/admin/posts";
  };

  // 탭 개수는 주제·검색 조건만 반영한다
  const base: Prisma.PostWhereInput = {
    ...SCOPE,
    ...(topic && { topic }),
    ...(q && { OR: [{ title: { contains: q } }, { content: { contains: q } }] }),
  };
  const where: Prisma.PostWhereInput = { ...base, ...(status && { status }) };

  const [byStatus, byTopic, total] = await Promise.all([
    prisma.post.groupBy({ by: ["status"], where: base, _count: true }),
    prisma.post.groupBy({ by: ["topic"], where: { ...SCOPE, ...(status && { status }) }, _count: true }),
    prisma.post.count({ where }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const page = Math.min(totalPages, Math.max(1, parseInt(sp.page ?? "1") || 1));
  const posts = await prisma.post.findMany({
    where,
    orderBy: sort.orderBy,
    skip: (page - 1) * PER_PAGE,
    take: PER_PAGE,
    select: { id: true, title: true, slug: true, category: true, topic: true, status: true, createdAt: true, updatedAt: true },
  });

  const countOf = (s: string) => byStatus.find((c) => c.status === s)?._count ?? 0;
  const tabs = [
    { key: undefined, label: "전체", count: byStatus.reduce((n, c) => n + c._count, 0) },
    ...POST_STATUSES.map((s) => ({ key: s, label: STATUS_LABEL[s], count: countOf(s) })),
  ];
  const topicTotal = byTopic.reduce((n, c) => n + c._count, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold leading-8 text-foreground">포스트</h1>
          <p className="mt-1 text-[13px] text-secondary">발행한 포스트와 초안을 관리합니다.</p>
        </div>
        <Link href="/write" className="flex h-11 items-center rounded-[10px] bg-brand px-4 text-sm font-bold text-white hover:opacity-90">
          새 포스트 쓰기
        </Link>
      </div>

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <nav aria-label="상태" className="flex gap-1">
          {tabs.map((t) => {
            const active = t.key === status;
            return (
              <Link
                key={t.label}
                href={href({ status: t.key, page: undefined })}
                aria-current={active ? "page" : undefined}
                className={`flex h-9 items-center gap-1.5 rounded-[10px] px-3.5 text-[13px] ${
                  active ? "bg-brand-soft font-bold text-brand" : "font-medium text-secondary hover:bg-background"
                }`}
              >
                {t.label}
                <span className={active ? "text-brand" : "text-muted"}>{t.count}</span>
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <form action="/admin/posts" className="flex h-10 w-[240px] items-center gap-2 rounded-[10px] border border-border bg-background px-3 focus-within:border-brand">
            {status && <input type="hidden" name="status" value={status} />}
            {topic && <input type="hidden" name="topic" value={topic} />}
            {sort.value !== "updated" && <input type="hidden" name="sort" value={sort.value} />}
            <input name="q" defaultValue={q} placeholder="검색" aria-label="포스트 검색" className="min-w-0 flex-1 bg-transparent text-[13px] text-foreground outline-none placeholder:text-muted" />
            <button type="submit" aria-label="검색">
              <Search size={16} className="text-secondary" />
            </button>
          </form>
          <FilterSelect
            label="주제"
            value={topic ?? "all"}
            options={[
              { value: "all", label: "전체", count: topicTotal, href: href({ topic: undefined, page: undefined }) },
              ...TOPICS.map((t) => ({
                value: t.slug,
                label: t.label,
                count: byTopic.find((c) => c.topic === t.slug)?._count ?? 0,
                href: href({ topic: t.slug, page: undefined }),
              })),
            ]}
          />
          <FilterSelect label="" value={sort.value} options={SORTS.map((s) => ({ value: s.value, label: s.label, href: href({ sort: s.value, page: undefined }) }))} />
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-background">
        <table className="w-full table-fixed text-left">
          <thead>
            <tr className="text-[15px] font-bold text-foreground">
              <th className="w-[120px] px-4 py-4 font-bold">주제</th>
              <th className="px-4 py-4 font-bold">제목</th>
              <th className="w-[96px] px-4 py-4 font-bold">상태</th>
              <th className="w-[112px] px-4 py-4 font-bold">발행일</th>
              <th className="w-[112px] px-4 py-4 font-bold">최종 수정일</th>
              <th className="w-[56px]" aria-label="메뉴" />
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 ? (
              <tr>
                <td colSpan={6} className="border-t border-border px-4 py-16 text-center text-sm text-secondary">
                  {q || topic || status ? "조건에 맞는 포스트가 없어요." : "아직 쓴 포스트가 없어요."}
                </td>
              </tr>
            ) : (
              posts.map((p) => (
                <tr key={p.id} className="border-t border-border text-sm">
                  <td className="px-4 py-4">
                    {isTopic(p.topic) ? (
                      <span className="flex items-center gap-1.5 font-medium text-foreground">
                        <TopicIcon slug={p.topic} className="text-brand" />
                        {topicLabel(p.topic)}
                      </span>
                    ) : (
                      <span className="text-muted">미지정</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <Link href={`/write/edit/${p.id}`} className="block truncate font-bold text-foreground hover:text-brand">
                      {p.title || "제목 없음"}
                    </Link>
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-4 py-4 text-secondary">{p.status === "draft" ? "—" : monthDay(p.createdAt)}</td>
                  <td className="px-4 py-4 text-secondary">{monthDay(p.updatedAt)}</td>
                  <td className="px-2 py-4">
                    <RowMenu id={p.id} title={p.title} status={p.status} previewHref={routeFor(p.category, p.slug)} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="flex items-center justify-between border-t border-border px-4 py-4">
          <span className="text-xs text-secondary">
            {total > 0 ? `${total}개 중 ${(page - 1) * PER_PAGE + 1}–${Math.min(total, page * PER_PAGE)}` : "0개"}
          </span>
          <AdminPager page={page} totalPages={totalPages} hrefFor={(n) => href({ page: n })} />
        </div>
      </div>
    </div>
  );
}

