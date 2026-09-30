"use client";

import { X } from "lucide-react";
import { cn } from "@/src/lib/utils";

export type ChipProps = {
  label: string;
  onRemove?: () => void;
  className?: string;
};

export function Chip({ label, onRemove, className }: ChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-[var(--radius-full)] border border-[var(--border)] bg-[var(--muted)] px-2.5 py-0.5 text-xs font-medium",
        className
      )}
    >
      {label}
      {onRemove ? (
        <button
          type="button"
          className="rounded-full p-0.5 hover:bg-[var(--border)]"
          aria-label={`Remove ${label}`}
          onClick={onRemove}
        >
          <X className="h-3 w-3" />
        </button>
      ) : null}
    </span>
  );
}
