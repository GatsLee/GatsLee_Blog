/**
 * 이력서 기본값. /resume은 SiteConfig `resume_ko` / `resume_en`을 먼저 읽고, 없거나 예전 형식이면 이 값을 쓴다.
 *
 * 형식은 Jake's Resume(github.com/jakegut/resume)를 따른다.
 * 머리(이름·연락처 한 줄) 뒤 섹션 순서는 원본과 달리 Projects → Experience → Education → Technical Skills로 둔다.
 * 요약·핵심 역량 같은 추상적인 칸은 두지 않고, 항목마다 실제 과정·프로젝트 이름과 한 일을 적는다.
 * 사실과 수치의 출처는 career/master-resume.md와 GitHub 저장소다.
 */

export interface ResumeEntry {
  /** 첫 줄 왼쪽 (굵게): 학교·기관·직책 */
  title: string;
  /** 첫 줄 오른쪽: 기간 */
  period: string;
  /** 둘째 줄 왼쪽 (기울임): 과정·소속 */
  subtitle: string;
  /** 둘째 줄 오른쪽 (기울임): 장소 */
  location?: string;
  bullets?: string[];
}

export interface ResumeProject {
  name: string;
  /** 이름 뒤 칸: 개인이면 맡은 범위, 팀이면 구성과 내 역할. 기술 스택은 적지 않는다 */
  team: string;
  period: string;
  bullets: string[];
}

export interface ResumeData {
  name: string;
  contact: { email: string; blog: string; linkedin?: string; github?: string };
  education: ResumeEntry[];
  experience: ResumeEntry[];
  projects: ResumeProject[];
  skills: { category: string; items: string }[];
}

const CONTACT = {
  email: "naanthonylee@gmail.com",
  blog: "blog.gatslee.com",
  linkedin: "linkedin.com/in/joon-yeol-lee-567421281",
};

export const RESUME_KO: ResumeData = {
  name: "이준열",
  contact: CONTACT,
  education: [
    {
      title: "42서울 (이노베이션 아카데미)",
      period: "2022.12 – 2024.05",
      subtitle: "카뎃 · 소프트웨어 엔지니어링",
      location: "서울",
      bullets: [
        "C 과제: libft, ft_printf, get_next_line, push_swap, minitalk, fdf, philosophers, minishell, cub3d",
        "C++ 과제: CPP Module, ft_irc · 동료 코드 리뷰 200회 이상",
      ],
    },
    {
      title: "연세대학교",
      period: "2017.03 – 2026.02",
      subtitle: "문과대학 사학과 학사 (한국사학 주전공)",
      location: "서울",
    },
  ],
  experience: [
    {
      title: "현대자동차그룹 ICT 소프티어 부트캠프 8기",
      period: "2026.07 – 2026.08",
      subtitle: "서비스 기획 직무",
      location: "서울",
      bullets: [
        "직무교육 3주(강의 10회, 과제 8건, 팀 프로젝트 '대학생 학습공동체 지원금 인증 서비스'), 개인 프로젝트 4주(얼터차지), 해커톤 3일",
      ],
    },
    {
      title: "통역병 (어학병)",
      period: "2019.05 – 2020.12",
      subtitle: "한미연합사령부",
      location: "서울",
      bullets: [
        "한·미 장교급 실무 회의 순차 통역, 군사 문서·작전 계획 번역, UFG 등 연합훈련 실시간 통역",
      ],
    },
  ],
  projects: [
    {
      name: "얼터차지 (AlterCharge) · 소프티어",
      team: "개인 · 리서치~발표 단독",
      period: "2026.07 – 2026.08",
      bullets: [
        "아파트 완속충전 자리 경쟁 문제를 인터뷰 5건, 설문 2회(35명), 데스크 리서치 22건, 강동구 27개 단지 충전기 1,075기 점유 관측 69,099건으로 정의",
        "공공 API 상태값으로는 차량 이탈을 알 수 없어 빈자리 예측을 기각하고, 개인 주행·충전 패턴 기반 다음 충전일 안내로 범위 축소",
        "요구사항 정의서, IA, 정책서, 화면설계서(30여 개 화면), Next.js 39개 화면 프로토타입 제작 · 현대차 양재 사옥 최종 발표",
      ],
    },
    {
      name: "Gats Blog (blog.gatslee.com)",
      team: "개인 · 기획, 개발, 운영",
      period: "2026.02 – 현재",
      bullets: [
        "블로그 RAG 챗봇을 FAQ 즉답 → 검색 + LLM 순서로 설계하고, 세션 137개·메시지 329건(2026.08)의 대화 기록으로 FAQ를 고침",
      ],
    },
    {
      name: "minishell · 42서울",
      team: "2인 팀(실행 담당 1명, 나) · 파싱, 시그널, 전체 구조",
      period: "2023.04 – 2023.05",
      bullets: ["bash와 비슷한 쉘의 명령 파싱과 시그널 처리를 만들고, heredoc 리다이렉션 오류와 메모리 누수 수정"],
    },
    {
      name: "ft_irc · 42서울",
      team: "3인 팀(서버 1명, 채널 명령 1명, 나) · 파싱, 채널",
      period: "2024.03 – 2024.04",
      bullets: ["RFC 기준 IRC 메시지 파서와 Channel 클래스, PASS·NICK·USER·JOIN·MODE 명령 처리 구현"],
    },
    {
      name: "42PAW · 42 커뮤니티",
      team: "6인 팀(프런트·백엔드) · 이미지 업로드",
      period: "2023.10 – 2024.02",
      bullets: ["42 교육생을 위한 반려동물 SNS에서 게시물 이미지 크롭·압축 업로드와 관련 스크롤·레이아웃 오류 수정"],
    },
  ],
  skills: [
    { category: "기획·리서치", items: "요구사항 정의서, IA, 정책서, 화면설계서, Figma, 사용자 인터뷰, 설문 설계, 공공데이터 분석" },
    { category: "개발", items: "C/C++, Python, TypeScript, Next.js, FastAPI, SQL (PostgreSQL, SQLite)" },
    { category: "AI·인프라", items: "Ollama, RAG, MCP, Docker, Nginx, Prometheus, Grafana" },
    { category: "어학", items: "TOEIC 980, OPIc IH (2025)" },
  ],
};

