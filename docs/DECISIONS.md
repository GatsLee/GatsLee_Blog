# GatsBlog 결정 기록

## D1 — 글 본문을 BlockNote JSON과 마크다운으로 함께 저장한다
- Date: 2026-10-30
- Status: Accepted (미구현)
- Context: 글 상세(`IA_PS_002`)에 오른쪽 여백 각주를 넣기로 했다. 글 작성은 BlockNote 0.47(`src/components/editor/NotionEditor.tsx`)을 쓰고, 본문은 `blocksToMarkdownLossy`로 바꾼 마크다운만 `Post.content`에 저장한다. 2026-10-30에 headless로 확인한 결과, 각주를 커스텀 인라인 콘텐츠로 만들면 BlockNote JSON에는 번호와 내용이 남지만 마크다운으로 내보낼 때 `[^n]: 내용` 정의 줄이 빠진다. 또 각주가 있는 마크다운을 `tryParseMarkdownToBlocks`로 다시 읽으면 참조는 일반 링크로, 정의는 "Footnotes" 제목과 번호 목록으로 풀려서, 한 번 다시 저장하면 각주가 사라진다.
- Decision: `Post`에 `contentJson` 컬럼을 추가해 BlockNote 문서를 그대로 저장하고, 편집 화면은 이 JSON으로 연다. 마크다운(`content`)은 글 상세 렌더링과 RAG 임베딩용으로 계속 함께 저장한다. 각주는 커스텀 인라인 콘텐츠(`createReactInlineContentSpec`)로 만들고, 저장할 때 마크다운 끝에 `[^n]: 내용` 정의를 덧붙인다.
- Rationale: 편집의 원본을 손실 없는 형식으로 두면 마크다운 왕복 변환을 직접 고칠 필요가 없다. 마크다운을 함께 두면 `MarkdownRenderer`와 RAG 파이프라인을 바꾸지 않아도 된다.
- Consequences: (+) 각주, 토글, 글자 색처럼 마크다운에서 빠지던 블록 속성이 편집 중에 유지된다. (+) 글 상세와 RAG는 지금 구조 그대로 쓴다. (-) 마이그레이션이 하나 생긴다. 기존 글 35개는 `contentJson`이 비어 있어 처음 편집할 때 마크다운에서 변환하며, 이때는 기존 손실이 그대로 적용된다(현재 각주를 쓴 글은 0건). (-) 같은 본문을 두 형식으로 저장하므로, 저장 경로가 둘 다 갱신하는지 지켜야 한다.
- Alternatives considered: 마크다운만 저장하고 불러오기 전에 `[^n]`을 자리표시자로 바꿨다가 각주 노드로 되돌리는 변환을 직접 쓰는 방식. 스키마 변경은 없지만 변환이 깨지기 쉽고 다른 블록 속성 손실은 그대로 남아 채택하지 않았다.

## D2 — 글 주제는 5개로 통일하고 Post.topic 컬럼에 저장한다
- Date: 2026-10-30
- Status: Accepted
- Context: 디자인 안에서 주제 목록이 화면마다 달랐다(홈·푸터 5개, 글 목록 사이드·헤더 드롭다운 8개). `Post`에는 주제 필드가 없고 `tags`(JSON)만 있다.
- Decision: 주제는 기획(planning)·개발(dev)·AI(ai)·아카이빙(archiving)·홈서버(homeserver) 5개로 통일한다. `Post`에 `topic` 문자열 컬럼을 추가하고 글 하나에 주제 하나를 둔다. 기존 글은 제목·태그로 추정해 채운다.
- Rationale: 글 23개를 나누기에 5개면 빈 주제가 생기지 않는다. 컬럼으로 두면 목록 필터, 주제별 개수, 어드민 라벨이 단순한 쿼리로 끝난다.
- Consequences: (+) 주제 필터·집계가 인덱스 하나로 된다. (+) 태그는 원래 용도(세부 키워드)로 남는다. (-) 마이그레이션 하나와 기존 글 주제 지정 작업이 필요하다. (-) 한 글이 두 주제에 걸치면 하나를 골라야 한다.
- Alternatives considered: `tags` 안에 `topic:dev` 같은 예약 태그를 두는 방식. 스키마 변경은 없지만 태그와 섞여 관리가 까다로워 채택하지 않았다.

## D3 — 헤더에서 언어 전환을 뺀다
- Date: 2026-10-30
- Status: Accepted
- Context: 코드 헤더에는 KO/EN 토글이 있고 디자인에는 없다.
- Decision: 헤더의 언어 전환 UI를 뺀다. `i18n` 코드와 영문 글 데이터(`locale`, `translationKey`)는 지우지 않고 남긴다.
- Rationale: 디자인과 방문자 대부분이 한국어 기준이다. 데이터는 남겨 두면 나중에 다시 붙일 수 있다.
- Consequences: (+) 헤더가 디자인과 같아진다. (-) 영문 글은 목록에 섞이지 않도록 한국어(`locale = "ko"`)만 보여줘야 한다.

## D4 — 이력서는 PDF로 바꾼다
- Date: 2026-10-30
- Status: Accepted
- Context: 디자인은 헤더 이력서 버튼이 PDF를 새 탭으로 열고, 어드민 사이드바의 이력서 모달(`IA_AD_005`)에서 KOR/EN PDF를 올린다. 코드는 `SiteConfig.resume_ko/en`의 구조화 데이터를 그리는 `/resume` 페이지와 `ResumeEditorTab`이다.
- Decision: PDF 방식으로 바꾼다. 업로드한 파일 경로는 `SiteConfig`의 `resume_pdf_ko`, `resume_pdf_en` 키에 둔다. `/resume` 페이지와 구조화 편집 탭은 걷어낸다.
- Rationale: 이력서는 따로 다듬은 PDF가 원본이라 같은 내용을 두 번 관리할 이유가 없다.
- Consequences: (+) 이력서 관리가 파일 교체 한 번으로 끝난다. (-) 기존 `/resume` 링크는 PDF로 리다이렉트해야 한다. (-) PDF가 없는 언어는 버튼을 회색으로 두고 열지 않는다.

## D5 — 디자인 파일과 실제 화면의 글꼴이 다르다
- Date: 2026-10-30
- Status: Accepted
- Context: Figma MCP로 화면을 그리면서 Noto Sans KR을 썼다.
- Decision: 실제 화면은 Pretendard를 쓴다. 크기·굵기·줄 간격은 Figma 값을 그대로 옮긴다.
- Consequences: (+) 기존 `globals.css`가 이미 Pretendard를 불러온다. (-) 같은 크기에서 글자 폭이 조금 달라 줄바꿈 위치가 Figma와 다를 수 있다.
