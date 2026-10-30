import { getSession } from "@/lib/auth";
import { removeOrphanChunks } from "@/lib/rag-index";

// 비공개·삭제된 글에 남은 청크 정리 (IA_AD_00403 "정리")
export async function POST() {
  if (!(await getSession())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  return Response.json({ deleted: await removeOrphanChunks() });
}
