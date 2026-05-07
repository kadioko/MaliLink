"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastTone = "success" | "error" | "warning" | "info";

type Toast = {
  id: string;
  title: string;
  message?: string;
  tone: ToastTone;
};

type ToastContextValue = {
  toast: (opts: Omit<Toast, "id">) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const toneConfig: Record<ToastTone, { icon: typeof CheckCircle2; bg: string; border: string; icon_cls: string }> = {
  success: { icon: CheckCircle2, bg: "bg-white",        border: "border-emerald-200", icon_cls: "text-emerald-600" },
  error:   { icon: XCircle,      bg: "bg-white",        border: "border-red-200",     icon_cls: "text-red-600"     },
  warning: { icon: AlertCircle,  bg: "bg-white",        border: "border-amber-200",   icon_cls: "text-amber-600"   },
  info:    { icon: Info,         bg: "bg-white",        border: "border-sky-200",     icon_cls: "text-sky-600"     },
};

function ToastItem({ item, onDismiss }: { item: Toast; onDismiss: (id: string) => void }) {
  const { icon: Icon, bg, border, icon_cls } = toneConfig[item.tone];
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => onDismiss(item.id), 4500);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [item.id, onDismiss]);

  return (
    <div
      className={cn(
        "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border p-4 shadow-lg transition",
        bg, border,
      )}
    >
      <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", icon_cls)} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900">{item.title}</p>
        {item.message ? <p className="mt-0.5 text-xs text-gray-500 leading-5">{item.message}</p> : null}
      </div>
      <button onClick={() => onDismiss(item.id)} className="shrink-0 text-gray-400 hover:text-gray-600">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const add = useCallback((opts: Omit<Toast, "id">) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev.slice(-4), { ...opts, id }]);
  }, []);

  const value: ToastContextValue = {
    toast: add,
    success: (title, message) => add({ tone: "success", title, message }),
    error: (title, message) => add({ tone: "error", title, message }),
    warning: (title, message) => add({ tone: "warning", title, message }),
    info: (title, message) => add({ tone: "info", title, message }),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[9999] flex flex-col gap-3">
        {toasts.map((t) => (
          <ToastItem key={t.id} item={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
