"use client";

type Props = {
  label: string;
  value: string;
  hint?: string;
  suppressed?: boolean;
  tone?: "default" | "warn" | "critical" | "ok";
};

const rail: Record<NonNullable<Props["tone"]>, string> = {
  default: "shadow-[inset_3px_0_0_#cbd5e1]",
  warn: "shadow-[inset_3px_0_0_#C89F3D]",
  critical: "shadow-[inset_3px_0_0_#B33A3A]",
  ok: "shadow-[inset_3px_0_0_#2F8F8C]",
};

export function ProjectMetricCard({
  label,
  value,
  hint,
  suppressed,
  tone = "default",
}: Props) {
  return (
    <div
      className={`rounded-2xl border border-[#2A2E33]/10 bg-white p-4 pl-4 shadow-sm ${rail[tone]}`}
    >
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#5a6b7c]">
        {label}
      </p>
      <p className="mt-2 text-[1.65rem] font-semibold leading-none tracking-tight tabular-nums text-[#2A2E33]">
        {suppressed ? "—" : value}
      </p>
      {suppressed ? (
        <p className="mt-2 text-xs text-[#94a3b8]">Insufficient sample (n&lt;5)</p>
      ) : hint ? (
        <p className="mt-2 text-xs text-[#5a6b7c]">{hint}</p>
      ) : null}
    </div>
  );
}
