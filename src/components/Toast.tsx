"use client";

import { CheckCircle2, AlertCircle, X } from "lucide-react";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

type T = { id: number; message: string; type: "success" | "error" };
const Ctx = createContext<(message: string, type?: "success" | "error") => void>(() => {});

export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<T[]>([]);
  const toast = useCallback((message: string, type: "success" | "error" = "success") => {
    const id = Date.now() + Math.random();
    setItems((s) => [...s, { id, message, type }]);
    setTimeout(() => setItems((s) => s.filter((x) => x.id !== id)), 5000);
  }, []);
  return (
    <Ctx.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[200] flex flex-col items-center gap-2 px-4" role="status" aria-live="polite">
        {items.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-[4px] bg-espresso px-4 py-3 text-sm text-cream shadow-2xl"
            style={{ animation: "toast-in 0.3s ease" }}
          >
            {t.type === "success" ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sand" /> : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-300" />}
            <span className="flex-1">{t.message}</span>
            <button aria-label="Dismiss" onClick={() => setItems((s) => s.filter((x) => x.id !== t.id))}>
              <X className="h-4 w-4 opacity-70" />
            </button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
