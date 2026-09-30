"use client";

import { HardHat } from "lucide-react";
import { useFieldMode } from "./FieldModeProvider";
import { cn } from "@/src/lib/utils";

export function FieldModeToggle({ className }: { className?: string }) {
  const { fieldModeActive, fieldModeManual, isOnline, setFieldModeManual } = useFieldMode();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={fieldModeActive}
      aria-label="Field mode"
      title={
        fieldModeManual === null
          ? "Auto (enabled when offline)"
          : fieldModeActive
            ? "Field mode on"
            : "Field mode off"
      }
      onClick={() => {
        if (fieldModeManual === null) setFieldModeManual(true);
        else if (fieldModeManual) setFieldModeManual(false);
        else setFieldModeManual(null);
      }}
      className={cn(
        "inline-flex items-center gap-2 rounded-[var(--radius-md)] px-2 py-1.5 text-xs font-medium transition",
        fieldModeActive
          ? "bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] text-[var(--color-primary)]"
          : "text-[var(--muted-foreground)] hover:bg-[var(--muted)]",
        className
      )}
    >
      <HardHat className="h-4 w-4" aria-hidden />
      <span className="hidden sm:inline">Field</span>
      {!isOnline && fieldModeManual === null ? (
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden />
      ) : null}
    </button>
  );
}
