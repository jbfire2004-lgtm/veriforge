"use client";

import { User } from "lucide-react";
import { SfSearchSelect } from "../ui/SfSearchSelect";

type Props = {
  label: string;
  value?: number | string;
  displayName?: string;
  onChange: (workerId: number | undefined) => void;
  disabled?: boolean;
  required?: boolean;
};

export function WorkerSelector({
  label,
  value,
  displayName,
  onChange,
  disabled,
  required,
}: Props) {
  const options = [
    ...(displayName && value
      ? [
          {
            value: String(value),
            label: displayName,
            sublabel: `Worker #${value}`,
            icon: <User className="h-4 w-4" />,
          },
        ]
      : []),
    {
      value: "",
      label: "Enter worker ID below",
      sublabel: "Or select from populated context",
    },
  ];

  return (
    <section className="space-y-3">
      <SfSearchSelect
        label={label}
        required={required}
        disabled={disabled}
        options={options.filter((o) => o.value !== "")}
        value={value != null ? String(value) : ""}
        onChange={(v) => onChange(v ? parseInt(v, 10) : undefined)}
        placeholder="Select worker…"
      />
      <input
        type="number"
        disabled={disabled}
        placeholder="Worker ID"
        className="w-full rounded-[var(--sf-radius-md)] border border-[var(--sf-border)] bg-[var(--sf-surface)] px-3 py-2 text-sm"
        value={value ?? ""}
        onChange={(e) => {
          const n = parseInt(e.target.value, 10);
          onChange(Number.isFinite(n) ? n : undefined);
        }}
      />
    </section>
  );
}
