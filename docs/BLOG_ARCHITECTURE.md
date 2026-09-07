# Gats Lab Blog — Architecture Overview

> AI 엔지니어 겸 빌더로서의 정체성을 담은 포트폴리오 블로그

---

## What This Blog Is

단순한 글쓰기 공간이 아니다. **직접 설계하고 직접 배포한 풀스택 AI 포트폴리오 시스템**이다.

- Next.js 풀스택 앱을 직접 개발
- RAG 파이프라인을 직접 설계하고 로컬 LLM과 연결
- Docker + GPU 환경에서 자체 서버 운영
- 블로그 자체가 "내가 뭘 만들 수 있는 사람인가"를 증명하는 프로덕트

---

## Tech Stack

| 레이어 | 기술 |
|--------|------|
| Frontend | Next.js 16 (App Router) + React 19 |
| Styling | Tailwind CSS v4 + Mantine v8 |
| Editor | BlockNote v0.47 (Notion-style 블록 에디터) |
| Animation | Motion (Framer) + GSAP |
| Backend | Next.js API Routes (App Router) |
| ORM | Prisma v6 + SQLite |
| Auth | JWT (jose) + bcryptjs |
| AI/RAG | Ollama (Qwen3:8b) + nomic-embed-text (768-dim) |
| Deployment | Docker Compose + NVIDIA GPU |
| Analytics | Google Analytics 4 + GTM + 자체 PageView 테이블 |

---

## Directory Structure

```
blog/
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── api/               # 30+ API 엔드포인트
│   │   ├── (pages)/           # 라우트별 페이지
│   │   └── admin/             # 관리자 대시보드
│   ├── components/
│   │   ├── home/              # 홈 섹션 (Hero, Chat, Build, Metrics)
│   │   ├── posts/             # 포스트 뷰어, 댓글, TOC
│   │   ├── editor/            # NotionEditor, ProductEditor, BuildEditor
│   │   ├── admin/             # 분석/RAG/About 탭
│   │   └── layout/            # Nav, Footer, ClientLayout
│   ├── lib/
│   │   ├── rag.ts             # RAG 파이프라인 코어
│   │   ├── faq-router.ts      # FAQ 시맨틱 라우팅
│   │   ├── github.ts          # GitHub 커밋 연동
│   │   └── auth.ts            # JWT 인증
│   ├── data/faq.ts            # 사전 작성 FAQ Q&A
│   └── i18n/translations.ts   # 한/영 i18n
├── prisma/
│   ├── schema.prisma          # 10개 테이블 스키마
│   └── migrations/            # 13개 마이그레이션
├── Dockerfile                 # Multi-stage 빌드
├── docker-compose.yml         # blog + ollama 서비스
├── entrypoint.sh              # DB 마이그레이션 + 어드민 초기화
└── deploy.sh                  # 자동 배포 스크립트
```

---

## Pages & Routes

| 경로 | 목적 |
|------|------|
| `/` | 홈 — 빌드 타임라인, 챗봇, 프로젝트 패널 |
| `/insights` | 개발 로그, 트러블슈팅, 블루프린트 |
| `/insights/[slug]` | 단일 포스트 (마크다운 + Mermaid + 코드 하이라이팅) |
| `/products` | 프로덕트 & AI 에이전트 갤러리 |
| `/products/[slug]` | 단일 프로덕트 (데모 영상, 외부 링크, 타겟 등) |
| `/about` | 소개 페이지 (어드민 편집 가능) |
| `/connect` | 방명록 |
| `/write` | 포스트 에디터 (인증 필요) |
| `/admin` | 관리자 대시보드 6탭 |
| `/login` | JWT 로그인 |

---

## Database Schema (10 Tables)

```
Post          — 블로그 포스트 (카테고리, 다국어, 핀, GitHub 연동)
Comment       — 댓글
GuestbookEntry — 방명록
PageView      — 페이지뷰 추적
MediaAsset    — 업로드 파일
AdminUser     — 어드민 계정
ProgressItem  — 빌드 진행상황
PostChunk     — RAG 임베딩 (768차원 벡터)
ChatMessage   — 챗봇 대화 기록
SiteConfig    — 사이트 전역 설정 (About 텍스트 등)
```

---

## RAG Chatbot Pipeline (핵심 AI 기능)

블로그 방문자가 "이 사람 뭐 만들었어요?"라고 물으면 실시간으로 답해주는 로컬 RAG 챗봇.

### 3-Tier 처리 흐름

```
사용자 쿼리
    │
    ▼
[Tier 1] FAQ Semantic Router
    │ nomic-embed-text로 임베딩 후 코사인 유사도 ≥ 0.80?
    │ YES → 즉시 사전 답변 반환 (Ollama 불필요)
    │
    ▼
[Tier 2] RAG + LLM Generation
    │ PostChunk 테이블에서 유사 청크 검색
    │ 컨텍스트 구성 후 Qwen3:8b에 스트리밍 요청
    │
    ▼
[Tier 3] Offline Fallback
    │ Ollama 다운 시 기본 프롬프트 기반 응답
```

