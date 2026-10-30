"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { AlertCircle, Check } from "lucide-react";

type ToastInput = { ok: boolean; message: string; retry?: () => void };
type ToastItem = ToastInput & { id: number };

const ToastContext = createContext<(t: ToastInput) => void>(() => {});

export const useToast = () => useContext(ToastContext);

// IA_AD_00702 저장 결과 토스트. 화면 아래 가운데에 3초 동안 뜬다
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const show = useCallback((t: ToastInput) => {
    const id = Date.now() + Math.random();
    setItems((list) => [...list, { ...t, id }]);
    setTimeout(() => setItems((list) => list.filter((i) => i.id !== id)), t.ok ? 3000 : 6000);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="pointer-events-none fixed bottom-10 left-1/2 z-[90] flex -translate-x-1/2 flex-col items-center gap-2">
        {items.map((t) => (
          <div
            key={t.id}
            role="status"
            className="pointer-events-auto flex items-center gap-2.5 rounded-xl bg-[#18191b] py-3 pl-4 pr-5 text-sm font-medium text-white shadow-[0_8px_24px_rgba(0,0,0,0.2)]"
          >
            {t.ok ? <Check size={18} className="text-[#4ade80]" /> : <AlertCircle size={18} className="text-[#f87171]" />}
            {t.message}
            {!t.ok && t.retry && (
              <button type="button" onClick={t.retry} className="text-[13px] font-bold text-[#93b4ff]">
                다시 시도
              </button>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
