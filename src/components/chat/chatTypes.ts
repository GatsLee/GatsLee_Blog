import { Rocket, Code2, Compass, Server, Mail, type LucideIcon } from "lucide-react";

export interface Source {
  title: string;
  route: string;
}

export interface Message {
  role: "user" | "assistant";
  content: string;
  error?: boolean;
  errorStatus?: number;
  sources?: Source[];
  thinkContent?: string;
}

export type ChatStage = "idle" | "searching" | "generating" | "streaming";

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  rocket: Rocket,
  code: Code2,
  compass: Compass,
  server: Server,
  mail: Mail,
};

export function detectCategory(text: string): string {
  if (/프로젝트|만들|빌드|개발|project|built|made/i.test(text)) return "project";
  if (/기술|스택|언어|프레임워크|tech|stack|language|framework/i.test(text)) return "techStack";
  if (/강점|전환|비전공|배경|경력|strength|transition|background|career/i.test(text)) return "strength";
  if (/인프라|서버|도커|Docker|모니터링|infra|server|monitoring/i.test(text)) return "infra";
  if (/연락|연결|contact|메시지|협업|message|collaborate/i.test(text)) return "contact";
  return "default";
}

export const FOLLOW_UPS: Record<string, Record<string, string[]>> = {
  ko: {
    project: ["그중 가장 도전적이었던 건?", "기술적으로 어려웠던 부분은?"],
    techStack: ["왜 그 스택을 선택했나요?", "앞으로 도입하고 싶은 기술은?"],
    strength: ["비전공자에서 어떻게 전환했나요?", "학습 방법이 궁금합니다"],
    infra: ["서버 비용은 얼마나 드나요?", "모니터링은 어떻게 하나요?"],
    contact: ["방명록에 메시지 남기기"],
    default: ["더 자세히 알고 싶어요", "다른 프로젝트도 있나요?"],
  },
  en: {
    project: ["Which was the most challenging?", "Any technical difficulties?"],
    techStack: ["Why did you choose that stack?", "Any tech you want to adopt next?"],
    strength: ["How did you transition from non-CS?", "What's your learning method?"],
    infra: ["How much does the server cost?", "How do you monitor it?"],
    contact: ["Leave a message on the guestbook"],
    default: ["Tell me more", "Any other projects?"],
  },
};

export const STAGE_TEXT: Record<"ko" | "en", Record<ChatStage, string>> = {
  ko: {
    idle: "",
    searching: "포스트 검색 중",
    generating: "응답 작성 중",
    streaming: "",
  },
  en: {
    idle: "",
    searching: "Searching posts",
    generating: "Drafting response",
    streaming: "",
  },
};
