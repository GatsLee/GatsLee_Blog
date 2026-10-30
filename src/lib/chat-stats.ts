import { prisma } from "@/lib/db";

// AI 챗봇 지표 (IA_AD_004). range가 없으면 누적
export async function chatCounts(range?: { start: Date; end: Date }) {
  const at = range ? { createdAt: { gte: range.start, lte: range.end } } : {};
  const [sessions, answers, clicks, feedback] = await Promise.all([
    prisma.chatMessage.findMany({ where: { ...at, role: "user" }, distinct: ["sessionId"], select: { sessionId: true } }),
    prisma.chatMessage.count({ where: { ...at, role: "assistant" } }),
    prisma.faqClick.count({ where: at }),
    prisma.chatMessage.count({ where: { ...at, feedback: { in: ["up", "down"] } } }),
  ]);
  return { chats: sessions.length, answers, clicks, feedback };
}

export interface SessionRow {
  sessionId: string;
  question: string;
  messages: number;
  up: number;
  down: number;
  lastAt: Date;
  firstTier: string;
}

// 대화 세션 목록. 마지막 메시지가 최근인 순
export async function sessionRows({ skip = 0, take = 10, sessionIds }: { skip?: number; take?: number; sessionIds?: string[] }) {
  const groups = await prisma.chatMessage.groupBy({
    by: ["sessionId"],
    where: sessionIds ? { sessionId: { in: sessionIds } } : undefined,
    _count: { _all: true },
    _max: { createdAt: true },
    orderBy: { _max: { createdAt: "desc" } },
    skip,
    take,
  });
  const ids = groups.map((g) => g.sessionId);
  const msgs = await prisma.chatMessage.findMany({
    where: { sessionId: { in: ids } },
    orderBy: { createdAt: "asc" },
    select: { sessionId: true, role: true, content: true, feedback: true, tier: true },
  });
  return groups.map<SessionRow>((g) => {
    const own = msgs.filter((m) => m.sessionId === g.sessionId);
    return {
      sessionId: g.sessionId,
      question: own.find((m) => m.role === "user")?.content ?? "",
      messages: g._count._all,
      up: own.filter((m) => m.feedback === "up").length,
      down: own.filter((m) => m.feedback === "down").length,
      lastAt: g._max.createdAt ?? new Date(0),
      firstTier: own.find((m) => m.role === "assistant")?.tier ?? "",
    };
  });
}

export const feedbackText = (r: { up: number; down: number }) =>
  r.up || r.down ? [r.up && `좋아요 ${r.up}`, r.down && `싫어요 ${r.down}`].filter(Boolean).join(" · ") : "—";

export function qVariants(raw: string): string[] {
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

// 답변 경로 라벨 (docs/ia.md "AI 챗봇 답변 경로 표기")
export const TIER_LABEL: Record<string, { label: string; tone: string }> = {
  "0": { label: "FAQ 그대로", tone: "bg-[#e6f7ee] text-success" },
  "1": { label: "FAQ 유사", tone: "bg-[#e6f7ee] text-success" },
  "2": { label: "FAQ 참고 생성", tone: "bg-brand-soft text-brand" },
  "3": { label: "검색 후 생성", tone: "bg-[#fff4e5] text-warning" },
};

export const FAQ_TIERS = ["0", "1"];
export const GEN_TIERS = ["2", "3"];
