# GatsBlog — 프로젝트 규칙

Next.js 16 + Prisma(SQLite) 개인 블로그. 프로덕션은 홈서버(100.88.144.100)의 `blog` 도커 컨테이너에서 `blog.gatslee.com`으로 서비스한다.

## 디자인 작업 (Figma)

| 용도 | 파일 | fileKey |
|------|------|---------|
| 상세기획 · 와이어프레임 산출 | [GatsBlog 상세기획](https://www.figma.com/design/wsLPU5JDsN67AAutcUBGeO/GatsBlog-%EC%83%81%EC%84%B8%EA%B8%B0%ED%9A%8D?node-id=0-1) | `wsLPU5JDsN67AAutcUBGeO` |
| 디자인 시스템 참조 | [Simple Design System (Community)](https://www.figma.com/design/zuvyejbTUvvu28tNOIujxp/Simple-Design-System--Community-?node-id=3-5) | `zuvyejbTUvvu28tNOIujxp` |

### 규칙

- **와이어프레임은 web과 mobile을 분리한다.** 상세기획 파일 안에서 `wireframe(web)`, `wireframe(mobile)` 두 페이지로 나눠 관리하고, 같은 화면이라도 두 페이지에 각각 그린다.
- **화면을 그릴 때는 Simple Design System의 컴포넌트를 우선 사용한다.** 새 컴포넌트를 직접 그리기 전에 `docs/figma-simple-design-system-index.md`(참조 인덱스)에서 대응되는 컴포넌트를 먼저 찾는다. 대응이 없을 때만 신규 제작하고, 그 사실을 인덱스에 남긴다.
- 레이어 네이밍은 `DP_figma-layer-naming` 규칙(IA-ID 기반 화면명, `SEC_`/`CMP_`/`EL_` 접두사)을 따른다.

## 로컬 개발

```bash
npm install
npx prisma generate
npx prisma migrate deploy   # 서버 DB 복사본을 가져왔다면 필수
npm run dev                 # http://localhost:4000
```

- `.env`는 커밋하지 않는다. 필요한 키: `DATABASE_URL`, `JWT_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `OLLAMA_URL`, `CHAT_MODEL`.
- DB는 SQLite 단일 파일이다. 프로덕션 데이터는 `docker cp blog:/app/prisma/blog.db`로 가져온다.
- RAG 임베딩은 1024차원(`bge-m3`) 기준으로 저장돼 있다. 다른 임베딩 모델을 쓰면 차원이 안 맞아 검색이 조용히 실패한다.
- `public/uploads`는 프로덕션에서 도커 볼륨이라 저장소에 없다. 로컬에서 이미지가 필요하면 서버에서 복사한다.

## 커밋 규칙

`.git/hooks/commit-msg`가 강제한다.

- 형식: `[TYPE] short description`, 제목 72자 이내
- 허용 타입: `FEAT` `FIX` `DOCS` `REFACTOR` `CHORE` `TEST` `STYLE` `PERF` `CI`

## 배포

`./deploy.sh` 하나로 빌드부터 프록시 연결 확인까지 처리한다. 컨테이너 시작 시 `entrypoint.sh`가 `prisma/migrations`를 순회해 미적용 마이그레이션을 자동 반영하므로, 스키마를 바꿨으면 재배포만 하면 된다.

(+) 마이그레이션 누락 없이 배포된다
(-) 재빌드 없이는 새 마이그레이션이 프로덕션 DB에 반영되지 않는다
