"use client";

import { sfCn } from "../theme/cn";

type Pill = { id: string; label: string };

type Props = {
  pills: Pill[];
  value: string;
  onChange: (id: string) => void;
};

export function SfFilterPills({ pills, value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2" role="tablist">
      {pills.map((p) => (
        <button
          key={p.id}
          type="button"
          role="tab"
          aria-selected={value === p.id}
          className={sfCn(
            "rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200",
            value === p.id
              ? "bg-[var(--sf-primary)] text-white shadow-[var(--sf-shadow-sm)]"
              : "border border-[var(--sf-border)] bg-[var(--sf-surface)] text-[var(--sf-text-muted)] hover:border-[var(--sf-primary)] hover:text-[var(--sf-primary)]",
          )}
          onClick={() => onChange(p.id)}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
