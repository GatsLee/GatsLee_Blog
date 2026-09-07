"use client";

import PostList from "@/components/posts/PostList";
import { useLanguage } from "@/context/LanguageContext";

interface PostItem {
  id: number;
  title: string;
  slug: string;
  category: string;
  content: string;
  createdAt: string;
  tags?: string;
  locale?: string;
  translationKey?: string | null;
}

export default function InsightsList({ posts }: { posts: PostItem[] }) {
  const { t } = useLanguage();

  return (
    <div className="max-w-screen-2xl mx-auto px-6 md:px-12 py-16">
      <PostList posts={posts} basePath="/insights" title={t.insights.title} />
    </div>
  );
}
