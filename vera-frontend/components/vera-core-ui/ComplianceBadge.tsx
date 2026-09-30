"use client";

import { cn } from "@/src/lib/utils";
import {
  COMPLIANCE_LABELS,
  COMPLIANCE_STYLES,
  type ComplianceState,
} from "@/lib/vera-core-ui/compliance";

type Props = {
  state: ComplianceState;
  className?: string;
  size?: "sm" | "md";
};

export function ComplianceBadge({ state, className, size = "sm" }: Props) {
  const styles = COMPLIANCE_STYLES[state];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-semibold",
        size === "sm" ? "px-2.5 py-0.5 text-[0.65rem]" : "px-3 py-1 text-xs",
        styles.badge,
        className,
      )}
    >
      {COMPLIANCE_LABELS[state]}
    </span>
  );
}
