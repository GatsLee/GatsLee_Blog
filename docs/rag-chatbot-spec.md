# RAG 챗봇 기획서

> 블로그 포스트를 학습한 AI 챗봇 — 포트폴리오 자체가 AI 프로젝트가 되는 핵심 기능

## 1. 개요

### 목표
방문자가 블로그 우하단의 플로팅 위젯을 통해 프로젝트, 기술 스택, 블로그 글에 대해 자연어로 질문하고, 블로그 콘텐츠를 기반으로 한 AI 답변을 실시간 스트리밍으로 받을 수 있도록 함.

### 핵심 가치
- **차별화**: AI 엔지니어 포트폴리오에 실제 동작하는 RAG 시스템이 있다는 것 자체가 기술 증명
- **실용성**: 채용 담당자가 프로젝트에 대해 빠르게 파악 가능
- **기술 스택 시연**: 임베딩, 벡터 검색, 스트리밍, LLM 활용을 한번에 보여줌

### 기술 스택
- **프레임워크**: Next.js 16 + React 19 + TypeScript
- **LLM / 임베딩**: Ollama (로컬 호스트, 포트 11434)
- **임베딩 모델**: `nomic-embed-text` (768차원, 한/영 지원)
- **생성 모델**: Ollama에 로딩된 모델 자동 감지
- **데이터베이스**: SQLite + Prisma (기존 인프라)
- **벡터 저장**: SQLite JSON 배열 (포트폴리오 규모에서 충분)

---

## 2. 아키텍처

### 전체 흐름

```
┌─────────────────────────────────────────────────────────────────┐
│                        인덱싱 파이프라인 (관리자)                    │
│                                                                 │
│  [블로그 포스트] → 마크다운 스트립 → 단락 청킹 → Ollama 임베딩       │
│                                    → SQLite PostChunk 저장       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        질의 파이프라인 (방문자)                     │
│                                                                 │
│  [사용자 질문] → Ollama 임베딩 → cosine similarity 검색             │
│                → top-5 chunk 추출 → 시스템 프롬프트 구성             │
│                → Ollama chat (스트리밍) → ReadableStream 응답       │
└─────────────────────────────────────────────────────────────────┘
```

### 컴포넌트 다이어그램

```
Frontend (React)                    Backend (Next.js API Routes)
┌──────────────┐                   ┌──────────────────────┐
│  ChatWidget  │ ← streaming ───── │  POST /api/chat      │
│  (플로팅)     │                   │  (검색 + 생성)        │
└──────────────┘                   └──────────────────────┘
                                           │
                                   ┌───────┴───────┐
                                   │               │
                              ┌────▼────┐    ┌─────▼─────┐
                              │ SQLite  │    │  Ollama   │
                              │PostChunk│    │ (LLM+Emb) │
                              └─────────┘    └───────────┘
```

---

## 3. 데이터베이스 설계

### 새 모델: PostChunk

포스트를 청킹하여 임베딩과 함께 저장.

```prisma
model PostChunk {
  id         Int      @id @default(autoincrement())
  postId     Int                    // 원본 포스트 ID
  postTitle  String                 // 검색 결과에서 출처 표시용
  postSlug   String                 // 링크 생성용
  content    String                 // 청크 텍스트 (200-500자)
  embedding  String   @default("[]") // JSON float 배열 (768차원)
  chunkIndex Int                    // 포스트 내 순서
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([postId])
}
```

### 새 모델: ChatMessage

관리자가 방문자 질문을 분석할 수 있도록 로깅.

```prisma
model ChatMessage {
  id        Int      @id @default(autoincrement())
  sessionId String                  // 클라이언트 생성 UUID
  role      String                  // "user" | "assistant"
  content   String                  // 메시지 내용
  createdAt DateTime @default(now())

  @@index([sessionId])
}
```

### 설계 결정

| 결정 | 선택 | 이유 |
|------|------|------|
| 벡터 저장 | SQLite JSON 배열 | 포트폴리오 규모(<1000 chunks)에서 in-memory cosine similarity가 밀리초 이하 |
| FK 관계 | 없음 (postId만 저장) | 포스트 삭제 시 청크를 별도로 정리 (인덱싱 시 자동 처리) |
| 채팅 히스토리 | React state(에페머럴) + DB(로그) | 방문자는 깨끗한 세션, 관리자는 질문 패턴 분석 가능 |

---

## 4. API 설계

### 4.1 POST `/api/chat` — 메인 챗 엔드포인트

**공개, 레이트 리밋 적용**

#### 요청
```json
{
  "message": "이 블로그에서 사용하는 기술 스택이 뭐야?",
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "history": [
    { "role": "user", "content": "안녕" },
    { "role": "assistant", "content": "안녕하세요! 무엇이 궁금하신가요?" }
  ]
}
```

#### 응답
- Content-Type: `text/plain; charset=utf-8`
- Transfer-Encoding: chunked (ReadableStream)
- 스트리밍으로 토큰 단위 전송

