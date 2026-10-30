import { prisma } from "@/lib/db";

/**
 * 업로드 잔디. 하루 한 칸, 그날 공개한 글·프로젝트 수로 0~4단계를 정한다.
 * 데이터는 Post.createdAt(공개 글)과 Product.createdAt(공개 프로젝트)만 쓴다.
 */
export interface StreakData {
  weeks: number[][]; // 주(열) × 요일(행, 일요일 시작). -1은 아직 오지 않은 날
  months: { label: string; col: number }[];
  posts: number;
  projects: number;
  longest: number;
}

const DAY = 86_400_000;
const key = (d: Date) => d.toISOString().slice(0, 10);
export const levelOf = (n: number) => (n <= 0 ? 0 : n >= 4 ? 4 : n);

export async function getStreak(weekCount: number, today = new Date()): Promise<StreakData> {
  const end = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  const start = new Date(end.getTime() - ((weekCount - 1) * 7 + end.getUTCDay()) * DAY);

  const [posts, projects] = await Promise.all([
    prisma.post.findMany({
      where: { published: true, locale: "ko", category: { in: ["journal", "build"] }, createdAt: { gte: start } },
      select: { createdAt: true },
    }),
    prisma.product.findMany({ where: { published: true, createdAt: { gte: start } }, select: { createdAt: true } }),
  ]);

  const counts = new Map<string, number>();
  for (const { createdAt } of [...posts, ...projects]) {
    const k = key(createdAt);
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }

  const weeks: number[][] = [];
  const months: { label: string; col: number }[] = [];
  let longest = 0;
  let run = 0;
  for (let w = 0; w < weekCount; w++) {
    const col: number[] = [];
    for (let d = 0; d < 7; d++) {
      const day = new Date(start.getTime() + (w * 7 + d) * DAY);
      if (day > end) {
        col.push(-1);
        continue;
      }
      const n = counts.get(key(day)) ?? 0;
      col.push(n);
      run = n > 0 ? run + 1 : 0;
      longest = Math.max(longest, run);
      if (day.getUTCDate() === 1) months.push({ label: `${day.getUTCMonth() + 1}월`, col: w });
    }
    weeks.push(col);
  }
  return { weeks, months, posts: posts.length, projects: projects.length, longest };
}
