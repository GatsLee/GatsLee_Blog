# Lab 인사이트 초안 10선

> 프로젝트 전반을 검토해서 뽑은 블로그 포스트 초안.
> 카테고리: devlog / troubleshooting

---

## 1. [devlog] 클라우드 API 없이 로컬 LLM 평가 파이프라인 만들기

**프로젝트:** LLMEval
**태그:** LLM, evaluation, Ollama, pynvml, hardware-profiling

### 요약
OpenAI API 한 번 안 쓰고 로컬에서 LLM 품질 + 하드웨어 성능을 동시에 측정하는 파이프라인을 만들었다.

### 본문 초안

LLM을 평가할 때 보통 GPT-4를 judge로 쓴다. 비용도 들고, 네트워크 의존성도 생긴다. LLMEval은 Ollama로 추론하고, 로컬 모델로 judge까지 돌린다.

**핵심 구조:**
- YAML로 태스크 정의 (Jinja2 템플릿 + 입력 데이터)
- Ollama streaming API로 모델 추론
- 백그라운드 스레드에서 10ms 간격으로 GPU 샘플링 (pynvml + psutil)
- 6개 evaluator: exact_match, ROUGE, LLM judge, embedding similarity 등

**judge 안정성 문제:**
로컬 모델은 같은 프롬프트에도 점수가 들쭉날쭉하다. 해결: 3회 실행 후 중앙값 사용. 분산이 1.5 이상이면 경고 플래그.

**VRAM spillover 감지:**
GPU VRAM이 부족하면 시스템 RAM으로 넘어가는데, 이때 t/s가 급락한다. pynvml로 VRAM 사용량 추적 + 시스템 RAM 증가 패턴으로 자동 감지.

**배운 점:**
- nvidia-smi 파싱보다 pynvml 직접 호출이 10배 빠르다
- Isolation Forest가 수작업 규칙보다 이상 탐지에 효과적
- 평가 없는 LLM 프로젝트는 감으로 운영하는 것과 같다

---

## 2. [devlog] Tauri 2 + React 19로 데스크톱 앱 만들기: WebKitGTK 샌드박스와의 싸움

**프로젝트:** PageNode
**태그:** Tauri, React, desktop-app, WebKitGTK, Vite

### 요약
Tauri로 데스크톱 앱을 만들다가 Linux WebKitGTK 샌드박스가 localhost fetch를 차단하는 문제를 만났고, Vite dev proxy로 해결했다.

### 본문 초안

PageNode는 PDF에서 개념을 추출해 지식 그래프로 시각화하는 데스크톱 앱이다. Tauri 2 + React 19 + FastAPI 백엔드 사이드카 구조.

**문제:**
개발 중 프론트엔드에서 `fetch('http://localhost:8000/api/...')`를 호출하면 WebKitGTK 샌드박스가 차단한다. Electron이라면 이런 문제가 없지만, Tauri는 시스템 웹뷰를 쓰기 때문에 OS 보안 정책을 그대로 받는다.

**해결:**
Vite dev server에 프록시 설정. `/api/*` 요청을 백엔드 포트로 포워딩.

```js
// vite.config.ts
server: {
  proxy: {
    '/api': `http://localhost:${backendPort}`
  }
}
```

**dev.sh 자동화:**
백엔드 포트를 동적으로 할당하고, `.env.development.local`에 기록. setsid로 백엔드를 별도 세션으로 실행해서 Tauri dev와 독립적으로 관리.

**배운 점:**
- Tauri는 가볍지만 OS 웹뷰 제약을 감안해야 한다
- 프록시 패턴은 CORS 문제도 동시에 해결한다
- setsid + PID 파일 = 프로세스 라이프사이클 관리의 기본

---

## 3. [devlog] Redis Streams로 에이전트 네트워크 만들기

**프로젝트:** agents/00-orchestrator
**태그:** agents, Redis, event-driven, orchestration, FastAPI

### 요약
독립적으로 돌아가는 에이전트들을 Redis Streams 이벤트 버스로 연결하고, 오케스트레이터로 라우팅하는 구조를 만들었다.

### 본문 초안

에이전트 하나를 만드는 건 쉽다. 문제는 여러 에이전트가 협력해야 할 때. RabbitMQ는 과하고, 단순 HTTP 호출은 결합도가 높다.

**선택: Redis Streams**
- 이미 인프라에 Redis가 있었다
- Consumer Group으로 메시지 분배 가능
- XADD/XREAD로 pub/sub + 영속성 둘 다 됨

**이벤트 스키마 (Pydantic):**
```python
class AgentEvent:
    source: str       # "blog-agent"
    type: str         # "draft.generated"
    payload: dict     # {"post_id": 42, "title": "..."}
    timestamp: datetime
