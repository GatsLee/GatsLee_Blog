export const translations = {
  // Sidebar
  "nav.home": { en: "Home", ko: "홈" },
  "nav.devlogs": { en: "Development Logs", ko: "개발 로그" },
  "nav.troubleshooting": { en: "Troubleshooting", ko: "문제 해결" },
  "nav.guestlogs": { en: "Guest Logs", ko: "방명록" },
  "sidebar.title": { en: "GATS LAB", ko: "GATS LAB" },
  "sidebar.session": { en: "CURRENT SESSION", ko: "현재 세션" },
  "sidebar.online": { en: "SYSTEM ONLINE", ko: "시스템 온라인" },
  "sidebar.admin": { en: "Protocol Write (Admin)", ko: "프로토콜 작성 (관리자)" },
  "sidebar.connect": { en: "Connect Protocol", ko: "연결 프로토콜" },

  // Header
  "header.objective": {
    en: "build **Life OS** to maximize my creativity and productivity.",
    ko: "창의성과 생산성을 극대화하기 위한 **Life OS** 구축.",
  },
  "header.objectiveLabel": {
    en: "Current Objective",
    ko: "현재 목표",
  },
  "header.objectiveMobile": {
    en: "**Life OS**",
    ko: "**Life OS**",
  },

  // Home page
  "home.readme": { en: "// README", ko: "// 소개" },
  "home.intro": {
    en: "Hi everyone. I'm Gats Lee, **Home Labs Enthusiast** and **Solopreneur (wannabe)**. I am currently building my home server to automate repetitive work and research based on local LLMs. If there is any recommendation or advice to give, feel free to write it on",
    ko: "안녕하세요. **홈랩 매니아**이자 **1인 기업가(지망생)** Gats Lee입니다. 현재 로컬 LLM을 기반으로 반복 작업과 연구를 자동화하기 위해 홈서버를 구축하고 있습니다. 추천이나 조언이 있으시면",
  },
  "home.intro.link": { en: "Guest Logs", ko: "방명록" },
  "home.intro.end": { en: ". Have fun!", ko: "에 남겨주세요. 즐겁게 둘러보세요!" },

  // Status bar
  "status.homeserver": { en: "HOME SERVER", ko: "홈서버" },
  "status.ai": { en: "AI", ko: "AI" },

  // Boot sequence
  "boot.init": { en: "Initializing Gats Lab Kernel...", ko: "Gats Lab 커널 초기화 중..." },
  "boot.modules": { en: "Loading modules...", ko: "모듈 로딩 중..." },
  "boot.mount": { en: "Mounting /dev/sda1...", ko: "/dev/sda1 마운트 중..." },
  "boot.ui": { en: "Starting UI Subsystem...", ko: "UI 서브시스템 시작..." },
  "boot.welcome": { en: "Welcome to Gats Lab Logs", ko: "Gats Lab 로그에 오신 것을 환영합니다" },

  // Guestbook
  "guest.interactive": { en: "(Interactive Mode)", ko: "(대화형 모드)" },
  "guest.namechange": { en: "/name <new_name> to change", ko: "/name <새이름> 으로 변경" },
  "guest.system": { en: "Gats Lab Linux 2.4.0 (tty1)", ko: "Gats Lab Linux 2.4.0 (tty1)" },
  "guest.welcome": {
    en: "Welcome to the guestbook. Leave your mark.",
    ko: "방명록에 오신 것을 환영합니다. 흔적을 남겨주세요.",
  },
  "guest.ratelimit": {
    en: "Rate limit: 3 messages per day. Type /name <name> to change your display name.",
    ko: "하루 3개 메시지 제한. /name <이름>으로 표시 이름을 변경할 수 있습니다.",
  },
  "guest.nameprompt": { en: "Enter your display name to get started:", ko: "시작하려면 표시 이름을 입력하세요:" },
  "guest.ratelimit.error": {
    en: "Rate limit exceeded. Max 3 messages per day.",
    ko: "전송 한도 초과. 하루 최대 3개 메시지입니다.",
  },
  "guest.connection.error": { en: "CONNECTION ERROR", ko: "연결 오류" },

  // Login
  "login.title": { en: "ADMIN AUTHENTICATION", ko: "관리자 인증" },
  "login.command": { en: "root@gats-lab: sudo login", ko: "root@gats-lab: sudo login" },
  "login.desc": { en: "Password required for elevated access.", ko: "높은 권한의 접근에는 비밀번호가 필요합니다." },
  "login.username": { en: "Username", ko: "사용자명" },
  "login.password": { en: "Password", ko: "비밀번호" },
  "login.denied": { en: "ACCESS DENIED: Invalid credentials", ko: "접근 거부: 잘못된 자격 증명" },
  "login.submit": { en: "Authenticate", ko: "인증" },
  "login.loading": { en: "Authenticating...", ko: "인증 중..." },

  // Write
  "write.title": { en: "Create New Protocol", ko: "새 프로토콜 작성" },
  "write.filename": { en: "Filename / Title", ko: "파일명 / 제목" },
  "write.category": { en: "Category", ko: "카테고리" },
  "write.devlog": { en: "Development", ko: "개발" },
  "write.troubleshooting": { en: "Troubleshooting", ko: "문제 해결" },
  "write.content": { en: "Content Body", ko: "본문" },
  "write.commit": { en: "Commit", ko: "커밋" },
  "write.saving": { en: "Saving...", ko: "저장 중..." },
  "write.error": { en: "Failed to save", ko: "저장 실패" },

  // Post detail
  "post.back": { en: "CD ..", ko: "CD .." },
  "post.date": { en: "Date: ", ko: "날짜: " },
  "post.category": { en: "Category: ", ko: "카테고리: " },

  // Write edit
  "write.edit.title": { en: "Edit Protocol", ko: "프로토콜 수정" },
  "write.edit.update": { en: "Update", ko: "업데이트" },
  "write.edit.updating": { en: "Updating...", ko: "업데이트 중..." },

  // Sidebar - new
  "nav.progress": { en: "Build Progress", ko: "빌드 진행" },
  "sidebar.adminDashboard": { en: "Admin Dashboard", ko: "관리자 대시보드" },

  // Admin dashboard
  "admin.title": { en: "Admin Dashboard", ko: "관리자 대시보드" },
  "admin.tab.posts": { en: "Posts", ko: "게시글" },
  "admin.tab.comments": { en: "Comments", ko: "댓글" },
  "admin.tab.guestbook": { en: "Guestbook", ko: "방명록" },
  "admin.posts.title": { en: "Title", ko: "제목" },
  "admin.posts.category": { en: "Category", ko: "카테고리" },
  "admin.posts.status": { en: "Status", ko: "상태" },
  "admin.posts.date": { en: "Date", ko: "날짜" },
  "admin.posts.actions": { en: "Actions", ko: "작업" },
  "admin.posts.published": { en: "Published", ko: "공개" },
  "admin.posts.draft": { en: "Draft", ko: "비공개" },
  "admin.comments.author": { en: "Author", ko: "작성자" },
  "admin.comments.content": { en: "Content", ko: "내용" },
  "admin.comments.post": { en: "Post", ko: "게시글" },
  "admin.guestbook.author": { en: "Author", ko: "작성자" },
  "admin.guestbook.message": { en: "Message", ko: "메시지" },
  "admin.action.edit": { en: "Edit", ko: "수정" },
  "admin.action.delete": { en: "Delete", ko: "삭제" },
  "admin.action.save": { en: "Save", ko: "저장" },
  "admin.action.cancel": { en: "Cancel", ko: "취소" },
  "admin.confirm.delete": { en: "Are you sure you want to delete this?", ko: "정말 삭제하시겠습니까?" },
  "admin.empty": { en: "No items found", ko: "항목이 없습니다" },

  // Progress page
  "progress.title": { en: "Build Progress", ko: "빌드 진행" },
  "progress.subtitle": { en: "Home Server Build & Development Roadmap", ko: "홈서버 빌드 및 개발 로드맵" },
  "progress.complete": { en: "complete", ko: "완료" },
  "progress.category.hardware": { en: "Hardware", ko: "하드웨어" },
  "progress.category.software": { en: "Software", ko: "소프트웨어" },
  "progress.category.network": { en: "Network", ko: "네트워크" },
  "progress.category.ai": { en: "AI Workforce", ko: "AI 워크포스" },

  // Common
  "error.connection": { en: "CONNECTION ERROR", ko: "연결 오류" },

  // Tags & Filters
  "filter.all": { en: "All", ko: "전체" },
  "filter.tags": { en: "Filter by Tag", ko: "태그로 필터" },
  "filter.clear": { en: "Clear Filter", ko: "필터 초기화" },
  "breadcrumb.root": { en: "Home", ko: "홈" },
} as const;

export type TranslationKey = keyof typeof translations;
export type Locale = "en" | "ko";
