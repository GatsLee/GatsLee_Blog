const OLLAMA_URL = process.env.OLLAMA_URL || "http://host.docker.internal:11434";
const CHAT_MODEL = process.env.CHAT_MODEL || "gemma4:e4b";

let started = false;

export function startOllamaKeepalive() {
  if (started) return;
  started = true;

  const ping = () =>
    fetch(`${OLLAMA_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: CHAT_MODEL, prompt: "", keep_alive: "10m" }),
    }).catch(() => {});

  ping();
  setInterval(ping, 5 * 60 * 1000);
}
