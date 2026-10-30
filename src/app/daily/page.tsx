import type { Metadata } from "next";
import TopicBubble from "@/components/common/TopicBubble";

export const metadata: Metadata = { title: "일상" };

// IA_DL_001 일상 (준비 중)
export default function DailyPage() {
  return (
    <section className="flex flex-col items-center gap-8 px-6 py-[180px] text-center">
      <div className="flex gap-6">
        <TopicBubble topic="chess" />
        <TopicBubble topic="travel" />
        <TopicBubble topic="running" />
      </div>
      <h1 className="text-[32px] font-bold leading-[46px] text-foreground">일상을 담을 공간을 만들고 있어요</h1>
    </section>
  );
}
