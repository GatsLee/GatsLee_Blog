import { levelOf, type StreakData } from "@/lib/streak";

// 공통/잔디 칸 Level 0~4
const LEVEL_CLASS = ["bg-[#eef1f8] dark:bg-[#1d2330]", "bg-[#c9d6fb]", "bg-[#94acf7]", "bg-[#5f83f3]", "bg-[#315cf4]"];

export function StreakCell({ n, size = 16 }: { n: number; size?: number }) {
  if (n < 0) return <span style={{ width: size, height: size }} />;
  return (
    <span
      title={n ? `${n}건` : undefined}
      className={`block rounded-[3px] ${LEVEL_CLASS[levelOf(n)]}`}
      style={{ width: size, height: size }}
    />
  );
}

export function StreakLegend({ size = 16 }: { size?: number }) {
  return (
    <span className="flex items-center gap-1 text-[11px] text-secondary">
      적음
      {[0, 1, 2, 3, 4].map((l) => (
        <StreakCell key={l} n={l} size={size} />
      ))}
      많음
    </span>
  );
}

// 홈 업로드 잔디 (최근 52주)
export default function UploadStreak({ data }: { data: StreakData }) {
  const CELL = 16;
  const GAP = 4;
  return (
    <div className="overflow-x-auto rounded-[20px] border border-border bg-background px-7 py-6">
      <div className="mx-auto w-max">
        <div className="relative ml-7 h-[14px] text-[11px] leading-[14px] text-secondary">
          {data.months.map((m) => (
            <span key={`${m.label}-${m.col}`} className="absolute" style={{ left: m.col * (CELL + GAP) }}>
              {m.label}
            </span>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <div className="flex w-5 flex-col text-[10px] text-muted" style={{ gap: GAP }}>
            {["", "월", "", "수", "", "금", ""].map((d, i) => (
              <span key={i} style={{ height: CELL, lineHeight: `${CELL}px` }}>
                {d}
              </span>
            ))}
          </div>
          <div className="flex" style={{ gap: GAP }}>
            {data.weeks.map((week, w) => (
              <div key={w} className="streak-col flex flex-col" style={{ gap: GAP, "--i": w } as React.CSSProperties}>
                {week.map((n, d) => (
                  <StreakCell key={d} n={n} size={CELL} />
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[13px] font-medium text-foreground">
            최근 1년 · 포스트 {data.posts}편 · 프로젝트 {data.projects}개 · 가장 긴 연속 기록 {data.longest}일
          </p>
          <StreakLegend />
        </div>
      </div>
    </div>
  );
}
