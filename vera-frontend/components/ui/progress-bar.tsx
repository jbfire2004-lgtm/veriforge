import * as React from "react";
import { cn } from "@/src/lib/utils";

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 0–100 when `max` is default 100. */
  value: number;
  max?: number;
  /** Accessible label (also shown above bar when `showLabel` is true). */
  label?: string;
  showLabel?: boolean;
  tone?: "teal" | "slate" | "danger" | "warning";
  /** Height preset. */
  size?: "sm" | "md";
}

const fillTone: Record<NonNullable<ProgressBarProps["tone"]>, string> = {
  teal: "bg-vera-teal",
  slate: "bg-vera-slate",
  danger: "bg-red-500",
  warning: "bg-amber-400",
};

/**
 * Determinate progress — training completion, expiry window, upload status, etc.
 */
export function ProgressBar({
  value,
  max = 100,
  label,
  showLabel = false,
  tone = "teal",
  size = "md",
  className,
  ...props
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const bounded = Math.min(max, Math.max(0, value));
  const height = size === "sm" ? "h-1.5" : "h-2.5";
  const showHeader = label != null || showLabel;

  return (
    <div className={cn("w-full space-y-vera-2", className)} {...props}>
      {showHeader ? (
        <div className="flex items-center justify-between gap-vera-3 text-xs font-medium text-vera-slate">
          <span className="truncate text-vera-charcoal">
            {label ?? (showLabel ? "Progress" : "")}
          </span>
          <span className="tabular-nums text-vera-muted">{Math.round(pct)}%</span>
        </div>
      ) : null}
      <div
        role="progressbar"
        aria-valuenow={bounded}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label ?? "Progress"}
        className={cn(
          "w-full overflow-hidden rounded-full bg-vera-charcoal/10 shadow-inner",
          height
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-500 ease-out",
            fillTone[tone]
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
