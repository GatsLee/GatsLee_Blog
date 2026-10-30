// 프로젝트 상세 로딩 뼈대
export default function Loading() {
  return (
    <div className="mx-auto max-w-[1184px] animate-pulse px-6 pb-20 pt-14">
      <div className="h-5 w-24 rounded bg-surface" />
      <div className="mt-6 h-16 w-3/4 rounded bg-surface" />
      <div className="mt-4 h-8 w-2/3 rounded bg-surface" />
      <div className="mx-auto mt-16 max-w-[720px] space-y-4">
        {Array.from({ length: 8 }, (_, i) => <div key={i} className="h-6 rounded bg-surface" />)}
      </div>
    </div>
  );
}