export const RESUME_EN: ResumeData = {
  name: "Joonyeol Lee",
  contact: CONTACT,
  education: [
    {
      title: "42 Seoul (Innovation Academy)",
      period: "Dec 2022 – May 2024",
      subtitle: "Cadet, Software Engineering",
      location: "Seoul, Korea",
      bullets: [
        "Projects: libft, ft_printf, get_next_line, push_swap, minitalk, fdf, philosophers, minishell, cub3d (C); CPP Modules, ft_irc (C++)",
        "Completed 200+ peer code reviews",
      ],
    },
    {
      title: "Yonsei University",
      period: "Mar 2017 – Feb 2026",
      subtitle: "B.A. in History (Korean History)",
      location: "Seoul, Korea",
    },
  ],
  experience: [
    {
      title: "Hyundai Motor Group ICT Softeer Bootcamp, 8th Cohort",
      period: "Jul 2026 – Aug 2026",
      subtitle: "Service Planning Track",
      location: "Seoul, Korea",
      bullets: [
        "3-week job training with a team project (study-group grant verification), 4-week solo project (AlterCharge), 3-day hackathon",
      ],
    },
    {
      title: "Military Interpreter",
      period: "May 2019 – Dec 2020",
      subtitle: "ROK–U.S. Combined Forces Command",
      location: "Seoul, Korea",
      bullets: [
        "Interpreted officer-level ROK–U.S. meetings and combined exercises (e.g., Ulchi Freedom Guardian); translated military documents and operation plans",
      ],
    },
  ],
  projects: [
    {
      name: "AlterCharge (Softeer)",
      team: "Solo · research to presentation",
      period: "Jul 2026 – Aug 2026",
      bullets: [
        "Defined competition for apartment charging spots from 5 interviews, 2 surveys (35 respondents), 22 desk sources, and 69,099 occupancy observations of 1,075 chargers in 27 complexes",
        "Dropped spot prediction once the API proved to report charger state, not vehicle departure; narrowed scope to a next-charge-date guide from personal driving patterns",
        "Produced requirements, IA, policy, and screen specs (30+ screens) and a 39-screen Next.js prototype; presented at Hyundai HQ",
      ],
    },
    {
      name: "Gats Blog (blog.gatslee.com)",
      team: "Solo · build and operate",
      period: "Feb 2026 – Present",
      bullets: [
        "Designed a RAG chatbot that answers from an FAQ first and falls back to retrieval plus a local LLM; revised the FAQ from 137 sessions and 329 messages (Aug 2026)",
      ],
    },
    {
      name: "minishell (42 Seoul)",
      team: "Team of 2 (execution, me) · parsing, signals",
      period: "Apr 2023 – May 2023",
      bullets: ["Built command parsing and signal handling for a bash-like shell; fixed heredoc redirection bugs and memory leaks"],
    },
    {
      name: "ft_irc (42 Seoul)",
      team: "Team of 3 (server, channel cmds, me) · parsing, channels",
      period: "Mar 2024 – Apr 2024",
      bullets: ["Implemented the RFC-based IRC message parser, Channel class, and PASS, NICK, USER, JOIN, and MODE commands"],
    },
    {
      name: "42PAW (42 Community)",
      team: "Team of 6 (FE, BE) · image upload",
      period: "Oct 2023 – Feb 2024",
      bullets: ["Built post image cropping and compressed upload for a pet social network for 42 students, and fixed related scroll and layout bugs"],
    },
  ],
  skills: [
    { category: "Planning", items: "Requirements, IA, Policy and Screen Specs, Figma, User Interviews, Surveys" },
    { category: "Development", items: "C/C++, Python, TypeScript, Next.js, FastAPI, SQL (PostgreSQL, SQLite)" },
    { category: "AI & Infra", items: "Ollama, RAG, MCP, Docker, Nginx, Prometheus, Grafana" },
    { category: "English", items: "TOEIC 980, OPIc IH (2025)" },
  ],
};

export function defaultResume(locale: string): ResumeData {
  return locale === "en" ? RESUME_EN : RESUME_KO;
}

/** SiteConfig에 남은 예전 형식(요약·핵심 역량·STAR)은 이 형식으로 읽을 수 없으니 기본값으로 대신한다 */
export function isResumeData(v: unknown): v is ResumeData {
  const r = v as ResumeData | null;
  return !!r && typeof r.name === "string" && Array.isArray(r.education) && Array.isArray(r.projects) && Array.isArray(r.skills);
}