```

**오케스트레이터 역할:**
1. 모든 에이전트의 /health 엔드포인트를 5분마다 핑
2. 이벤트 스트림 구독 → 라우팅 규칙에 따라 처리
3. 장애 감지 시 Telegram 알림

**현재 에이전트:**
- blog-agent: git log → LLM 초안 → 블로그 API
- aiops-agent: 로그 수집 → 이상 탐지 → Telegram 알림

**배운 점:**
- 이벤트 소싱은 디버깅을 10배 쉽게 만든다 (모든 이벤트가 기록됨)
- 에이전트는 서로를 몰라도 된다, 이벤트만 알면 된다
- 헬스 모니터링은 선택이 아니라 필수

---

## 4. [devlog] ML + LLM 2단계 이상 탐지: 로그 보안 분석

**프로젝트:** agents/01-aiops
**태그:** anomaly-detection, Isolation-Forest, LLM, security, logs

### 요약
Isolation Forest로 "뭔가 이상하다"를 감지하고, LLM으로 "왜 이상한지"를 분석하는 2단계 파이프라인을 만들었다.

### 본문 초안

Nginx 액세스 로그에서 공격 패턴을 찾고 싶었다. 규칙 기반(403 카운트, 특정 UA 필터)은 새로운 패턴에 대응을 못 한다.

**4단계 파이프라인:**
1. **Ingester**: JSON 구조화 (IP, method, status, UA, timestamp)
2. **Detector**: Isolation Forest (비지도 학습, 정상 패턴에서 벗어나면 -1)
3. **Analyzer**: LLM에 이상 로그 묶음을 넘기고 root cause 분석
4. **Reporter**: 심각도 + 권고사항 → Telegram

**왜 ML만으로 부족한가:**
Isolation Forest는 "이 요청 패턴이 비정상"이라고만 알려준다. 크롤러인지, 무차별 대입인지, 설정 오류인지는 모른다. LLM이 로그 컨텍스트를 읽고 "이건 WordPress 스캐너 봇"이라고 해석해준다.

**왜 LLM만으로 부족한가:**
모든 로그를 LLM에 넣으면 비용도 문제지만, 정상 트래픽 속 미세한 이상을 놓친다. ML이 먼저 필터링해야 LLM이 집중할 수 있다.

**배운 점:**
- Isolation Forest는 학습 데이터 레이블이 필요 없다 (보안 로그에 레이블 다는 건 비현실적)
- 컨텍스트 윈도우 안에 들어가는 양으로 줄여서 넘겨야 LLM이 정확하다
- Telegram 알림은 단순하지만 즉각적인 대응을 가능하게 한다

---

## 5. [devlog] 3-Layer RAG 검색 구현기: 제목 → 태그 → 임베딩

**프로젝트:** one-by-one-cs
**태그:** RAG, search, embeddings, SSE, Next.js

### 요약
CS 학습 플랫폼에 3단계 검색을 구현했다. 정확한 매칭부터 시맨틱 검색까지, 각 레이어가 이전 레이어를 보완한다.

### 본문 초안

71개 MDX 문서에서 원하는 내용을 찾는 검색이 필요했다. 임베딩 검색만 쓰면 "운영체제 스케줄링"같은 정확한 쿼리에서 오히려 느리고 부정확하다.

**3개 레이어:**

**Layer 1 - 제목 정규화:**
`normalizeQuery()`로 한국어 질문 접미사 제거 ("~이 뭐야?", "~에 대해") 후 제목과 매칭. 가장 빠르고 정확한 히트.

**Layer 2 - 태그 키워드:**
각 문서에 20-30개 태그를 미리 생성 (인덱싱 시). 메모리에서 키워드 매칭. Layer 1에서 놓친 연관 문서를 잡는다.

**Layer 3 - 임베딩 RAG:**
Ollama로 쿼리 임베딩 → ChromaDB에서 유사도 검색. 가장 느리지만 의미적으로 관련된 문서를 찾아준다.

**중복 제거:**
`seenFilePaths` Set으로 레이어 간 중복 방지. Layer 1에서 이미 나온 문서는 Layer 2, 3에서 제외.

**SSE 스트리밍:**
결과가 레이어별로 도착하는 대로 클라이언트에 전송. `title_match` → `tag_match` → `result` → `rag_answer` 이벤트.

**배운 점:**
- 가장 단순한 매칭을 먼저 시도해야 사용자 체감 속도가 빠르다
- 태그는 문서 작성 시 자동 생성하면 유지보수 부담이 없다
- SSE는 WebSocket보다 구현이 간단하고 이 용도에 충분하다

---

## 6. [devlog] 한국 비즈니스 API를 위한 MCP 서버 만들기

**프로젝트:** Seekr
**태그:** MCP, DART, open-source, Korean-API, agents

### 요약
AI 에이전트가 한국 비즈니스 API(DART 공시 등)를 직접 사용할 수 있도록 MCP 서버를 만들었다.

### 본문 초안

Claude Code나 Cursor 같은 AI 도구에서 한국 비즈니스 데이터에 접근하고 싶었다. Composio 같은 해외 플랫폼은 한국 API 지원이 전무하다.

**MCP (Model Context Protocol):**
Anthropic이 제안한 도구 실행 표준. 에이전트가 JSON-RPC로 도구를 호출하면, MCP 서버가 실제 API를 대신 호출한다.

**DART (전자공시) 구현:**
```python
@tool
async def company_search(query: str) -> ToolResult:
    """회사명으로 기업 정보를 검색합니다."""
    ...
