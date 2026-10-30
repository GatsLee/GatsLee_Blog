import { Archive, ClipboardList, Code, Cpu, Server, type LucideProps } from "lucide-react";
import type { TopicSlug } from "@/lib/topics";

// 푸터 TOPICS·글 목록 사이드와 같은 아이콘
const ICONS: Record<TopicSlug, React.ComponentType<LucideProps>> = {
  planning: ClipboardList,
  dev: Code,
  ai: Cpu,
  archiving: Archive,
  homeserver: Server,
};

export default function TopicIcon({ slug, ...props }: { slug: TopicSlug } & LucideProps) {
  const Icon = ICONS[slug];
  return <Icon size={16} strokeWidth={1.8} {...props} />;
}
