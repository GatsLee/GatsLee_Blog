# 맥북에서 블로그 포스팅 — 원격 셋업 가이드

> `blog` CLI를 설치하고 Claude Code 슬래시 커맨드로 등록하는 전체 과정

---

## 사전 준비

맥북 터미널에서:

```bash
# Homebrew 설치 여부 확인
which brew || /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 의존성 설치 (curl은 macOS 기본 내장)
brew install jq
```

---

## 1단계 — CLI 스크립트 설치

### 방법 A: 서버에서 SCP로 복사 (홈 서버 SSH 접근 가능한 경우)

```bash
# 맥북 터미널에서
scp gatslee@<서버IP>:~/Desktop/docker/blog/scripts/blog ~/.local/bin/blog
chmod +x ~/.local/bin/blog
```

### 방법 B: 수동 복사 (SSH 없는 경우)

`blog.gatslee.com`은 외부에서 접근 가능하므로, 스크립트 내용을 직접 붙여넣어 만든다.

```bash
mkdir -p ~/.local/bin
nano ~/.local/bin/blog   # 아래 전체 내용 붙여넣기 후 Ctrl+X, Y, Enter
chmod +x ~/.local/bin/blog
```

<details>
<summary>스크립트 전체 내용 (클릭해서 펼치기)</summary>

파일 위치: `~/Desktop/docker/blog/scripts/blog`

</details>

### PATH 등록 확인

```bash
# ~/.local/bin이 PATH에 있는지 확인
echo $PATH | grep -q ".local/bin" && echo "OK" || echo "PATH 추가 필요"

# PATH에 없으면 ~/.zshrc에 추가
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

---

## 2단계 — 자격증명 설정

```bash
mkdir -p ~/.config/blog
cat > ~/.config/blog/config << 'EOF'
BLOG_USERNAME=gatslee
BLOG_PASSWORD=여기에_비밀번호
EOF
chmod 600 ~/.config/blog/config   # 본인만 읽기 가능
```

---

## 3단계 — 로그인 테스트

```bash
blog login
# → ✓ 로그인 성공 (토큰 6일간 유효)
```

토큰은 `~/.config/blog/token`에 저장된다. 6일 후 만료되면 `blog post` 실행 시 자동으로 재로그인한다.

---

## 4단계 — 포스팅 테스트

```bash
# 테스트 포스트 작성
cat > /tmp/test.md << 'EOF'
# 테스트 포스트

맥북에서 CLI로 발행 테스트.

## 결론

잘 됨.
EOF

# 비공개로 올려서 확인 (published=false)
blog post --draft --category journal /tmp/test.md
# → ✓ 발행 완료: https://blog.gatslee.com/insights/테스트-포스트

# 확인 후 admin 패널에서 삭제 또는 공개 전환
```

---

## 5단계 — Claude Code 슬래시 커맨드 등록

맥북의 Claude Code에서 `/blog-post` 커맨드로 쓸 수 있도록 스킬 파일을 만든다.

```bash
mkdir -p ~/.claude/skills
```

아래 내용으로 `~/.claude/skills/blog-post.md` 파일 생성:

```bash
cat > ~/.claude/skills/blog-post.md << 'SKILL'
---
description: 블로그 포스트를 작성하고 blog CLI로 blog.gatslee.com에 직접 발행
---

# Blog Post Skill

사용자가 주제를 주면 마크다운 포스트로 작성 후 `blog` CLI로 발행한다.

## 카테고리

단일 소스: `src/lib/categories.ts`

| 카테고리 | 내용 | URL |
|---|---|---|
| `case` | 케이스 스터디 (문제→가설→트레이드오프→결과) | /cases |
| `journal` | 개발 일지, 문제 해결 기록 | /insights |
| `build` | 빌드 타임라인 | /insights |
| `product` | 프로덕트 소개 | /products |
| `agent` | AI 에이전트 소개 | /products |

> `devlog`, `troubleshooting`, `blueprint`, `progress`는 폐기되어 `journal`로 통합되었습니다.
> `case`는 6개 beat(`caseBeats` JSON)를 웹 에디터에서 채워야 하므로, CLI로는 본문만 올리고
> beat는 `/write/edit/[id]`에서 채우는 것을 권장합니다.

## 워크플로

1. 사용자가 주제/내용을 주면 마크다운으로 포스트 초안 작성
2. 카테고리, 언어(ko/en), 공개 여부 확인
3. 아래 순서로 발행:

```bash
# 초안을 파일로 저장
cat > /tmp/blog_draft.md << 'MARKDOWN'
# 제목

내용...
MARKDOWN

# 발행
blog post --category journal /tmp/blog_draft.md

# 비공개로 저장
blog post --draft --category journal /tmp/blog_draft.md

# 영문 포스트
blog post --locale en --category journal /tmp/blog_draft.md
```

## CLI가 없을 때

```bash
which blog  # 설치 확인
blog login  # 토큰 수동 갱신
```

환경 설정 문제라면: 서버의 ~/Desktop/docker/blog/docs/REMOTE_POSTING.md 참고.
SKILL
```

Claude Code를 재시작하거나 새 세션을 열면 `/blog-post` 커맨드로 사용 가능하다.

---

## 사용 예시

### CLI 직접 사용

```bash
# 파일로 발행
blog post post.md

# 옵션 포함
blog post --title "제목 직접 지정" --category journal --locale ko post.md

# 비공개 초안
blog post --draft post.md

# 영문 에이전트 포스트
blog post --category agent --locale en agent-post.md

# stdin으로 바로 올리기
echo "# 빠른 메모\n내용" | blog post
```

### Claude Code에서 `/blog-post` 슬래시 커맨드

```
/blog-post 오늘 FastAPI 미들웨어 이슈 트러블슈팅한 내용 포스팅해줘
```

Claude가 내용을 구성하고 `/tmp/blog_draft.md`에 쓴 뒤 `blog post`로 자동 발행.

---

## 자격증명 관리

| 파일 | 내용 | 권한 |
|------|------|------|
| `~/.config/blog/config` | username / password | 600 |
| `~/.config/blog/token` | JWT 토큰 (자동 생성) | 600 |

> **주의**: `~/.config/blog/config`는 절대 git에 올리지 말 것.

---

## 트러블슈팅

| 증상 | 원인 | 해결 |
|------|------|------|
| `jq: command not found` | jq 미설치 | `brew install jq` |
| `blog: command not found` | PATH 미등록 | `export PATH="$HOME/.local/bin:$PATH"` |
| `Error: 로그인 실패` | 비밀번호 오류 | `~/.config/blog/config` 확인 |
| `Error: 서버 연결 실패` | 서버 다운 또는 네트워크 | `curl -I https://blog.gatslee.com` |
| 토큰 만료 | 6일 경과 | `blog login` 또는 자동 갱신됨 |

---

## 파일 위치 요약

```
맥북
├── ~/.local/bin/blog              ← CLI 스크립트
├── ~/.config/blog/config          ← 자격증명 (chmod 600)
├── ~/.config/blog/token           ← JWT 캐시 (자동 생성)
└── ~/.claude/skills/blog-post.md  ← Claude Code 슬래시 커맨드

홈 서버 (원본)
└── ~/Desktop/docker/blog/scripts/blog  ← CLI 원본
```
