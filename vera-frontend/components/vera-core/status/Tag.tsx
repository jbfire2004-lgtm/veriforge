import * as React from "react";
import { cn } from "@/src/lib/utils";

export type TagProps = {
  children: React.ReactNode;
  variant?: "default" | "primary" | "muted";
  className?: string;
};

export function Tag({ children, variant = "default", className }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[var(--radius-sm)] px-2 py-0.5 text-xs font-medium",
        variant === "default" && "bg-[var(--muted)] text-[var(--foreground)]",
        variant === "primary" &&
          "bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] text-[var(--color-primary)]",
        variant === "muted" && "bg-[var(--muted)] text-[var(--muted-foreground)]",
        className
      )}
    >
      {children}
    </span>
  );
}
