import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/src/lib/utils";

export type StatusPillTone =
  | "neutral"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "teal";

export interface StatusPillProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: StatusPillTone;
  icon?: LucideIcon;
  /** Visually de-emphasise (e.g. draft). */
  subtle?: boolean;
}

const toneStyles: Record<
  StatusPillTone,
  { solid: string; subtle: string }
> = {
  neutral: {
    solid: "border-vera-charcoal/15 bg-vera-surface text-vera-charcoal",
    subtle: "border-vera-charcoal/10 bg-vera-white text-vera-muted",
  },
  success: {
    solid: "border-emerald-200 bg-emerald-50 text-emerald-900",
    subtle: "border-emerald-100 bg-emerald-50/60 text-emerald-800",
  },
  warning: {
    solid: "border-amber-200 bg-amber-50 text-vera-charcoal",
    subtle: "border-amber-100 bg-amber-50/70 text-vera-charcoal",
  },
  danger: {
    solid: "border-red-200 bg-red-50 text-red-900",
    subtle: "border-red-100 bg-red-50/70 text-red-800",
  },
  info: {
    solid: "border-vera-teal/30 bg-vera-teal/10 text-vera-deep",
    subtle: "border-vera-teal/20 bg-vera-teal/5 text-vera-slate",
  },
  teal: {
    solid: "border-vera-teal/40 bg-vera-teal text-vera-deep",
    subtle: "border-vera-teal/25 bg-vera-teal/15 text-vera-deep",
  },
};

/**
 * Compact status indicator — use for workflow states, compliance flags, and tags.
 * Pairs with Lucide icons.
 */
export function StatusPill({
  tone = "neutral",
  icon: Icon,
  subtle = false,
  className,
  children,
  ...props
}: StatusPillProps) {
  const palette = toneStyles[tone];
  const surface = subtle ? palette.subtle : palette.solid;
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-vera-2 rounded-full border px-vera-3 py-vera-1 text-xs font-medium leading-none tracking-tight shadow-md",
        surface,
        className
      )}
      {...props}
    >
      {Icon != null && <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />}
      <span className="truncate">{children}</span>
    </span>
  );
}
