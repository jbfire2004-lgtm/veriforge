"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";
import { COLORS } from "@/src/theme/veriforge-tokens";
import { vfTokenVars } from "./utils";
import styles from "./VFTag.module.css";

export type VFTagTone = "neutral" | "critical" | "success" | "active" | "warning";

export interface VFTagProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: VFTagTone;
}

const toneClass: Record<VFTagTone, string> = {
  neutral: styles.neutral,
  critical: styles.critical,
  success: styles.success,
  active: styles.active,
  warning: styles.warning,
};

export function VFTag({
  tone = "neutral",
  className,
  style,
  children,
  ...props
}: VFTagProps) {
  return (
    <span
      className={cn(styles.tag, toneClass[tone], className)}
      style={vfTokenVars({
        ["--vf-forge-red" as string]: COLORS.safetyBlue,
        ["--vf-critical" as string]: COLORS.criticalAlert,
        ["--vf-glow" as string]: "none",
        ...style,
      })}
      {...props}
    >
      {children}
    </span>
  );
}

export default VFTag;
