/**
 * 글 주제 5개 (DECISIONS D2). Post.topic 컬럼에 slug를 저장한다.
 * 헤더 드롭다운, 푸터, 글 목록 사이드, 어드민 주제 라벨이 모두 이 목록을 쓴다.
 */
export const TOPICS = [
  { slug: "planning", label: "기획", description: "문제를 정의하고 서비스를 설계한 기록" },
  { slug: "dev", label: "개발", description: "서비스를 구현하며 고민한 코드와 구조, 개발 도구" },
  { slug: "ai", label: "AI", description: "LLM, RAG, 에이전트를 직접 붙여 본 경험" },
  { slug: "archiving", label: "아카이빙", description: "기록을 모으고 정리하는 방법" },
  { slug: "homeserver", label: "홈서버", description: "집에서 직접 운영하는 서버와 인프라" },
] as const;

export type TopicSlug = (typeof TOPICS)[number]["slug"];

export function isTopic(value: string | null | undefined): value is TopicSlug {
  return TOPICS.some((t) => t.slug === value);
}

export function topicLabel(slug: string | null | undefined): string {
  return TOPICS.find((t) => t.slug === slug)?.label ?? "";
}
