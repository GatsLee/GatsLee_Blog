"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Pencil, X, Check, MessageSquare, ThumbsUp, Sparkles } from "lucide-react";

interface FaqRow {
  id: number;
  slug: string;
  qVariants: string[];
  a_ko: string;
  a_en: string;
  tags: string[];
  isActive: boolean;
  source: string;
  upvotes: number;
  downvotes: number;
  updatedAt: string;
}

interface FrequentQuestion {
  content: string;
  count: number;
  alreadyInFaq: boolean;
}

interface UpvotedMessage {
  feedbackId: number;
  sessionId: string;
  userQuery: string;
  assistantAnswer: string;
  assistantMessageId: number;
  createdAt: string;
}

interface CandidatesData {
  frequentQuestions: FrequentQuestion[];
  upvotedAssistantMessages: UpvotedMessage[];
}

const EMPTY_DRAFT = {
  slug: "",
  qVariantsText: "",
  a_ko: "",
  a_en: "",
  tagsText: "",
  source: "manual" as string,
  promotedFromMessageId: null as number | null,
};

export default function FaqManagementTab() {
  const [rows, setRows] = useState<FaqRow[]>([]);
  const [candidates, setCandidates] = useState<CandidatesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | "new" | null>(null);
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [faqRes, candRes] = await Promise.all([
        fetch("/api/admin/faq").then((r) => r.json()),
        fetch("/api/admin/faq/candidates").then((r) => r.json()),
      ]);
      setRows(Array.isArray(faqRes) ? faqRes : []);
      setCandidates(candRes && !candRes.error ? candRes : null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const startNew = (prefill?: Partial<typeof EMPTY_DRAFT>) => {
    setEditingId("new");
    setDraft({ ...EMPTY_DRAFT, ...prefill });
  };

  const startEdit = (row: FaqRow) => {
    setEditingId(row.id);
    setDraft({
      slug: row.slug,
      qVariantsText: row.qVariants.join("\n"),
      a_ko: row.a_ko,
      a_en: row.a_en,
      tagsText: row.tags.join(", "),
      source: row.source,
      promotedFromMessageId: null,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft(EMPTY_DRAFT);
  };

  const handleSave = async () => {
    const qVariants = draft.qVariantsText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const tags = draft.tagsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (!draft.slug.trim()) return alert("slug 필수");
    if (qVariants.length === 0) return alert("질문 변형 1개 이상 필요");
    if (!draft.a_ko.trim() || !draft.a_en.trim()) return alert("ko/en 답변 모두 필수");

    setSaving(true);
    try {
      if (editingId === "new") {
        const res = await fetch("/api/admin/faq", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug: draft.slug.trim(),
            qVariants,
            a_ko: draft.a_ko,
            a_en: draft.a_en,
            tags,
            source: draft.source,
            promotedFromMessageId: draft.promotedFromMessageId,
          }),
        });
        const result = await res.json();
        if (!res.ok) {
          alert(`Error: ${result.error || "save failed"}`);
          return;
        }
      } else if (typeof editingId === "number") {
        const res = await fetch(`/api/admin/faq/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug: draft.slug.trim(),
            qVariants,
            a_ko: draft.a_ko,
            a_en: draft.a_en,
            tags,
          }),
        });
        if (!res.ok) {
          const result = await res.json();
          alert(`Error: ${result.error || "save failed"}`);
          return;
        }
      }
      cancelEdit();
      fetchAll();
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (row: FaqRow) => {
    await fetch(`/api/admin/faq/${row.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !row.isActive }),
    });
    fetchAll();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("이 FAQ를 삭제할까요? 되돌릴 수 없습니다.")) return;
    await fetch(`/api/admin/faq/${id}`, { method: "DELETE" });
    fetchAll();
  };

  const promoteFromQuestion = (q: FrequentQuestion) => {
    const slug = `auto_${Date.now().toString(36)}`;
    startNew({
      slug,
      qVariantsText: q.content,
      source: "promoted",
    });
  };

  const promoteFromAssistant = (m: UpvotedMessage) => {
    const slug = `auto_${Date.now().toString(36)}`;
    startNew({
      slug,
      qVariantsText: m.userQuery,
      a_ko: m.assistantAnswer,
      a_en: m.assistantAnswer,
      source: "promoted",
      promotedFromMessageId: m.assistantMessageId,
    });
  };

  const filtered = rows.filter((r) => {
    if (!filter) return true;
    const f = filter.toLowerCase();
    return (
      r.slug.toLowerCase().includes(f) ||
      r.qVariants.some((q) => q.toLowerCase().includes(f)) ||
      r.tags.some((t) => t.toLowerCase().includes(f))
    );
  });

  const activeCount = rows.filter((r) => r.isActive).length;

  if (loading) return <div className="text-muted text-sm py-8 text-center">Loading FAQ...</div>;

  return (
    <div className="space-y-8">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border border-border p-5">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare size={16} className="text-muted" />
            <span className="editorial-label text-muted">Active / Total FAQs</span>
          </div>
          <p className="text-3xl font-heading font-bold">{activeCount} / {rows.length}</p>
        </div>
        <div className="border border-border p-5">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={16} className="text-muted" />
            <span className="editorial-label text-muted">Frequent Questions (30d)</span>
          </div>
          <p className="text-3xl font-heading font-bold">{candidates?.frequentQuestions.length ?? 0}</p>
        </div>
        <div className="border border-border p-5">
          <div className="flex items-center gap-2 mb-2">
            <ThumbsUp size={16} className="text-muted" />
            <span className="editorial-label text-muted">Upvoted Answers (30d)</span>
          </div>
          <p className="text-3xl font-heading font-bold">{candidates?.upvotedAssistantMessages.length ?? 0}</p>
        </div>
      </div>

      {/* Promotion Candidates */}
      {candidates && (candidates.frequentQuestions.length > 0 || candidates.upvotedAssistantMessages.length > 0) && (
        <section className="border border-border p-5 space-y-4">
          <h3 className="editorial-label">PROMOTION CANDIDATES</h3>

          {candidates.frequentQuestions.length > 0 && (
            <div>
              <p className="text-xs text-muted mb-2">자주 등장한 질문 (2회 이상)</p>
              <div className="space-y-1">
                {candidates.frequentQuestions.slice(0, 8).map((q, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm py-1">
                    <span className="font-mono text-xs text-muted shrink-0 w-8">×{q.count}</span>
                    <span className="flex-1 truncate">{q.content}</span>
                    {q.alreadyInFaq ? (
                      <span className="text-xs text-green-500">in FAQ</span>
                    ) : (
                      <button
                        onClick={() => promoteFromQuestion(q)}
                        className="text-xs px-2 py-1 border border-border rounded hover:border-foreground transition-colors cursor-pointer"
                      >
                        Promote
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {candidates.upvotedAssistantMessages.length > 0 && (
            <div>
              <p className="text-xs text-muted mb-2">👍 받은 어시스턴트 응답</p>
              <div className="space-y-2">
                {candidates.upvotedAssistantMessages.slice(0, 6).map((m) => (
                  <div key={m.feedbackId} className="border-l-2 border-border pl-3 py-2">
                    <p className="text-xs text-muted truncate">Q: {m.userQuery}</p>
                    <p className="text-sm truncate mt-1">{m.assistantAnswer.slice(0, 140)}...</p>
                    <button
                      onClick={() => promoteFromAssistant(m)}
                      className="text-xs px-2 py-1 mt-2 border border-border rounded hover:border-foreground transition-colors cursor-pointer"
                    >
                      Promote to FAQ
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="검색 (slug, 질문, 태그)..."
          className="flex-1 max-w-md bg-surface border border-border rounded px-3 py-2 text-sm outline-none focus:border-foreground"
        />
        <button
          onClick={() => startNew()}
          className="flex items-center gap-2 px-4 py-2 text-xs font-mono uppercase tracking-wider bg-foreground text-background rounded hover:opacity-80 cursor-pointer"
        >
          <Plus size={14} /> New FAQ
        </button>
      </div>

      {/* Editor */}
      {editingId !== null && (
        <div className="border border-foreground p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="editorial-label">{editingId === "new" ? "NEW FAQ" : `EDIT #${editingId}`}</h3>
            <button onClick={cancelEdit} className="text-muted hover:text-foreground cursor-pointer">
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="editorial-label text-muted">Slug</span>
              <input
                type="text"
                value={draft.slug}
                onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
                disabled={editingId !== "new"}
                className="bg-surface border border-border rounded px-3 py-2 text-sm font-mono outline-none focus:border-foreground disabled:opacity-50"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="editorial-label text-muted">Tags (comma-separated)</span>
              <input
                type="text"
                value={draft.tagsText}
                onChange={(e) => setDraft({ ...draft, tagsText: e.target.value })}
                className="bg-surface border border-border rounded px-3 py-2 text-sm outline-none focus:border-foreground"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1">
            <span className="editorial-label text-muted">Question Variants (한 줄에 하나)</span>
            <textarea
              value={draft.qVariantsText}
              onChange={(e) => setDraft({ ...draft, qVariantsText: e.target.value })}
              rows={5}
              className="bg-surface border border-border rounded px-3 py-2 text-sm outline-none focus:border-foreground font-mono"
            />
          </label>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="editorial-label text-muted">Answer (Korean)</span>
              <textarea
                value={draft.a_ko}
                onChange={(e) => setDraft({ ...draft, a_ko: e.target.value })}
                rows={8}
                className="bg-surface border border-border rounded px-3 py-2 text-sm outline-none focus:border-foreground"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="editorial-label text-muted">Answer (English)</span>
              <textarea
                value={draft.a_en}
                onChange={(e) => setDraft({ ...draft, a_en: e.target.value })}
                rows={8}
                className="bg-surface border border-border rounded px-3 py-2 text-sm outline-none focus:border-foreground"
              />
            </label>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              onClick={cancelEdit}
              className="px-4 py-2 text-xs font-mono uppercase tracking-wider border border-border rounded hover:border-foreground cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 text-xs font-mono uppercase tracking-wider bg-foreground text-background rounded hover:opacity-80 disabled:opacity-50 cursor-pointer"
            >
              <Check size={14} /> {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="border border-border divide-y divide-border">
        <div className="grid grid-cols-12 px-4 py-2 editorial-label text-muted">
          <span className="col-span-2">Slug</span>
          <span className="col-span-5">First Question</span>
          <span className="col-span-1">Source</span>
          <span className="col-span-1">Active</span>
          <span className="col-span-1 text-right">👍</span>
          <span className="col-span-2 text-right">Actions</span>
        </div>
        {filtered.map((row) => (
          <div key={row.id} className="grid grid-cols-12 px-4 py-3 items-center text-sm">
            <span className="col-span-2 font-mono text-xs truncate">{row.slug}</span>
            <span className="col-span-5 truncate text-secondary">{row.qVariants[0] ?? "—"}</span>
            <span className="col-span-1 text-xs font-mono text-muted">{row.source}</span>
            <button
              onClick={() => handleToggleActive(row)}
              className={`col-span-1 text-xs font-mono cursor-pointer ${row.isActive ? "text-green-500" : "text-muted"}`}
            >
              {row.isActive ? "● on" : "○ off"}
            </button>
            <span className="col-span-1 text-right text-xs font-mono">{row.upvotes}</span>
            <div className="col-span-2 flex justify-end gap-2">
              <button
                onClick={() => startEdit(row)}
                className="text-xs px-2 py-1 border border-border rounded hover:border-foreground cursor-pointer"
              >
                <Pencil size={12} />
              </button>
              <button
                onClick={() => handleDelete(row.id)}
                className="text-xs px-2 py-1 text-red-500 border border-red-500/30 rounded hover:bg-red-500/10 cursor-pointer"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="px-4 py-8 text-center text-muted text-sm">FAQ가 없습니다</div>}
      </div>
    </div>
  );
}
