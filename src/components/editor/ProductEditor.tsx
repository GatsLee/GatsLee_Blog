"use client";

import React, { useState, useRef, useEffect } from 'react';
import {
  Tag,
  ChevronDown,
  ImagePlus,
  Video,
  X,
  Plus,
} from 'lucide-react';
import { uploadFile } from '@/lib/upload';

// ─── Types ─────────────────────────────────────────────────────────────────

interface ProductSaveData {
  title: string;
  category: string;
  content: string;
  slug?: string;
  coverImage?: string;
  description?: string;
  locale?: string;
  published?: boolean;
  tags?: string;
  demoVideo?: string;
  demoImages?: string;
  targetAudience?: string;
  purpose?: string;
  expectedEffect?: string;
}

interface ProductEditorProps {
  initialTitle?: string;
  initialCategory?: string;
  initialContent?: string;
  initialCoverImage?: string;
  initialDemoVideo?: string;
  initialDemoImages?: string;
  initialTargetAudience?: string;
  initialPurpose?: string;
  initialExpectedEffect?: string;
  initialLocale?: string;
  initialPublished?: boolean;
  initialTags?: string;
  initialSlug?: string;
  initialDescription?: string;
  onSave: (data: ProductSaveData) => void;
  saving?: boolean;
}

const STATUS_OPTIONS = ['planning', 'developing', 'deployed'] as const;

// ─── ProductEditor ─────────────────────────────────────────────────────────

