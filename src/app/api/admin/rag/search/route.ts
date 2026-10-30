import { getSession } from "@/lib/auth";
import { debugRetrieve } from "@/lib/rag";

// 검색 테스트 (IA_AD_00403). 모델은 부르지 않고 검색 순위만 본다
export async function POST(req: Request) {
  if (!(await getSession())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const query = typeof body.query === "string" ? body.query.trim().slice(0, 300) : "";
  if (!query) return Response.json({ error: "질문을 입력해 주세요." }, { status: 400 });
  try {
    return Response.json({ results: await debugRetrieve(query) });
  } catch {
    return Response.json({ error: "임베딩 모델에 연결하지 못했어요. 모델 서버 상태를 확인해 주세요." }, { status: 503 });
  }
}
