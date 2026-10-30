// 글 목록 로딩 뼈대
export default function Loading() {
  return (
    <div className="mx-auto max-w-[1184px] animate-pulse px-6 pb-20 pt-14">
      <div className="h-5 w-32 rounded bg-surface" />
      <div className="mt-8 h-12 w-40 rounded bg-surface" />
      <div className="mt-3 h-6 w-96 max-w-full rounded bg-surface" />
      <div className="mt-12 flex gap-12">
        <div className="hidden w-[175px] flex-col gap-3 md:flex">
          {Array.from({ length: 6 }, (_, i) => <div key={i} className="h-12 rounded-lg bg-surface" />)}
        </div>
        <div className="flex-1">
          <div className="h-[52px] rounded-lg bg-surface" />
          {Array.from({ length: 4 }, (_, i) => <div key={i} className="mt-8 h-28 rounded bg-surface" />)}
        </div>
      </div>
    </div>
  );
}
