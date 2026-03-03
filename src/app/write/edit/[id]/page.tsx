"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import NotionEditor, { parseMarkdownToBlocks } from "@/components/editor/NotionEditor";
import type { Block } from "@/components/editor/NotionEditor";
import ProductEditor from "@/components/editor/ProductEditor";

const ROUTE_MAP: Record<string, string> = {
  product: "/products",
  agent: "/products",
  blueprint: "/blueprint",
  devlog: "/insights",
  troubleshooting: "/insights",
};

export default function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [postId, setPostId] = useState<string>("");
  const [postData, setPostData] = useState<Record<string, unknown> | null>(null);
  const [initialBlocks, setInitialBlocks] = useState<Block[] | undefined>(undefined);
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
          setInitialBlocks(parseMarkdownToBlocks(post.content || ""));
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
    coverImage?: string;
    description?: string;
    locale?: string;
    published?: boolean;
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
        const basePath = ROUTE_MAP[data.category] || "/insights";
        router.push(`${basePath}/${post.slug}`);
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
        const basePath = ROUTE_MAP[data.category] || "/products";
        router.push(`${basePath}/${post.slug}`);
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

  const category = (postData.category as string) || "devlog";

  // Blueprint posts are edited via the blueprint editor
  if (category === "blueprint") {
    router.push("/write/blueprint");
    return null;
  }

  // Product/Agent → ProductEditor
  if (category === "product" || category === "agent") {
    return (
      <ProductEditor
        initialTitle={(postData.title as string) || ""}
        initialCategory={category}
        initialContent={(postData.content as string) || ""}
        initialCoverImage={(postData.coverImage as string) || ""}
        initialDemoVideo={(postData.demoVideo as string) || ""}
        initialDemoImages={(postData.demoImages as string) || "[]"}
        initialTargetAudience={(postData.targetAudience as string) || ""}
        initialPurpose={(postData.purpose as string) || ""}
        initialExpectedEffect={(postData.expectedEffect as string) || ""}
        initialLocale={(postData.locale as string) || "ko"}
        initialPublished={postData.published !== false}
        initialTags={(postData.tags as string) || "[]"}
        initialSlug={(postData.slug as string) || ""}
        initialDescription={(postData.description as string) || ""}
        onSave={handleProductSave}
        saving={saving}
      />
    );
  }

  // Devlog/Troubleshooting → NotionEditor
  return (
    <NotionEditor
      initialBlocks={initialBlocks}
      initialCategory={category}
      initialSlug={(postData.slug as string) || ""}
      initialCoverImage={(postData.coverImage as string) || ""}
      initialDescription={(postData.description as string) || ""}
      initialLocale={(postData.locale as string) || "ko"}
      initialPublished={postData.published !== false}
      onSave={handleNotionSave}
      saving={saving}
    />
  );
}
