import { NextResponse } from "next/server";

const OLLAMA_URL = process.env.OLLAMA_URL || "http://host.docker.internal:11434";

interface OllamaModel {
  name: string;
  model: string;
  size: number;
  details?: { parameter_size?: string; quantization_level?: string };
}

interface OllamaRunningModel {
  name: string;
  model: string;
  size: number;
  size_vram?: number;
  expires_at?: string;
}

export async function GET() {
  try {
    const [tagsRes, psRes] = await Promise.allSettled([
      fetch(`${OLLAMA_URL}/api/tags`, { next: { revalidate: 30 } }),
      fetch(`${OLLAMA_URL}/api/ps`, { next: { revalidate: 10 } }),
    ]);

    const models: OllamaModel[] =
      tagsRes.status === "fulfilled" && tagsRes.value.ok
        ? (await tagsRes.value.json()).models ?? []
        : [];

    const running: OllamaRunningModel[] =
      psRes.status === "fulfilled" && psRes.value.ok
        ? (await psRes.value.json()).models ?? []
        : [];

    const activeModel = running[0]?.name ?? (models[0]?.name ?? null);
    const paramSize = models[0]?.details?.parameter_size ?? null;

    return NextResponse.json({
      available: models.length,
      running: running.length,
      activeModel,
      paramSize,
      models: models.map((m) => ({
        name: m.name,
        size: m.size,
        paramSize: m.details?.parameter_size,
      })),
    });
  } catch {
    return NextResponse.json(
      { error: "Ollama unreachable", available: 0, running: 0, activeModel: null, paramSize: null, models: [] },
      { status: 503 }
    );
  }
}
