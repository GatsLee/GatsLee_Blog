# 한국 비즈니스 API를 위한 MCP 서버 만들기

**카테고리:** devlog
**태그:** MCP, DART, open-source, Korean-API, agents
**프로젝트:** Seekr

---

## 요약

AI 에이전트가 DART 전자공시 같은 한국 비즈니스 API를 직접 사용할 수 있도록, MCP(Model Context Protocol) 서버를 만들었습니다.

---

## 한국 API는 왜 에이전트 생태계에서 빠져 있나

Claude Code나 Cursor 같은 AI 도구에서 한국 비즈니스 데이터에 접근하고 싶었습니다. Composio 같은 해외 통합 플랫폼을 찾아봤지만, 한국 API 지원은 전무했습니다. DART, 카카오톡, 네이버 웍스, 토스 — 한국에서 실제로 쓰는 서비스들이 빠져 있었습니다.

직접 만들기로 했습니다.

## MCP란

Model Context Protocol은 Anthropic이 제안한 도구 실행 표준입니다. 에이전트가 JSON-RPC로 도구를 호출하면, MCP 서버가 실제 API를 대신 호출하고 결과를 돌려줍니다.

핵심은 프레임워크 비종속적이라는 점입니다. LangChain에서든 Claude Code에서든 Cursor에서든 같은 MCP 서버를 쓸 수 있습니다.

## DART 전자공시 구현

첫 번째 도구로 DART(금융감독원 전자공시)를 구현했습니다.

```python
@tool
async def company_search(query: str) -> ToolResult:
    """회사명으로 기업 정보를 검색합니다."""
    ...

@tool
async def financials(corp_code: str, year: int) -> ToolResult:
    """기업의 재무제표를 조회합니다."""
    ...
```

도구의 docstring을 한국어로 작성했습니다. AI가 도구를 선택할 때 이 설명을 참고하기 때문에, 한국어로 쓰면 한국어 쿼리에 대한 도구 선택 정확도가 올라갔습니다.

## 클라이언트 패턴 통일

모든 API 클라이언트가 같은 패턴을 따릅니다.

- `httpx.AsyncClient` 기반 (커넥션 풀 공유)
- `ToolResult` dataclass로 반환값 표준화
- 에러 핸들링을 한 곳에서 관리

새로운 API를 추가할 때 이 패턴을 따르기만 하면 되어서, 카카오톡이나 네이버 웍스를 붙이는 작업이 크게 어렵지 않을 것으로 예상합니다.

## 테스트

respx로 HTTP를 모킹해서 외부 API 호출 없이 테스트합니다. 22개의 유닛 테스트와 pre-commit hooks(ruff, mypy)를 설정했습니다. 오픈소스로 공개한 만큼 코드 품질에 신경을 썼습니다.

## 배운 점

- MCP 표준 덕분에 한 번 만든 서버를 여러 AI 도구에서 재사용할 수 있었습니다
- 한국어 docstring이 에이전트의 도구 선택 정확도를 눈에 띄게 높였습니다
- 금융 API는 rate limit이 빡빡해서, 캐싱 레이어를 일찍 넣는 게 좋았습니다
