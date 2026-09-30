"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";
import type { FilterChip } from "@/lib/wireframes/types";

export type FiltersProps = {
  chips: FilterChip[];
  activeId?: string;
  onChange?: (id: string) => void;
  children?: React.ReactNode;
  className?: string;
};

export function Filters({ chips, activeId, onChange, children, className }: FiltersProps) {
  return (
    <section className={cn("flex flex-wrap items-center gap-2", className)}>
      {chips.map((chip) => {
        const active = activeId === chip.id;
        return (
          <button
            key={chip.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange?.(chip.id)}
            className={cn(
              "rounded-[var(--radius-md)] px-3 py-1.5 text-sm font-medium transition",
              active
                ? "bg-[var(--color-primary)] text-white shadow-sm"
                : "bg-[var(--surface)] text-[var(--muted-foreground)] ring-1 ring-[var(--border)] hover:bg-[var(--muted)]"
            )}
          >
            {chip.label}
          </button>
        );
      })}
      {children}
    </section>
  );
}
