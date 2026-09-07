import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import HeroSection from "@/components/home/HeroSection";

export const metadata: Metadata = {
  title: "About",
  description: "Gats Lee — 서비스 기획 · AI Engineer. 역사학도의 구조적 사고로 AI 서비스를 기획하고 구현하는 Product Builder. 현대차 소프티어에서 서비스 기획을 정식으로 배우며, 3개 프로덕션 에이전트와 24/7 홈서버 인프라를 운영합니다.",
};

async function getAboutData() {
  try {
    const [ko, en] = await Promise.all([
      prisma.siteConfig.findUnique({ where: { key: "about_ko" } }),
      prisma.siteConfig.findUnique({ where: { key: "about_en" } }),
    ]);
    return {
      ko: ko ? JSON.parse(ko.value) : null,
      en: en ? JSON.parse(en.value) : null,
    };
  } catch {
    return { ko: null, en: null };
  }
}

export default async function AboutPage() {
  const aboutData = await getAboutData();
  return <HeroSection dbData={aboutData} />;
}
