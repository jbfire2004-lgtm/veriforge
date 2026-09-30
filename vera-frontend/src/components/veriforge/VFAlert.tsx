"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";
import { COLORS } from "@/src/theme/veriforge-tokens";
import { vfTokenVars } from "./utils";
import styles from "./VFAlert.module.css";

export type VFAlertTone = "critical" | "neutral" | "success" | "warning";

export interface VFAlertProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: VFAlertTone;
  title: string;
  message: string;
}

const toneClass: Record<VFAlertTone, string> = {
  critical: styles.critical,
  neutral: styles.neutral,
  success: styles.success,
  warning: styles.warning,
};

export function VFAlert({
  tone = "neutral",
  title,
  message,
  className,
  style,
  ...props
}: VFAlertProps) {
  return (
    <div
      role="alert"
      className={cn(styles.alert, toneClass[tone], className)}
      style={vfTokenVars({
        ["--vf-forge-red" as string]: COLORS.safetyBlue,
        ["--vf-critical" as string]: COLORS.criticalAlert,
        ["--vf-glow" as string]: "none",
        ...style,
      })}
      {...props}
    >
      <span className={styles.mark} aria-hidden />
      <div>
        <p className={styles.title}>{title}</p>
        <p className={styles.message}>{message}</p>
      </div>
    </div>
  );
}

export default VFAlert;
