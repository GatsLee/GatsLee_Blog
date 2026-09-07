/**
 * FAQ dataset — pre-written Q&A pairs for semantic routing.
 * These cover the most common visitor questions about Gats Lee.
 * Format: { q: string[], a_ko: string, a_en: string, tags: string[] }
 * Multiple q variants per entry improve match coverage.
 */

export interface FaqEntry {
  id: string;
  q: string[];        // question variants (used for embedding)
  a_ko: string;       // Korean answer
  a_en: string;       // English answer
  tags: string[];
}

export const FAQ_DATA: FaqEntry[] = [
  // ─── 자기소개 ───────────────────────────────────────────────
  {
    id: "intro_who",
    q: [
      "Gats Lee가 누구인가요?",
      "자기소개해 주세요",
      "본인이 누구인지 소개해주세요",
      "Who are you?",
      "Tell me about yourself",
      "What is Gats Lab?",
      "Gats Lab이 뭔가요?",
    ],
    a_ko: `저는 Gats Lee(이준열)입니다. 문제를 숫자로 정의하고 시스템으로 해결하는 Technical PM입니다. 연세대 사학과 졸업 후 42서울에서 2년간 C/C++ 시스템 프로그래밍을 배웠고, 지금은 현대차 소프티어에서 서비스 기획을 정식으로 배우고 있습니다.

기획한 것을 직접 구현하고 운영까지 해본다는 게 강점입니다 — 실현 가능성과 비용을 스스로 판단할 수 있으니까요. AI 에이전트 3개를 홈서버에서 24/7 운영 중이고, 의사결정 과정은 케이스 스터디(/cases)에 문제 정의부터 결과 검증까지 기록해 두었습니다.`,
    a_en: `I'm Gats Lee (Joonyeol Lee), a Technical PM who frames problems as numbers and solves them as systems. After studying History at Yonsei University, I spent two years at 42Seoul on C/C++ systems programming. I'm now in Hyundai Softeer's product planning program.

What sets me apart is that I ship and operate what I plan — so I can judge feasibility and cost myself. I run 3 AI agents 24/7 on a self-hosted server, and I document the decisions behind them as case studies (/cases): problem, hypothesis, tradeoffs, measured outcome.`,
    tags: ["intro", "about", "background"],
  },
  {
    id: "intro_career",
    q: [
      "경력 전환 과정이 어떻게 되나요?",
      "어떤 배경을 가지고 있나요?",
      "비전공자인가요?",
      "42서울에서 뭘 배웠나요?",
      "How did you transition into AI?",
      "What is your background?",
      "Did you study computer science?",
    ],
    a_ko: `연세대 사학과 → 42서울(2년) → AI 엔지니어링 순서로 전환했습니다.

42서울에서는 C/C++ 기반 시스템 프로그래밍, 200회 이상의 피어 코드 리뷰, DirectX11 3D 렌더링, 게임 엔진 개발을 경험했습니다. 비전공 출신이지만 이 과정에서 컴퓨터 과학의 밑바닥부터 쌓았고, 지금은 그 위에 AI/ML을 올리고 있습니다.`,
    a_en: `My path: Yonsei University (History) → 42Seoul (2 years) → AI Engineering.

At 42Seoul I worked on C/C++ systems programming, did 200+ peer code reviews, built a DirectX11 3D renderer, and developed a game engine. No CS degree, but I built the foundations from scratch — and now I build AI on top of that.`,
    tags: ["career", "background", "42seoul"],
  },

  // ─── 기술 스택 ───────────────────────────────────────────────
  {
    id: "tech_stack",
    q: [
      "기술 스택이 어떻게 되나요?",
      "기술 스택이 궁금합니다",
      "어떤 기술을 사용하나요?",
      "주로 쓰는 언어나 프레임워크가 뭔가요?",
      "What tech stack do you use?",
      "Tell me about the tech stack",
      "What programming languages do you know?",
      "What are your main technologies?",
    ],
    a_ko: `지금 이 블로그 자체가 스택의 축소판입니다. Next.js 프론트, FastAPI 백엔드, Ollama로 로컬 LLM 실행, SQLite에 벡터 저장, Docker Compose로 전체를 묶었습니다.

분야별로 정리하면:

- **AI/ML**: Ollama(로컬 LLM), RAG 파이프라인, 에이전트 설계, 모델 평가, MCP 서버, Isolation Forest(이상탐지)
- **백엔드**: Python, FastAPI, PostgreSQL, Redis, n8n(워크플로우 자동화)
- **프론트엔드**: TypeScript, Next.js, React, Tailwind CSS
- **인프라**: Docker Compose, Cloudflare Tunnel, NGINX, Prometheus, Grafana, ChromaDB, Ubuntu 홈서버
- **시스템**: C/C++ (42서울 — OS, 네트워크, 게임 엔진)

AI 모델을 운영 가능한 서비스로 만드는 전 과정 — 데이터부터 모니터링까지 — 을 혼자 소유하는 것에 강점이 있습니다.`,
    a_en: `This blog itself is a snapshot of the stack — Next.js frontend, FastAPI backend, local LLM via Ollama, vectors in SQLite, all tied together with Docker Compose.

By area:

- **AI/ML**: Ollama (local LLM), RAG pipelines, agent design, model evaluation, MCP servers, Isolation Forest (anomaly detection)
- **Backend**: Python, FastAPI, PostgreSQL, Redis, n8n (workflow automation)
- **Frontend**: TypeScript, Next.js, React, Tailwind CSS
- **Infra**: Docker Compose, Cloudflare Tunnel, NGINX, Prometheus, Grafana, ChromaDB, Ubuntu home server
- **Systems**: C/C++ (42Seoul — OS, networking, game engine)

My strength is owning the full pipeline — from data to monitoring — and turning AI models into running services.`,
    tags: ["tech", "stack", "skills"],
  },

  // ─── 프로젝트 ────────────────────────────────────────────────
  {
    id: "projects_overview",
    q: [
      "어떤 프로젝트를 만들었나요?",
      "대표 프로젝트가 뭔가요?",
      "포트폴리오 프로젝트를 소개해 주세요",
      "What projects have you built?",
      "Show me your portfolio",
      "What have you worked on?",
    ],
    a_ko: `운영 중인 것부터 개발 중인 것까지, 현재 상태 그대로입니다.

- **홈서버 인프라** (운영 중): 8개 Docker 서비스를 24/7 직접 운영합니다. Cloudflare 터널로 외부 접근을 처리하고, 3개 AI 에이전트가 실시간으로 모니터링·자동화합니다. 지금 이 블로그도 그 위에서 돌아가고 있습니다.
- **Calyx** (개발 중): iOS 캘린더 앱인데, 각 생활 영역(운동/식단/문화/여행)을 전담 AI 에이전트가 관리하는 구조입니다. 에이전트를 구독하면 내 패턴을 학습해 일정을 능동적으로 제안합니다.
- **Seekr** (개발 중): 한국 서비스용 AI 에이전트 인프라. 해외엔 Composio 같은 도구가 있지만 한국 특화 버전이 없었습니다. DART 공시 MCP 서버부터 시작했습니다.
- **ModelPulse**: LLM을 배포한 이후가 더 중요하다는 생각에서 만든 모니터링 대시보드. 10개 품질 지표 + GPU 프로파일링.
- **이 블로그**: 지금 대화 중인 챗봇이 증거입니다. Ollama RAG 파이프라인, 콘텐츠 자동 생성, AIOps 이상 탐지까지 직접 구현했습니다.`,
    a_en: `Here's what I'm currently building and running:

- **Home Server Infra** (live): 8 Docker services running 24/7. Cloudflare tunnel handles external access, and 3 AI agents monitor and automate everything in real time. This blog runs on it right now.
- **Calyx** (in development): An iOS calendar app where domain-specific AI agents manage each area of your life (fitness, diet, culture, travel). Agents learn your patterns and proactively suggest plans.
- **Seekr** (in development): AI agent infrastructure for Korean services. Tools like Composio exist abroad but nothing Korea-specific — I started with a DART financial disclosure MCP server.
- **ModelPulse**: A monitoring dashboard built on the belief that what happens after you deploy an LLM matters more. 10 quality metrics + GPU profiling.
- **This blog**: The chatbot you're talking to right now is the proof. Ollama RAG pipeline, automated content generation, AIOps anomaly detection — all built from scratch.`,
    tags: ["projects", "portfolio"],
  },
  {
    id: "project_seekr",
    q: [
      "Seekr가 뭔가요?",
      "Seekr 프로젝트 설명해 주세요",
      "DART MCP 서버가 뭔가요?",
      "What is Seekr?",
      "Tell me about Seekr",
    ],
    a_ko: `Seekr는 한국형 AI Agent 인프라 프로젝트입니다. 해외의 Composio처럼 한국 서비스와 데이터를 AI 에이전트에 연결하는 도구 모음을 만드는 것이 목표입니다.

현재 DART(금융감독원 공시 시스템) MCP 서버를 구현하여, AI 에이전트가 한국 상장 기업의 재무 데이터에 직접 접근할 수 있게 합니다. 이외에도 한국 시장에 특화된 다양한 MCP 도구를 추가할 예정입니다.`,
    a_en: `Seekr is a Korean AI Agent infrastructure project — think Composio, but for Korea. It connects Korean services and data sources to AI agents.

Currently it includes a DART (Korea's Financial Supervisory Service disclosure system) MCP server, which lets AI agents directly access financial data on Korean listed companies. More Korea-specific MCP tools are planned.`,
    tags: ["seekr", "projects", "mcp", "dart"],
  },
  {
    id: "project_modelpulse",
    q: [
      "ModelPulse가 뭔가요?",
      "LLM 모니터링 어떻게 하나요?",
      "모델 평가 시스템 설명해 주세요",
      "What is ModelPulse?",
      "How do you monitor LLMs?",
    ],
    a_ko: `ModelPulse는 LLM 품질 모니터링 대시보드입니다. 프로덕션에서 LLM 응답의 품질을 10개 지표로 측정하고 시각화합니다.

주요 기능: 응답 품질 평가(정확성, 관련성, 일관성 등), GPU 프로파일링, 모델 비교, 시계열 추이 분석. AI 시스템을 "배포하고 끝"이 아니라 지속적으로 관찰하고 개선하는 MLOps 관점에서 만든 도구입니다.`,
    a_en: `ModelPulse is an LLM quality monitoring dashboard. It measures and visualizes LLM response quality across 10 metrics in production.

Key features: response quality evaluation (accuracy, relevance, consistency, etc.), GPU profiling, model comparison, and time-series trend analysis. It's built from an MLOps perspective — the idea that AI systems need continuous observation and improvement, not just "deploy and forget."`,
    tags: ["modelpulse", "projects", "llm", "monitoring"],
  },
  {
    id: "project_blog",
    q: [
      "이 블로그는 어떻게 만들었나요?",
      "블로그 기술 스택이 뭔가요?",
      "챗봇은 어떻게 구현했나요?",
      "How did you build this blog?",
      "What powers this chatbot?",
      "Tell me about the blog architecture",
    ],
    a_ko: `이 블로그는 Next.js 14 + Prisma + SQLite로 만들었으며, Docker Compose로 배포 중입니다.

챗봇은 Ollama의 Qwen3 8B 모델을 로컬에서 직접 실행하고, 블로그 포스트를 청킹해 SQLite에 벡터로 저장한 뒤 cosine similarity로 관련 컨텍스트를 검색하는 RAG 파이프라인을 구현했습니다. 답변은 Server-Sent Events(SSE)로 실시간 스트리밍됩니다. 클라우드 AI API를 쓰지 않고 홈서버에서 완전히 자체 운영합니다.`,
    a_en: `This blog is built with Next.js 14 + Prisma + SQLite, deployed via Docker Compose.

The chatbot runs Ollama's Qwen3 8B model locally, with a RAG pipeline that chunks blog posts, stores them as vectors in SQLite, and retrieves relevant context via cosine similarity. Responses stream in real-time using Server-Sent Events (SSE). No cloud AI APIs — fully self-hosted on a home server.`,
    tags: ["blog", "chatbot", "rag", "ollama"],
  },

  // ─── 인프라 ─────────────────────────────────────────────────
  {
    id: "infra_homeserver",
    q: [
      "홈서버 인프라에 대해 알려주세요",
      "서버를 어떻게 운영하나요?",
      "Docker로 어떻게 배포하나요?",
      "Tell me about your home server",
      "How do you host your projects?",
      "What's your infrastructure setup?",
    ],
    a_ko: `클라우드 없이 개인 홈서버에서 프로덕션 수준의 인프라를 직접 운영합니다.

**구성**: Cloudflare 터널 → NGINX 리버스 프록시 → 서비스 레이어 (Next.js 블로그, FastAPI 백엔드, n8n 워크플로우) → AI 레이어 (Ollama GPU, AIOps, Blog Agent, CS Tutor) → 데이터 레이어 (PostgreSQL, Redis, ChromaDB) → 모니터링 (Prometheus, Grafana)

**운영 수치**: 24/7 무중단, 3개 에이전트 상시 실행, GPU VRAM 실시간 추적, 이상 발생 시 Telegram 자동 알림

실제 트래픽이 들어오고, 실제 장애가 발생하고, 실제 병목을 디버깅합니다. 그 경험이 인프라에 대한 판단력을 만듭니다.`,
    a_en: `I run production-grade infrastructure on a personal home server — no cloud.

**Architecture**: Cloudflare Tunnel → NGINX reverse proxy → service layer (Next.js blog, FastAPI backend, n8n workflows) → AI layer (Ollama GPU, AIOps, Blog Agent, CS Tutor) → data layer (PostgreSQL, Redis, ChromaDB) → monitoring (Prometheus, Grafana)

**Numbers**: 24/7 uptime, 3 agents running continuously, GPU VRAM tracked in real time, Telegram alerts on anomalies

Real traffic comes in. Real failures happen. Real bottlenecks get debugged. That's what builds infrastructure judgment.`,
    tags: ["infra", "docker", "homeserver", "devops"],
  },
  {
    id: "infra_monitoring",
    q: [
      "Prometheus Grafana를 어떻게 사용하나요?",
      "모니터링 스택이 어떻게 되나요?",
      "How do you use Prometheus and Grafana?",
      "What monitoring do you have?",
    ],
    a_ko: `Prometheus로 메트릭을 수집하고 Grafana로 시각화합니다.

수집 항목: Docker 컨테이너 CPU/메모리, Ollama GPU VRAM 사용률, Next.js 요청 응답시간, FastAPI 엔드포인트 에러율, 챗봇 동시 요청 수.

AIOps 에이전트가 이상 징후를 감지하면 Telegram으로 알림을 보내도록 연동되어 있습니다.`,
    a_en: `I use Prometheus for metric collection and Grafana for visualization.

What I track: Docker container CPU/memory, Ollama GPU VRAM usage, Next.js request latency, FastAPI endpoint error rates, chatbot concurrent request counts.

The AIOps agent detects anomalies and sends Telegram alerts.`,
    tags: ["monitoring", "prometheus", "grafana", "infra"],
  },

  // ─── 에이전트 ────────────────────────────────────────────────
  {
    id: "agent_overview",
    q: [
      "AI 에이전트를 어떻게 활용하나요?",
      "에이전트 프로젝트 소개해 주세요",
      "어떤 자동화를 구축했나요?",
      "What AI agents have you built?",
      "Tell me about your agents",
      "What automation do you have?",
    ],
    a_ko: `세 가지 에이전트를 직접 만들어 운영하고 있습니다.

- **AIOps**: ML+LLM 2계층 이상 탐지 에이전트. 서버 메트릭에서 이상을 감지해 Telegram 알림을 보냅니다. API 비용 80% 절감.
- **Blog Agent**: git log를 읽어 자동으로 포스트 초안을 작성하고, SEO 최적화 후 빌드를 모니터링합니다. 주간 리포트도 생성.
- **CS Tutor**: SM-2 간격 반복 알고리즘 기반 학습 에이전트. 약점 분석 후 LLM이 맞춤 퀴즈를 생성합니다. 1700개 이상 문제 보유.`,
    a_en: `I've built and run three agents:

- **AIOps**: ML+LLM two-tier anomaly detection. Monitors server metrics, sends Telegram alerts for issues. Reduced API costs by 80%.
- **Blog Agent**: Reads git log, auto-drafts posts, applies SEO optimization, monitors builds, and generates weekly reports.
- **CS Tutor**: Spaced repetition (SM-2) learning agent. Analyzes weak areas and has LLM generate custom quizzes. 1700+ problems built up.`,
    tags: ["agents", "automation", "aiops"],
  },

  // ─── 강점 / 채용 ─────────────────────────────────────────────
  {
    id: "strength_differentiator",
    q: [
      "PM으로서 강점이 뭔가요?",
      "AI 엔지니어로서 강점이 뭔가요?",
      "다른 사람들과 차별화되는 점이 뭔가요?",
      "왜 Gats Lee를 채용해야 하나요?",
      "What makes you stand out as a PM?",
      "What are your strengths?",
      "Why should I hire you?",
    ],
    a_ko: `네 가지인데, 주장보다 증거로 말하겠습니다.

1. **기획한 걸 끝까지 굴려봅니다** — 이 블로그 하나에 Next.js 프론트, Ollama RAG 챗봇, AIOps 이상탐지, Blog Agent 자동화, Prometheus 모니터링이 다 들어 있습니다. 혼자 기획하고 혼자 만들고 혼자 운영합니다. 그래서 실현 가능성과 운영 비용을 스스로 판단할 수 있습니다.
2. **"언제 AI를 쓰지 않는가"를 압니다** — AIOps에서 단순 이상탐지는 Isolation Forest(ML)로, 원인 분석만 LLM으로 분리했습니다. ML 게이트 하나로 API 비용을 80% 절감했습니다. 안 만들기로 한 것(파인튜닝, 벡터DB, 알림당 LLM 호출)이 만든 것만큼 중요했습니다.
3. **의사결정을 기록으로 남깁니다** — /cases에 문제 정의(숫자) → 가설(사전 선언한 성공 기준) → 트레이드오프 → 결과 → 학습 순서로 남겨두었습니다. 기준 미달이면 미달이라고 씁니다.
4. **시스템 밑바닥부터 쌓았습니다** — 42서울에서 C로 메모리 관리, OS, 네트워크를 직접 구현했기 때문에 엔지니어와 같은 언어로 대화할 수 있습니다. 역사학 → 시스템 → 기획 전환이 적응력의 증거입니다.`,
    a_en: `Four differentiators — backed by evidence, not just claims.

1. **Full-stack ownership** — This blog alone contains a Next.js frontend, Ollama RAG chatbot, AIOps anomaly detection, Blog Agent automation, and Prometheus monitoring. Built and operated solo.
2. **I know when NOT to use AI** — In AIOps, I use Isolation Forest (ML) for anomaly detection and LLM only for root cause analysis. That ML gate cut API costs by 80%.
3. **Built from the ground up** — At 42Seoul I implemented memory management, OS internals, and networking in C. I can see below the abstraction layers. History → systems → AI is the proof of fast adaptation.
4. **Architectural opinions** — I can explain why a system is designed a certain way. This chatbot's 3-tier routing (FAQ → RAG → fallback) exists for reasons I can walk you through.`,
    tags: ["strengths", "hiring", "differentiator"],
  },
  {
    id: "hiring_status",
    q: [
      "지금 구직 중인가요?",
      "취업 준비 중인가요?",
      "인턴십 지원 가능한가요?",
      "Are you looking for a job?",
      "Are you available for hire?",
      "Are you open to internship opportunities?",
    ],
    a_ko: `네, 2026년 하반기 공채를 준비하고 있습니다. 서비스 기획 / PM / PO 포지션이 목표입니다.

**맞는 자리:** AI·데이터가 제품의 핵심인 서비스의 기획. 기술적 실현 가능성을 스스로 판단해야 하는 자리. 0→1 구간.
**안 맞는 자리:** 순수 리서치 롤, 기획 없이 구현만 하는 자리.

이력서는 /resume, 의사결정 기록은 /cases에 있습니다. 문의는 /connect에 남겨주세요.`,
    a_en: `Yes — I'm preparing for the 2026 H2 hiring season, targeting product planning / PM / PO roles.

**Good fit:** planning services where AI or data is the core of the product; roles where you must judge technical feasibility yourself; 0→1 work.
**Not a fit:** pure research roles, or implementation-only roles with no ownership of the plan.

Resume at /resume, decision records at /cases. Reach me via /connect.`,
    tags: ["hiring", "job", "internship", "contact"],
  },

  // ─── 연락 ────────────────────────────────────────────────────
  {
    id: "contact",
    q: [
      "연락하고 싶어요",
      "어떻게 연락할 수 있나요?",
      "이메일 주소가 뭔가요?",
      "같이 일하고 싶어요",
      "협업 제안이 있어요",
      "채용 문의하고 싶어요",
      "How can I contact you?",
      "How do I reach you?",
      "I want to get in touch",
      "I'd like to work with you",
    ],
    a_ko: `언제든 환영합니다. 가장 빠른 방법은 세 가지입니다.

- **이메일**: naanthonylee@gmail.com — 24시간 내로 답변드립니다
- **/connect 페이지**: 이 블로그 내 메시지 폼입니다
- **GitHub**: github.com/GatsLee — 코드로 대화하고 싶다면 여기서

무엇을 써야 할지 막막하다면, 이런 내용이 오면 반갑습니다:
- "이런 포지션에서 함께 일하고 싶어요"
- "이 프로젝트에 대해 더 얘기하고 싶어요"
- "비슷한 걸 만들고 있는데 기술 얘기 나눠볼 수 있을까요?"

짧아도 됩니다. 일단 연락해 주세요.`,
    a_en: `Always welcome. Three fastest ways:

- **Email**: naanthonylee@gmail.com — I respond within 24 hours
- **/connect page**: The message form on this blog
- **GitHub**: github.com/GatsLee — if you'd rather talk in code

Not sure what to write? Any of these work:
- "I have a position I think you'd be a good fit for"
- "I'd like to talk more about one of your projects"
- "I'm building something similar and want to compare notes"

Short is fine. Just reach out.`,
    tags: ["contact", "email", "github"],
  },

  // ─── 학습 / 공부 ─────────────────────────────────────────────
  {
    id: "learning_approach",
    q: [
      "어떻게 공부하나요?",
      "AI를 독학으로 배웠나요?",
      "커리큘럼이 있나요?",
      "학습 방법이 궁금합니다",
      "공부 방법이 궁금해요",
      "How do you learn new things?",
      "How did you learn AI on your own?",
      "What's your learning method?",
    ],
    a_ko: `주로 두 가지 방식으로 공부합니다.

1. **만들면서 배우기**: 이론을 읽고 바로 실제 프로젝트에 적용합니다. 이 블로그, Seekr, ModelPulse 모두 학습과 동시에 만든 결과물입니다.
2. **CS Tutor**: 직접 만든 SM-2 기반 복습 에이전트로 개념을 장기 기억에 저장합니다. 현재 1700개 이상의 CS 문제를 축적했습니다.

"일단 만들어 보고, 막히면 그때 이론으로 돌아간다"는 원칙을 지키고 있습니다.`,
    a_en: `Two main approaches:

1. **Build to learn**: I read theory and immediately apply it in real projects. This blog, Seekr, and ModelPulse are all artifacts of learning-by-building.
2. **CS Tutor**: My own SM-2 spaced repetition agent helps me retain concepts long-term. I've built up 1700+ CS problems.

My rule: "Build first, go back to theory when stuck."`,
    tags: ["learning", "study", "self-taught"],
  },

  // ─── follow-up: 프로젝트 꼬리 질문 ──────────────────────────
  {
    id: "followup_challenge",
    q: [
      "그중 가장 도전적이었던 건?",
      "가장 힘들었던 프로젝트가 뭔가요?",
      "가장 어려웠던 부분은?",
      "Which project was the most challenging?",
      "What was the hardest thing you've built?",
      "What was your biggest technical challenge?",
    ],
    a_ko: `두 가지가 특히 기억에 남습니다.

**42서울 시절**: C 언어로 메모리 관리와 포인터 연산을 처음 다룰 때 — 가비지 컬렉터 없이 직접 메모리를 할당·해제해야 했고, 세그폴트 디버깅만 며칠씩 걸렸습니다.

**현재 인프라**: GPU 메모리 한계 안에서 RAG + 스트리밍을 동시에 안정적으로 돌리는 것이었습니다. 동시 요청이 2개 이상 들어오면 Ollama가 OOM으로 죽는 문제가 있어서, concurrency limiter와 AbortController로 요청을 제어하는 구조를 직접 설계했습니다.`,
    a_en: `Two stand out.

**42Seoul**: Working with C memory management for the first time — no garbage collector, raw malloc/free, spending days debugging segfaults.

**Current infra**: Running RAG + streaming reliably within GPU memory limits. When two requests hit simultaneously, Ollama would OOM-crash. I designed a concurrency limiter + AbortController system to control requests and abort orphaned streams when clients disconnect.`,
    tags: ["challenge", "projects", "42seoul", "infra"],
  },
  {
    id: "followup_tech_difficulty",
    q: [
      "기술적으로 어려웠던 부분은?",
      "구현하면서 막혔던 부분이 있었나요?",
      "어떤 버그나 문제가 있었나요?",
      "What was technically difficult?",
      "What bugs or problems did you run into?",
      "Any tricky implementation challenges?",
    ],
    a_ko: `가장 까다로웠던 건 한국어 임베딩 품질 문제였습니다.

nomic-embed-text 모델이 영어보다 한국어를 상대적으로 약하게 처리해서, 의미적으로 비슷한 질문이 낮은 cosine score를 받는 경우가 많았습니다. 청크 크기, 오버랩, 유사도 임계값을 반복 조정하고, 최종적으로 사전 작성 Q&A 기반 시맨틱 라우터를 Tier 1으로 앞에 두는 3단계 파이프라인으로 해결했습니다.

또 SSE 스트리밍 중 클라이언트가 연결을 끊으면 서버가 계속 Ollama에서 토큰을 받아 GPU를 낭비하는 문제도 있었습니다. AbortController를 stream의 cancel()에 연결해서 해결했습니다.`,
    a_en: `The trickiest issue was Korean embedding quality.

nomic-embed-text handles Korean weaker than English — semantically similar questions were getting low cosine scores. I tuned chunk sizes, overlap, and similarity thresholds repeatedly, and ultimately solved it by adding a pre-written Q&A semantic router as Tier 1 in a 3-tier pipeline.

Another issue: when a client disconnected mid-stream, the server kept pulling tokens from Ollama, wasting GPU cycles. I solved it by wiring an AbortController to the stream's cancel() method.`,
    tags: ["technical", "difficulty", "rag", "korean", "streaming"],
  },

  // ─── follow-up: 기술 스택 꼬리 질문 ─────────────────────────
  {
    id: "followup_why_stack",
    q: [
      "왜 그 스택을 선택했나요?",
      "기술 스택 선택 기준이 뭔가요?",
      "왜 Python을 쓰나요?",
      "왜 Next.js를 선택했나요?",
      "Why did you choose that stack?",
      "Why FastAPI over other frameworks?",
      "Why Next.js?",
      "What's your stack selection criteria?",
    ],
    a_ko: `각 선택에 이유가 있습니다.

- **Python + FastAPI**: AI/ML 생태계의 표준 언어라는 점, 그리고 FastAPI의 자동 OpenAPI 문서와 async 지원이 API 설계를 빠르게 합니다.
- **Next.js**: SSR, API Routes, App Router를 하나의 코드베이스에서 처리할 수 있어서 프론트엔드-백엔드 전환 오버헤드가 없습니다.
- **Docker Compose**: 개발 환경과 프로덕션을 동일하게 유지하기 위해서입니다. "내 컴에서만 돼요" 문제를 원천 차단합니다.
- **Ollama**: 클라우드 API 없이 LLM을 로컬에서 실행할 수 있는 가장 낮은 진입장벽의 선택지입니다.`,
    a_en: `Each choice has a reason.

- **Python + FastAPI**: Standard language for the AI/ML ecosystem, plus FastAPI's auto-generated OpenAPI docs and async support make API development fast.
- **Next.js**: SSR, API Routes, and App Router in one codebase — no context-switching between frontend and backend repos.
- **Docker Compose**: Keeps dev and production identical. No "works on my machine" problems.
- **Ollama**: Lowest-barrier way to run LLMs locally without cloud API costs.`,
    tags: ["stack", "tech", "why", "python", "nextjs", "docker", "ollama"],
  },
  {
    id: "followup_next_tech",
    q: [
      "앞으로 도입하고 싶은 기술은?",
      "배우고 싶은 기술이 있나요?",
      "다음에 사용해볼 기술은?",
      "What tech do you want to adopt next?",
      "What are you learning next?",
      "What's on your tech radar?",
    ],
    a_ko: `세 가지 방향에 관심이 있습니다.

1. **vLLM**: Ollama 대신 PagedAttention 기반 고성능 추론 서버로 교체해서 throughput을 높이고 싶습니다.
2. **Kubernetes**: 현재 Docker Compose 환경을 K8s로 마이그레이션해서 스케일링과 자동 복구를 추가하는 것이 목표입니다.
3. **OpenTelemetry**: 분산 트레이싱을 도입해서 FastAPI → Celery → Ollama 체인의 병목을 더 정밀하게 파악하고 싶습니다.`,
    a_en: `Three directions interest me:

1. **vLLM**: Replace Ollama with a PagedAttention-based inference server for higher throughput.
2. **Kubernetes**: Migrate the current Docker Compose setup to K8s for auto-scaling and self-healing.
3. **OpenTelemetry**: Add distributed tracing to pinpoint bottlenecks across the FastAPI → Celery → Ollama chain.`,
    tags: ["future", "learning", "vllm", "kubernetes", "opentelemetry"],
  },

  // ─── follow-up: 인프라 꼬리 질문 ─────────────────────────────
  {
    id: "followup_server_cost",
    q: [
      "서버 비용은 얼마나 드나요?",
      "홈서버 운영 비용이 궁금해요",
      "서버 유지비가 얼마예요?",
      "How much does the home server cost?",
      "What are your server running costs?",
      "Is a home server cheaper than cloud?",
    ],
    a_ko: `홈서버라 월 비용은 사실상 전기세뿐입니다.

GPU(RTX 계열)가 풀로드 시 약 200–300W를 사용하지만, 대부분의 시간은 아이들 상태라 실제 전력 소비는 훨씬 낮습니다. 월 전기 추가분은 약 5–10달러 수준으로 추정합니다.

클라우드 GPU 인스턴스(A10G 기준 $1-2/hr)와 비교하면 동일한 워크로드를 10배 이상 저렴하게 돌릴 수 있습니다. 초기 하드웨어 비용을 6개월이면 회수할 수 있는 구조입니다.`,
    a_en: `Since it's a home server, the only ongoing cost is electricity.

The GPU (RTX series) draws ~200–300W at full load, but sits idle most of the time, so actual consumption is much lower. I estimate the monthly electricity increase at around $5–10.

Compared to cloud GPU instances (A10G at $1–2/hr), I can run the same workload for 10x cheaper. The hardware pays for itself within ~6 months.`,
    tags: ["cost", "homeserver", "infra", "cloud"],
  },

  // ─── follow-up: 비전공 전환 ───────────────────────────────────
  {
    id: "followup_noncs_transition",
    q: [
      "비전공자에서 어떻게 전환했나요?",
      "비전공자도 AI 엔지니어가 될 수 있나요?",
      "어떻게 시작했나요?",
      "How did you transition from non-CS?",
      "Can a non-CS person become an AI engineer?",
      "How did you get started in tech?",
    ],
    a_ko: `순서가 핵심이었습니다.

**1단계 (42서울)**: 추상화를 거치지 않고 C 언어로 메모리, 포인터, 시스템 콜을 직접 다뤘습니다. "컴퓨터가 실제로 어떻게 동작하는가"를 몸으로 배웠습니다.

**2단계 (Python + AI)**: 탄탄한 하드웨어/OS 이해 위에 Python과 ML 개념을 쌓으니 "왜 이렇게 동작하는가"가 자연스럽게 연결됐습니다.

**3단계 (만들기)**: 이론을 읽고 바로 실제 프로젝트에 적용하는 사이클을 반복했습니다.

비전공이라서 유리한 점도 있었습니다 — 선입견 없이 "왜?"를 묻는 습관이 아키텍처를 더 깊게 이해하게 해줬습니다.`,
    a_en: `The order mattered.

**Step 1 (42Seoul)**: Worked with C — no abstraction layers, direct memory management, pointers, system calls. Learned how computers actually work at the metal level.

**Step 2 (Python + AI)**: With a solid hardware/OS foundation, Python and ML concepts connected naturally — I understood the "why" behind the abstractions.

**Step 3 (Build)**: Read theory, apply immediately in a real project, repeat.

Being non-CS was actually an advantage — asking "why?" without preconceptions led me to understand architecture at a deeper level.`,
    tags: ["non-cs", "transition", "career", "how-to"],
  },

  // ─── follow-up: 더 보기 ────────────────────────────────────────
  {
    id: "followup_more_projects",
    q: [
      "다른 프로젝트도 있나요?",
      "더 자세히 알고 싶어요",
      "포트폴리오를 더 보고 싶어요",
      "Are there more projects?",
      "Tell me more",
      "I want to see more of your work",
    ],
    a_ko: `네, 몇 가지 더 있습니다.

- **StudyOS**: FastAPI + Next.js + ChromaDB + Ollama로 만든 AI 학습 관리 시스템. 커리큘럼 생성 → 스터디 세션 스케줄링 → RAG 챗 → 플래시카드 퀴즈 흐름을 자동화합니다.
- **Archon**: 9개 에이전트가 협력하는 자율 코딩 오케스트레이터 파이프라인.
- **Calyx**: 캘린더 에이전트 플랫폼 앱 (iOS). 운동/식단/문화/여행 에이전트를 구독하는 시스템으로 개발 중입니다.

자세한 내용은 상단 /products 페이지에서 확인하실 수 있습니다.`,
    a_en: `Yes, a few more:

- **StudyOS**: AI study management system built on FastAPI + Next.js + ChromaDB + Ollama. Automates the flow from curriculum generation → session scheduling → RAG chat → flashcard quizzes.
- **Archon**: Autonomous coding orchestrator pipeline with 9 collaborating agents.
- **Calyx**: Calendar agent platform app (iOS). A subscription system for domain-specific agents (fitness/diet/culture/travel). Currently in development.

Check the /products page for full details.`,
    tags: ["projects", "studyos", "archon", "calyx", "more"],
  },
];
