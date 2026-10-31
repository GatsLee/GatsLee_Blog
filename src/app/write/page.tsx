import PostEditor from "@/components/editor/PostEditorClient";
import { ToastProvider } from "@/components/admin/ui/Toast";

export const metadata = { title: "새 포스트" };

// IA_AD_00203 글 작성. 사이드바 없이 전체 폭을 쓴다
export default function WritePage() {
  return (
    <ToastProvider>
      <PostEditor post={null} />
    </ToastProvider>
  );
}