export default function ProductEditor({
  initialTitle = '',
  initialCategory = 'product',
  initialContent = '',
  initialCoverImage = '',
  initialDemoVideo = '',
  initialDemoImages = '[]',
  initialTargetAudience = '',
  initialPurpose = '',
  initialExpectedEffect = '',
  initialLocale = 'ko',
  initialPublished = true,
  initialTags = '[]',
  initialSlug = '',
  initialDescription = '',
  onSave,
  saving = false,
}: ProductEditorProps) {
  // Parse initial tags into status + tech tags
  const parsedInitialTags: string[] = (() => {
    try { return JSON.parse(initialTags); } catch { return []; }
  })();
  const initialStatus = parsedInitialTags.find(t => (STATUS_OPTIONS as readonly string[]).includes(t)) || 'planning';
  const initialTechTags = parsedInitialTags.filter(t => !(STATUS_OPTIONS as readonly string[]).includes(t));

  const parsedInitialImages: string[] = (() => {
    try { return JSON.parse(initialDemoImages); } catch { return []; }
  })();

  // State
  const [title, setTitle] = useState(initialTitle);
  const [category, setCategory] = useState(initialCategory);
  const [content, setContent] = useState(initialContent);
  const [coverImage, setCoverImage] = useState(initialCoverImage);
  const [demoVideo, setDemoVideo] = useState(initialDemoVideo);
  const [demoImages, setDemoImages] = useState<string[]>(parsedInitialImages);
  const [targetAudience, setTargetAudience] = useState(initialTargetAudience);
  const [purpose, setPurpose] = useState(initialPurpose);
  const [expectedEffect, setExpectedEffect] = useState(initialExpectedEffect);
  const [locale, setLocale] = useState(initialLocale);
  const [published, setPublished] = useState(initialPublished);
  const [status, setStatus] = useState(initialStatus);
  const [techTags, setTechTags] = useState<string[]>(initialTechTags);
  const [tagInput, setTagInput] = useState('');
  const [slug, setSlug] = useState(initialSlug);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!initialSlug);
  const [description, setDescription] = useState(initialDescription);

  // Upload state
  const [coverUploading, setCoverUploading] = useState(false);
  const [demoUploading, setDemoUploading] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const demoInputRef = useRef<HTMLInputElement>(null);

  // Auto-generate slug from title
  useEffect(() => {
    if (slugManuallyEdited) return;
    const auto = title.toLowerCase().replace(/[^a-z0-9가-힣]+/g, '-').replace(/^-|-$/g, '');
    setSlug(auto);
  }, [title, slugManuallyEdited]);

  // Stats
  const allText = [title, content, purpose, targetAudience, expectedEffect].join(' ');
  const wordCount = allText.trim() ? allText.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = allText.replace(/\s/g, '').length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const isUploading = coverUploading || demoUploading;

  // Handlers
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverUploading(true);
    try {
      const url = await uploadFile(file);
      setCoverImage(url);
    } catch { alert('Cover upload failed.'); }
    finally {
      setCoverUploading(false);
      if (coverInputRef.current) coverInputRef.current.value = '';
    }
  };

  const handleDemoImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setDemoUploading(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const url = await uploadFile(file);
        urls.push(url);
      }
      setDemoImages(prev => [...prev, ...urls]);
    } catch { alert('Demo image upload failed.'); }
    finally {
      setDemoUploading(false);
      if (demoInputRef.current) demoInputRef.current.value = '';
    }
  };

  const removeDemoImage = (index: number) => {
    setDemoImages(prev => prev.filter((_, i) => i !== index));
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !techTags.includes(tag)) {
      setTechTags(prev => [...prev, tag]);
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setTechTags(prev => prev.filter(t => t !== tag));
  };

  const handleSave = () => {
    if (!title.trim()) return;
    const tags = JSON.stringify([status, ...techTags]);
    onSave({
      title,
      category,
      content,
      slug,
      coverImage,
      description,
      locale,
      published,
      tags,
      demoVideo,
      demoImages: JSON.stringify(demoImages),
      targetAudience,
      purpose,
      expectedEffect,
    });
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background text-foreground">

      {/* ── Toolbar ────────────────────────────────────────────────────── */}
      <div className="h-10 border-b border-border flex items-center justify-between px-6 bg-surface shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] text-muted tracking-widest uppercase">
            POST <span className="mx-1 font-light opacity-40">/</span> PRODUCT EDITOR
          </span>
          {isUploading && (
            <span className="text-[11px] text-accent font-mono animate-pulse">Uploading…</span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-muted font-mono mr-1">
            {saving ? 'Saving...' : published ? 'Public' : 'Draft'}
          </span>
          <button
            onClick={() => setLocale(l => l === 'ko' ? 'en' : 'ko')}
            className="px-2 h-7 text-[11px] font-medium font-mono text-muted hover:text-foreground hover:bg-hover rounded transition-colors"
            title="Post language"
          >
            {locale === 'ko' ? '한' : 'EN'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving || isUploading}
            className="ml-1 bg-foreground hover:bg-foreground/90 text-background font-bold h-7 px-4 text-[11px] uppercase tracking-widest rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'COMMIT'}
          </button>
        </div>
      </div>

      {/* ── Main area ──────────────────────────────────────────────────── */}
      <main className="flex-1 flex overflow-hidden">

        {/* Editor center */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-16 pt-12 pb-8">

            {/* Cover image */}
            {coverImage ? (
              <div className="relative group mb-6">
                <img src={coverImage} alt="Cover" className="w-full h-48 object-cover rounded-lg card-border" />
                <button
                  onClick={() => setCoverImage('')}
                  className="absolute top-2 right-2 bg-background/80 text-muted hover:text-foreground rounded px-2 py-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  remove
                </button>
              </div>
            ) : (
              <button
                onClick={() => coverInputRef.current?.click()}
                disabled={coverUploading}
                className="w-full h-32 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center text-muted hover:bg-hover hover:border-accent/40 transition-colors bg-background gap-1 text-xs mb-6"
              >
                <ImagePlus size={20} />
                <span>{coverUploading ? 'Uploading…' : 'Add Cover Image'}</span>
              </button>
            )}

            {/* Title */}
            <input
              className="w-full bg-transparent outline-none text-4xl md:text-[2.75rem] font-bold text-foreground tracking-tight mb-6 placeholder-muted/25"
              style={{ fontFamily: 'Archivo, sans-serif' }}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Product Name"
              autoComplete="off"
            />

            {/* Metadata badges */}
            <div className="flex items-center gap-2 mb-6 flex-wrap">
              <div className="flex items-center gap-1.5 px-3 py-1.5 card-border rounded-md hover:bg-hover transition-colors">
                <Tag size={13} className="text-muted" />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="bg-transparent text-sm text-foreground focus:outline-none cursor-pointer appearance-none"
                >
                  <option value="product">Product</option>
                  <option value="agent">Agent</option>
                </select>
                <ChevronDown size={13} className="text-muted pointer-events-none" />
              </div>

              <button
                onClick={() => setPublished(p => !p)}
                className="flex items-center gap-2 px-3 py-1.5 card-border rounded-md text-sm hover:bg-hover transition-colors"
              >
                <div className={`w-2 h-2 rounded-full ${published ? 'bg-accent' : 'bg-muted/40'}`} />
                <span className="text-foreground text-xs font-medium">{published ? 'Public' : 'Draft'}</span>
              </button>
            </div>

            <div className="w-full h-px bg-border mb-8" />

            {/* ── Demo Section ──────────────────────────────────────────── */}
            <section className="mb-8">
              <h3 className="text-[10px] font-bold text-muted tracking-widest mb-4 uppercase">Demo</h3>

              {/* Demo Video */}
              <div className="mb-5">
                <label className="block text-xs text-muted mb-2">Demo Video URL</label>
                <div className="flex items-center gap-2">
                  <Video size={14} className="text-muted shrink-0" />
                  <input
                    value={demoVideo}
                    onChange={(e) => setDemoVideo(e.target.value)}
                    placeholder="https://youtube.com/watch?v=... or Vimeo URL"
                    className="w-full px-3 py-2 bg-background card-border rounded text-sm text-foreground focus:outline-none focus:border-accent/50 transition-colors placeholder:text-muted/40 font-mono"
                  />
                </div>
              </div>

              {/* Demo Images */}
              <div>
                <label className="block text-xs text-muted mb-2">Screenshots</label>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  {demoImages.map((url, i) => (
                    <div key={i} className="relative group">
                      <img src={url} alt={`Demo ${i + 1}`} className="w-full h-32 object-cover rounded-lg card-border" />
                      <button
                        onClick={() => removeDemoImage(i)}
                        className="absolute top-1 right-1 bg-background/80 text-muted hover:text-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => demoInputRef.current?.click()}
                    disabled={demoUploading}
                    className="h-32 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center text-muted hover:bg-hover hover:border-accent/40 transition-colors bg-background gap-1 text-xs"
                  >
                    <Plus size={16} />
                    <span>{demoUploading ? 'Uploading…' : 'Add Image'}</span>
                  </button>
                </div>
              </div>
            </section>

            <div className="w-full h-px bg-border mb-8" />

            {/* ── Structured Fields ─────────────────────────────────────── */}
            <section className="mb-8 space-y-5">
              <h3 className="text-[10px] font-bold text-muted tracking-widest mb-4 uppercase">Details</h3>

              <div>
                <label className="block text-xs text-muted mb-2">Purpose</label>
                <textarea
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="What problem does this solve?"
                  rows={3}
                  className="w-full px-4 py-3 bg-background card-border rounded-lg text-sm text-foreground resize-none focus:outline-none focus:border-accent/50 transition-colors placeholder:text-muted/40"
                />
              </div>

              <div>
                <label className="block text-xs text-muted mb-2">Target Audience</label>
                <textarea
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="Who is this for?"
                  rows={2}
                  className="w-full px-4 py-3 bg-background card-border rounded-lg text-sm text-foreground resize-none focus:outline-none focus:border-accent/50 transition-colors placeholder:text-muted/40"
                />
              </div>

              <div>
                <label className="block text-xs text-muted mb-2">Expected Effect</label>
                <textarea
                  value={expectedEffect}
                  onChange={(e) => setExpectedEffect(e.target.value)}
                  placeholder="What outcomes or impact is expected?"
                  rows={2}
                  className="w-full px-4 py-3 bg-background card-border rounded-lg text-sm text-foreground resize-none focus:outline-none focus:border-accent/50 transition-colors placeholder:text-muted/40"
                />
              </div>
            </section>

            <div className="w-full h-px bg-border mb-8" />

            {/* ── Description (main body) ───────────────────────────────── */}
            <section className="mb-8">
              <h3 className="text-[10px] font-bold text-muted tracking-widest mb-4 uppercase">Description</h3>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Detailed description (supports Markdown)..."
                rows={12}
                className="w-full px-4 py-3 bg-background card-border rounded-lg text-sm text-foreground font-mono resize-y focus:outline-none focus:border-accent/50 transition-colors placeholder:text-muted/40 leading-relaxed"
              />
            </section>
          </div>
        </div>

        {/* ── Right sidebar ──────────────────────────────────────────── */}
        <aside className="w-[300px] border-l border-border bg-surface/50 flex flex-col overflow-y-auto shrink-0">
          <div className="p-5">
            <h3 className="text-[10px] font-bold text-muted tracking-widest mb-5 uppercase">
              Page Settings
            </h3>

            {/* Status */}
            <div className="mb-5">
              <label className="block text-xs text-muted mb-2">Status</label>
              <div className="flex gap-1.5">
                {STATUS_OPTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className={`px-2.5 py-1.5 text-[10px] font-mono uppercase rounded transition-all ${
                      status === s
                        ? s === 'planning' ? 'bg-amber-500/10 text-amber-500 card-border'
                        : s === 'developing' ? 'bg-blue-500/10 text-blue-500 card-border'
                        : 'bg-green-500/10 text-green-500 card-border'
                        : 'bg-hover text-muted card-border hover:bg-accent/10'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Tech Tags */}
            <div className="mb-5">
              <label className="block text-xs text-muted mb-2">Tech Tags</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {techTags.map(tag => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 px-2 py-1 text-[10px] font-mono bg-hover text-muted rounded card-border"
                  >
                    {tag}
                    <button onClick={() => removeTag(tag)} className="hover:text-foreground">
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); addTag(); }
                }}
                placeholder="Add tag + Enter"
                className="w-full px-3 py-2 bg-background card-border rounded text-xs text-foreground focus:outline-none focus:border-accent/50 transition-colors placeholder:text-muted/40"
              />
            </div>

            {/* Slug */}
            <div className="mb-5">
              <label className="block text-xs text-muted mb-2">Slug</label>
              <input
                value={slug}
                onChange={(e) => { setSlug(e.target.value); setSlugManuallyEdited(true); }}
                placeholder="auto-generated-slug"
                className="w-full px-3 py-2 bg-background card-border rounded text-xs text-foreground font-mono focus:outline-none focus:border-accent/50 transition-colors placeholder:text-muted/40"
              />
            </div>

            {/* SEO Description */}
            <div className="mb-5">
              <label className="block text-xs text-muted mb-2">SEO Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description for search engines…"
                rows={3}
                className="w-full px-3 py-2 bg-background card-border rounded text-xs text-muted resize-none focus:outline-none focus:border-accent/50 transition-colors placeholder:text-muted/40"
              />
            </div>
          </div>
        </aside>
      </main>

      {/* ── Bottom status bar ────────────────────────────────────────── */}
      <div className="h-9 border-t border-border flex items-center justify-between px-6 bg-surface shrink-0">
        <div className="flex items-center gap-4 text-[11px] text-muted font-mono">
          <span>Words: {wordCount}</span>
          <span className="opacity-30">•</span>
          <span>Chars: {charCount}</span>
          <span className="opacity-30">•</span>
          <span>Reading: ~{readingTime} min</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-muted font-mono">
          <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          <span>Live Sync</span>
        </div>
      </div>

      {/* Hidden file inputs */}
      <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
      <input ref={demoInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleDemoImageUpload} />
    </div>
  );
}