### 엔지니어링 포인트

| 항목 | 구현 |
|------|------|
| 임베딩 모델 | nomic-embed-text (768차원, Ollama 로컬) |
| LLM | Qwen3:8b (NVIDIA GPU, 8B 파라미터) |
| 청크 사이즈 | 600-1000자, 제목 prefix 포함 |
| 캐싱 | 청크 캐시 5분 TTL, 임베딩 캐시 10분 TTL |
| Rate Limiting | IP당 60초에 5요청 |
| Concurrency | 동시 Ollama 요청 최대 2개 (GPU 보호) |
| 스트리밍 | SSE (Server-Sent Events) |
| 언어 분리 | 한국어 입력 → 한국어 출력 (CJK 필터링) |

### 관련 파일

- `src/lib/rag.ts` — RAG 파이프라인 전체
- `src/lib/faq-router.ts` — FAQ 시맨틱 라우팅
- `src/data/faq.ts` — 사전 Q&A 데이터
- `src/app/api/chat/route.ts` — SSE 스트리밍 엔드포인트

---

## Post Categories

| 카테고리 | 목적 | 라우트 |
|----------|------|--------|
| `journal` | 개발 일지, 과정 기록 | `/insights` |
| `troubleshooting` | 문제 해결 기록 | `/insights` |
| `blueprint` | 아키텍처 설계 문서 | `/insights` |
| `build` | 빌드 타임라인 | `/insights` |
| `product` | 만든 프로덕트 소개 | `/products` |
| `agent` | 만든 AI 에이전트 소개 | `/products` |

**Multi-language:** 각 포스트에 `locale (ko/en)` + `translationKey`로 번역 쌍 연결.

---

## Admin Dashboard (6 Tabs)

어드민 패널 자체도 내가 직접 구현한 백오피스.

| 탭 | 기능 |
|----|------|
| Posts | 포스트 목록/편집/삭제/핀 설정 |
| Comments | 댓글 관리 |
| Guestbook | 방명록 관리 |
| Chat Analytics | 챗봇 세션 기록, IP 로깅, 대화 트랜스크립트 |
| RAG Management | 단일/전체 포스트 임베딩 재구성 |
| About Page | 한/영 About 텍스트 WYSIWYG 편집 |

---

## Deployment Architecture

```
인터넷
  │
  ▼
Nginx Proxy Manager (proxy-net)
  │
  ▼
blog (Next.js, port 3001)
  │  blog-internal network
  ▼
ollama (GPU, port 11434)
```

### Docker 구성

- `Dockerfile` — Multi-stage build (node:20-alpine)
- `docker-compose.yml` — blog + ollama (NVIDIA GPU reservation)
- `entrypoint.sh` — DB 마이그레이션 자동 적용 + 어드민 계정 초기화
- `deploy.sh` — 빌드 → 재시작 → 헬스체크 → 프록시 연결 자동화

### Volume 전략

- `blog-data` → `/app/prisma` (SQLite DB 영속화)
- `blog-uploads` → `/app/public/uploads` (미디어 파일 영속화)

---

## API Surface

30개 이상의 엔드포인트. 주요 그룹:

| 그룹 | 엔드포인트 수 | 비고 |
|------|--------------|------|
| Posts CRUD | 5 | 보호된 쓰기 |
| Auth | 2 | JWT, httpOnly 쿠키 |
| Chat + RAG | 5 | SSE 스트리밍, 피드백 |
| Admin | 6 | 모두 인증 필요 |
| Comments | 3 | 공개 쓰기, 관리자 삭제 |
| Guestbook | 3 | 공개 쓰기 |
| Progress | 4 | 빌드 진행상황 관리 |
| GitHub | 1 | 커밋 히스토리 캐싱 |
| Upload/Static | 2 | 파일 업로드/서빙 |
| Health/Status | 2 | 서비스 상태 체크 |

---

## 왜 이 블로그가 포트폴리오인가

1. **직접 설계한 RAG 아키텍처** — FAQ 라우터 → 벡터 검색 → LLM 생성의 3티어 파이프라인을 처음부터 구현했다.

2. **GPU 인프라 직접 운영** — Ollama + NVIDIA GPU 컨테이너를 홈서버에 구성하고, 동시성 제어와 레이트 리밋까지 직접 짰다.

3. **풀스택 단독 구현** — 프론트엔드(블록 에디터, 애니메이션, i18n), 백엔드(인증, API, DB 마이그레이션), 인프라(Docker, 배포 자동화)를 혼자 다 만들었다.

4. **프로덕트 사고** — 단순 기술 스택 나열이 아니라 "AI 엔지니어가 만든 것"과 "AI 에이전트"를 별도 카테고리로 분리해 포트폴리오 구조를 설계했다.

5. **블로그 자체가 살아있는 프로덕트** — 방문자가 챗봇에게 질문하고, 커밋 히스토리가 실시간으로 표시되고, 빌드 타임라인이 업데이트된다.

---

*Last updated: 2026-04-19*