#### 처리 흐름
1. IP 기반 레이트 리밋 확인 (5회/분)
2. 쿼리 임베딩: Ollama `/api/embed` (nomic-embed-text)
3. 컨텍스트 검색: 전체 PostChunk 로드 → cosine similarity → top-5
4. 시스템 프롬프트 구성 (검색된 컨텍스트 포함)
5. Ollama `/api/chat` 스트리밍 호출
6. ReadableStream으로 응답 전달
7. 완료 후 ChatMessage에 유저/어시스턴트 메시지 저장


#### 에러 응답
| 상태 코드 | 조건 |
|----------|------|
| 400 | message 누락 |
| 429 | 레이트 리밋 초과 |
| 503 | Ollama 연결 불가 또는 모델 없음 |

---

### 4.2 POST `/api/chat/index` — 인덱싱 엔드포인트

**관리자 전용 (JWT 인증 필요)**

#### 처리 흐름
1. 인증 확인 (`getSession()`)
2. 모든 published 포스트 조회
3. 각 포스트에 대해:
   - 마크다운 스트립 → 단락 기준 청킹
   - 각 청크에 포스트 타이틀 프리픽스
   - Ollama `/api/embed`로 임베딩 생성
4. 기존 PostChunk 삭제 → 새 청크 삽입
5. 응답: `{ indexed: 포스트수, chunks: 총청크수 }`

#### 청킹 전략
```
1. 마크다운 → 플레인 텍스트 변환
   - 헤더(#) → "Section: 헤더텍스트\n"
   - 코드 블록 → 유지
   - 이미지/링크 → alt 텍스트만
   - 리스트 → 플레인 텍스트

2. 단락 분할 (더블 뉴라인 기준)

3. 500자 초과 단락 → 문장 단위 분할

4. 타이틀 프리픽스: "[Post: {title}] {chunk}"

5. 타겟 청크 크기: 200-500자
```

---

### 4.3 GET `/api/chat/status` — 상태 확인

**공개**

#### 응답
```json
{
  "available": true,
  "model": "gemma2:9b",
  "embedModel": "nomic-embed-text",
  "chunksCount": 142
}
```

#### 확인 항목
- Ollama 연결 가능 여부
- nomic-embed-text 모델 존재 여부
- 생성 모델 존재 여부
- PostChunk 레코드 존재 여부

---

## 5. 프론트엔드 설계

### 5.1 ChatWidget 컴포넌트

#### 구조
```
<div fixed bottom-6 right-6 z-50>
  {isOpen ? (
    <motion.div 400w×500h card>
      ┌─────────────────────────────┐
      │  🤖 AI 어시스턴트      [✕]  │  ← ChatHeader
      ├─────────────────────────────┤
      │                             │
      │  [인사 메시지]               │
      │                             │
      │           [사용자 질문] 🟦   │
      │  🤖 [AI 답변 스트리밍...]    │
      │                             │  ← ChatMessages (스크롤)
      │                             │
      ├─────────────────────────────┤
      │  [질문 입력...        ] [→]  │  ← ChatInput
      └─────────────────────────────┘
    </motion.div>
  ) : (
    <motion.button 원형 56px>        ← FAB (Floating Action Button)
      💬
    </motion.button>
  )}
</div>
```

#### 상태 관리
```typescript
// React state (컴포넌트 내부)
const [isOpen, setIsOpen] = useState(false);
const [messages, setMessages] = useState<Message[]>([greeting]);
const [input, setInput] = useState("");
const [isStreaming, setIsStreaming] = useState(false);
const [isAvailable, setIsAvailable] = useState(false);

// sessionStorage
const sessionId = sessionStorage.getItem("chat-session") || crypto.randomUUID();
```

#### 스트리밍 소비
```typescript
const response = await fetch("/api/chat", {
  method: "POST",
  body: JSON.stringify({ message, sessionId, history }),
});

const reader = response.body!.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  const chunk = decoder.decode(value, { stream: true });
  // 현재 assistant 메시지에 chunk 추가
  setMessages(prev => {
    const updated = [...prev];
    updated[updated.length - 1].content += chunk;
    return updated;
  });
}
```

#### 스타일링
- 기존 디자인 시스템 따름: `bg-surface`, `text-foreground`, `card-border`
- FAB: `bg-accent text-white rounded-full shadow-lg`
- 메시지 버블: 유저=우측 `bg-accent/10`, AI=좌측 `bg-hover`
- Framer Motion: 위젯 열기/닫기 `scale + opacity` 애니메이션
- 다크/라이트 테마 자동 연동

### 5.2 레이아웃 통합

**ClientLayout.tsx 수정**:
```tsx
// 기존 구조
<div className="flex h-screen overflow-hidden">
  <Sidebar />
  <main>...</main>
  <ChatWidget />  {/* ← 여기 추가 (fixed이므로 overflow 영향 없음) */}
</div>
```

