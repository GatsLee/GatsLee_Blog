"use client";

import React, { useState, useCallback } from 'react';
import { Plus, Trash2, ChevronDown, Save } from 'lucide-react';
import BlueprintContent from '@/app/blueprint/BlueprintContent';

// ─── Types ─────────────────────────────────────────────────────────────────

interface SerializedPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  tags: string;
  createdAt: string;
}

type MilestoneStatus = 'now' | 'next' | 'later';

interface ManifestoItem {
  existingId?: number;
  title: string;
  content: string;
}

interface PrincipleItem {
  existingId?: number;
  title: string;
  content: string;
}

interface MilestoneItem {
  existingId?: number;
  title: string;
  content: string;
  status: MilestoneStatus;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function parseTags(tags: string): string[] {
  try { return JSON.parse(tags); } catch { return []; }
}

function generateSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9가-힣]+/g, '-').replace(/^-|-$/g, '') || 'untitled';
}

// ─── BlueprintEditor ───────────────────────────────────────────────────────

export default function BlueprintEditor({ initialPosts }: { initialPosts: SerializedPost[] }) {
  // Parse initial posts into sections
  const initManifesto: ManifestoItem = (() => {
    const post = initialPosts.find(p => parseTags(p.tags).some(t => t.toLowerCase() === 'manifesto'));
    return post
      ? { existingId: post.id, title: post.title, content: post.content }
      : { title: '', content: '' };
  })();

  const initPrinciples: PrincipleItem[] = initialPosts
    .filter(p => parseTags(p.tags).some(t => t.toLowerCase() === 'principle'))
    .map(p => ({ existingId: p.id, title: p.title, content: p.content }));

  const initMilestones: MilestoneItem[] = initialPosts
    .filter(p => parseTags(p.tags).some(t => t.toLowerCase() === 'milestone'))
    .map(p => {
      const tags = parseTags(p.tags);
      const status: MilestoneStatus = tags.includes('now') ? 'now' : tags.includes('next') ? 'next' : 'later';
      return { existingId: p.id, title: p.title, content: p.content, status };
    });

  // Track deleted post IDs for cleanup
  const [deletedIds, setDeletedIds] = useState<number[]>([]);

  // State
  const [manifesto, setManifesto] = useState<ManifestoItem>(initManifesto);
  const [principles, setPrinciples] = useState<PrincipleItem[]>(initPrinciples);
  const [milestones, setMilestones] = useState<MilestoneItem[]>(initMilestones);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Principle CRUD
  const addPrinciple = useCallback(() => {
    if (principles.length >= 3) return;
    setPrinciples(prev => [...prev, { title: '', content: '' }]);
  }, [principles.length]);

  const updatePrinciple = useCallback((index: number, data: Partial<PrincipleItem>) => {
    setPrinciples(prev => prev.map((p, i) => i === index ? { ...p, ...data } : p));
  }, []);

  const removePrinciple = useCallback((index: number) => {
    setPrinciples(prev => {
      const item = prev[index];
      if (item.existingId) setDeletedIds(d => [...d, item.existingId!]);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  // Milestone CRUD
  const addMilestone = useCallback(() => {
    setMilestones(prev => [...prev, { title: '', content: '', status: 'later' }]);
  }, []);

  const updateMilestone = useCallback((index: number, data: Partial<MilestoneItem>) => {
    setMilestones(prev => prev.map((m, i) => i === index ? { ...m, ...data } : m));
  }, []);

  const removeMilestone = useCallback((index: number) => {
    setMilestones(prev => {
      const item = prev[index];
      if (item.existingId) setDeletedIds(d => [...d, item.existingId!]);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  // Save all sections
  const handleSaveAll = async () => {
    setSaving(true);
    setSaveMessage('');
    try {
      // Delete removed posts
      for (const id of deletedIds) {
        await fetch(`/api/posts/${id}`, { method: 'DELETE' });
      }
      setDeletedIds([]);

      // Save manifesto
      if (manifesto.title.trim()) {
        const body = {
          title: manifesto.title,
          content: manifesto.content,
          category: 'blueprint',
          tags: JSON.stringify(['manifesto']),
          slug: generateSlug(manifesto.title),
          published: true,
        };
        if (manifesto.existingId) {
          await fetch(`/api/posts/${manifesto.existingId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });
        } else {
          const res = await fetch('/api/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });
          if (res.ok) {
            const post = await res.json();
            setManifesto(prev => ({ ...prev, existingId: post.id }));
          }
        }
      }

      // Save principles
      for (let i = 0; i < principles.length; i++) {
        const p = principles[i];
        if (!p.title.trim()) continue;
        const body = {
          title: p.title,
          content: p.content,
          category: 'blueprint',
          tags: JSON.stringify(['principle']),
          slug: generateSlug(p.title),
          published: true,
        };
        if (p.existingId) {
          await fetch(`/api/posts/${p.existingId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });
        } else {
          const res = await fetch('/api/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });
          if (res.ok) {
            const post = await res.json();
            setPrinciples(prev => prev.map((item, j) => j === i ? { ...item, existingId: post.id } : item));
          }
        }
      }

      // Save milestones
      for (let i = 0; i < milestones.length; i++) {
        const m = milestones[i];
        if (!m.title.trim()) continue;
        const body = {
          title: m.title,
          content: m.content,
          category: 'blueprint',
          tags: JSON.stringify(['milestone', m.status]),
          slug: generateSlug(m.title),
          published: true,
        };
        if (m.existingId) {
          await fetch(`/api/posts/${m.existingId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });
        } else {
          const res = await fetch('/api/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });
          if (res.ok) {
            const post = await res.json();
            setMilestones(prev => prev.map((item, j) => j === i ? { ...item, existingId: post.id } : item));
          }
        }
      }

      setSaveMessage('Saved successfully');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      console.error('Save failed:', err);
      setSaveMessage('Save failed');
    } finally {
      setSaving(false);
    }
  };

  // Build preview data
  const previewManifesto = manifesto.title.trim() ? {
    id: manifesto.existingId || 0,
    title: manifesto.title,
    slug: generateSlug(manifesto.title),
    content: manifesto.content,
    createdAt: new Date().toISOString(),
    parsedTags: ['manifesto'],
  } : null;

  const previewPrinciples = principles
    .filter(p => p.title.trim())
    .map((p, i) => ({
      id: p.existingId || -(i + 1),
      title: p.title,
      slug: generateSlug(p.title),
      content: p.content,
      createdAt: new Date().toISOString(),
      parsedTags: ['principle'],
    }));

  const previewMilestones = milestones
    .filter(m => m.title.trim())
    .map((m, i) => ({
      id: m.existingId || -(i + 100),
      title: m.title,
      slug: generateSlug(m.title),
      content: m.content,
      createdAt: new Date().toISOString(),
      parsedTags: ['milestone', m.status],
    }));

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background text-foreground">

      {/* ── Toolbar ────────────────────────────────────────────────────── */}
      <div className="h-10 border-b border-border flex items-center justify-between px-6 bg-surface shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] text-muted tracking-widest uppercase">
            POST <span className="mx-1 font-light opacity-40">/</span> BLUEPRINT EDITOR
          </span>
          {saveMessage && (
            <span className={`text-[11px] font-mono ${saveMessage.includes('failed') ? 'text-red-400' : 'text-accent'}`}>
              {saveMessage}
            </span>
          )}
        </div>
        <button
          onClick={handleSaveAll}
          disabled={saving}
          className="bg-foreground hover:bg-foreground/90 text-background font-bold h-7 px-4 text-[11px] uppercase tracking-widest rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
        >
          <Save size={12} />
          {saving ? 'Saving...' : 'SAVE ALL'}
        </button>
      </div>

      {/* ── Main split pane ────────────────────────────────────────────── */}
      <main className="flex-1 flex overflow-hidden">

        {/* Editor panel (left) */}
        <div className="flex-1 overflow-y-auto border-r border-border" style={{ flexBasis: '55%' }}>
          <div className="max-w-2xl mx-auto px-8 py-10 space-y-10">

            {/* ── Manifesto ──────────────────────────────────────────── */}
            <section>
              <h3 className="text-[10px] font-bold text-accent tracking-widest mb-4 uppercase flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                Manifesto
              </h3>
              <input
                value={manifesto.title}
                onChange={(e) => setManifesto(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Manifesto title"
                className="w-full bg-transparent outline-none text-2xl font-bold text-foreground tracking-tight mb-4 placeholder-muted/25"
                style={{ fontFamily: 'Archivo, sans-serif' }}
              />
              <textarea
                value={manifesto.content}
                onChange={(e) => setManifesto(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Write your manifesto (supports Markdown)..."
                rows={8}
                className="w-full px-4 py-3 bg-background card-border rounded-lg text-sm text-foreground font-mono resize-y focus:outline-none focus:border-accent/50 transition-colors placeholder:text-muted/40 leading-relaxed"
              />
            </section>

            <div className="w-full h-px bg-border" />

            {/* ── Principles ─────────────────────────────────────────── */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] font-bold text-blue-400 tracking-widest uppercase flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  Principles ({principles.length}/3)
                </h3>
                {principles.length < 3 && (
                  <button
                    onClick={addPrinciple}
                    className="flex items-center gap-1 text-xs text-muted hover:text-accent transition-colors"
                  >
                    <Plus size={14} />
                    <span>Add</span>
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {principles.map((p, i) => (
                  <div key={i} className="bg-surface card-border rounded-lg p-4 relative group">
                    <button
                      onClick={() => removePrinciple(i)}
                      className="absolute top-3 right-3 text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={14} />
                    </button>
                    <input
                      value={p.title}
                      onChange={(e) => updatePrinciple(i, { title: e.target.value })}
                      placeholder={`Principle ${i + 1} title`}
                      className="w-full bg-transparent outline-none text-base font-semibold text-foreground mb-3 placeholder-muted/25"
                      style={{ fontFamily: 'Archivo, sans-serif' }}
                    />
                    <textarea
                      value={p.content}
                      onChange={(e) => updatePrinciple(i, { content: e.target.value })}
                      placeholder="Description (Markdown)..."
                      rows={3}
                      className="w-full px-3 py-2 bg-background card-border rounded text-xs text-foreground font-mono resize-y focus:outline-none focus:border-accent/50 transition-colors placeholder:text-muted/40 leading-relaxed"
                    />
                  </div>
                ))}
              </div>
            </section>

            <div className="w-full h-px bg-border" />

            {/* ── Milestones ─────────────────────────────────────────── */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] font-bold text-muted tracking-widest uppercase flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-muted" />
                  Milestones ({milestones.length})
                </h3>
                <button
                  onClick={addMilestone}
                  className="flex items-center gap-1 text-xs text-muted hover:text-accent transition-colors"
                >
                  <Plus size={14} />
                  <span>Add</span>
                </button>
              </div>

              <div className="space-y-4">
                {milestones.map((m, i) => (
                  <div key={i} className="bg-surface card-border rounded-lg p-4 relative group">
                    <button
                      onClick={() => removeMilestone(i)}
                      className="absolute top-3 right-3 text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={14} />
                    </button>
                    <div className="flex items-center gap-3 mb-3">
                      <input
                        value={m.title}
                        onChange={(e) => updateMilestone(i, { title: e.target.value })}
                        placeholder={`Milestone ${i + 1} title`}
                        className="flex-1 bg-transparent outline-none text-base font-semibold text-foreground placeholder-muted/25"
                        style={{ fontFamily: 'Archivo, sans-serif' }}
                      />
                      <div className="flex items-center gap-1.5 px-2 py-1 card-border rounded-md">
                        <select
                          value={m.status}
                          onChange={(e) => updateMilestone(i, { status: e.target.value as MilestoneStatus })}
                          className="bg-transparent text-[10px] font-mono uppercase text-foreground focus:outline-none cursor-pointer appearance-none"
                        >
                          <option value="now">NOW</option>
                          <option value="next">NEXT</option>
                          <option value="later">LATER</option>
                        </select>
                        <ChevronDown size={10} className="text-muted pointer-events-none" />
                      </div>
                    </div>
                    <textarea
                      value={m.content}
                      onChange={(e) => updateMilestone(i, { content: e.target.value })}
                      placeholder="Details (Markdown)..."
                      rows={3}
                      className="w-full px-3 py-2 bg-background card-border rounded text-xs text-foreground font-mono resize-y focus:outline-none focus:border-accent/50 transition-colors placeholder:text-muted/40 leading-relaxed"
                    />
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* Preview panel (right) */}
        <div className="overflow-y-auto bg-background" style={{ flexBasis: '45%' }}>
          <div className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span className="text-[10px] font-mono text-muted tracking-widest uppercase">Live Preview</span>
            </div>
            <div className="transform scale-[0.85] origin-top-left" style={{ width: 'calc(100% / 0.85)' }}>
              <BlueprintContent
                manifesto={previewManifesto}
                principles={previewPrinciples}
                milestones={previewMilestones}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
