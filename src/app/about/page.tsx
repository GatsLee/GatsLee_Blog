import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Lightbulb, Plus, UserSearch, Users } from "lucide-react";
import { CHESS_USERNAME, getRapidRating } from "@/lib/chess";
import TopicBubble from "@/components/common/TopicBubble";
import RevealOnScroll from "@/components/home/RevealOnScroll";
import DialNumber from "@/components/about/DialNumber";
import TravelMap from "@/components/about/TravelMap";
import CollabButton from "./CollabButton";

export const metadata: Metadata = { title: "소개" };

// 소개 화면 문구는 코드에서 관리한다 (docs/ia.md, 코드에서 관리하는 항목)
const RESEARCH_STEPS = [
  { title: "유저 리서치", body: "인터뷰와 관찰로\n사용 맥락을 확인합니다" },
  { title: "데이터 수집", body: "행동과 반복 패턴을\n기록으로 모읍니다" },
  { title: "문제 정의", body: "정성·정량 근거를 연결해\n풀 문제를 정합니다" },
];

const QUESTIONS = [
  { label: "사용자 행동(UX)", question: "사용자는 어디에서 멈출까?" },
  { label: "정보 위계", question: "무엇을 먼저 보여줘야 할까?" },
  { label: "결정의 근거", question: "이 결정을 개발자에게 어떻게 설명할까?" },
];

function IconCircle({ children, tone = "soft" }: { children: React.ReactNode; tone?: "soft" | "white" }) {
  return (
    <span className={`flex h-[62px] w-[62px] items-center justify-center rounded-full text-brand ${tone === "white" ? "bg-background" : "bg-brand-soft"}`}>
      {children}
    </span>
  );
}

// 소개 글의 핵심 구절에 형광펜 밑줄을 왼쪽부터 긋는다 (globals.css .draw-underline)
function Mark({ children, delay }: { children: React.ReactNode; delay: number }) {
  return (
    <span className="draw-underline text-foreground" style={{ "--d": `${delay}ms` } as React.CSSProperties}>
      {children}
    </span>
  );
}

