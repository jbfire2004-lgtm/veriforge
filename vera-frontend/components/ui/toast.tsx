"use client";

import * as React from "react";
import { CheckCircle2, Info, AlertTriangle, X, XCircle } from "lucide-react";
import { cn } from "@/src/lib/utils";

export type ToastVariant = "default" | "success" | "warning" | "error";

export type ToastInput = {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
};

type ToastRecord = ToastInput & { id: string };

type ToastContextValue = {
  toast: (t: ToastInput) => void;
  dismiss: (id: string) => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

function useToastContext() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<ToastRecord[]>([]);

  const dismiss = React.useCallback((id: string) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = React.useCallback(
    (input: ToastInput) => {
      const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const record: ToastRecord = {
        id,
        variant: "default",
        duration: 5000,
        ...input,
      };
      setItems((prev) => [...prev, record]);
      const ms = record.duration ?? 5000;
      if (ms > 0) {
        window.setTimeout(() => dismiss(id), ms);
      }
    },
    [dismiss]
  );

  const value = React.useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster items={items} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useToastContext();
}

const variantStyles: Record<ToastVariant, string> = {
  default: "border-vera-charcoal/10 bg-vera-white text-vera-charcoal",
  success: "border-emerald-200 bg-emerald-50 text-emerald-950",
  warning: "border-amber-200 bg-amber-50 text-amber-950",
  error: "border-red-200 bg-red-50 text-red-950",
};

function ToastIcon({ variant }: { variant: ToastVariant }) {
  const cls = "h-5 w-5 shrink-0";
  switch (variant) {
    case "success":
      return <CheckCircle2 className={cn(cls, "text-emerald-600")} aria-hidden />;
    case "warning":
      return <AlertTriangle className={cn(cls, "text-amber-600")} aria-hidden />;
    case "error":
      return <XCircle className={cn(cls, "text-red-600")} aria-hidden />;
    default:
      return <Info className={cn(cls, "text-vera-teal")} aria-hidden />;
  }
}

function Toaster({
  items,
  onDismiss,
}: {
  items: ToastRecord[];
  onDismiss: (id: string) => void;
}) {
  if (items.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-vera-3 bottom-vera-4 z-[100] flex flex-col gap-vera-3 p-vera-2 sm:inset-x-auto sm:bottom-vera-6 sm:right-vera-6 sm:w-full sm:max-w-sm"
      aria-live="polite"
      aria-relevant="additions text"
    >
      {items.map((t) => (
        <div
          key={t.id}
          className={cn(
            "pointer-events-auto flex gap-vera-3 rounded-xl border p-vera-4 shadow-md",
            variantStyles[t.variant ?? "default"]
          )}
          role="status"
        >
          <ToastIcon variant={t.variant ?? "default"} />
          <div className="min-w-0 flex-1 text-left">
            <p className="text-sm font-medium leading-tight tracking-tight">{t.title}</p>
            {t.description != null && (
              <p className="mt-vera-2 text-sm leading-relaxed opacity-90">{t.description}</p>
            )}
          </div>
          <button
            type="button"
            className="shrink-0 rounded-md p-vera-1 text-current opacity-60 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vera-teal"
            onClick={() => onDismiss(t.id)}
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