```

도구 docstring을 한국어로 작성하면 AI가 도구 설명으로 사용한다.

**httpx AsyncClient 패턴:**
모든 API 클라이언트가 동일한 패턴을 따른다:
- `httpx.AsyncClient` 기반 (커넥션 풀 공유)
- `ToolResult` dataclass로 반환값 표준화
- 에러 핸들링 통일

**테스트:**
- respx로 HTTP 모킹 (외부 API 호출 없이 테스트)
- 22개 유닛 테스트 + pre-commit hooks (ruff, mypy)

**배운 점:**
- MCP는 프레임워크 비종속적 — LangChain, Claude Code, Cursor 어디서든 동작
- 한국어 docstring이 에이전트의 도구 선택 정확도를 높인다
- 금융 API는 rate limit이 빡빡해서 캐싱이 중요하다

---

## 7. [troubleshooting] Mermaid 파서 62개 변형 전부 잡기

**프로젝트:** one-by-one-cs
**태그:** Mermaid, parsing, regex, MDX, troubleshooting

### 요약
CS 학습 플랫폼에서 Mermaid 다이어그램이 렌더링 안 되는 버그를 추적하니, 파서가 62가지 flowchart 변형 중 절반을 놓치고 있었다.

### 본문 초안

MDX 파일에 Mermaid 블록을 넣었는데, 일부만 렌더링되고 나머지는 깨졌다.

**원인 분석:**
graph TD/LR 외에도 다양한 변형이 있었다:
- `graph TB`, `graph BT`, `graph RL` (방향 변형)
- 선행 빈 줄이 있는 경우
- `direction TB/LR` (서브그래프 내부 방향 지시자)
- `-.-` (화살표 없는 점선)
- `A -- "label" --> B` (인라인 따옴표 레이블)
- `A -- 5 --- B` (인라인 숫자 레이블)
- 중복 `graph TD` 선언

**수정:**
각 변형마다 regex 패턴을 추가. 총 62개의 flowchart 차트가 모두 파싱되는지 테스트.

```
Before: 31/62 charts rendered
After:  62/62 charts rendered
```

**MDX hydration 에러도 같이 수정:**
`<details><summary>` 블록이 `<p>` 태그 안에 들어가서 hydration mismatch. MDX 파일 13개에 빈 줄을 추가해서 블록 레벨로 인식하게 함.

**배운 점:**
- Mermaid 공식 문법은 문서화되지 않은 변형이 많다
- 파서를 만들 때는 실제 사용 케이스를 전수 조사해야 한다
- MDX에서 HTML 태그는 반드시 빈 줄로 감싸야 블록으로 처리된다

---

## 8. [devlog] CLI → 웹 서비스: 평가 도구의 프로덕션 진화

**프로젝트:** LLMEval → ModelPulse
**태그:** CLI, web-service, HTMX, monitoring, APScheduler

### 요약
CLI로 시작한 LLM 평가 도구를 웹 대시보드로 진화시키면서 겪은 설계 변화를 정리했다.

### 본문 초안

LLMEval은 터미널에서 `llmeval run task.yaml`로 실행하는 CLI다. 잘 동작하지만 한계가 있었다:
- 정기적 실행을 위해 cron을 직접 관리해야 한다
- 결과를 비교하려면 SQLite를 직접 쿼리해야 한다
- 품질이 떨어져도 알아채기 어렵다

**ModelPulse로의 진화:**

| 기능 | LLMEval (CLI) | ModelPulse (Web) |
|------|---------------|-------------------|
| 실행 | 수동 (터미널) | 자동 (APScheduler) |
| 결과 확인 | SQLite 쿼리 | Chart.js 대시보드 |
| 알림 | 없음 | Slack webhook |
| 상태 | Stateless | Stateful (실행 이력) |

**HTMX 선택 이유:**
React/Vue를 또 쓰기엔 과했다. HTMX로 서버 렌더링 HTML을 부분 교체하면 실시간 느낌을 줄 수 있다. Jinja2 템플릿 + HTMX = 프론트엔드 빌드 스텝 제로.

**품질 회귀 감지:**
이전 3회 평균 대비 15% 이상 점수 하락 → Slack 알림. 모델 업데이트, 프롬프트 변경, 인프라 문제를 빠르게 포착.

**핵심 설계 원칙:**
LLMEval의 runner, evaluator, profiler 모듈을 그대로 import. 새 코드는 스케줄링 + UI + 알림뿐.

**배운 점:**
- CLI를 잘 만들어두면 웹 서비스 확장이 쉽다 (모듈 재사용)
- HTMX는 대시보드 용도에 충분하다
- 모니터링 = 평가의 시간 축 확장

---

## 9. [devlog] git log에서 블로그 포스트 자동 생성하기

**프로젝트:** agents/02-blog
**태그:** automation, git, LLM, content-generation, agents

### 요약
git 커밋 히스토리를 파싱해서 LLM으로 블로그 초안을 생성하고, SEO 메타데이터까지 자동 생성하는 에이전트를 만들었다.

### 본문 초안

매일 코드를 짜지만 블로그 글은 밀린다. "커밋이 곧 콘텐츠"라는 아이디어로 자동화했다.

**3개 파이프라인:**

**Pipeline 1 - 콘텐츠 생성:**
1. GitPython으로 최근 커밋 파싱 (diff, message, files changed)
2. 관련 커밋끼리 클러스터링 (같은 기능/수정)
3. LLM에 커밋 클러스터 → 블로그 초안 생성
4. SEO 메타데이터 (title, description, tags) 자동 생성
5. Blog API (`/api/posts`)로 draft 상태로 저장

**Pipeline 2 - 운영 모니터링:**
빌드 실패 감지 → LLM으로 원인 분석 → Telegram 알림

**Pipeline 3 - 트래픽 분석:**
주간 인기 포스트 → 트렌드 리포트 → Telegram

**커밋 → 블로그 변환 프롬프트:**
```
다음 커밋 묶음을 기반으로 기술 블로그 글을 작성해주세요.
- 했습니다 체
- 2-3문장 요약으로 시작
- 문제 → 해결 → 배운 점 구조
- 코드 스니펫 포함
```

**배운 점:**
- 커밋 메시지 컨벤션이 좋으면 LLM 초안 품질도 올라간다
- draft 상태로 저장해서 사람이 검수 후 publish
- 완전 자동은 위험, 반자동이 현실적

---

## 10. [devlog] Docker 기반 홈 서버 인프라 구축기

**프로젝트:** docker/infrastructure
**태그:** Docker, MariaDB, Nginx, Prometheus, Grafana, self-hosting

### 요약
블로그, 에이전트, 모니터링을 모두 Docker Compose로 운영하는 홈 서버 인프라를 구축했다.

### 본문 초안

클라우드 서비스 비용 없이 모든 프로젝트를 셀프호스팅하고 싶었다.

**인프라 구조:**
```
Nginx Proxy Manager (80/443)
  ├── blog.gatslee.com → blog:3001
  ├── agents → orchestrator:8000
  └── monitoring → grafana:3000

MariaDB (공유 DB)
  ├── n8n 워크플로우
  └── 인프라 설정

Prometheus + Node Exporter → Grafana
Portainer (Docker 관리 UI)
```

**네트워크 분리:**
- `infra-net`: 내부 전용 (DB, Prometheus)
- `proxy-net`: 외부 노출 (Nginx → 서비스)

에이전트가 DB에 직접 접근하지 못하게 네트워크로 격리.

**SSL/TLS:**
Nginx Proxy Manager + Let's Encrypt 자동 갱신. 설정 UI에서 도메인 추가만 하면 인증서 발급.

**모니터링:**
Node Exporter → Prometheus → Grafana. CPU, 메모리, 디스크, 네트워크를 대시보드로 시각화. 에이전트가 리소스를 과점유하면 바로 보인다.

**배운 점:**
- Docker 네트워크 분리는 보안의 첫걸음
- MariaDB 하나를 공유하면 관리 포인트가 줄어든다
- Portainer가 있으면 SSH 접속 빈도가 90% 줄어든다
- 무료 SSL = 셀프호스팅의 가장 큰 진입장벽 해소