// IA_AB_001 소개 · 00101 체스 레이팅 실패 · 00102 협업 제안
export default async function AboutPage() {
  const rating = await getRapidRating();

  // 순서대로 늦게 나타나는 간격 (ms)
  const delay = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;

  return (
    <div className="mx-auto max-w-[1184px] px-6">
      <RevealOnScroll />
      <section className="flex flex-col items-center gap-8 pb-[72px] pt-16 lg:flex-row lg:items-start">
        <div className="flex flex-1 flex-col gap-7">
          <h1 className="motion-rise text-[40px] font-bold leading-[56px] text-foreground md:text-[52px] md:leading-[74px]">
            안녕하세요,
            <br />
            저는 이준열입니다 :)
          </h1>
          <div style={delay(140)} className="motion-rise flex flex-col gap-[30px] text-lg leading-[30px] text-secondary">
            <p>
              대학교에서는 한국사를 전공했고, 42서울에서는 프로그래밍과 CS의 기초를, 현대차 소프티어 부트캠프에서는 서비스 기획을 배웠습니다.
              분야는 달랐지만, <Mark delay={900}>배운 것을 사람들에게 필요한 무언가로 만드는 일</Mark>에 꾸준하게 관심이 있었습니다.
            </p>
            <p>
              Gats Blog는 그 과정에서 만든 것과 직접 내린 결정을 기록하는 공간입니다. AI가 너무 익숙한 도구가 된 요즘,{" "}
              <Mark delay={1500}>무엇을, 어떻게, 왜 선택했는지 기록</Mark>하지 않으면 제 생각보다 AI의 답을 먼저 따르게 될 수 있다고 느꼈습니다.
            </p>
            <p>글을 읽고 떠오른 생각이 있다면 편하게 남겨주세요. <Mark delay={2100}>커피챗도 언제든 환영합니다</Mark> :)</p>
          </div>
        </div>
        <div style={delay(220)} className="motion-rise shrink-0">
          <Image src="/images/about-character-v2.png" alt="이준열 캐릭터" width={416} height={520} priority className="hero-float" quality={90} />
        </div>
      </section>

      <section className="flex flex-col gap-6 pb-16 lg:flex-row">
        <div className="flex flex-col gap-8 lg:w-[720px]">
          <div data-reveal className="flex flex-col gap-6 rounded-[28px] bg-surface p-9">
            <IconCircle>
              <UserSearch size={22} />
            </IconCircle>
            <h2 className="text-[28px] font-bold leading-[42px] text-foreground md:text-[32px] md:leading-[46px]">
              유저 리서치와 데이터로
              <br />
              문제를 정의하고 기획합니다
            </h2>
            <p className="text-lg leading-[30px] text-secondary">
              인터뷰와 관찰로 사용 맥락을 확인하고, 행동 데이터를 모읍니다.
              <br />
              정성·정량 근거를 함께 살펴본 뒤 풀어야 할 문제를 정의합니다.
            </p>
            <div className="flex flex-col gap-2 rounded-[14px] bg-brand-soft px-[18px] py-4">
              <p className="text-[13px] font-medium leading-5 text-brand">조사에서 문제 정의까지</p>
              <p className="text-base leading-[26px] text-foreground">
                한 번의 의견보다 반복되는 행동과 기록을 확인하고, 근거가 쌓인 뒤 문제를 정의합니다.
              </p>
            </div>
            <div className="flex flex-col items-center gap-2 sm:flex-row">
              {RESEARCH_STEPS.map((s, i) => (
                <div key={s.title} data-reveal style={delay(200 + i * 120)} className="flex w-full items-center gap-2 sm:w-auto sm:flex-1">
                  {i > 0 &&
                    (i === 1 ? (
                      <Plus size={20} className="hidden shrink-0 text-brand sm:block" />
                    ) : (
                      <ArrowRight size={20} className="hidden shrink-0 text-brand sm:block" />
                    ))}
                  <div className="flex flex-1 flex-col gap-2 rounded-[14px] bg-background p-4">
                    <p className="text-[25px] font-bold leading-9 text-foreground">{s.title}</p>
                    <p className="whitespace-pre-line text-[13px] font-medium leading-5 text-brand">{s.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div data-reveal className="flex items-center gap-6 rounded-[28px] bg-surface p-7">
            <div className="flex flex-1 flex-col gap-3">
              <IconCircle>
                <Users size={24} />
              </IconCircle>
              <h2 className="text-[26px] font-bold leading-10 text-foreground">질문은 솔직하게, 결정은 분명하게</h2>
              <p className="text-lg leading-[30px] text-secondary">
                논의 전에는 사용자 근거와 제약을 정리하고, 쟁점을 질문합니다. 결정 뒤에는 담당자와 다음 행동이 분명하도록 기록합니다.
              </p>
            </div>
            <CollabButton />
          </div>

          <div data-reveal className="flex flex-col gap-6 rounded-[28px] bg-surface p-8">
            <TopicBubble topic="travel" size={62} className="bubble-float" />
            <h2 className="text-[26px] font-bold leading-10 text-foreground">여행은 경험이다</h2>
            <p className="text-lg leading-[30px] text-secondary">
              최근 몇 년 동안은 혼자 여행을 많이 다녔습니다. 혼자 여행을 하다 보면, 우연히 만나게 되는 사람들과 대화할 수 있고, 걷다가 잊지 못할
              풍경을 눈에 담을 때도 있거든요. 제가 앞으로 살아가는 동안, 여행은 낯선 사람의 이야기를 듣는 시간이자 생각을 넓혀 가는 방법일
              것입니다.
            </p>
            <TravelMap />
          </div>
        </div>

        <div className="flex flex-col gap-11 lg:w-[440px]">
          <div data-reveal style={delay(120)} className="flex flex-col gap-3 rounded-[28px] bg-brand-soft p-7">
            <IconCircle tone="white">
              <Lightbulb size={22} />
            </IconCircle>
            <h2 className="text-[26px] font-bold leading-10 text-foreground">요즘 고민과 생각</h2>
            <ul className="flex flex-col gap-2.5">
              {QUESTIONS.map((q, i) => (
                <li key={q.label} data-reveal style={delay(240 + i * 90)}>
                  <Link
                    href="/insights?topic=planning"
                    className="group flex items-center justify-between gap-3 rounded-[14px] bg-background px-4 py-3.5 transition-shadow duration-300 hover:ring-2 hover:ring-brand"
                  >
                    <span>
                      <span className="block text-[13px] font-medium leading-5 text-brand">{q.label}</span>
                      <span className="block text-base font-bold leading-6 text-foreground">{q.question}</span>
                    </span>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
                      <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div data-reveal style={delay(120)} className="flex flex-col items-center gap-3 rounded-[28px] bg-brand-soft p-7">
            <Image src="/images/chess-playing-v2.png" alt="체스를 두는 이준열 캐릭터" width={200} height={250} quality={90} className="hero-float" />
            <div className="flex flex-col items-center rounded-2xl bg-background px-5 py-2.5">
              <div className="flex items-center gap-3.5">
                <span className="rounded-full bg-brand px-2.5 py-[5px] text-xs font-medium leading-[18px] text-white">Rapid Rating</span>
                {rating ? (
                  <DialNumber value={String(rating)} className="text-[32px] font-bold leading-[52px] text-foreground" />
                ) : (
                  <span className="text-[32px] font-bold leading-[52px] text-muted">—</span>
                )}
              </div>
              {rating === null && <p className="pb-1 text-xs text-secondary">지금은 레이팅을 불러올 수 없어요</p>}
            </div>
            <p className="text-lg leading-[30px] text-secondary">
              2024년부터 본격적으로 체스를 두기 시작했습니다. 체스는 끊임없이 생각해야 하고, 제가 두었던 수를 복기해야 합니다. 마치 기획처럼요 :)
            </p>
            <a
              href={`https://www.chess.com/member/${CHESS_USERNAME}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center gap-1 py-4 text-sm font-bold text-brand"
            >
              체스를 같이 두고 싶다면, 친구 신청해주세요 <ArrowUpRight size={16} />
            </a>
          </div>

          <div data-reveal style={delay(120)} className="flex flex-col gap-[18px] rounded-[28px] bg-surface p-7">
            <TopicBubble topic="running" size={62} className="bubble-float" />
            <h2 className="text-[26px] font-bold leading-10 text-foreground">체력은 기본</h2>
            <p className="text-base leading-[26px] text-secondary">
              올해 초부터 다이어트를 위해 시작했던 러닝
              <br />
              이제는 매주 3~4번은 5km씩 뛰고 있어요. 체력이 되어야 공부든 뭐든 잘할 수 있더라구요!
            </p>
            <div className="flex items-center gap-3.5 rounded-2xl bg-background p-4">
              <span className="rounded-full bg-brand px-[9px] py-1 text-xs font-bold leading-[18px] text-white">현재 기록</span>
              <DialNumber value="5km 25:13" className="text-[25px] font-bold leading-[34px] text-foreground" />
            </div>
            <div className="flex items-center gap-3.5 rounded-2xl bg-background p-4">
              <span className="rounded-full bg-brand px-[9px] py-1 text-xs font-bold leading-[18px] text-white">다음 목표</span>
              <span className="text-[25px] font-bold leading-[34px] text-foreground">2027년에 대회 나가기!</span>
            </div>
          </div>
        </div>
      </section>

      <Link
        href="/products"
        data-reveal
        className="group mb-16 flex items-center justify-between gap-8 rounded-3xl bg-brand-soft p-8 hover:bg-surface"
      >
        <span>
          <span className="block text-[26px] font-bold leading-10 text-foreground">소개는 여기까지! 만든 것을 더 보여드릴게요 :)</span>
          <span className="mt-2 block text-lg leading-[30px] text-secondary">
            서비스를 기획하면서 어떤 문제를 정의하고, 어떤 결정을 했는지 담았습니다.
          </span>
        </span>
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-background text-brand">
          <ArrowRight size={20} className="transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </Link>
    </div>
  );
}
