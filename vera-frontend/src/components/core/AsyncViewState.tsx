"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { AlertTriangle, CheckCircle2, Inbox, Loader2 } from "lucide-react";

type StateProps = {
  title: string;
  message?: string;
  action?: ReactNode;
  className?: string;
  icon?: LucideIcon;
};

export function LoadingState({ title, message, className }: StateProps) {
  return (
    <div
      className={`rounded-lg border border-slate-200 bg-slate-50 p-4 transition-all duration-200 ${className ?? ""}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3">
        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-slate-700" aria-hidden />
        <div>
          <p className="text-sm font-medium text-slate-900">{title}</p>
          {message && <p className="text-xs text-slate-600">{message}</p>}
        </div>
      </div>
    </div>
  );
}

export function EmptyState({ title, message, action, className, icon: Icon = Inbox }: StateProps) {
  return (
    <div
      className={`rounded-lg border border-slate-200 bg-white p-6 text-center transition-all duration-200 ${className ?? ""}`}
      role="status"
      aria-live="polite"
    >
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500">
        <Icon className="h-5 w-5" aria-hidden />
      </div>
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      {message && <p className="mt-1 text-sm text-slate-600">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ title, message, action, className, icon: Icon = AlertTriangle }: StateProps) {
  return (
    <div
      className={`rounded-lg border border-red-200 bg-red-50 p-4 transition-all duration-200 ${className ?? ""}`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-red-700" aria-hidden />
        <div>
          <p className="text-sm font-semibold text-red-900">{title}</p>
          {message && <p className="mt-1 text-sm text-red-700">{message}</p>}
          {action && <div className="mt-3">{action}</div>}
        </div>
      </div>
    </div>
  );
}

export function SuccessState({ title, message, action, className, icon: Icon = CheckCircle2 }: StateProps) {
  return (
    <div
      className={`rounded-lg border border-emerald-200 bg-emerald-50 p-4 transition-all duration-200 ${className ?? ""}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" aria-hidden />
        <div>
          <p className="text-sm font-semibold text-emerald-900">{title}</p>
          {message && <p className="mt-1 text-sm text-emerald-700">{message}</p>}
          {action && <div className="mt-3">{action}</div>}
        </div>
      </div>
    </div>
  );
}

