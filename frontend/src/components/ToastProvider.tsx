"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { CheckCircle2, XCircle, Info } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toast: (type: ToastType, message: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast debe usarse dentro de <ToastProvider>");
  return ctx;
}

const toastStyles: Record<ToastType, { icon: React.ReactNode; iconColor: string; label: string }> = {
  success: {
    icon: <CheckCircle2 className="w-5 h-5" aria-hidden="true" />,
    iconColor: "text-emerald-500",
    label: "Éxito",
  },
  error: {
    icon: <XCircle className="w-5 h-5" aria-hidden="true" />,
    iconColor: "text-red-500",
    label: "Error",
  },
  info: {
    icon: <Info className="w-5 h-5" aria-hidden="true" />,
    iconColor: "text-navy-500",
    label: "Información",
  },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (type: ToastType, message: string) => {
      const id = ++idRef.current;
      setToasts((prev) => [...prev.slice(-3), { id, type, message }]);
      window.setTimeout(() => dismiss(id), 4000);
    },
    [dismiss]
  );

  const value: ToastContextValue = {
    toast,
    success: useCallback((m: string) => toast("success", m), [toast]),
    error: useCallback((m: string) => toast("error", m), [toast]),
    info: useCallback((m: string) => toast("info", m), [toast]),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="fixed top-4 right-4 z-[100] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2"
      >
        {toasts.map((t) => {
          const style = toastStyles[t.type];
          return (
            <div
              key={t.id}
              role="status"
              className="toast-in flex items-start gap-3 rounded-lg border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 shadow-layered"
            >
              <span className={`mt-0.5 shrink-0 ${style.iconColor}`}>{style.icon}</span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                  {style.label}
                </p>
                <p className="text-sm text-gray-800 dark:text-gray-200 break-words">{t.message}</p>
              </div>
              <button
                onClick={() => dismiss(t.id)}
                aria-label="Descartar notificación"
                className="shrink-0 text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 transition-colors text-lg leading-none"
              >
                &times;
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
