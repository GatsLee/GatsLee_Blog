import { getSession } from "@/lib/auth";
import { setChatVisible } from "@/lib/chat-settings";

// 운영 설정 저장. 지금은 챗봇 노출 하나
export async function PUT(req: Request) {
  if (!(await getSession())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  if (typeof body.chatVisible !== "boolean") return Response.json({ error: "chatVisible required" }, { status: 400 });
  await setChatVisible(body.chatVisible);
  return Response.json({ ok: true });
}
