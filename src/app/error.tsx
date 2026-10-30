"use client";

import { useEffect } from "react";
import { RotateCw } from "lucide-react";
import StatusPage from "@/components/common/StatusPage";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusPage
      code="500"
      title="잠시 문제가 생겼어요"
      description={
        <>
          서버에서 화면을 불러오지 못했어요.
          <br />
          잠시 뒤 다시 시도해 주세요.
        </>
      }
      action={
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-[46px] items-center gap-2 rounded-lg bg-brand px-5 text-sm font-medium text-white"
        >
          다시 시도 <RotateCw size={16} />
        </button>
      }
    />
  );
}
