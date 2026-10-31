import type { Metadata } from "next";
import TopicBubble from "@/components/common/TopicBubble";

export const metadata: Metadata = { title: "일상" };

// IA_DL_001 일상 (준비 중)
export default function DailyPage() {
  return (
    <section className="flex flex-col items-center gap-8 px-6 py-[180px] text-center">
      {/* 세 버블이 서로 다른 박자로 둥실 떠 있도록 주기와 시작을 어긋나게 둔다 */}
      <div className="flex gap-6">
        <TopicBubble topic="chess" look="3d" className="bubble-float" style={{ "--float-dur": "3.2s", "--float-delay": "0s" } as React.CSSProperties} />
        <TopicBubble topic="travel" look="3d" className="bubble-float" style={{ "--float-dur": "3.8s", "--float-delay": "-1.4s" } as React.CSSProperties} />
        <TopicBubble topic="running" look="3d" className="bubble-float" style={{ "--float-dur": "3.5s", "--float-delay": "-2.6s" } as React.CSSProperties} />
      </div>
      <h1 className="text-[32px] font-bold leading-[46px] text-foreground">일상을 담을 공간을 만들고 있어요</h1>
    </section>
  );
}
