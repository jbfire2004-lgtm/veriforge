"use client";

import { cn } from "@/src/lib/utils";

export type PmFilterChip = {
  id: string;
  label: string;
};

type Props = {
  items: PmFilterChip[];
  active: string;
  onChange: (id: string) => void;
  ariaLabel?: string;
  className?: string;
};

/**
 * In-page filter chips — use in VeraPageLayout `filters` slot.
 * Not for module switching (use global/module nav instead).
 */
export function PmFilterChips({
  items,
  active,
  onChange,
  ariaLabel = "Page filters",
  className,
}: Props) {
  return (
    <nav
      className={cn(
        "flex flex-wrap gap-1 rounded-xl border border-[var(--border)] bg-[var(--card)] p-1 shadow-sm",
        className,
      )}
      aria-label={ariaLabel}
    >
      {items.map((item) => {
        const selected = item.id === active;
        return (
          <button
            key={item.id}
            type="button"
            aria-current={selected ? "true" : undefined}
            onClick={() => onChange(item.id)}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
              selected
                ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm"
                : "text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)]",
            )}
          >
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
