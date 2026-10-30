"use client";

import dynamic from "next/dynamic";

// BlockNote는 브라우저에서만 돈다. 서버에서는 빈 화면을 그리고 클라이언트에서 불러온다
const PostEditorClient = dynamic(() => import("./PostEditor"), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-background" aria-busy="true" />,
});

export default PostEditorClient;
