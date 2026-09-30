"use client";

import { sfCn } from "../theme/cn";

const LEVELS = [
  {
    value: "low",
    label: "Low",
    desc: "Acceptable with standard controls",
    className: "from-emerald-400/30 to-emerald-600/10 border-emerald-500/50 text-emerald-900",
  },
  {
    value: "medium",
    label: "Medium",
    desc: "Additional controls required",
    className: "from-yellow-400/30 to-yellow-600/10 border-yellow-500/50 text-yellow-900",
  },
  {
    value: "high",
    label: "High",
    desc: "Senior approval required",
    className: "from-orange-400/30 to-orange-600/10 border-orange-500/50 text-orange-900",
  },
  {
    value: "critical",
    label: "Critical",
    desc: "Stop work — escalate immediately",
    className: "from-red-500/30 to-red-600/10 border-red-500/50 text-red-900",
  },
];

type Props = {
  label: string;
  value?: string;
  onChange: (level: string) => void;
  disabled?: boolean;
  required?: boolean;
};

export function RiskMatrix({ label, value, onChange, disabled, required }: Props) {
  return (
    <fieldset className="space-y-3" disabled={disabled}>
      <legend className="text-sm font-medium text-[var(--sf-text)]">
        {label}
        {required ? <span className="text-[var(--sf-danger)]"> *</span> : null}
      </legend>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {LEVELS.map((l) => (
          <button
            key={l.value}
            type="button"
            title={l.desc}
            disabled={disabled}
            onClick={() => onChange(l.value)}
            className={sfCn(
              "group relative overflow-hidden rounded-[var(--sf-radius-md)] border bg-gradient-to-br p-4 text-left transition-all duration-200 will-change-transform",
              l.className,
              value === l.value
                ? "scale-[1.03] ring-2 ring-[var(--sf-primary)] shadow-[var(--sf-shadow-glow)]"
                : "hover:scale-[1.02] hover:shadow-[var(--sf-shadow-md)]",
            )}
          >
            <span className="block text-sm font-bold">{l.label}</span>
            <span className="mt-1 block text-xs opacity-80">{l.desc}</span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}
