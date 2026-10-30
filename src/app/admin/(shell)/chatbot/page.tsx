import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { prisma } from "@/lib/db";
import { parseWeek, weekRange } from "@/lib/week";
import { chatCounts, feedbackText, qVariants, sessionRows } from "@/lib/chat-stats";
import { isChatVisible } from "@/lib/chat-settings";
import { INDEX_COLOR, INDEX_LABEL, countStates, getIndexStates, modelServer, type IndexState } from "@/lib/rag-status";
import WeekNav, { Delta } from "@/components/admin/ui/WeekNav";
import SettingToggle from "@/components/admin/chatbot/SettingToggle";

export const metadata = { title: "AI 챗봇" };

type SearchParams = Promise<{ week?: string }>;

const when = (d: Date) => `${d.getMonth() + 1}월 ${d.getDate()}일 ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

// IA_AD_004 AI 챗봇
export default async function ChatbotPage({ searchParams }: { searchParams: SearchParams }) {
  const offset = parseWeek((await searchParams).week);
  const now = weekRange(offset);
  const prev = weekRange(offset - 1);

  const [total, cur, before, faqs, candidates, recent, visible, server, index] = await Promise.all([
    chatCounts(),
    chatCounts(now),
    chatCounts(prev),
    prisma.faqEntry.findMany({
      where: { featured: true },
      orderBy: { featuredOrder: "asc" },
      select: { id: true, qVariants: true, source: true, isActive: true, _count: { select: { clicks: true } } },
    }),
    prisma.faqEntry.count({ where: { featured: false } }),
    sessionRows({ take: 4 }),
    isChatVisible(),
    modelServer(),
    getIndexStates(),
  ]);
  const states = countStates(index);

  const cumulative = [
    { label: "대화", value: total.chats },
    { label: "답변", value: total.answers },
    { label: "FAQ 클릭", value: total.clicks },
    { label: "피드백", value: total.feedback },
  ];
  const weekly = [
    { label: "대화", now: cur.chats, before: before.chats, sub: "방문자 세션" },
    { label: "답변", now: cur.answers, before: before.answers, sub: "챗봇이 보낸 답변" },
    { label: "FAQ 클릭", now: cur.clicks, before: before.clicks, sub: "추천 질문을 누른 횟수" },
    { label: "피드백", now: cur.feedback, before: before.feedback, sub: "좋아요·싫어요 합계" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold leading-8 text-foreground">AI 챗봇</h1>
          <p className="mt-1 text-[13px] text-secondary">방문자 질문과 답변 근거(FAQ·RAG)를 관리합니다.</p>
        </div>
        <span className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${visible ? "bg-[#e6f7ee] text-success" : "bg-[#eef0f3] text-secondary"}`}>
          <span className={`h-2 w-2 rounded-full ${visible ? "bg-success" : "bg-muted"}`} />
          {visible ? "방문자에게 공개 중" : "방문자에게 숨김"}
        </span>
      </div>

      <section className="flex flex-col gap-6 rounded-3xl bg-brand px-8 py-6 text-white md:flex-row md:items-center md:justify-between">
        <h2 className="text-[40px] font-bold leading-[52px]">누적 지표</h2>
        <dl className="flex">
          {cumulative.map((c, i) => (
            <div key={c.label} className={`flex w-[128px] flex-col gap-1 px-6 ${i > 0 ? "border-l border-white/25" : "pl-0"}`}>
              <dt className="text-[13px] text-white/80">{c.label}</dt>
              <dd className="text-[40px] font-bold leading-[48px]">{c.value.toLocaleString()}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="flex items-center justify-between">
        <p className="flex items-baseline gap-2">
          <span className="text-[17px] font-bold text-foreground">주간</span>
          <span className="text-xs text-secondary">배지는 지난주 대비</span>
        </p>
        <WeekNav basePath="/admin/chatbot" offset={offset} start={now.start} end={now.end} />
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {weekly.map((k) => (
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
        <section className="flex flex-1 flex-col rounded-3xl border border-border bg-background px-5 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-[17px] font-bold text-foreground">FAQ</h2>
              <p className="mt-1 text-xs text-secondary">챗봇 패널에 추천 질문으로 보이고, 비슷한 질문에는 저장된 답을 바로 보여줍니다. 최대 5개.</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Link href="/admin/chatbot/faq" className="text-xs font-bold text-brand">
                FAQ 관리 · 후보 {candidates}
              </Link>
              <span className="rounded-full bg-surface px-2.5 py-1 text-xs font-bold text-secondary">{faqs.length} / 5</span>
            </div>
          </div>
          {faqs.length === 0 ? (
            <p className="py-10 text-center text-sm text-secondary">대표 FAQ가 없어요. FAQ 관리에서 후보를 올려 주세요.</p>
          ) : (
            <ul className="mt-3">
              {faqs.map((f) => {
                const q = qVariants(f.qVariants);
                return (
                  <li key={f.id} className="flex items-center justify-between gap-4 border-b border-border px-1 py-4 last:border-0">
                    <Link href={`/admin/chatbot/faq?id=${f.id}`} className="min-w-0">
                      <p className="truncate text-[15px] font-bold text-foreground hover:text-brand">{q[0]}</p>
                      <p className="mt-0.5 text-xs text-secondary">
                        변형 질문 {Math.max(0, q.length - 1)}개 · {f.source}
                      </p>
                    </Link>
                    <span className="flex shrink-0 items-center gap-3">
                      <span className="text-xs text-secondary">클릭 {f._count.clicks}회</span>
                      <SettingToggle
                        initial={f.isActive}
                        label={`${q[0]} 사용`}
                        endpoint={`/api/admin/faq/${f.id}`}
                        field="isActive"
                        onMessage="FAQ를 다시 사용해요."
                        offMessage="FAQ를 쉬게 했어요. 추천 질문과 답변 매칭에서 빠집니다."
                      />
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <div className="flex flex-col gap-4 lg:w-[380px]">
          <section className="flex flex-col gap-4 rounded-3xl border border-border bg-background px-5 py-5">
            <div>
              <h2 className="text-[17px] font-bold text-foreground">운영 설정</h2>
              <p className="mt-1 text-xs text-secondary">바꾸면 바로 적용됩니다.</p>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-foreground">방문자에게 AI 챗봇 노출</p>
                <p className="mt-0.5 text-xs text-secondary">플로팅 버튼, 푸터, 홈의 질문하기 진입점을 보여줍니다.</p>
              </div>
              <SettingToggle
                initial={visible}
                label="방문자에게 AI 챗봇 노출"
                endpoint="/api/admin/settings"
                field="chatVisible"
                onMessage="방문자에게 챗봇을 보여줘요."
                offMessage="방문자에게 챗봇을 숨겼어요."
              />
            </div>
            <dl className="flex flex-col rounded-2xl bg-surface-2 px-4 text-[13px]">
              <div className="flex items-center justify-between border-b border-border py-3">
                <dt className="text-secondary">모델 서버</dt>
                <dd className={`flex items-center gap-1.5 font-bold ${server.ok ? "text-success" : "text-danger"}`}>
                  <span className={`h-2 w-2 rounded-full ${server.ok ? "bg-success" : "bg-danger"}`} />
                  {server.ok ? "연결됨" : "연결 안 됨"}
                </dd>
              </div>
              <div className="flex items-center justify-between border-b border-border py-3">
                <dt className="text-secondary">답변 모델</dt>
                <dd className="text-foreground">{server.chatModel}</dd>
              </div>
              <div className="flex items-center justify-between py-3">
                <dt className="text-secondary">임베딩 모델</dt>
                <dd className="text-foreground">{server.embedModel}</dd>
              </div>
            </dl>
          </section>

          <section className="flex flex-col gap-3 rounded-3xl border border-border bg-background px-5 py-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[17px] font-bold text-foreground">RAG 관리</h2>
              <Link href="/admin/chatbot/rag" aria-label="RAG 관리로" className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-foreground hover:border-brand hover:text-brand">
                <ChevronRight size={16} />
              </Link>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-xs text-secondary">글별 색인 상태</span>
              <span>
                <span className="text-[24px] font-bold text-foreground">{index.length}</span>
                <span className="ml-1 text-xs text-secondary">개 글</span>
              </span>
            </div>
            <div className="flex h-4 gap-0.5 overflow-hidden rounded">
              {(Object.keys(INDEX_LABEL) as IndexState[]).map((s) =>
                states[s] ? <span key={s} className={INDEX_COLOR[s]} style={{ flexGrow: states[s] }} title={`${INDEX_LABEL[s]} ${states[s]}`} /> : null
              )}
            </div>
            <ul className="flex flex-col items-end gap-1.5 text-xs">
              {(Object.keys(INDEX_LABEL) as IndexState[]).map((s) => (
                <li key={s} className="flex items-center gap-2 text-secondary">
                  <span className={`h-2 w-2 rounded-full ${INDEX_COLOR[s]}`} />
                  {INDEX_LABEL[s]}
                  <b className="w-5 text-right text-foreground">{states[s]}</b>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <section className="rounded-3xl border border-border bg-background px-5 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[17px] font-bold text-foreground">최근 대화</h2>
            <p className="mt-1 text-xs text-secondary">질문을 눌러 대화 전체와 답변 근거를 확인하고, 좋은 답은 FAQ로 올립니다.</p>
          </div>
          <Link href="/admin/chatbot/conversations" className="flex h-10 items-center rounded-[10px] border border-border px-4 text-sm font-bold text-foreground hover:bg-surface">
            전체 보기
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="py-10 text-center text-sm text-secondary">아직 대화가 없어요.</p>
        ) : (
          <table className="mt-4 w-full table-fixed text-left text-[13px]">
            <thead>
              <tr className="text-xs font-medium text-secondary">
                <th className="py-3 pl-1 font-medium">첫 질문</th>
                <th className="w-[64px] py-3 font-medium">메시지</th>
                <th className="w-[120px] py-3 font-medium">피드백</th>
                <th className="w-[112px] py-3 font-medium">시간</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((r) => (
                <tr key={r.sessionId} className="border-t border-border">
                  <td className="py-4 pl-1">
                    <Link href={`/admin/chatbot/conversations?session=${encodeURIComponent(r.sessionId)}`} className="block truncate text-foreground hover:text-brand">
                      {r.question || "(질문 없음)"}
                    </Link>
                  </td>
                  <td className="py-4 text-secondary">{r.messages}</td>
                  <td className="py-4 text-secondary">{feedbackText(r)}</td>
                  <td className="py-4 text-secondary">{when(r.lastAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
