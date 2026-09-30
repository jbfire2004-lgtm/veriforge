import * as React from "react";
import { cn } from "@/src/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Announced by screen readers; defaults to "Loading". Pass empty string to omit. */
  label?: string;
}

export function Skeleton({ className, label = "Loading", ...props }: SkeletonProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={label || undefined}
      className={cn("animate-pulse rounded-xl bg-vera-charcoal/10", className)}
      {...props}
    />
  );
}
