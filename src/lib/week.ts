// 어드민 주간 지표 공용 (IA_AD_001 대시보드, IA_AD_004 AI 챗봇). offset 0은 오늘까지 7일
const DAY = 86_400_000;

export function weekRange(offset: number) {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  end.setTime(end.getTime() + offset * 7 * DAY);
  const start = new Date(end.getTime() - 7 * DAY + 1);
  return { start, end };
}

export const parseWeek = (v: string | undefined) => Math.min(0, parseInt(v ?? "0") || 0);

export const monthDot = (d: Date) => `${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;

export { DAY };
