import Link from "next/link";
import { ArrowRight } from "lucide-react";

// IA_SY_001 404, IA_SY_003 서버 오류가 같은 틀을 쓴다
export default function StatusPage({
  code,
  title,
  description,
  action,
}: {
  code: string;
  title: string;
  description: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="flex flex-col items-center px-6 py-[140px] text-center">
      <p className="text-[96px] font-bold leading-[104px] tracking-[-4px] text-brand">{code}</p>
      <h1 className="mt-5 text-[32px] font-bold leading-[46px] tracking-[-1px] text-foreground">{title}</h1>
      <p className="mt-5 text-[17px] leading-[25px] text-secondary">{description}</p>
      <div className="mt-9 flex items-center gap-6">
        {action ?? (
          <Link
            href="/"
            className="inline-flex h-[46px] items-center gap-2 rounded-lg bg-brand px-5 text-sm font-medium text-white"
          >
            홈으로 가기 <ArrowRight size={16} />
          </Link>
        )}
        <Link href="/insights" className="inline-flex items-center gap-1 text-sm font-medium text-brand">
          글 전체 보기 <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}
