import { prisma } from "@/lib/db";

// 운영 설정 (IA_AD_004). 방문자에게 AI 챗봇 진입점을 보여줄지
const VISIBLE_KEY = "chat_visible";

export async function isChatVisible(): Promise<boolean> {
  const row = await prisma.siteConfig.findUnique({ where: { key: VISIBLE_KEY } }).catch(() => null);
  return row?.value !== "false";
}

export async function setChatVisible(visible: boolean) {
  await prisma.siteConfig.upsert({
    where: { key: VISIBLE_KEY },
    create: { key: VISIBLE_KEY, value: String(visible) },
    update: { value: String(visible) },
  });
}
