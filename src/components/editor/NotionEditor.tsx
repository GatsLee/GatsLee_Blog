"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Calendar } from 'lucide-react';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import { uploadFile } from '@/lib/upload';
import { useTheme } from '@/context/ThemeContext';

// ─── Props ─────────────────────────────────────────────────────────────────

interface NotionEditorProps {
  initialTitle?: string;
  initialCategory?: string;
  /** Raw markdown string (replaces old initialBlocks) */
  initialContent?: string;
  initialSlug?: string;
  initialDescription?: string;
  initialTags?: string;
  initialLocale?: string;
  initialPublished?: boolean;
  initialCreatedAt?: string;
  onSave: (data: {
    title: string;
    category: string;
    content: string;
    slug?: string;
    description?: string;
    tags?: string;
    locale?: string;
    published?: boolean;
    createdAt?: string;
  }) => void;
  saving?: boolean;
}

// ─── NotionEditor ──────────────────────────────────────────────────────────

export default function NotionEditor({
  initialTitle = '',
  initialCategory = 'journal',
  initialContent,
  initialSlug = '',
  initialDescription = '',
  initialTags = '[]',
  initialLocale = 'ko',
  initialPublished = true,
  initialCreatedAt,
  onSave,
  saving = false,
}: NotionEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [category] = useState(initialCategory);
  const [createdAt, setCreatedAt] = useState(() => {
    if (initialCreatedAt) {
      const d = new Date(initialCreatedAt);
      return d.toISOString().slice(0, 16);
    }
    return new Date().toISOString().slice(0, 16);
  });
  const [locale, setLocale] = useState(initialLocale);
  const [published, setPublished] = useState(initialPublished);
  const [slug, setSlug] = useState(initialSlug);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!initialSlug);
  const [description, setDescription] = useState(initialDescription);
  const [tags, setTags] = useState<string[]>(() => {
    try { return JSON.parse(initialTags); } catch { return []; }
  });
  const [tagInput, setTagInput] = useState('');
  const [contentLoaded, setContentLoaded] = useState(false);

  const titleRef = useRef<HTMLInputElement>(null);
  const { theme } = useTheme();

  // Auto-generate slug from title
  useEffect(() => {
    if (slugManuallyEdited) return;
    const auto = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-{2,}/g, '-').replace(/^-|-$/g, '');
    setSlug(auto);
  }, [title, slugManuallyEdited]);

  // ── BlockNote editor instance ─────────────────────────────────────────────
  const editor = useCreateBlockNote({
    uploadFile: async (file: File) => {
      return await uploadFile(file);
    },
  });

  // Load initial markdown content into editor
  useEffect(() => {
    if (contentLoaded) return;
    const load = async () => {
      const md = initialContent ?? '';
      if (md.trim()) {
        const blocks = await editor.tryParseMarkdownToBlocks(md);
        editor.replaceBlocks(editor.document, blocks);
      }
      setContentLoaded(true);
    };
    load();
  }, [editor, initialContent, contentLoaded]);

  // ── Stats (computed from editor document) ────────────────────────────────
  const getPlainText = useCallback(() => {
    return editor.document
      .map(b => {
        const content = b.content;
        if (Array.isArray(content)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return (content as any[]).map(s => (typeof s === 'object' && s !== null && 'text' in s ? s.text : '')).join('');
        }
        return '';
      })
      .join(' ');
  }, [editor]);

  // ── Save handler ─────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    const content = await editor.blocksToMarkdownLossy(editor.document);
    onSave({
      title: title || 'Untitled',
      category,
      content,
      slug,
      description,
      tags: JSON.stringify(tags),
      locale,
      published,
      createdAt: new Date(createdAt).toISOString(),
    });
  }, [editor, title, category, slug, description, tags, locale, published, createdAt, onSave]);

  // Cmd+S shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  // TOC from editor blocks
  const tocItems = editor.document.filter(b => {
    if (b.type !== 'heading') return false;
    if (!Array.isArray(b.content)) return false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (b.content as any[]).some(s => s && typeof s === 'object' && 'text' in s && s.text?.trim());
  });

  const plainText = getPlainText();
  const wordCount = plainText.trim() ? plainText.trim().split(/\s+/).filter(Boolean).length : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="flex flex-col overflow-hidden bg-background text-foreground" style={{ height: 'calc(100vh - 72px)' }}>

      {/* ── Editor toolbar ──────────────────────────────────────────────── */}
      <div className="h-10 border-b border-border flex items-center justify-between px-6 bg-surface shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] text-muted tracking-widest uppercase">
            POST <span className="mx-1 font-light opacity-40">/</span> EDITOR
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className={`text-[11px] font-mono mr-1 ${saving ? 'text-muted' : published ? 'text-green-500' : 'text-orange-400'}`}>
            {saving ? 'Saving...' : published ? 'Public' : 'Draft'}
          </span>
          <button
            onClick={() => setLocale(l => l === 'ko' ? 'en' : 'ko')}
            className="px-2 h-7 text-[11px] font-medium font-mono text-muted hover:text-foreground hover:bg-hover rounded transition-colors"
            title="Post language">
            {locale === 'ko' ? '한' : 'EN'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="ml-1 bg-foreground hover:bg-foreground/90 text-background font-bold h-7 px-4 text-[11px] uppercase tracking-widest rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {saving ? 'Saving...' : 'COMMIT'}
          </button>
        </div>
      </div>

      {/* ── Main area ───────────────────────────────────────────────────── */}
      <main className="flex-1 flex overflow-hidden min-w-0">

        {/* Editor center */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-8 md:px-16 pt-12 pb-8">

            {/* Title */}
            <input
              ref={titleRef}
              className="w-full bg-transparent outline-none text-4xl md:text-[2.75rem] font-bold text-foreground tracking-tight mb-6 placeholder-muted/25"
              style={{ fontFamily: "'Manrope', 'Pretendard', sans-serif" }}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="New Page"
              autoComplete="off"
            />

            {/* Metadata badges */}
            <div className="flex items-center gap-2 mb-6 flex-wrap">
              <div className="flex items-center gap-1.5 px-3 py-1.5 card-border rounded-md hover:bg-hover transition-colors">
                <Calendar size={13} className="text-muted" />
                <input
                  type="datetime-local"
                  value={createdAt}
                  onChange={(e) => setCreatedAt(e.target.value)}
                  className="bg-transparent text-sm text-foreground focus:outline-none cursor-pointer"
                />
              </div>

              <button
                onClick={() => setPublished(p => !p)}
                className="flex items-center gap-2 px-3 py-1.5 card-border rounded-md text-sm hover:bg-hover transition-colors">
                <div className={`w-2 h-2 rounded-full ${published ? 'bg-green-500' : 'bg-orange-400'}`} />
                <span className="text-foreground text-xs font-medium">{published ? 'Public' : 'Draft'}</span>
              </button>
            </div>

            <div className="w-full h-px bg-border mb-8" />

            {/* BlockNote editor */}
            <div className="bn-editor-wrapper">
              <BlockNoteView
                editor={editor}
                theme={theme}
                className="bn-custom"
              />
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <aside className="w-[300px] border-l border-border bg-surface/50 flex flex-col overflow-y-auto shrink-0">
          <div className="p-5">
            <h3 className="text-[10px] font-bold text-muted tracking-widest mb-5 uppercase">
              Page Settings
            </h3>

            {/* Slug */}
            <div className="mb-5">
              <label className="block text-xs text-muted mb-2">Slug</label>
              <input
                value={slug}
                onChange={(e) => { setSlug(e.target.value); setSlugManuallyEdited(true); }}
                placeholder="auto-generated-from-title"
                className="w-full px-3 py-1.5 bg-background card-border rounded text-xs text-muted font-mono focus:outline-none focus:border-accent/50 transition-colors placeholder:text-muted/40"
              />
            </div>

            {/* Tags */}
            <div className="mb-5">
              <label className="block text-xs text-muted mb-2">Tags</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {tags.map((tag, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-background card-border rounded text-xs text-muted">
                    {tag}
                    <button
                      onClick={() => setTags(prev => prev.filter((_, idx) => idx !== i))}
                      className="text-muted/50 hover:text-foreground transition-colors leading-none"
                    >&times;</button>
                  </span>
                ))}
              </div>
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && tagInput.trim()) {
                    e.preventDefault();
                    const newTag = tagInput.trim();
                    if (!tags.includes(newTag)) setTags(prev => [...prev, newTag]);
                    setTagInput('');
                  }
                  if (e.key === 'Backspace' && tagInput === '' && tags.length > 0) {
                    setTags(prev => prev.slice(0, -1));
                  }
                }}
                placeholder="Add tag and press Enter…"
                className="w-full px-3 py-1.5 bg-background card-border rounded text-xs text-muted focus:outline-none focus:border-accent/50 transition-colors placeholder:text-muted/40"
              />
            </div>

            {/* Description */}
            <div className="mb-5">
              <label className="block text-xs text-muted mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description for search engines…"
                rows={3}
                className="w-full px-3 py-2 bg-background card-border rounded text-xs text-muted resize-none focus:outline-none focus:border-accent/50 transition-colors placeholder:text-muted/40"
              />
            </div>
          </div>

          <div className="h-px bg-border mx-5 mb-5" />

          {/* TOC */}
          <div className="px-5 pb-5">
            <h3 className="text-[10px] font-bold text-muted tracking-widest mb-3 uppercase">
              Table of Contents
            </h3>
            {tocItems.length > 0 ? (
              <ul className="space-y-2">
                {tocItems.map((b, i) => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const headingBlock = b as any;
                  const level: number = headingBlock.props?.level ?? 1;
                  const text: string = Array.isArray(headingBlock.content)
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    ? headingBlock.content.map((s: any) => (s && typeof s === 'object' && 'text' in s ? s.text : '')).join('')
                    : '';
                  return (
                    <li key={i}
                      className={`text-xs text-muted hover:text-foreground cursor-pointer transition-colors truncate leading-relaxed ${
                        level === 2 ? 'pl-3' : level === 3 ? 'pl-5' : ''
                      }`}>
                      {level === 1 && <span className="text-accent mr-1 font-mono">#</span>}
                      {level === 2 && <span className="text-muted/50 mr-1 font-mono">##</span>}
                      {level === 3 && <span className="text-muted/30 mr-1 font-mono">###</span>}
                      {text}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-[11px] text-muted/40 font-mono">Add headings to see TOC</p>
            )}
          </div>
        </aside>
      </main>

      {/* ── Fixed bottom bar (stats) ──────────────────────────────────── */}
      <div className="h-10 border-t border-border flex items-center justify-between px-6 bg-surface shrink-0">
        <div className="flex items-center gap-4 text-[11px] text-muted font-mono">
          <span>Words: {wordCount}</span>
          <span className="opacity-30">•</span>
          <span>Reading: ~{readingTime} min</span>
          <span className="opacity-30">•</span>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span>Live Sync</span>
          </div>
        </div>
      </div>

      {/* BlockNote theme override — adapts to blog light/dark via CSS vars */}
      <style>{`
        .bn-custom {
          --bn-colors-editor-background: transparent;
          --bn-colors-editor-text: var(--color-foreground);
          --bn-colors-menu-background: var(--color-surface);
          --bn-colors-menu-text: var(--color-foreground);
          --bn-colors-tooltip-background: var(--color-surface);
          --bn-colors-tooltip-text: var(--color-foreground);
          --bn-colors-hovered-background: var(--color-hover);
          --bn-colors-selected-background: var(--color-accent);
          --bn-colors-disabled-background: transparent;
          --bn-colors-shadow: rgba(0,0,0,0.15);
          --bn-colors-border: var(--color-border);
          --bn-colors-side-menu: var(--color-muted);
          --bn-font-family: 'Manrope', 'Pretendard', system-ui, sans-serif;
        }
        .bn-custom .bn-editor {
          padding: 0;
          font-size: 1rem;
          line-height: 1.75;
          color: var(--color-foreground);
          background: transparent;
        }
        /* Mantine panel inherits surface color */
        .bn-custom [data-mantine-color-scheme] {
          --mantine-color-body: transparent;
        }
      `}</style>
    </div>
  );
}
