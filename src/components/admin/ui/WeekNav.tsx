import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { monthDot } from "@/lib/week";

// 주간 이동 (이전 주 · 기간 · 다음 주). 이번 주에서는 다음이 비활성
export default function WeekNav({ basePath, offset, start, end }: { basePath: string; offset: number; start: Date; end: Date }) {
  const btn = "flex h-8 w-8 items-center justify-center rounded-lg";
  return (
    <div className="flex items-center gap-2 text-[13px] font-bold text-foreground">
      <Link href={`${basePath}?week=${offset - 1}`} aria-label="이전 주" className={`${btn} hover:bg-background`}>
        <ChevronLeft size={16} />
      </Link>
      {monthDot(start)} – {monthDot(end)}
      {offset < 0 ? (
        <Link href={offset + 1 === 0 ? basePath : `${basePath}?week=${offset + 1}`} aria-label="다음 주" className={`${btn} hover:bg-background`}>
          <ChevronRight size={16} />
        </Link>
      ) : (
        <span className={`${btn} text-muted`}>
          <ChevronRight size={16} />
        </span>
      )}
    </div>
  );
}

// 지난주 대비 배지. 같으면 숨긴다
export function Delta({ now, before }: { now: number; before: number }) {
  const d = now - before;
  if (d === 0) return null;
  return (
    <span className={`rounded-full px-[7px] py-[3px] text-[11px] font-bold ${d > 0 ? "bg-brand-soft text-brand" : "bg-[#eef0f3] text-secondary"}`}>
      {d > 0 ? `+${d}` : `−${-d}`}
    </span>
  );
}
