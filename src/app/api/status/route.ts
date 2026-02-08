import { NextResponse } from "next/server";
import { getServerMetrics } from "@/lib/server-metrics";

export async function GET() {
  try {
    const metrics = getServerMetrics();
    return NextResponse.json(metrics);
  } catch {
    return NextResponse.json({ error: "Failed to get metrics" }, { status: 500 });
  }
}