### 5.3 i18n 추가

```typescript
// translations.ts
chat: {
  title: "AI 어시스턴트",         // "AI Assistant"
  placeholder: "블로그에 대해 물어보세요...", // "Ask about this blog..."
  send: "보내기",                // "Send"
  thinking: "생각 중...",        // "Thinking..."
  offline: "챗봇 오프라인",       // "Chatbot offline"
  greeting: "안녕하세요! Gats Lab에 대해 궁금한 점을 물어보세요.",
           // "Hi! Ask me anything about Gats Lab."
}
```

---

## 6. 핵심 유틸리티: `src/lib/rag.ts`

### 함수 목록

| 함수 | 입력 | 출력 | 설명 |
|------|------|------|------|
| `stripMarkdown(md)` | 마크다운 문자열 | 플레인 텍스트 | 마크다운 문법 제거, 코드 블록 유지 |
| `chunkPost(title, content)` | 제목, 마크다운 | `string[]` | 단락 기준 분할, 타이틀 프리픽스 |
| `embedText(text)` | 텍스트 | `number[]` | Ollama `/api/embed` 호출 |
| `embedTexts(texts)` | 텍스트 배열 | `number[][]` | 배치 임베딩 |
| `cosineSimilarity(a, b)` | 두 벡터 | 0~1 float | 유사도 계산 |
| `retrieveContext(query, topK)` | 질의, K | `PostChunk[]` | 검색 파이프라인 전체 |

### cosine similarity 구현
```typescript
function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
```

### 검색 시 중복 제거
포스트당 최대 2개 청크만 반환하여 다양한 출처의 컨텍스트 보장.

---

## 7. 보안 & 제한

| 항목 | 설정 |
|------|------|
| 챗 레이트 리밋 | IP당 5회/분 (기존 `rate-limit.ts` 활용) |
| 인덱싱 접근 | 관리자 JWT 인증 필수 |
| 입력 검증 | message 최대 1000자 |
| 히스토리 제한 | 최근 10턴까지만 전송 |
| 응답 제한 | Ollama `num_predict: 500` (토큰 수 제한) |
| XSS 방지 | React 자동 이스케이핑 + 마크다운 렌더 없음 (플레인 텍스트) |

---

## 8. 파일 목록 및 작업

| 파일 | 작업 | 설명 |
|------|------|------|
| `prisma/schema.prisma` | 수정 | PostChunk, ChatMessage 모델 추가 |
| `src/lib/rag.ts` | **생성** | 핵심 RAG 유틸리티 |
| `src/app/api/chat/route.ts` | **생성** | 메인 챗 엔드포인트 (스트리밍) |
| `src/app/api/chat/index/route.ts` | **생성** | 인덱싱 엔드포인트 (관리자) |
| `src/app/api/chat/status/route.ts` | **생성** | 챗봇 상태 확인 |
| `src/components/chat/ChatWidget.tsx` | **생성** | 플로팅 챗 위젯 UI |
| `src/components/layout/ClientLayout.tsx` | 수정 | ChatWidget 마운트 |
| `src/i18n/translations.ts` | 수정 | 챗 번역 추가 |

---

## 9. 구현 순서

### Step 1: 백엔드 기반
1. `prisma/schema.prisma` 수정 → `npx prisma db push`
2. `src/lib/rag.ts` 생성 (청킹, 임베딩, 유사도 함수)
3. `/api/chat/status` 생성 (Ollama 연결 확인)
4. `/api/chat/index` 생성 (인덱싱 파이프라인)

### Step 2: 챗 엔드포인트
5. `/api/chat` 생성 (검색 + 스트리밍 생성)
6. curl로 테스트

### Step 3: 프론트엔드
7. i18n 번역 추가
8. `ChatWidget.tsx` 생성
9. `ClientLayout.tsx`에 마운트

### Step 4: 검증
10. `npm run build` 빌드 확인
11. 전체 플로우 E2E 테스트

---

## 10. 사전 준비

### Ollama 모델 설치
```bash
ollama pull nomic-embed-text    # 임베딩 모델 (필수)
# 생성 모델은 이미 설치된 것 사용 (gemma2, llama3 등)
```

### 의존성
- 추가 npm 패키지 없음 — fetch + ReadableStream으로 구현
- Prisma schema 변경만 필요

---

## 11. 향후 확장 가능성

| 기능 | 설명 | 난이도 |
|------|------|--------|
| 관리자 대시보드 | 질문 빈도, 인기 토픽 분석 | ★★ |
| 자동 인덱싱 | 포스트 생성/수정 시 자동 re-index | ★ |
| PDF 이력서 인덱싱 | 업로드된 이력서도 RAG 소스로 | ★★ |
| 멀티턴 요약 | 긴 대화를 요약하여 컨텍스트 윈도우 절약 | ★★★ |
| 외부 LLM 폴백 | Ollama 오프라인 시 Anthropic API 사용 | ★★ |
