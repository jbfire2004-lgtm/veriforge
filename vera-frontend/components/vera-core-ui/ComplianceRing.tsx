"use client";

import { cn } from "@/src/lib/utils";
import {
  COMPLIANCE_STYLES,
  type ComplianceState,
} from "@/lib/vera-core-ui/compliance";

type Props = {
  value: number;
  state?: ComplianceState;
  size?: number;
  strokeWidth?: number;
  label?: string;
  className?: string;
};

export function ComplianceRing({
  value,
  state = "ok",
  size = 88,
  strokeWidth = 7,
  label,
  className,
}: Props) {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;
  const styles = COMPLIANCE_STYLES[state];

  return (
    <div
      className={cn("relative inline-flex flex-col items-center gap-1", className)}
      role="img"
      aria-label={label ?? `${clamped}% compliance`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={strokeWidth}
          opacity={0.35}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className={cn(styles.ring, "transition-all duration-500 ease-out")}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span
        className="absolute inset-0 flex items-center justify-center text-lg font-semibold tabular-nums text-[var(--foreground)]"
        style={{ width: size, height: size }}
      >
        {Math.round(clamped)}
      </span>
      {label ? (
        <span className="text-xs font-medium text-[var(--muted-foreground)]">{label}</span>
      ) : null}
    </div>
  );
}
