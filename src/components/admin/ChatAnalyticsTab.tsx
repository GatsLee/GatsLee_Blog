"use client";

import { useState, useEffect } from "react";
import { MessageCircle, Users, Calendar, ChevronDown } from "lucide-react";

interface TopQuestion {
  content: string;
  count: number;
}

interface RecentSession {
  sessionId: string;
  messageCount: number;
  lastActive: string;
  firstMessage: string;
  ip: string;
}

interface SessionMessage {
  role: string;
  content: string;
  ip: string;
  createdAt: string;
}

interface Analytics {
  totalSessions: number;
  totalMessages: number;
  todaySessions: number;
  topQuestions: TopQuestion[];
  recentSessions: RecentSession[];
}

export default function ChatAnalyticsTab() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [sessionMessages, setSessionMessages] = useState<SessionMessage[]>([]);

  useEffect(() => {
    fetch("/api/admin/chat-analytics")
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleSession = async (sessionId: string) => {
    if (expandedSession === sessionId) {
      setExpandedSession(null);
      setSessionMessages([]);
      return;
    }
    setExpandedSession(sessionId);
    try {
      const res = await fetch(`/api/admin/chat-analytics/${sessionId}`);
      const d = await res.json();
      setSessionMessages(d.messages || []);
    } catch {
      setSessionMessages([]);
    }
  };

  if (loading) {
    return <div className="text-muted text-sm py-8 text-center">Loading analytics...</div>;
  }

  if (!data) {
    return <div className="text-muted text-sm py-8 text-center">Failed to load analytics.</div>;
  }

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border border-border p-5">
          <div className="flex items-center gap-3 mb-2">
            <Users size={16} className="text-muted" />
            <span className="editorial-label text-muted">Total Sessions</span>
          </div>
          <p className="text-3xl font-heading font-bold">{data.totalSessions}</p>
        </div>
        <div className="border border-border p-5">
          <div className="flex items-center gap-3 mb-2">
            <MessageCircle size={16} className="text-muted" />
            <span className="editorial-label text-muted">Total Messages</span>
          </div>
          <p className="text-3xl font-heading font-bold">{data.totalMessages}</p>
        </div>
        <div className="border border-border p-5">
          <div className="flex items-center gap-3 mb-2">
            <Calendar size={16} className="text-muted" />
            <span className="editorial-label text-muted">Today&apos;s Sessions</span>
          </div>
          <p className="text-3xl font-heading font-bold">{data.todaySessions}</p>
        </div>
      </div>

      {/* Top Questions */}
      {data.topQuestions.length > 0 && (
        <div>
          <h3 className="font-heading text-lg font-bold mb-4">Top Questions</h3>
          <div className="border border-border divide-y divide-border">
            <div className="grid grid-cols-12 px-4 py-2 editorial-label text-muted">
              <span className="col-span-1">#</span>
              <span className="col-span-9">Question</span>
              <span className="col-span-2 text-right">Count</span>
            </div>
            {data.topQuestions.map((q, i) => (
              <div key={i} className="grid grid-cols-12 px-4 py-3 text-sm">
                <span className="col-span-1 text-muted">{i + 1}</span>
                <span className="col-span-9 truncate">{q.content}</span>
                <span className="col-span-2 text-right font-mono text-muted">{q.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Sessions */}
      {data.recentSessions.length > 0 && (
        <div>
          <h3 className="font-heading text-lg font-bold mb-4">Recent Sessions</h3>
          <div className="border border-border divide-y divide-border">
            {data.recentSessions.map((s) => (
              <div key={s.sessionId}>
                <button
                  onClick={() => toggleSession(s.sessionId)}
                  className="w-full text-left px-4 py-3 hover:bg-hover transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{s.firstMessage || "(empty)"}</p>
                      <div className="flex gap-4 mt-1 editorial-label text-muted">
                        <span>{s.messageCount} msgs</span>
                        <span>{s.ip || "unknown"}</span>
                        <span>{new Date(s.lastActive).toLocaleString()}</span>
                      </div>
                    </div>
                    <ChevronDown
                      size={16}
                      className={`text-muted shrink-0 ml-2 transition-transform ${expandedSession === s.sessionId ? "rotate-180" : ""}`}
                    />
                  </div>
                </button>

                {/* Expanded conversation */}
                {expandedSession === s.sessionId && (
                  <div className="px-4 pb-4 space-y-2 bg-surface">
                    {sessionMessages.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] px-3 py-2 text-xs rounded-xl ${
                            msg.role === "user"
                              ? "bg-foreground text-background rounded-br-sm"
                              : "bg-hover text-foreground rounded-bl-sm border border-border"
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    ))}
                    {sessionMessages.length === 0 && (
                      <p className="text-xs text-muted py-2">Loading...</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
