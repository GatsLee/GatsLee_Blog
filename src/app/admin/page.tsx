import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { prisma } from "@/lib/db";

const DAY = 86_400_000;

type SearchParams = Promise<{ week?: string }>;

function range(offset: number) {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  end.setTime(end.getTime() + offset * 7 * DAY);
  const start = new Date(end.getTime() - 7 * DAY + 1);
  return { start, end };
}

const md = (d: Date) => `${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;

async function countsFor(start: Date, end: Date) {
  const between = { gte: start, lte: end };
  const [views, comments, posts, sessions] = await Promise.all([
    prisma.pageView.count({ where: { createdAt: between } }),
    prisma.comment.count({ where: { createdAt: between } }),
    prisma.post.count({ where: { status: "published", createdAt: between } }),
    prisma.chatMessage.findMany({ where: { createdAt: between, role: "user" }, distinct: ["sessionId"], select: { sessionId: true } }),
  ]);
  return { views, comments, posts, chats: sessions.length };
}

function Delta({ now, before }: { now: number; before: number }) {
  const d = now - before;
  if (d === 0) return null;
  return (
    <span className={`rounded-full px-[7px] py-[3px] text-[11px] font-bold ${d > 0 ? "bg-brand-soft text-brand" : "bg-[#eef0f3] text-secondary"}`}>
      {d > 0 ? `+${d}` : `−${-d}`}
    </span>
  );
}

// 조회 추이: 7일 영역 그래프
function ViewsChart({ days }: { days: { label: string; value: number }[] }) {
  const W = 680;
  const H = 200;
  const max = Math.max(4, ...days.map((d) => d.value));
  const x = (i: number) => 16 + (i * (W - 32)) / (days.length - 1);
  const y = (v: number) => H - 24 - (v / max) * (H - 48);
  const line = days.map((d, i) => `${i ? "L" : "M"}${x(i)},${y(d.value)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="일별 조회수">
      {[0.25, 0.5, 0.75].map((r) => (
        <line key={r} x1="16" x2={W - 16} y1={24 + r * (H - 48)} y2={24 + r * (H - 48)} stroke="var(--color-border)" strokeDasharray="4 4" />
      ))}
      <path d={`${line} L${x(days.length - 1)},${H - 24} L${x(0)},${H - 24} Z`} fill="var(--color-brand-soft)" />
      <path d={line} fill="none" stroke="var(--color-brand)" strokeWidth="2.5" strokeLinejoin="round" />
      {days.map((d, i) => (
        <g key={d.label}>
          <circle cx={x(i)} cy={y(d.value)} r="3.5" fill="var(--color-brand)" />
          <text x={x(i)} y={H - 4} textAnchor="middle" fontSize="11" fill="var(--color-secondary)">
            {d.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

// IA_AD_001 대시보드. 있는 데이터만 보여준다 (D8)
export default async function DashboardPage({ searchParams }: { searchParams: SearchParams }) {
  const offset = Math.min(0, parseInt((await searchParams).week ?? "0") || 0);
  const now = range(offset);
  const prev = range(offset - 1);

  const [cur, before, statusCounts, daily, viewed] = await Promise.all([
    countsFor(now.start, now.end),
    countsFor(prev.start, prev.end),
    prisma.post.groupBy({ by: ["status"], where: { locale: "ko", category: { in: ["journal", "build"] } }, _count: true }),
    prisma.pageView.findMany({ where: { createdAt: { gte: now.start, lte: now.end } }, select: { createdAt: true } }),
    prisma.pageView.groupBy({
      by: ["path"],
      where: { createdAt: { gte: now.start, lte: now.end }, OR: [{ path: { startsWith: "/insights/" } }, { path: { startsWith: "/products/" } }] },
      _count: true,
      orderBy: { _count: { path: "desc" } },
      take: 3,
    }),
  ]);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now.start.getTime() + i * DAY);
    const value = daily.filter((v) => v.createdAt.toDateString() === d.toDateString()).length;
    return { label: md(d), value };
  });

  const slugs = viewed.map((v) => v.path.split("/")[2]).filter(Boolean);
  const [posts, products] = await Promise.all([
    prisma.post.findMany({ where: { slug: { in: slugs } }, select: { slug: true, title: true } }),
    prisma.product.findMany({ where: { slug: { in: slugs } }, select: { slug: true, name: true } }),
  ]);
  const titleOf = (path: string) => {
    const slug = path.split("/")[2];
    return posts.find((p) => p.slug === slug)?.title ?? products.find((p) => p.slug === slug)?.name ?? path;
  };

  const status = (s: string) => statusCounts.find((c) => c.status === s)?._count ?? 0;
  const kpis = [
    { label: "주간 조회수", now: cur.views, before: before.views, sub: "공개 화면 조회" },
    { label: "주간 댓글", now: cur.comments, before: before.comments, sub: "글·프로젝트 댓글" },
    { label: "발행한 글", now: cur.posts, before: before.posts, sub: "이 기간에 발행" },
    { label: "챗봇 대화", now: cur.chats, before: before.chats, sub: "방문자 세션" },
  ];
  const stages = [
    { key: "draft", label: "초안", desc: "작성 중이거나 공개 전인 글" },
    { key: "published", label: "발행됨", desc: "블로그에 공개된 글" },
    { key: "hidden", label: "숨김", desc: "발행했다가 내린 글" },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold leading-8 text-foreground">대시보드</h1>
        <div className="flex items-center gap-2 text-[13px] font-bold text-foreground">
          <Link href={`/admin?week=${offset - 1}`} aria-label="이전 주" className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-background">
            <ChevronLeft size={16} />
          </Link>
          {md(now.start)} – {md(now.end)}
          {offset < 0 ? (
            <Link href={`/admin?week=${offset + 1}`} aria-label="다음 주" className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-background">
              <ChevronRight size={16} />
            </Link>
          ) : (
            <span className="flex h-8 w-8 items-center justify-center text-muted">
              <ChevronRight size={16} />
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="flex flex-col gap-1.5 rounded-[20px] border border-border bg-background px-[18px] py-4">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-secondary">{k.label}</span>
              <Delta now={k.now} before={k.before} />
            </div>
            <span className="text-[28px] font-bold leading-9 text-foreground">{k.now.toLocaleString()}</span>
            <span className="text-[11px] text-secondary">{k.sub}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="flex-1 rounded-3xl border border-border bg-background px-5 py-3.5">
          <p className="py-2 text-[17px] font-bold text-foreground">조회 추이</p>
          <ViewsChart days={days} />
        </div>
        <div className="flex flex-col gap-2 rounded-3xl border border-border bg-background px-5 py-4 lg:w-[376px]">
          <p className="text-[17px] font-bold text-foreground">많이 읽힌 글</p>
          <p className="text-[11px] text-secondary">이 기간에 조회가 많았던 글과 프로젝트입니다.</p>
          {viewed.length === 0 ? (
            <p className="py-6 text-center text-sm text-secondary">이 기간에 기록된 조회가 없어요.</p>
          ) : (
            viewed.map((v, i) => (
              <Link key={v.path} href={v.path} target="_blank" className="flex flex-col gap-0.5 rounded-xl bg-surface px-3 py-2.5 hover:bg-brand-soft">
                <span className="text-[11px] font-medium text-brand">
                  {i + 1}위 · 조회 {v._count}
                </span>
                <span className="truncate text-[13px] font-bold text-foreground">{titleOf(v.path)}</span>
              </Link>
            ))
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3.5 rounded-3xl border border-border bg-background px-5 py-[18px]">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[17px] font-bold text-foreground">콘텐츠 단계</p>
            <p className="text-[11px] text-secondary">한국어 글 기준</p>
          </div>
          <Link href="/admin/posts" className="text-[11px] font-bold text-brand">
            전체 {status("draft") + status("published") + status("hidden")}개
          </Link>
        </div>
        <div className="flex flex-col items-stretch gap-3 md:flex-row md:items-center">
          {stages.map((s, i) => (
            <div key={s.key} className="contents">
              {i > 0 && <ArrowRight size={20} className="hidden shrink-0 text-brand md:block" />}
              <Link href={`/admin/posts?status=${s.key}`} className="flex flex-1 flex-col gap-3 rounded-[18px] bg-surface p-4 hover:bg-brand-soft">
                <span className="flex items-center justify-between">
                  <span className="text-[15px] font-bold text-foreground">{s.label}</span>
                  <span className="text-[22px] font-bold text-foreground">{status(s.key)}</span>
                </span>
                <span className="text-xs text-secondary">{s.desc}</span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
