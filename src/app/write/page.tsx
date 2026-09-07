"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Code2, Package, Bot, Activity, Target } from "lucide-react";
import NotionEditor from "@/components/editor/NotionEditor";
import ProductEditor from "@/components/editor/ProductEditor";
import BuildEditor from "@/components/editor/BuildEditor";
import CaseStudyEditor, { type CaseSaveData } from "@/components/editor/CaseStudyEditor";
import { routeFor, type Category } from "@/lib/categories";

type EditorCategory = Category;

const CATEGORY_OPTIONS: { value: EditorCategory; label: string; description: string; icon: React.ReactNode }[] = [
  { value: 'case', label: 'Case Study', description: '문제 → 가설 → 트레이드오프 → 결과 → 학습', icon: <Target size={20} /> },
  { value: 'journal', label: 'Journal', description: 'Development notes and troubleshooting', icon: <Code2 size={20} /> },
  { value: 'product', label: 'Product', description: 'Product with structured fields', icon: <Package size={20} /> },
  { value: 'agent', label: 'Agent', description: 'AI agent with structured fields', icon: <Bot size={20} /> },
  { value: 'build', label: 'Build', description: 'Build progress timeline entry', icon: <Activity size={20} /> },
];

export default function WritePage() {
  const [selectedCategory, setSelectedCategory] = useState<EditorCategory | null>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const handleCategorySelect = (cat: EditorCategory) => {
    setSelectedCategory(cat);
  };

  // Save handler for NotionEditor (devlog/troubleshooting)
  const handleNotionSave = async (data: {
    title: string;
    category: string;
    content: string;
    slug?: string;
    description?: string;
    tags?: string;
    locale?: string;
    published?: boolean;
    createdAt?: string;
  }) => {
    if (!data.title.trim() || !data.content.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const post = await res.json();
        router.push(routeFor(data.category, post.slug));
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setSaving(false);
    }
  };

  // Save handler for ProductEditor (product/agent)
  const handleProductSave = async (data: {
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
    externalLinks?: string;
    targetAudience?: string;
    purpose?: string;
    expectedEffect?: string;
  }) => {
    if (!data.title.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const post = await res.json();
        router.push(routeFor(data.category, post.slug));
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setSaving(false);
    }
  };

  // Save handler for CaseStudyEditor
  const handleCaseSave = async (data: CaseSaveData) => {
    if (!data.title.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const post = await res.json();
        router.push(routeFor("case", post.slug));
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setSaving(false);
    }
  };

  // Save handler for BuildEditor
  const handleBuildSave = async (data: {
    title: string;
    category: string;
    content: string;
    slug?: string;
    description?: string;
    published?: boolean;
    tags?: string;
    relatedPosts?: string;
    createdAt?: string;
  }) => {
    if (!data.title.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        router.push("/admin");
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setSaving(false);
    }
  };

  // Category selection screen
  if (!selectedCategory) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <div className="mb-10 text-center">
            <h1
              className="text-3xl font-bold text-foreground tracking-tight mb-3"
              style={{ fontFamily: "'Manrope', 'Pretendard', sans-serif" }}
            >
              Create New Post
            </h1>
            <p className="text-sm text-muted">Select a category to begin</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {CATEGORY_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => handleCategorySelect(opt.value)}
                className="text-left bg-surface card-border rounded-lg p-5 hover:border-accent transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-md bg-background card-border flex items-center justify-center text-muted group-hover:text-accent group-hover:border-accent/40 transition-colors shrink-0">
                    {opt.icon}
                  </div>
                  <div>
                    <h3
                      className="text-base font-semibold text-foreground group-hover:text-accent transition-colors tracking-tight"
                      style={{ fontFamily: "'Manrope', 'Pretendard', sans-serif" }}
                    >
                      {opt.label}
                    </h3>
                    <p className="text-xs text-muted mt-1">{opt.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Render appropriate editor
  if (selectedCategory === 'case') {
    return <CaseStudyEditor onSave={handleCaseSave} saving={saving} />;
  }

  if (selectedCategory === 'journal') {
    return <NotionEditor initialCategory={selectedCategory} onSave={handleNotionSave} saving={saving} />;
  }

  if (selectedCategory === 'product' || selectedCategory === 'agent') {
    return <ProductEditor initialCategory={selectedCategory} onSave={handleProductSave} saving={saving} />;
  }

  if (selectedCategory === 'build') {
    return <BuildEditor onSave={handleBuildSave} saving={saving} />;
  }

  return null;
}
