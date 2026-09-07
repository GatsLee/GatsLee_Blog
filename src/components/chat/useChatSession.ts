import { useState, useRef, useEffect, useCallback } from "react";
import type { Message, Source, ChatStage } from "./chatTypes";

interface UseChatSessionOptions {
  initialMessage: string;
  locale: "ko" | "en";
  isOpen: boolean;
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function useChatSession({ initialMessage, locale, isOpen }: UseChatSessionOptions) {
  const [sessionId, setSessionId] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [stage, setStage] = useState<ChatStage>("idle");
  const [feedbackGiven, setFeedbackGiven] = useState<Map<number, "up" | "down">>(new Map());
  const [ollamaAvailable, setOllamaAvailable] = useState<boolean | null>(null);
  const [restored, setRestored] = useState(false);

  const ollamaStatusCachedAt = useRef(0);
  const hasSentInitial = useRef(false);

  // Init session ID
  useEffect(() => {
    let id = sessionStorage.getItem("chat-session");
    if (!id) {
      id = Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem("chat-session", id);
    }
    setSessionId(id);
  }, []);

  // Restore feedback from sessionStorage when session changes
  useEffect(() => {
    if (!sessionId) return;
    try {
      const raw = sessionStorage.getItem(`chat-feedback-${sessionId}`);
      if (raw) {
        const parsed = JSON.parse(raw) as Array<[number, "up" | "down"]>;
        setFeedbackGiven(new Map(parsed));
      } else {
        setFeedbackGiven(new Map());
      }
    } catch {
      setFeedbackGiven(new Map());
    }
  }, [sessionId]);

  // Restore session messages from DB on mount
  useEffect(() => {
    if (!sessionId || restored) return;
    (async () => {
      try {
        const res = await fetch(`/api/chat/history?sessionId=${sessionId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.messages && data.messages.length > 0) {
            setMessages(data.messages);
          }
        }
      } catch {
        // ignore — start fresh
      } finally {
        setRestored(true);
      }
    })();
  }, [sessionId, restored]);

  // Poll Ollama status when widget opens (cache 2 min)
  useEffect(() => {
    if (!isOpen) return;
    const CACHE_TTL = 2 * 60 * 1000;
    if (Date.now() - ollamaStatusCachedAt.current < CACHE_TTL) return;
    (async () => {
      try {
        const res = await fetch("/api/chat/status");
        if (res.ok) {
          const data = await res.json();
          setOllamaAvailable(data.available ?? true);
        } else {
          setOllamaAvailable(false);
        }
      } catch {
        setOllamaAvailable(false);
      } finally {
        ollamaStatusCachedAt.current = Date.now();
      }
    })();
  }, [isOpen]);

  const sendMessage = useCallback(
    async (text: string, history: Message[]) => {
      const userMsg: Message = { role: "user", content: text };
      const updated = [...history, userMsg];
      setMessages([...updated, { role: "assistant", content: "" }]);
      setIsStreaming(true);
      setStage("searching");

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            sessionId,
            history: updated.slice(0, -1).map((m) => ({ role: m.role, content: m.content })),
          }),
        });

        if (!res.ok || !res.body) {
          const status = res.status;
          const errorContent =
            status === 429
              ? locale === "ko"
                ? "잠시 후 다시 시도해주세요 (1분에 5회 제한)"
                : "Please try again shortly (5 requests per minute)"
              : status === 503
              ? locale === "ko"
                ? "서버가 바쁩니다. 잠시 후 다시 시도해주세요"
                : "Server is busy. Please try again shortly"
              : locale === "ko"
              ? "응답을 받을 수 없습니다"
              : "Unable to get a response";
          setMessages([
            ...updated,
            { role: "assistant", content: errorContent, error: true, errorStatus: status },
          ]);
          setIsStreaming(false);
          setStage("idle");
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";
        const wordBuffer: string[] = [];
        let displaying = false;

        let pendingSources: Source[] = [];
        let pendingThinkContent: string | undefined;

        const revealWords = async () => {
          if (displaying) return;
          displaying = true;
          while (wordBuffer.length > 0) {
            const word = wordBuffer.shift()!;
            accumulated += word;
            setMessages([...updated, { role: "assistant", content: accumulated }]);
            await delay(10);
          }
          displaying = false;
        };

        let pendingChars = "";
        let streamDone = false;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));

          for (const line of lines) {
            const data = line.slice(6);
            if (data === "[DONE]") {
              streamDone = true;
              break;
            }
            try {
              const parsed = JSON.parse(data);

              if (parsed.thinking === "generating") {
                setStage("generating");
              }

              if (parsed.content) {
                setStage("streaming");
                pendingChars += parsed.content;
                const parts = pendingChars.split(/(?<=\s)/);
                if (parts.length > 1) {
                  for (let i = 0; i < parts.length - 1; i++) {
                    wordBuffer.push(parts[i]);
                  }
                  pendingChars = parts[parts.length - 1];
                }
                revealWords();
              }

              if (parsed.sources) pendingSources = parsed.sources;
              if (parsed.thinkContent) pendingThinkContent = parsed.thinkContent;
            } catch {
              // skip malformed
            }
          }

          if (streamDone) break;
        }

        if (pendingChars) wordBuffer.push(pendingChars);
        while (wordBuffer.length > 0) {
          const word = wordBuffer.shift()!;
          accumulated += word;
          setMessages([...updated, { role: "assistant", content: accumulated }]);
          await delay(10);
        }

        const cleanContent = accumulated.trim();
        if (cleanContent) {
          setMessages([
            ...updated,
            {
              role: "assistant",
              content: cleanContent,
              sources: pendingSources.length > 0 ? pendingSources : undefined,
              thinkContent: pendingThinkContent,
            },
          ]);
        } else {
          setMessages([
            ...updated,
            {
              role: "assistant",
              content: locale === "ko" ? "응답을 생성하지 못했습니다" : "Failed to generate a response",
              error: true,
            },
          ]);
        }
      } catch {
        setMessages([
          ...updated,
          {
            role: "assistant",
            content: locale === "ko" ? "연결 오류가 발생했습니다" : "Connection error occurred",
            error: true,
          },
        ]);
      } finally {
        setIsStreaming(false);
        setStage("idle");
      }
    },
    [sessionId, locale]
  );

  // Send initial message once after restore
  useEffect(() => {
    if (!hasSentInitial.current && initialMessage && restored) {
      hasSentInitial.current = true;
      if (messages.length > 0) return;
      sendMessage(initialMessage, []);
    }
  }, [initialMessage, sendMessage, restored, messages.length]);

  const submitInput = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;
    setInput("");
    sendMessage(
      trimmed,
      messages.filter((m) => m.content && !m.error)
    );
  }, [input, isStreaming, messages, sendMessage]);

  const retryLast = useCallback(() => {
    const lastUserIdx = [...messages].reverse().findIndex((m) => m.role === "user");
    if (lastUserIdx === -1) return;
    const userMsgPos = messages.length - 1 - lastUserIdx;
    const lastUserMsg = messages[userMsgPos];
    const historyBeforeError = messages.slice(0, userMsgPos);
    sendMessage(lastUserMsg.content, historyBeforeError);
  }, [messages, sendMessage]);

  const regenerateLast = useCallback(() => {
    if (isStreaming) return;
    const lastUserIdx = [...messages].reverse().findIndex((m) => m.role === "user");
    if (lastUserIdx === -1) return;
    const userMsgPos = messages.length - 1 - lastUserIdx;
    const lastUserMsg = messages[userMsgPos];
    const historyForRegen = messages.slice(0, userMsgPos);
    sendMessage(lastUserMsg.content, historyForRegen);
  }, [isStreaming, messages, sendMessage]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setFeedbackGiven(new Map());
    sessionStorage.removeItem(`chat-feedback-${sessionId}`);
    sessionStorage.removeItem("chat-session");
    const newId = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem("chat-session", newId);
    setSessionId(newId);
  }, [sessionId]);

  const submitFeedback = useCallback(
    async (msgIndex: number, rating: "up" | "down") => {
      setFeedbackGiven((prev) => {
        const next = new Map(prev);
        next.set(msgIndex, rating);
        try {
          sessionStorage.setItem(`chat-feedback-${sessionId}`, JSON.stringify([...next.entries()]));
        } catch {
          // storage full — ignore
        }
        return next;
      });
      try {
        await fetch("/api/chat/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, messageIndex: msgIndex, rating }),
        });
      } catch {
        // non-critical
      }
    },
    [sessionId]
  );

  return {
    sessionId,
    messages,
    input,
    setInput,
    isStreaming,
    stage,
    feedbackGiven,
    ollamaAvailable,
    restored,
    sendMessage,
    submitInput,
    retryLast,
    regenerateLast,
    clearChat,
    submitFeedback,
  };
}
