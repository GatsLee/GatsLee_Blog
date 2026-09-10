# 와이어프레임 → 코드 이관 계획

`docs/ia.md`의 32개 화면을 실제 Next.js 코드에 반영하는 순서와 범위. 2026-09-10 기준 코드베이스(약 17,000 LOC)와 와이어프레임 사이의 차이를 메운다.

## 가장 큰 차이 하나

**와이어프레임은 프로덕트를 독립 엔티티로 다루는데, 코드는 `Post`의 카테고리 값으로 다룬다.**

지금 `/products`는 `Post.category IN ('product','agent')`인 행 6건을 읽는다. 프로덕트 상세에 필요한 값(타입·단계·기간·역할·타겟·문제 서술·근거 카드·핵심 기능 단계·서비스 플로우 임베드·스택 칩)은 `Post`에 자리가 없고, 있는 것도 `purpose` / `targetAudience` / `expectedEffect` 세 칸뿐이다. 이 셋은 2026-09-09에 와이어프레임에서 이미 뺀 구조다.

여기가 갈라지면 나머지도 전부 갈라진다. 포스트를 프로덕트에 묶는 것(`IA_PS_001`의 프로덕트 카드 필터, `IA_PS_002`의 프로덕트 연결 카드), 관리자 프로덕트 탭(`IA_AD_00202`), 홈의 핵심 프로덕트 3장(`IA_HM_001`)이 전부 이 엔티티를 전제한다. **그래서 데이터 모델이 1단계다.**

## 단계

| 단계 | 무엇 | 배포 가능 | 위험 |
|------|------|-----------|------|
| 1 | 데이터 모델 — `Product` 신설, `Post` 연결, 관측 필드 | 예 (읽는 곳 없음) | 낮음 |
| 2 | 데이터 이관 — 기존 프로덕트 6건을 `Product`로 | 예 | 중간 (되돌리려면 백업 필요) |
| 3 | 공개 화면 — 홈 · 프로덕트 · 포스트 · 상태 화면 | 예 | 낮음 |
| 4 | 관리자 — 탭 6개 | 예 | 낮음 |
| 5 | 챗봇 — 제안 화면, 관측 필드 기록 | 예 | 낮음 |
| 6 | 정리 — 죽은 라우트·모델 제거 | 예 | 중간 (되돌리기 어려움) |

각 단계는 그 자체로 배포된다. 1~2단계를 먼저 올리고 3단계를 나눠 올리는 식으로 간다.

## 1단계 — 데이터 모델

### 신설: `Product`

와이어프레임 `IA_PD_002`와 `IA_AD_0020201`이 요구하는 필드를 그대로 옮긴다.

| 필드 | 타입 | 화면 |
|------|------|------|
| `slug` `name` `tagline` | String | 목록·상세 제목/한 줄 요약 |
| `type` | String | `app` / `web` / `agent` — 상세 화면 골격을 가른다 |
| `stage` `stamp` | String | 기획·구현·운영 / 도장 문구 |
| `periodStart` `periodEnd` `ongoing` | String, Boolean | 메타 4칸의 기간 |
| `roles` `headcount` | JSON, Int | 메타 4칸의 역할 |
| `useCase` `audience` | String | 메타 4칸의 유형·타겟 |
| `coverImage` | String | 대표 이미지 |
| `summary` | JSON | 목록 카드의 요점 3줄 |
| `stack` | JSON | 스택 칩 |
| `links` | JSON | 상단 액션 버튼 2개 |
| `problemBody` `evidence` | String, JSON | 문제 서술 + 근거 카드(인용·출처·수치·요약) |
| `features` | JSON | 핵심 기능 단계 배열 (라벨·부제·본문·이미지 슬롯) |
| `flowEmbedUrl` | String | 서비스 플로우 Figma 임베드 |
| `published` `sortOrder` | Boolean, Int | 관리자 목록 정렬·노출 |

### 변경: `Post`

- `productId Int?` + 관계 — `IA_PS_001` 프로덕트 카드 필터, `IA_PS_002` 프로덕트 연결 카드
- `takeaway String` — 목록의 한 줄 결론
- `seriesKey String` / `seriesOrder Int` — 시리즈 행

기존 프로덕트 전용 칸(`demoVideo` `demoImages` `externalLinks` `targetAudience` `purpose` `expectedEffect` `caseBeats`)은 **1단계에서 지우지 않는다.** 2단계 이관이 이 값을 읽어야 하므로 6단계에서 지운다.

### 변경: `ChatMessage`

`IA_AD_0020401` 세션 상세가 요구하는 관측 필드. 지금은 전부 없어서 RAG 평가가 불가능하다.

`chunkIds` (JSON) / `tier` (라우팅 4단계 중 어디) / `mlGate` (Boolean?) / `fallback` (Boolean) / `ttftMs` `totalMs` (Int?) / `feedback` (String)

