# GatsBlog 와이어프레임 구성

Figma 상세기획 파일에 제작한 와이어프레임의 화면 목록과 섹션 조립 내역. 홈 상단 네비게이션 6개 탭을 기준으로 나눴다.

| 항목 | 값 |
|------|-----|
| 파일 | [GatsBlog 상세기획](https://www.figma.com/design/wsLPU5JDsN67AAutcUBGeO/GatsBlog-%EC%83%81%EC%84%B8%EA%B8%B0%ED%9A%8D) |
| File Key | `wsLPU5JDsN67AAutcUBGeO` |
| 페이지 | `wireframe(web)` (node 0-1), `wireframe(mobile)` (node 1-2) |
| 디자인 시스템 | Simple Design System — 컴포넌트 목록은 `figma-simple-design-system-index.md` |
| 캔버스 폭 | web 1200px, mobile 375px |
| 제작 일자 | 2026-09-07 |

## 탭 구조

홈 `TopNav`(`src/components/layout/TopNav.tsx`)의 `navItems`가 탭 기준이다. 방명록은 푸터에, 작성·관리는 관리자 전용이라 별도 섹션으로 뺐다.

| 섹션 | 탭 | 라우트 | 화면 수 |
|------|----|--------|---------|
| 01_Home | Home | `/` | 1 (mobile 2) |
| 02_Cases | Cases | `/cases`, `/cases/[slug]` | 2 |
| 03_Resume | Resume | `/resume` | 1 |
| 04_Products | Products | `/products`, `/products/[slug]` | 2 |
| 05_Insights | Insights | `/insights`, `/insights/[slug]` | 2 |
| 06_About | About | `/about` | 1 |
| 07_보조 | 푸터·비로그인 | `/connect`, `/login` | 2 |
| 08_관리자 | 관리자 전용 | `/admin`, `/write` | 2 |

web 13개, mobile 14개(모바일 메뉴 열림 상태 추가). 합계 27개 프레임.

## 화면별 섹션 조립

각 화면은 세로 auto-layout 프레임이고, 자식은 전부 Simple Design System 인스턴스다. `Platform` variant로 web(Desktop)·mobile(Mobile)을 가른다.

### 01_Home

**W-01 / M-01 홈**

| 순서 | 레이어 | SDS 컴포넌트 | 역할 |
|------|--------|--------------|------|
| 1 | SEC_글로벌헤더 | Header | 로고 + 6개 탭 + KO/EN + LOGIN |
| 2 | SEC_히어로_명제 | Hero Actions | 명제 한 줄 + CTA 2개 |
| 3 | SEC_지표 | Card Grid Icon | 운영 지표 6종 |
| 4 | SEC_현재빌드 | Panel Image Content | 진행 중 빌드의 목표·진척률 |
| 5 | SEC_빌드로그 | Card Grid Content List | 최신 빌드 로그 3건 |
| 6 | SEC_포트폴리오 | Card Grid Image | 프로덕트·에이전트 6종 |
| 7 | SEC_글로벌푸터 | Footer | 둘러보기 / 콘텐츠 / 연락 3열 |

**M-01b 홈_메뉴열림** — Header `Platform=Mobile, State=Open` 단독. 모바일 햄버거를 눌렀을 때의 전체화면 메뉴.

### 02_Cases

**W-02 / M-02 케이스목록**: Header, Hero Basic(페이지 타이틀), Tabs(카테고리 필터), Card Grid Content List(목록), Pagination, Footer

**W-03 / M-03 케이스상세**: Header, Hero Basic(케이스 헤드), Panel Image Content(문제와 가설), Card Grid Content List(관련 케이스), Footer

### 03_Resume

**W-04 / M-04 이력서**: Header, Hero Basic(프로필 헤드 + PDF/연락 CTA), Card Grid Icon(핵심 지표), Card Grid Content List(경력), Panel Image Content(역량과 도구), Footer

### 04_Products

**W-05 / M-05 프로덕트목록**: Header, Hero Basic, Page Product Results(검색 + 결과 그리드), Footer

**W-06 / M-06 프로덕트상세**: Header, Page Product(개요 2열), Tabs(섹션 탭), Card Grid Image(화면), Footer

### 05_Insights

**W-07 / M-07 인사이트목록**: Header, Hero Basic, Tabs(태그 필터), Card Grid Content List, Pagination, Footer

**W-08 / M-08 인사이트상세**: Header, Hero Basic(글 헤드), Panel Image Content(본문), Card Grid Content List(관련 글), Footer

### 06_About

**W-09 / M-09 소개**: Header, Hero Image(인트로), Panel Image Content(일하는 방식), Panel Image Content Reverse(관심 영역), Card Grid Icon(역량 요약), Footer

### 07_보조

**W-10 / M-10 방명록**: Header, Hero Basic, Card Grid Testimonials(남겨진 메시지), Form Contact(입력 폼), Footer

**W-11 / M-11 로그인**: Header Auth, Form Log In. 푸터 없음.

### 08_관리자

**W-12 / M-12 관리자대시보드**: Header Auth, Tabs(게시글·FAQ·RAG·이력서), Card Grid Content List(관리 목록), Footer

**W-13 / M-13 글작성**: Header Auth, Page Product(본문 + 발행 설정 2열), Footer

## 네이밍 규칙

- 화면 프레임: `W-{번호}_{화면명}` (web), `M-{번호}_{화면명}` (mobile). 번호는 두 플랫폼에서 동일한 화면을 가리킨다.
- 화면 내 블록: `SEC_{역할}` — 페이지 단위 밴드.
- 단일 컴포넌트: `CMP_{역할}` — 탭·페이지네이션·폼처럼 밴드가 아닌 것.
- Figma 기본 이름(`Frame 1`, `Group 4` 등) 잔재 없음. 인스턴스 내부 레이어는 원본 이름을 유지한다.

## 남은 작업

| 항목 | 상태 | 비고 |
|------|------|------|
| 실제 콘텐츠 반영 | 진행 | 헤딩·타이틀은 GatsBlog 문구로 교체 완료. 카드 본문은 서술형 플레이스홀더 |
| 다크 모드 | 대기 | SDS `Color` 컬렉션의 `SDS Dark` 모드로 전환해 별도 프레임 제작 필요 |
| AI 챗봇 위젯 | 대기 | SDS `AI Chatbot` 컴포넌트(`Device` 축) 미배치 |
| 태블릿 | 폐기 | SDS `Responsive` 컬렉션에 Tablet 모드가 있으나 현 범위 제외 |
| 상세 디스크립션 | 대기 | 화면별 예외·분기·트리거 정의는 별도 문서로 |

## 신규 제작 컴포넌트

없음. 27개 화면 전부 Simple Design System 인스턴스로만 조립했다.
