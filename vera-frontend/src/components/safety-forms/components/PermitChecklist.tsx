"use client";

import { CheckCircle2, Circle } from "lucide-react";
import { sfCn } from "../theme/cn";

type Props = {
  label: string;
  items: string[];
  value?: string[];
  onChange: (checked: string[]) => void;
  disabled?: boolean;
  required?: boolean;
};

export function PermitChecklist({
  label,
  items,
  value = [],
  onChange,
  disabled,
  required,
}: Props) {
  const done = value.length;
  const total = items.length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  function toggle(item: string) {
    if (disabled) return;
    onChange(value.includes(item) ? value.filter((x) => x !== item) : [...value, item]);
  }

  return (
    <fieldset className="space-y-3" disabled={disabled}>
      <header className="flex items-center justify-between">
        <legend className="text-sm font-medium text-[var(--sf-text)]">
          {label}
          {required ? <span className="text-[var(--sf-danger)]"> *</span> : null}
        </legend>
        <span
          className={sfCn(
            "text-xs font-medium tabular-nums",
            pct === 100 ? "text-[var(--sf-success)]" : "text-[var(--sf-text-muted)]",
          )}
        >
          {done}/{total}
        </span>
      </header>
      <ul className="space-y-2">
        {items.map((item) => {
          const checked = value.includes(item);
          return (
            <li key={item}>
              <button
                type="button"
                onClick={() => toggle(item)}
                className={sfCn(
                  "flex w-full items-center gap-3 rounded-[var(--sf-radius-md)] border px-4 py-3 text-left text-sm transition-all duration-200",
                  checked
                    ? "border-[var(--sf-success)]/40 bg-emerald-500/10 text-[var(--sf-text)]"
                    : "border-[var(--sf-border)] hover:border-[var(--sf-primary)] hover:bg-[var(--sf-surface-hover)]",
                )}
              >
                {checked ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-[var(--sf-success)]" />
                ) : (
                  <Circle className="h-5 w-5 shrink-0 text-[var(--sf-text-muted)]" />
                )}
                {item}
              </button>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}
