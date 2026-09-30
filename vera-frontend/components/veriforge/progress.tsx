import * as React from "react";
import { cn } from "@/src/lib/utils";
import { veriforgeTypography } from "./theme";

export function VeriForgeProgressBar({
  label,
  value,
  className,
  tone = "blue",
}: {
  label: string;
  value: number;
  className?: string;
  tone?: "blue" | "green" | "amber";
}) {
  const clamped = Math.max(0, Math.min(100, value));
  const fill =
    tone === "green"
      ? "bg-[#4FAF6F]"
      : tone === "amber"
        ? "bg-[#C89F3D]"
        : "bg-[#1E6FB8]";

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-xs">
        <span
          className={cn(
            veriforgeTypography.heading,
            "text-[11px] font-semibold uppercase tracking-[0.06em] text-[#A8B0B8]",
          )}
        >
          {label}
        </span>
        <span className="tabular-nums text-[#D5DBE0]">{clamped}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-[3px] border border-[#5A6169] bg-[#23272C]">
        <div
          className={cn("h-full rounded-[2px] transition-all duration-300", fill)}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

export function VeriForgeStepRail({
  steps,
  current,
  className,
}: {
  steps: string[];
  current: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid gap-2",
        steps.length <= 4 ? "md:grid-cols-4" : "md:grid-cols-7",
        className,
      )}
    >
      {steps.map((step, idx) => {
        const done = idx < current;
        const active = idx === current;
        return (
          <div
            key={step}
            className={cn(
              "rounded-[3px] border px-2 py-2 text-center text-[11px] font-medium tracking-[0.02em]",
              done
                ? "border-[#4FAF6F]/50 bg-[rgba(79,175,111,0.14)] text-[#D4EEDC]"
                : active
                  ? "border-[#1E6FB8] bg-[rgba(30,111,184,0.18)] text-[#F4F6F8]"
                  : "border-[#5A6169] bg-[#2A2E33] text-[#A8B0B8]",
            )}
          >
            {step}
          </div>
        );
      })}
    </div>
  );
}
