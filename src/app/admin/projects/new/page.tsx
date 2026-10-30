import ProjectForm from "@/components/admin/projects/ProjectForm";
import { ToastProvider } from "@/components/admin/ui/Toast";
import { postOptions } from "../data";

export const metadata = { title: "새 프로젝트" };

// IA_AD_00301 프로젝트 작성. 사이드바 없이 전체 폭을 쓴다
export default async function NewProjectPage() {
  return (
    <ToastProvider>
      <ProjectForm initial={null} posts={await postOptions()} />
    </ToastProvider>
  );
}