### 삭제 예정 (6단계)

`GuestbookEntry` — 커넥트 삭제로 쓰는 화면이 없다. 데이터 0건.
`ProgressItem` — 데이터 0건. `/api/progress`만 참조.

## 2단계 — 데이터 이관

기존 `Post` 6건을 `Product`로 옮긴다.

| id | slug | → type |
|----|------|--------|
| 53 | `a41` | app |
| 55 | `calyx` | app |
| 60 | `bookear` | app |
| 24 | `orchestrator-agent` | agent |
| 25 | `aiops-agent` | agent |
| 26 | `blog-agent` | agent |

`purpose` → `problemBody`, `targetAudience` → `audience`, `externalLinks` → `links`, `tags` → `stack`으로 옮기고 나머지 필드는 빈 값으로 둔다. 관리자 화면에서 채우는 것이 전제다.

이관 뒤 이 6건의 `Post` 행은 **지우지 않고 `published = false`로 내린다.** `PostChunk` 251건이 `postId`로 걸려 있어서 지우면 RAG 검색이 조용히 깨진다. 청크 재색인은 3단계에서 프로덕트 본문을 소스로 다시 만든다.

남은 포스트 29건의 `productId`는 태그로 1차 매핑하고(`#A41` → A41, `#CALYX` → CALYX 등) 나머지는 관리자에서 손으로 붙인다.

## 3단계 — 공개 화면

| 화면 | 파일 | 주요 변경 |
|------|------|-----------|
| `IA_HM_001` | `src/app/page.tsx`, `src/components/home/*` | 히어로 + 핵심 프로덕트 3장 + 워크플로우 5단계 + 아카이브. 지금의 서버 상태 패널·빌더 로그는 뺀다 |
| `IA_PD_001` | `src/app/products/page.tsx`, `ProductGallery.tsx` | `Product` 읽기. 블록형 목록(이미지 슬롯 + 요점 3줄 + 스택 칩) |
| `IA_PD_002` | `src/app/products/[slug]/` | 타입별 골격. 개요 → 문제 → 핵심 기능 → 서비스 플로우 |
| `IA_PS_001` | `src/app/insights/` | 프로덕트 카드 필터, 채워진 아티클 카드, 한 줄 결론 |
| `IA_PS_002` | `src/app/insights/[slug]/` | 프로덕트 연결 카드 + 같은 프로덕트 포스트 |
| `IA_PS_00101` `IA_SY_001` | 빈 상태 · `not-found.tsx` | 새로 만든다 |

네비게이션도 여기서 정리한다. 지금 `TopNav`는 홈·케이스·이력서·프로덕트·인사이트·소개 여섯인데, 와이어프레임은 홈·프로덕트·포스트 셋에 이력서는 유틸이다.

## 4단계 — 관리자

`src/app/admin/page.tsx`(558줄)를 탭 6개로 다시 짠다. 현황 / 프로덕트 / 포스트 / AI 챗봇 / CS / 설정.

지금 있는 탭 컴포넌트 다섯 중 `AboutEditorTab`은 소개 삭제로 없어지고, `FaqManagementTab`·`ChatAnalyticsTab`은 AI 챗봇 탭으로 합쳐지고, `RAGManagementTab`은 프로덕트/포스트 탭 안으로 들어간다. `ResumeEditorTab`은 설정 탭의 업로드 버튼 하나로 줄어든다.

## 5단계 — 챗봇

`IA_CB_00101` 제안 화면을 추천 질문 4개로 줄이고(`WelcomeScreen.tsx`), `/api/chat`에서 관측 필드를 `ChatMessage`에 기록한다. 지금 응답 경로에 타이머와 청크 id가 흐르고는 있으나 저장하지 않는다.

## 6단계 — 정리

라우트 삭제: `/about` `/cases` `/connect`. 모델 삭제: `GuestbookEntry` `ProgressItem`. `Post`의 프로덕트 전용 칸 7개 삭제. `src/lib/categories.ts`의 카테고리를 `journal` `build` 둘로 줄인다.

SQLite는 컬럼 삭제가 테이블 재생성이라, 이 단계는 프로덕션 백업을 뜬 뒤에 한다.

## 결정이 필요한 것

1. **와이어프레임에만 있는 프로덕트 셋** — AlterCharge, Alfred, GatsBlog는 DB에 없다. 2단계에서 빈 행으로 만들어 둘지, 관리자 화면이 생긴 뒤 직접 넣을지.
2. **프로덕션 반영 시점** — 1~2단계를 한 번에 배포할지, 로컬에서 3단계까지 만들고 한꺼번에 올릴지. 홈서버 DB는 `docker cp`로 가져와야 하고 지금 로컬 사본은 2026-09-07 것이다.
3. **`/cases` 라우트** — 글이 0건이라 IA에서 뺐는데, 라우트를 지울지 남겨둘지. 남기면 빈 목록이 계속 보인다.
