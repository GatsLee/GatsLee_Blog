import { ChessPawn, Footprints, Plane } from "lucide-react";

// DL/주제 버블 (체스 · 여행 · 러닝)
const ICON = { chess: ChessPawn, travel: Plane, running: Footprints };

export default function TopicBubble({ topic, size = 88 }: { topic: keyof typeof ICON; size?: number }) {
  const Icon = ICON[topic];
  return (
    <span className="flex items-center justify-center rounded-full bg-brand-soft text-brand" style={{ width: size, height: size }}>
      <Icon size={Math.round(size * 0.36)} strokeWidth={1.8} />
    </span>
  );
}
