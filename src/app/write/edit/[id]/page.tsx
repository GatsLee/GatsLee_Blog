"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import NotionEditor from "@/components/editor/NotionEditor";
import ProductEditor from "@/components/editor/ProductEditor";
import BuildEditor from "@/components/editor/BuildEditor";
import CaseStudyEditor, { type CaseSaveData } from "@/components/editor/CaseStudyEditor";
import { routeFor } from "@/lib/categories";

export default function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [postId, setPostId] = useState<string>("");
  const [postData, setPostData] = useState<Record<string, unknown> | null>(null);
  const [initialContent, setInitialContent] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadPost() {
      const { id } = await params;
      setPostId(id);

      try {
        const res = await fetch(`/api/posts/${id}`);
        if (res.ok) {
          const post = await res.json();
          setPostData(post);
          setInitialContent(post.content || "");
        }
      } catch {
        /* ignore — editor opens with empty state */
      } finally {
        setLoading(false);
      }
    }
    loadPost();
  }, [params]);

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
      const res = await fetch(`/api/posts/${postId}`, {
        method: "PUT",
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
      const res = await fetch(`/api/posts/${postId}`, {
        method: "PUT",
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
      const res = await fetch(`/api/posts/${postId}`, {
        method: "PUT",
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

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        <span className="text-muted font-mono text-sm animate-pulse">Loading…</span>
      </div>
    );
  }

  if (!postData) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        <span className="text-muted font-mono text-sm">Post not found</span>
      </div>
    );
  }

  const category = (postData.category as string) || "journal";

  // Case → CaseStudyEditor
  if (category === "case") {
    return (
      <CaseStudyEditor
        initialTitle={(postData.title as string) || ""}
        initialContent={(postData.content as string) || ""}
        initialCaseBeats={(postData.caseBeats as string) || null}
        initialExternalLinks={(postData.externalLinks as string) || "[]"}
        initialLocale={(postData.locale as string) || "ko"}
        initialPublished={postData.published !== false}
        initialTags={(postData.tags as string) || "[]"}
        initialDescription={(postData.description as string) || ""}
        onSave={handleCaseSave}
        saving={saving}
      />
    );
  }

  // Build → BuildEditor
  if (category === "build") {
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
        const res = await fetch(`/api/posts/${postId}`, {
          method: "PUT",
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

    return (
      <BuildEditor
        initialTitle={(postData.title as string) || ""}
        initialDescription={(postData.description as string) || ""}
        initialTags={(postData.tags as string) || "[]"}
        initialRelatedPosts={(postData.relatedPosts as string) || "[]"}
        initialPublished={postData.published !== false}
        initialCreatedAt={(postData.createdAt as string) || undefined}
        onSave={handleBuildSave}
        saving={saving}
      />
    );
  }

  // Product/Agent → ProductEditor
  if (category === "product" || category === "agent") {
    return (
      <ProductEditor
        initialTitle={(postData.title as string) || ""}
        initialCategory={category}
        initialContent={(postData.content as string) || ""}
        initialDemoImages={(postData.demoImages as string) || "[]"}
        initialExternalLinks={(postData.externalLinks as string) || "[]"}
        initialTargetAudience={(postData.targetAudience as string) || ""}
        initialPurpose={(postData.purpose as string) || ""}
        initialExpectedEffect={(postData.expectedEffect as string) || ""}
        initialLocale={(postData.locale as string) || "ko"}
        initialPublished={postData.published !== false}
        initialTags={(postData.tags as string) || "[]"}
        initialDescription={(postData.description as string) || ""}
        onSave={handleProductSave}
        saving={saving}
      />
    );
  }

  // Devlog/Troubleshooting → NotionEditor
  return (
    <NotionEditor
      initialContent={initialContent}
      initialCategory={category}
      initialSlug={(postData.slug as string) || ""}
      initialDescription={(postData.description as string) || ""}
      initialTags={(postData.tags as string) || "[]"}
      initialLocale={(postData.locale as string) || "ko"}
      initialPublished={postData.published !== false}
      initialCreatedAt={(postData.createdAt as string) || undefined}
      onSave={handleNotionSave}
      saving={saving}
    />
  );
}
