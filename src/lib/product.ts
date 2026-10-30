/**
 * Product 엔티티의 JSON 칼럼을 읽고 화면이 쓰는 모양으로 바꾼다.
 *
 * SQLite라 배열·객체는 전부 문자열로 들어 있다. 파싱 실패는 조용히 빈 값으로
 * 떨어뜨린다 — 관리자에서 아직 안 채운 필드가 화면을 깨뜨리면 안 된다.
 */

export type ProductType = "app" | "web" | "agent";
export type ProductStage = "planning" | "building" | "operating";

export interface ProductLink {
  label: string;
  url: string;
}

/** 핵심 기능의 한 단계. shots는 목업 이미지 URL. */
export interface ProductFeature {
  label: string;
  sub: string;
  body: string;
  shots?: string[];
}

/** 문제 섹션 옆에 붙는 근거 카드. */
export interface ProductEvidence {
  label?: string;
  quote?: string;
  source?: string;
  numbers?: { value: string; label: string }[];
  note?: string;
}

export const TYPE_LABEL: Record<ProductType, string> = {
  app: "앱",
  web: "웹",
  agent: "에이전트",
};

export const STAGE_LABEL: Record<ProductStage, string> = {
  planning: "기획",
  building: "구현",
  operating: "운영",
};

/**
 * 타입마다 핵심 기능 섹션의 성격이 다르다(IA_PD_002).
 * 에이전트는 화면 흐름이 곧 서비스 플로우라 두 섹션이 같은 것을 두 번 말했다.
 * 그래서 임베드를 핵심 기능 안으로 넣고 별도 섹션을 없앤다.
 */
export const FEATURE_SECTION: Record<ProductType, { kicker: string; heading: string; flowInside: boolean }> = {
  app: { kicker: "SCENARIO", heading: "하루를 따라가며", flowInside: false },
  web: { kicker: "SCREENS", heading: "무엇을 볼 수 있나", flowInside: false },
  agent: { kicker: "PIPELINE", heading: "기록이 지나는 단계", flowInside: true },
};

function parse<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    const value = JSON.parse(raw);
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

export function productType(value: string): ProductType {
  return value === "web" || value === "agent" ? value : "app";
}

export function productStage(value: string): ProductStage {
  return value === "building" || value === "operating" ? value : "planning";
}

export const parseLinks = (raw: string | null | undefined) => parse<ProductLink[]>(raw, []);
export const parseFeatures = (raw: string | null | undefined) => parse<ProductFeature[]>(raw, []);
export const parseEvidence = (raw: string | null | undefined) => parse<ProductEvidence>(raw, {});
export const parseStrings = (raw: string | null | undefined) => parse<string[]>(raw, []);

/** 메타 4칸의 기간 문구. periodEnd가 비고 ongoing이면 "진행 중". */
export function periodText(start: string, end: string, ongoing: boolean): string {
  if (!start) return "";
  if (end) return `${start} – ${end}`;
  return ongoing ? `${start} – 진행 중` : start;
}

/** 메타 4칸의 역할 문구. 역할 배열과 인원을 한 줄로 합친다. */
export function roleText(roles: string[], headcount: number): string {
  const joined = roles.join(" · ");
  if (!joined) return headcount > 0 ? `${headcount}인` : "";
  return headcount > 0 ? `${joined} · ${headcount}인` : joined;
}

/**
 * 상세 화면 전용 값 (IA_PD_002). 목록 카드에 쓰지 않는 항목을 Product.detail 한 칸에 모은다.
 * problem.body가 비면 예전 problemBody를 읽는다.
 */
export interface ProductDetail {
  headline?: string;
  intro?: string;
  gallery?: string[];
  audiences?: { who: string; gain: string }[];
  problem?: { summary?: string; body?: string };
  hypothesis?: { summary?: string; body?: string; metrics?: string[] };
  decisions?: { title: string; body: string; why: string; so: string }[];
}

export const parseDetail = (raw: string | null | undefined) => parse<ProductDetail>(raw, {});

/** 진행 단계 도장 4종 (IA_AD_00302). 고르면 stage도 같이 맞춘다. */
export const STAMPS = ["기획 완료", "개발 중", "운영 중", "배포됨"] as const;
export type Stamp = (typeof STAMPS)[number];

export function stageOfStamp(stamp: string): ProductStage {
  if (stamp === "개발 중") return "building";
  if (stamp === "운영 중" || stamp === "배포됨") return "operating";
  return "planning";
}

/** 공개 전 확인 5항목. 모두 채워야 공개할 수 있다. */
export function publishChecks(p: {
  name: string;
  slug: string;
  tagline: string;
  summary: string[];
  coverImage: string;
  problemSummary: string;
  hypothesisSummary: string;
  featureCount: number;
}) {
  return [
    { label: "이름과 주소", ok: Boolean(p.name.trim() && p.slug.trim()) },
    { label: "한 줄 소개와 두 줄 설명", ok: Boolean(p.tagline.trim() && p.summary[0]?.trim()) },
    { label: "대표 이미지 (4:3)", ok: Boolean(p.coverImage) },
    { label: "문제와 가설", ok: Boolean(p.problemSummary.trim() && p.hypothesisSummary.trim()) },
    { label: "핵심 기능 1개 이상", ok: p.featureCount > 0 },
  ];
}
