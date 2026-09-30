"use client";

import { FLHA_READINESS_ITEMS } from "@/src/pages/pm/jha-flha/jha-flha-templates";
import { sfCn } from "@/src/components/safety-forms/theme/cn";

type Props = {
  value: Record<string, boolean>;
  onChange: (next: Record<string, boolean>) => void;
  disabled?: boolean;
};

export function FlhaReadinessChecklist({ value, onChange, disabled }: Props) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--sf-text-muted)]">
        Pre-task readiness
      </p>
      <ul className="grid gap-2 sm:grid-cols-2">
        {FLHA_READINESS_ITEMS.map((item) => {
          const checked = Boolean(value[item.id]);
          return (
            <li key={item.id}>
              <label
                className={sfCn(
                  "flex cursor-pointer items-start gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors",
                  checked
                    ? "border-green-300 bg-green-50"
                    : "border-[var(--sf-border)] bg-[var(--sf-surface)]",
                  disabled && "cursor-not-allowed opacity-60",
                )}
              >
                <input
                  type="checkbox"
                  className="mt-0.5 shrink-0"
                  checked={checked}
                  disabled={disabled}
                  onChange={(e) =>
                    onChange({ ...value, [item.id]: e.target.checked })
                  }
                />
                <span>{item.label}</span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
