import { STATUS_LABEL, isPostStatus } from "@/lib/post-status";

const TONE = {
  draft: "bg-brand-soft text-brand",
  published: "bg-[#e6f7ee] text-success",
  hidden: "bg-[#eef0f3] text-secondary",
} as const;

// 유닛_상태라벨. 초안·발행됨·숨김
export default function StatusBadge({ status }: { status: string }) {
  const s = isPostStatus(status) ? status : "draft";
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${TONE[s]}`}>{STATUS_LABEL[s]}</span>;
}
