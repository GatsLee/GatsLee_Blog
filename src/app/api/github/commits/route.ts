import { NextRequest, NextResponse } from "next/server";
import { fetchRecentCommits } from "@/lib/github";

export async function GET(req: NextRequest) {
  const repo = req.nextUrl.searchParams.get("repo") ?? "";
  if (!repo) return NextResponse.json({ commits: [] });
  const commits = await fetchRecentCommits(repo);
  return NextResponse.json({ commits }, { headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate" } });
}
