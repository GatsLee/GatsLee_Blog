/**
 * Resume defaults. The live page reads SiteConfig keys `resume_ko` / `resume_en`
 * and falls back to these — same mechanism as about_ko/about_en, so the resume
 * can be edited from the admin panel without a redeploy.
 *
 * The page IS the PDF: /resume prints to a clean A4 via @media print.
 */

export interface ResumeExperience {
  role: string;
  org: string;
  period: string;
  /** STAR: the problem, framed by a number. */
  problem: string;
  action: string;
  /** The result, framed by a number. */
  result: string;
  /** Links this block to /cases/[slug] — the resume is the index, the case is the proof. */
  caseSlug?: string;
}

export interface ResumeData {
  name: string;
  /** One-line positioning. This is the single most important string on the site. */
  headline: string;
  contact: { email: string; github: string; blog: string; linkedin?: string };
  /** Max 3 bullets. Each one must contain a number. */
  summary: string[];
  /** PM skills first, technical second. The ordering IS the positioning. */
  pmSkills: string[];
  techSkills: string[];
  experience: ResumeExperience[];
  /** One compact line per category — not a 30-chip wall. */
  stack: { category: string; items: string }[];
  education: { title: string; org: string; period: string; note?: string }[];
}

export const RESUME_KO: ResumeData = {
  name: "이준열 (Gats Lee)",
  headline: "문제를 숫자로 정의하고 시스템으로 해결하는 Technical PM",
  contact: {
    email: "naanthonylee@gmail.com",
    github: "github.com/GatsLee",
    blog: "blog.gatslee.com",
    linkedin: "linkedin.com/in/joon-yeol-lee-567421281",
  },
  summary: [
    "AI 에이전트 3개를 직접 기획·구현해 홈서버에서 24/7 운영 중 — 컨테이너 10개, 가동률 99% 이상.",
    "LLM 호출 앞단에 ML 사전 필터를 설계해 API 비용 80% 절감 (월 $5–10 수준으로 운영).",
    "역사학 전공에서 42서울 2년(C/C++, 피어리뷰 200회 이상)을 거쳐 서비스 기획으로 이동 — 현대차 소프티어에서 기획 정식 과정 이수 중.",
  ],
  pmSkills: [
    "문제 정의 — 지표에서 출발하는 문제 프레이밍 (퍼널·코호트·AARRR)",
    "가설 검증 — 성공 기준 사전 선언, A/B 및 프록시 지표 설계",
    "우선순위 — RICE/ICE 기반 스코핑, 만들지 않을 것의 명시적 결정",
  ],
  techSkills: [
    "AI/LLM — RAG 파이프라인, 임베딩, 로컬 LLM 서빙 (Ollama)",
    "백엔드 — Next.js API Routes, Prisma, SQLite/Postgres",
    "인프라 — Docker Compose, NGINX, Cloudflare Tunnel, GPU 서버 운영",
  ],
  experience: [],
  stack: [
    { category: "AI / ML", items: "Ollama, RAG, 임베딩·벡터 검색, BM25/FTS5, 프롬프트 설계" },
    { category: "Backend", items: "Next.js, TypeScript, Prisma, SQLite, Python" },
    { category: "Infra", items: "Docker Compose, NGINX, Cloudflare Tunnel, Linux, GPU 서버" },
    { category: "Data", items: "GA4, 퍼널·코호트 분석, SQL" },
  ],
  education: [
    {
      title: "서비스 기획 과정",
      org: "현대자동차 소프티어 (Softeer)",
      period: "2026.07 –",
      note: "서비스 기획 정식 과정",
    },
    {
      title: "소프트웨어 엔지니어링",
      org: "42서울",
      period: "2년",
      note: "C/C++, 피어리뷰 200회 이상, DirectX11",
    },
    { title: "사학과", org: "연세대학교", period: "학사" },
  ],
};

export const RESUME_EN: ResumeData = {
  name: "Joonyeol Lee (Gats Lee)",
  headline: "Technical PM — frames problems as numbers, solves them as systems",
  contact: {
    email: "naanthonylee@gmail.com",
    github: "github.com/GatsLee",
    blog: "blog.gatslee.com",
    linkedin: "linkedin.com/in/joon-yeol-lee-567421281",
  },
  summary: [
    "Planned, built, and operate 3 AI agents running 24/7 on a self-hosted server — 10 containers, 99%+ uptime.",
    "Designed an ML pre-filter in front of LLM calls, cutting API cost by 80% (now running at ~$5–10/month).",
    "History major → 2 years at 42Seoul (C/C++, 200+ peer reviews) → service planning; currently in Hyundai Softeer's product planning program.",
  ],
  pmSkills: [
    "Problem framing — starting from the metric, not the feature (funnel, cohort, AARRR)",
    "Hypothesis validation — pre-declared success criteria, A/B and proxy metric design",
    "Prioritization — RICE/ICE scoping, and explicitly deciding what not to build",
  ],
  techSkills: [
    "AI/LLM — RAG pipelines, embeddings, local LLM serving (Ollama)",
    "Backend — Next.js API routes, Prisma, SQLite/Postgres",
    "Infra — Docker Compose, NGINX, Cloudflare Tunnel, GPU server ops",
  ],
  experience: [],
  stack: [
    { category: "AI / ML", items: "Ollama, RAG, embeddings & vector search, BM25/FTS5, prompt design" },
    { category: "Backend", items: "Next.js, TypeScript, Prisma, SQLite, Python" },
    { category: "Infra", items: "Docker Compose, NGINX, Cloudflare Tunnel, Linux, GPU servers" },
    { category: "Data", items: "GA4, funnel & cohort analysis, SQL" },
  ],
  education: [
    {
      title: "Product Planning Program",
      org: "Hyundai Softeer",
      period: "2026.07 –",
    },
    {
      title: "Software Engineering",
      org: "42Seoul",
      period: "2 years",
      note: "C/C++, 200+ peer reviews, DirectX11",
    },
    { title: "B.A. History", org: "Yonsei University", period: "" },
  ],
};

export function defaultResume(locale: string): ResumeData {
  return locale === "en" ? RESUME_EN : RESUME_KO;
}
