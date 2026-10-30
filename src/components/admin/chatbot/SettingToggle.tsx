"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Switch from "@/components/admin/ui/Switch";
import { useToast } from "@/components/admin/ui/Toast";

// 바꾸면 바로 저장하는 토글. 챗봇 노출(운영 설정)과 FAQ 사용 여부에 쓴다
export default function SettingToggle({
  initial,
  label,
  endpoint,
  method = "PUT",
  field,
  onMessage,
  offMessage,
}: {
  initial: boolean;
  label: string;
  endpoint: string;
  method?: string;
  field: string;
  onMessage: string;
  offMessage: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [value, setValue] = useState(initial);
  const [busy, setBusy] = useState(false);

  const change = async (next: boolean) => {
    setBusy(true);
    setValue(next);
    const res = await fetch(endpoint, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ [field]: next }) }).catch(() => null);
    setBusy(false);
    if (res?.ok) {
      toast({ ok: true, message: next ? onMessage : offMessage });
      router.refresh();
    } else {
      setValue(!next);
      toast({ ok: false, message: "바꾸지 못했어요.", retry: () => change(next) });
    }
  };

  return <Switch checked={value} onChange={change} label={label} disabled={busy} />;
}
