"use client";

import { Building2 } from "lucide-react";
import { SfFloatingInput } from "../ui/SfFloatingInput";

type Props = {
  label: string;
  value?: number | string;
  displayName?: string;
  onChange: (projectId: number | undefined) => void;
  disabled?: boolean;
  required?: boolean;
};

export function ProjectSelector({
  label,
  value,
  displayName,
  onChange,
  disabled,
  required,
}: Props) {
  const hint =
    displayName && value != null
      ? `${displayName} (#${value})`
      : "Enter the project ID from Project Management (seeded demo uses id 1).";

  return (
    <div className="space-y-2">
      <SfFloatingInput
        label={label}
        type="number"
        required={required}
        disabled={disabled}
        hint="e.g. 1"
        value={value != null ? String(value) : ""}
        onChange={(e) => {
          const n = parseInt(e.target.value, 10);
          onChange(Number.isFinite(n) ? n : undefined);
        }}
      />
      <p className="flex items-start gap-2 text-xs text-[var(--sf-text-muted)]">
        <Building2 className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
        {hint}
      </p>
    </div>
  );
}
