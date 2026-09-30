"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";
import { COLORS, SHADOWS } from "@/src/theme/veriforge-tokens";
import { vfTokenVars } from "./utils";
import styles from "./VFStatusIndicator.module.css";

export type VFStatus = "stable" | "watch" | "critical" | "active" | "offline";

export interface VFStatusIndicatorProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  status?: VFStatus;
  label?: string;
}

const statusClass: Record<VFStatus, string> = {
  stable: styles.stable,
  watch: styles.watch,
  critical: styles.critical,
  active: styles.active,
  offline: styles.offline,
};

const DEFAULT_LABEL: Record<VFStatus, string> = {
  stable: "Stable",
  watch: "Watch",
  critical: "Critical",
  active: "Active",
  offline: "Offline",
};

export function VFStatusIndicator({
  status = "stable",
  label,
  className,
  style,
  ...props
}: VFStatusIndicatorProps) {
  return (
    <span
      className={cn(styles.indicator, statusClass[status], className)}
      style={vfTokenVars({
        ["--vf-forge-red" as string]: COLORS.forgeRed,
        ["--vf-glow" as string]: SHADOWS.metallicShadow,
        ...style,
      })}
      {...props}
    >
      <span className={styles.dot} aria-hidden />
      <span>{label ?? DEFAULT_LABEL[status]}</span>
    </span>
  );
}

export default VFStatusIndicator;
