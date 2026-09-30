"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";

const variants = {
  error:
    "border-red-200 bg-red-50 text-red-800",
  warning:
    "border-amber-200 bg-amber-50 text-amber-950",
  success:
    "border-emerald-200 bg-emerald-50 text-emerald-900",
  info: "border-slate-200 bg-slate-50 text-slate-800",
} as const;

export type CoreAlertVariant = keyof typeof variants;

export type CoreAlertProps = {
  variant?: CoreAlertVariant;
  children: React.ReactNode;
  className?: string;
  role?: "alert" | "status";
};

/**
 * Consistent inline banner for VERA Core flows (errors, warnings, success).
 */
export function CoreAlert({
  variant = "error",
  children,
  className,
  role = "alert",
}: CoreAlertProps) {
  return (
    <div
      role={role}
      className={cn(
        "rounded-md border px-3 py-2 text-sm",
        variants[variant],
        className
      )}
    >
      {children}
    </div>
  );
}
