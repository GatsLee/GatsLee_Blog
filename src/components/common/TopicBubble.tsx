import Image from "next/image";
import { ChessPawn, Footprints, Plane } from "lucide-react";

// DL/주제 버블 (체스 · 여행 · 러닝). look="3d"는 선 아이콘 대신 3D 렌더 이미지를 쓴다 (일상 화면)
const ICON = { chess: ChessPawn, travel: Plane, running: Footprints };

export default function TopicBubble({
  topic,
  size = 88,
  look = "line",
  className = "",
  style,
}: {
  topic: keyof typeof ICON;
  size?: number;
  look?: "line" | "3d";
  className?: string;
  style?: React.CSSProperties;
}) {
  const Icon = ICON[topic];
  return (
    <span className={`flex items-center justify-center rounded-full bg-brand-soft text-brand ${className}`} style={{ width: size, height: size, ...style }}>
      {look === "3d" ? (
        <Image src={`/images/topic-3d-${topic}.png`} alt="" width={Math.round(size * 0.72)} height={Math.round(size * 0.72)} quality={90} />
      ) : (
        <Icon size={Math.round(size * 0.36)} strokeWidth={1.8} />
      )}
    </span>
  );
}
